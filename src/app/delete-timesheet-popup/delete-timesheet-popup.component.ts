import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { ExportPopupComponent } from '../export-popup/export-popup.component';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-delete-timesheet-popup',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete-timesheet-popup.component.html',
  styleUrl: './delete-timesheet-popup.component.css'
})
export class DeleteTimesheetPopupComponent {
  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<DeleteTimesheetPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: any }
  ) {}

    baseURL = environment.apiBaseUrl;

  close() {
    this.dialogRef.close();
  }

  deleteTimesheet() {
    const timesheetId = this.data.id;
    this.http.delete(`${this.baseURL}/timesheet/${timesheetId}`).subscribe({
      next:(res: any) =>{
        console.log(res);
        // window.location.reload();
        this.dialogRef.close(timesheetId); // Send deleted ID back

      },
      error:(err)=> {
        console.log(err);
        this.close();
      },
    })
    // this.close();
  }
}
