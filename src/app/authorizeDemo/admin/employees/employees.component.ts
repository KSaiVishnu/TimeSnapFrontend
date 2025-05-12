import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirstKeyPipe } from '../../../shared/pipes/first-key.pipe';
import { TaskReportComponent } from '../../../task-report/task-report.component';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { ToastrService } from 'ngx-toastr';
import { MatTab, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { UserService } from '../../../shared/services/user.service';
import { DeleteEmployeePopupComponent } from '../../../delete-employee-popup/delete-employee-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { EditEmployeePopupComponent } from '../../../edit-employee-popup/edit-employee-popup.component';

interface Employee {
  userId: string;
  userName: string;
  email: string;
  empId: string;
  roleId: string;
}

export interface UserEmployee {
  id: number;
  employeeId: string;
  userName: string;
  email: string;
}

enum ApiStatus {
  INITIAL = 'INITIAL',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Component({
  selector: 'app-employees',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    FirstKeyPipe,
    FormsModule,
    TaskReportComponent,
    MatTabsModule,
    MatTab,
    MatTabGroup,
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent implements OnInit, AfterViewInit {
  // allAssignees: { userName: string; employeeId: string }[] = []; // Store all users

  // displayedColumns: string[] = [
  //   // 'id',
  //   'userName',
  //   'email',
  //   'employeeId',
  //   'role',
  //   'actions',
  // ];
  // dataSource = new MatTableDataSource<any>();
  // @ViewChild(MatPaginator) paginator!: MatPaginator;

  // @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('employeePaginator') employeePaginator!: MatPaginator;
  @ViewChild('userEmployeePaginator') userEmployeePaginator!: MatPaginator;

  displayedColumns: string[] = [
    'userName',
    'email',
    'employeeId',
    'role',
    'actions',
  ];
  dataSource = new MatTableDataSource<Employee>();

  userEmployeeDisplayedColumns: string[] = [
    'id',
    'employeeId',
    'userName',
    'email',
    'actions',
  ];
  userEmployeeDataSource = new MatTableDataSource<any>();

  baseURL = environment.apiBaseUrl;
  employees: any = [];
  addedUsers: any = [];
  form: FormGroup;
  lastIdentity: any;
  count = 1;

  userEmployees: UserEmployee[] = [];

  roles = [
    { id: '8ce4f9f7-026f-11f0-ac41-000d3a915061', name: 'Admin' },
    { id: '8ce4ff9f-026f-11f0-ac41-000d3a915061', name: 'Manager' },
    { id: '8ce500dd-026f-11f0-ac41-000d3a915061', name: 'Employee' },
  ];

  apiStatus: ApiStatus = ApiStatus.INITIAL;
  errorMessage: string = '';
  errorStatus: number | null = null;

  invitedStatus: ApiStatus = ApiStatus.INITIAL;
  invitedErrorMessage: string = '';
  invitedErrorStatus: number | null = null;

  constructor(
    private http: HttpClient,
    public formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private errorHandler: ErrorHandlerService,
    private toastr: ToastrService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.form = this.formBuilder.group({
      empName: ['', Validators.required],
      empMail: [
        '',
        [Validators.required, Validators.email, this.emailDomainValidator],
      ],
      empId: ['', Validators.required],
    });
    // this.dataSource = this.employees;
  }

  getFirstError(controlName: string): string | null {
    const controlErrors = this.form.get(controlName)?.errors;
    return controlErrors ? Object.keys(controlErrors)[0] : null;
  }

  emailDomainValidator(control: AbstractControl) {
    const email = control.value;
    return email && email.endsWith('@framsikt.no')
      ? null
      : { invalidDomain: true };
  }

  ngOnInit(): void {
    this.fetchEmployees();
    // this.fetchLastIdentityId();
    this.fetchUserEmployees();
  }

  // ngAfterViewInit() {
  //   if (this.paginator) {
  //     this.dataSource.paginator = this.paginator;
  //   }
  // }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;

    this.dataSource.paginator = this.employeePaginator;
    this.userEmployeeDataSource.paginator = this.userEmployeePaginator;
  }

  private handleError(error: HttpErrorResponse) {
    const errorInfo = this.errorHandler.getErrorMessage(error);
    this.errorStatus = errorInfo.status;
    this.errorMessage = errorInfo.message;
  }

  fetchEmployees() {
    this.apiStatus = ApiStatus.IN_PROGRESS;
    this.http.get<any[]>(`${this.baseURL}/user-employee`).subscribe({
      next: (data) => {
        this.employees = data;
        console.log(data);
        this.dataSource.data = data; // Set data for the paginator to work
        this.apiStatus = ApiStatus.SUCCESS;

        this.cdr.detectChanges(); // Forces UI update

        this.dataSource = new MatTableDataSource(data);
        // this.dataSource.paginator = this.paginator;
        if (!this.dataSource.paginator) {
          this.dataSource.paginator = this.employeePaginator;
        }
        // this.dataSource.paginator = this.employeePaginator;
      },
      error: (error: HttpErrorResponse) => {
        this.apiStatus = ApiStatus.FAILURE;
        this.handleError(error);
        this.cdr.detectChanges(); // Forces UI update
      },
    });
  }

  fetchUserEmployees() {
    this.invitedStatus = ApiStatus.IN_PROGRESS;
    this.userService.getUserEmployees().subscribe({
      next: (data) => {
        console.log(data);
        this.userEmployees = data;
        this.invitedStatus = ApiStatus.SUCCESS;
        this.cdr.detectChanges();

        this.userEmployeeDataSource = new MatTableDataSource(data);
        // this.userEmployeeDataSource.paginator = this.paginator;
        // this.userEmployeeDataSource.paginator = this.userEmployeePaginator;

        // ✅ Safe: assign paginator only if not already set
        if (!this.userEmployeeDataSource.paginator) {
          this.userEmployeeDataSource.paginator = this.userEmployeePaginator;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch user employees:', err);
        this.invitedStatus = ApiStatus.FAILURE;
        const errorInfo = this.errorHandler.getErrorMessage(err);
        this.invitedErrorStatus = errorInfo.status;
        this.invitedErrorMessage = errorInfo.message;
        this.cdr.detectChanges();
        // Optional: Show a toast or message to the user
      },
    });
  }

  onDeleteEmployee(employee: any) {
    console.log(employee);
    const dialogRef = this.dialog.open(DeleteEmployeePopupComponent, {
      width: '50%',
      data: { employee },
    });

    dialogRef.afterClosed().subscribe((email: any) => {
      // console.log(deletedTaskId);
      // console.log(this.tasks);
      if (email) {
        this.employees = this.employees.filter((t: any) => t.email !== email);
        this.userEmployees = this.userEmployees.filter(
          (t: any) => t.email !== email
        );

        this.dataSource = new MatTableDataSource(this.employees);
        // this.dataSource.paginator = this.paginator;
        this.dataSource.paginator = this.employeePaginator;

        this.userEmployeeDataSource = new MatTableDataSource(
          this.userEmployees
        );
        this.userEmployeeDataSource.paginator = this.userEmployeePaginator;

        // this.userEmployeeDataSource.paginator = this.paginator;
        // setTimeout(() => {
        //   this.userEmployeeDataSource.paginator = this.paginator;
        // });
      }

      // // console.log(this.tasks);
    });
  }

  onEditEmployee(employee: any) {
    console.log(employee);
    const dialogRef = this.dialog.open(EditEmployeePopupComponent, {
      width: '50%',
      data: { employee },
    });

    dialogRef.afterClosed().subscribe((updatedEmployee: any) => {
      if (updatedEmployee) {
        // 🔁 Update in this.employees
        // const empIndex = this.employees.findIndex(
        //   (e: any) => e.id === updatedEmployee.id
        // );
        // if (empIndex !== -1) {
        //   console.log(this.employees[empIndex]);
        //   this.employees[empIndex].userName = updatedEmployee.userName;
        //   this.employees[empIndex].empId = updatedEmployee.employeeId;
        //   this.employees[empIndex].email = updatedEmployee.email;          
        // }

        // 🔁 Update in this.userEmployees
        const userEmpIndex = this.userEmployees.findIndex(
          (e) => e.id === updatedEmployee.id
        );
        if (userEmpIndex !== -1) {
          this.userEmployees[userEmpIndex] = updatedEmployee;
        }

        this.dataSource = new MatTableDataSource(this.employees);
        this.dataSource.paginator = this.employeePaginator;

        this.userEmployeeDataSource = new MatTableDataSource(
          this.userEmployees
        );
        this.userEmployeeDataSource.paginator = this.userEmployeePaginator;
      }
    });
  }

  onRetry() {
    this.fetchEmployees();
  }

  fetchLastIdentityId() {
    this.http
      .get<{ lastIdentity: number }>(
        `${this.baseURL}/user-employee/get-last-identity`
      )
      .subscribe({
        next: (response) => {
          console.log('Last Identity ID:', response.lastIdentity);
          this.lastIdentity = response.lastIdentity;
          const newId = (response.lastIdentity + this.count)
            .toString()
            .padStart(3, '0');
          const newEmpId = `E${newId}`;
          this.form.patchValue({ empId: newEmpId });
        },
        error: (error: any) => {
          // alert("Error While Fetching Last EmpId");
          // this.toastr.error('Error ', 'Task Updation Successful');
        },
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
      .post<{ message: string }>(
        `${this.baseURL}/user-employee/add-employee`,
        this.addedUsers
      )
      .subscribe({
        next: (response: any) => {
          // Success response
          console.log(response.message);
          this.toastr.success(response.message, 'Success');
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Error Uploading Employees', 'Error');
        },
      });
    // .subscribe((response) => {
    //   console.log(response.message);
    // });
    this.addedUsers = [];
  }

  onAddEmployee() {
    const formValue = this.form.value;
    let formData = {
      employeeId: formValue.empId,
      userName: formValue.empName,
      email: formValue.empMail,
    };
    this.addedUsers = [...this.addedUsers, formData];
    console.log(this.addedUsers);
    this.form.reset();
    this.count += 1;
    // const newId = (this.lastIdentity + this.count).toString().padStart(3, '0');
    // const newEmpId = `E${newId}`;
    // this.form.patchValue({ empId: newEmpId });
  }

  removeAssignee(index: number) {
    this.addedUsers.splice(index, 1);
    console.log(this.addedUsers);
  }

  updateUserRole(user: any) {
    const updatedData = {
      userId: user.userId,
      newRoleId: user.roleId,
    };

    console.log(updatedData);

    this.http
      .put(`${this.baseURL}/user-employee/update-user-role`, updatedData)
      .subscribe({
        next: (response) => {
          console.log('User role updated successfully', response);
          this.toastr.success('Role Updated Successfully', 'Role Updated');
        },
        error: (error) => {
          console.error('Error updating user role', error);
          this.toastr.error('Error While Updating Role', 'Updation Error');
        },
      });
  }
}
