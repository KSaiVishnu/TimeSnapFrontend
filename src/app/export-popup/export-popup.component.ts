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
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-export-popup',
  standalone: true,
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
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close();
  }

  save() {
    console.log(this.data);

    const exportData = this.data.map((ts: any) => ({
      // ID: ts.id,
      // Employee_ID: ts.empId,
      TaskId: ts.taskId,
      TaskName: ts.taskName,
      UserName: ts.userName,
      Date: new Date(ts.date).toLocaleDateString(),
      DailyLog:
        Math.floor(ts.totalMinutes / 60) +
        ':' +
        (ts.totalMinutes % 60).toString().padStart(2, '0'),
      BillingType: ts.billingType,
      Notes: ts.notes,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Timesheets: worksheet },
      SheetNames: ['Timesheets'],
    };

    const excelBuffer: Uint8Array = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Save file using FileSaver
    const currentDate = new Date().toISOString(); // Get YYYY-MM-DD format
    const fileName = `Timesheets_${currentDate}.xlsx`;
    FileSaver.saveAs(blob, fileName);

    this.dialogRef.close();
  }
}

// Define TimeSheetEntry Interface
interface TimeSheetEntry {
  id: string;
  empId: string;
  taskId: string;
  date: string | number | Date;
  totalMinutes: number;
  userName: string;
  taskName: string;
  billingType: string;
  Notes: string;
}
