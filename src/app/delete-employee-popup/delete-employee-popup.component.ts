import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { DeleteTaskPopupComponent } from '../delete-task-popup/delete-task-popup.component';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-delete-employee-popup',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete-employee-popup.component.html',
  styleUrl: './delete-employee-popup.component.css',
})
export class DeleteEmployeePopupComponent {
  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private http: HttpClient,
    private dialogRef: MatDialogRef<DeleteTaskPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: any }
  ) {
    console.log(this.data.employee);
  }
  baseURL = environment.apiBaseUrl;

  isDeleting = false;


  close() {
    this.dialogRef.close(); // Pass deleted taskId
  }

  deleteEmployee() {
    console.log(this.data.employee);
    const employeeId = this.data.employee.employeeId;
    this.userService.deleteUserByEmployeeId(employeeId).subscribe({
      next: (res) => {
        console.log(res);
        // this.users = this.users.filter(u => u.employeeId !== employeeId);
        this.dialogRef.close(this.data.employee.email); // Pass deleted taskId
        this.toastr.success('User Deleted Successfully', 'User Deletion');
        // alert('User deleted successfully.');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error While deleting User', 'Deletion Error');
        // alert('Failed to delete user.');
      }
    });
    // this.userService.deleteAccount().subscribe({
    //   next: () => {
    //     this.isDeleting = false;
    //     // this.showDeleteModal = false;
    //     // Redirect to logout or home page
    //     console.log('Employee deleted successfully.');

    //     this.toastr.success('Employee Deleted Successfully', 'Account Deleted');
    //   },
    //   error: (err) => {
    //     this.isDeleting = false;
    //     this.toastr.error('Error While Deleting Employee', 'Deletion Error');
    //     console.error('Error deleting Employee:', err);
    //   },
    // });
  }
}
