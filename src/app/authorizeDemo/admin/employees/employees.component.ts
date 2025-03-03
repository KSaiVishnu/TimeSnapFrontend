import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
})
export class EmployeesComponent implements OnInit, AfterViewInit {
  // allAssignees: { userName: string; employeeId: string }[] = []; // Store all users

  displayedColumns: string[] = ['id', 'userName', 'employeeId'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  baseURL = environment.apiBaseUrl;

  addedUsers:any = [];

  form: FormGroup;

  lastIdentity:any;
  count = 1;

  constructor(private http: HttpClient, public formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      empName: ['', Validators.required],
      empId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchEmployees();
    this.fetchLastIdentityId();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  fetchEmployees() {
    this.http
      .get<{ userName: string; employeeId: string }[]>(
        `${this.baseURL}/user-employee`
      )
      .subscribe((data) => {
        // console.log(data);
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      });
  }

  fetchLastIdentityId() {
    this.http
      .get<{ lastIdentity: number }>(
        `${this.baseURL}/user-employee/get-last-identity`
      )
      .subscribe((response) => {
        console.log('Last Identity ID:', response.lastIdentity);
        this.lastIdentity = response.lastIdentity;
        const newId = (response.lastIdentity + this.count).toString().padStart(3, '0');
        const newEmpId = `E${newId}`;
        this.form.patchValue({ empId: newEmpId });
      });
  }

  onSubmitEmployees() {
    // console.log(this.form.value);
    // const formValue = this.form.value;
    // let formData = {
    //   employeeId: formValue.empId,
    //   userName: formValue.empName,
    // };
    // console.log(formData);

    // this.http
    //   .post<{ message: string; lastId: number }>(
    //     `${this.baseURL}/user-employee/add-employee`,
    //     formData
    //   )
    //   .subscribe((response) => {
    //     console.log(response.message);
    //     console.log('Inserted Employee ID:', response.lastId);
    //   });

    console.log(this.addedUsers);

    this.http
      .post<{ message: string}>(
        `${this.baseURL}/user-employee/add-employee`,
        this.addedUsers
      )
      .subscribe((response) => {
        console.log(response.message);
      });
      this.addedUsers = [];
  
  }


  onAddEmployee(){
    const formValue = this.form.value;
    let formData = {
      employeeId: formValue.empId,
      userName: formValue.empName,
    };
    this.addedUsers = [...this.addedUsers, formData];
    this.form.reset();
    this.count += 1;
    const newId = (this.lastIdentity + this.count).toString().padStart(3, '0');
    const newEmpId = `E${newId}`;
    this.form.patchValue({ empId: newEmpId });
  }


  removeAssignee(index: number){
    this.addedUsers.splice(index, 1);
    console.log(this.addedUsers);
  }

}

export interface UserEmployee {
  userName: string;
  employeeId: string;
}
