import { Component, Inject } from '@angular/core';
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
  selector: 'app-delete-task-popup',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete-task-popup.component.html',
  styleUrl: './delete-task-popup.component.css',
})
export class DeleteTaskPopupComponent {
  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<DeleteTaskPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: any }
  ) {
    console.log(this.data.task)
  }
  baseURL = environment.apiBaseUrl;

  close() {
    this.dialogRef.close(this.data.task.taskId); // Pass deleted taskId
  }

  // deleteTask() {
  //   console.log(this.data.task);
  //   let taskId = this.data.task.taskId;
  //   this.http.delete(`${this.baseURL}/tasks/delete-task/${taskId}`).subscribe({
  //     next(res: any) {
  //       console.log(res);
  //       // window.location.reload();
  //       this.close();
  //     },
  //     error(err) {
  //       console.log(err);
  //     },
  //   })

  // }



  deleteTask() {
    const taskId = this.data.task.taskId;
    this.http.delete(`${this.baseURL}/tasks/delete-task/${taskId}`).subscribe({
      next: (res: any) => {
        console.log(res);
        this.close(); // Now this works correctly
      },
      error: (err) => {
        console.log(err);
        this.close();
      }
    });
  }
  
}
