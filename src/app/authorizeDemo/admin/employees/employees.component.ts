import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirstKeyPipe } from "../../../shared/pipes/first-key.pipe";

@Component({
  selector: 'app-employees',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    FirstKeyPipe
],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
})
export class EmployeesComponent implements OnInit, AfterViewInit {
  // allAssignees: { userName: string; employeeId: string }[] = []; // Store all users

  displayedColumns: string[] = ['id', 'userName', 'email', 'employeeId', 'role', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  baseURL = environment.apiBaseUrl;

  addedUsers:any = [];

  form: FormGroup;

  lastIdentity:any;
  count = 1;

  isLoading = true;

  constructor(private http: HttpClient, public formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    this.form = this.formBuilder.group({
      empName: ['', Validators.required],
      empMail: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      empId: ['', Validators.required],
    });
  }

  getFirstError(controlName: string): string | null {
    const controlErrors = this.form.get(controlName)?.errors;
    return controlErrors ? Object.keys(controlErrors)[0] : null;
  }

  emailDomainValidator(control: AbstractControl) {
    const email = control.value;
    return email && (email.endsWith('@gmail.com') || email.endsWith('@framsikt.no'))
      ? null
      : { invalidDomain: true };
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
    this.isLoading = true;
    this.http
      .get<{ userName: string; employeeId: string }[]>(
        `${this.baseURL}/user-employee`
      )
      .subscribe((data) => {
        console.log(data);
        this.isLoading = false;
        this.cdr.detectChanges(); // Forces UI to update
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
      email: formValue.empMail
    };
    this.addedUsers = [...this.addedUsers, formData];
    console.log(this.addedUsers);
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
