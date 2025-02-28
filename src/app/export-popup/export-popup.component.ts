import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-export-popup',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './export-popup.component.html',
  styleUrl: './export-popup.component.css',
})
export class ExportPopupComponent {
  constructor(
    private dialogRef: MatDialogRef<ExportPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { filteredTimeSheets: any }
  ) {}

  close() {
    this.dialogRef.close();
  }

  save() {
    console.log(this.data);
    console.log(this.data.filteredTimeSheets);
    const exportData = this.data.filteredTimeSheets.map(
      (ts: {
        id: any;
        empId: any;
        taskId: any;
        date: string | number | Date;
        totalMinutes: any;
        userName: any;
        taskName: any;
        billingType: any;
      }) => ({
        ID: ts.id,
        Employee_ID: ts.empId,
        Task_ID: ts.taskId,
        Date: new Date(ts.date).toLocaleDateString(),
        Total_Minutes: ts.totalMinutes,
        Username: ts.userName,
        Task_Name: ts.taskName,
        Billing_Type: ts.billingType,
      })
    );

    // console.log(exportData);

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Timesheets: worksheet },
      SheetNames: ['Timesheets'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(data, 'Timesheets.xlsx');
    this.dialogRef.close();
  }
}
