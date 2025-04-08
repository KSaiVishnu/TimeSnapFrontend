import { Component, EventEmitter, inject, Inject, Output } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { ExportPopupComponent } from '../export-popup/export-popup.component';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-delete-timesheet-popup',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule, CommonModule, MatIcon],
  templateUrl: './delete-timesheet-popup.component.html',
  styleUrl: './delete-timesheet-popup.component.css'
})
export class DeleteTimesheetPopupComponent {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<DeleteTimesheetPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: any }
  ) {}

    baseURL = environment.apiBaseUrl;

  close() {
    this.dialogRef.close();
  }

  isDeleting: boolean = false;


  deleteTimesheet() {
    this.isDeleting = true;
    const timesheetId = this.data.id;
    this.http.delete(`${this.baseURL}/timesheet/${timesheetId}`).subscribe({
      next:(res: any) =>{
        console.log(res);
        // window.location.reload();
        // this.toastr.success(res.message);
        this.dialogRef.close(timesheetId); // Send deleted ID back
        this.openSnackBar();

      },
      error:(err)=> {
        this.toastr.error('TimeSheet Deletion Failed');
        console.log(err);
        this.close();
      },
      complete: () => {
        this.isDeleting = false;
      }
    })
    // this.close();
  }


    // snackbar
    private _snackBar = inject(MatSnackBar);
    durationInSeconds = 5;
    openSnackBar() {
      this._snackBar.openFromComponent(SnackbarComponent, {
        duration: this.durationInSeconds * 1000,
        data: {
          message: 'TimeSheet Deleted Successfully',
        },
      });
    }

  
}
