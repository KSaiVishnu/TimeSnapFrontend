
import { ChangeDetectorRef, Component, ElementRef, Inject, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';



// Pipe for truncating text
@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 25, completeWords = false, ellipsis = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (completeWords) {
      limit = value.substring(0, limit).lastIndexOf(' ');
    }
    return `${value.substring(0, limit)}${ellipsis}`;
  }
}


@Component({
  selector: 'app-timesheet-upload',
  imports: [CommonModule, MatTooltipModule, MatTableModule, MatIconModule, TruncatePipe],
  templateUrl: './timesheet-upload.component.html',
  styleUrl: './timesheet-upload.component.scss',
})
export class TimesheetUploadComponent {
  // files: File[] = [];
  // parsedData: any[] = [];

  // @ViewChild('fileInput') fileInput!: ElementRef;

  // constructor(private http: HttpClient) {}

  // baseURL = environment.apiBaseUrl;

  // handleClick() {
  //   if (this.files.length == 0) {
  //     this.fileInput.nativeElement.click();
  //   }
  // }

  // onFileChange(event: any) {
  //   const selectedFiles = Array.from(event.target.files);
  //   selectedFiles.forEach((file: any) => {
  //     if (file.name.endsWith('.xlsx')) {
  //       this.files.push(file);
  //       this.readFile(file);
  //     } else {
  //       alert('Please select a valid .xlsx file.');
  //     }
  //   });
  //   event.target.value = '';
  // }

  // readFile(file: File) {
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const data = new Uint8Array(e.target.result);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //     let parsedData = XLSX.utils.sheet_to_json(worksheet);

  //     this.parsedData = parsedData.map((row: any) => ({
  //       EmpId: row['Employee_ID'],
  //       TaskId: row['Task_ID'],
  //       Date: this.formatExcelDate(row['Date']), // Formatting only the date
  //       TotalHours: row['Total_Hours'], // Keeping this as HH:mm format
  //       Notes: row['Notes']
  //     }));

  //     console.log(this.parsedData);
  //   };
  //   reader.readAsArrayBuffer(file);
  // }

  // formatExcelDate(excelDate: any): string {
  //   if (!excelDate) return ''; // Handle empty values
  //   if (typeof excelDate === 'number') {
  //     // Convert Excel serial number to date
  //     const excelEpoch = new Date(1899, 11, 30);
  //     const date = new Date(excelEpoch.getTime() + (excelDate + 1) * 86400000);
  //     return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  //   }
  //   if (typeof excelDate === 'string') {
  //     // Parse MM/DD/YYYY format
  //     const dateParts = excelDate.split('/');
  //     if (dateParts.length === 3) {
  //       const [month, day, year] = dateParts.map(Number);
  //       const formattedDate = new Date(year, month - 1, day); // Month is 0-based
  //       return formattedDate.toISOString().split('T')[0];
  //     }
  //   }
  //   return excelDate; // Return as is if unrecognized format
  // }

  // uploadFiles() {
  //   console.log(this.parsedData);
  //   if (this.parsedData.length > 0) {
  //     this.http.post(`${this.baseURL}/timesheet/upload`, this.parsedData).subscribe({
  //       next: () => {
  //         alert('Files uploaded successfully');
  //         location.reload();
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         alert('Error uploading files');
  //       },
  //     });
  //   } else {
  //     alert('No data to upload.');
  //   }
  // }

  files: File[] = [];
  parsedData: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private http: HttpClient,     private cdr: ChangeDetectorRef , private dialog: MatDialog
) {}

  baseURL = environment.apiBaseUrl;

  errorMap = {
    invalidTaskIds: [] as string[],
    invalidUserIds: [] as string[],
    unassignedTaskUserPairs: [] as string[],
  };

  uploadedTimesheets: any[] = [];

  handleClick() {
    if (this.files.length == 0) {
      this.fileInput.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files.length) {
      Array.from(event.dataTransfer.files).forEach((file) => {
        if (this.files.some((f) => f.name === file.name)) {
          alert(`${file.name} is already selected`);
        } else if (file.name.endsWith('.xlsx')) {
          this.files.push(file);
          this.readFile(file);
        } else {
          alert('Please select a valid .xlsx file.');
        }
      });
    }
  }

  onFileChange(event: any) {
    const selectedFiles = Array.from(event.target.files);
    selectedFiles.forEach((file: any) => {
      if (this.files.some((f) => f.name === file.name)) {
        alert(`${file.name} is already selected`);
      } else if (file.name.endsWith('.xlsx')) {
        this.files.push(file);
        this.readFile(file);
      } else {
        alert('Please select a valid .xlsx file.');
      }
    });
    event.target.value = '';

    this.errorMap = {
      invalidUserIds: [],
      invalidTaskIds: [],
      unassignedTaskUserPairs: []
    };
  }

  // readFile(file: File) {
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const data = new Uint8Array(e.target.result);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //     let parsedData = XLSX.utils.sheet_to_json(worksheet);

  //     // Append new parsed data to the existing array
  //     const formattedData = parsedData.map((row: any) => ({
  //       EmpId: row['Employee_ID'],
  //       TaskId: row['Task_ID'],
  //       Date: this.formatExcelDate(row['Date']),
  //       TotalHours: row['Total_Hours'],
  //       Notes: row['Notes'],
  //       fileName: file.name, // Add file reference
  //     }));

  //     this.parsedData = [...this.parsedData, ...formattedData]; // Append instead of overwrite

  //     console.log(this.parsedData);
  //   };
  //   reader.readAsArrayBuffer(file);
  // }

  readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let parsedData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = parsedData.map((row: any) => ({
        // TaskId: row['StoryId'], // Map StoryId to TaskId
        TaskId:
          typeof row['StoryId'] === 'number'
            ? row['StoryId'].toString()
            : row['StoryId'],
        // TaskName: row['StoryName'],
        UserId: row['UserId'], // Email from Excel
        Date: this.formatExcelDate(row['Date']),
        TotalHours: row['Daily Log'], // e.g., "02:00"
        Notes: row['Notes'],
        fileName: file.name, // Add file reference
      }));

      this.parsedData = [...this.parsedData, ...formattedData];
      console.log(this.parsedData);
    this.cdr.detectChanges();

    };
    reader.readAsArrayBuffer(file);
  }

  // formatExcelDate(excelDate: any): string {
  //   if (!excelDate) return ''; // Handle empty values
  //   if (typeof excelDate === 'number') {
  //     // Convert Excel serial number to proper date format (fix 1-day offset)
  //     const excelEpoch = new Date(1899, 11, 30);
  //     const date = new Date(excelEpoch.getTime() + (excelDate + 1) * 86400000);
  //     return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  //   }
  //   if (typeof excelDate === 'string') {
  //     // Handle MM/DD/YYYY format
  //     const dateParts = excelDate.split('/');
  //     if (dateParts.length === 3) {
  //       const [month, day, year] = dateParts.map(Number);
  //       const formattedDate = new Date(year, month - 1, day); // Month is 0-based
  //       return formattedDate.toISOString().split('T')[0];
  //     }
  //   }
  //   return excelDate;
  // }

  formatExcelDate(excelDate: any): string {
    if (!excelDate) return ''; // Handle empty values

    if (typeof excelDate === 'number') {
      // Convert Excel serial number to a valid date
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + (excelDate + 1) * 86400000);
      return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    }

    if (typeof excelDate === 'string') {
      // Try parsing MM/DD/YYYY format
      const dateParts = excelDate.split('/');
      if (dateParts.length === 3) {
        const [month, day, year] = dateParts.map(Number);
        const formattedDate = new Date(year, month - 1, day);
        return formattedDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      }
    }

    return excelDate; // If already valid, return as is
  }

  uploadFiles() {
    console.log(this.parsedData);
    if (this.parsedData.length === 0) {
      alert('No data to upload.');
      return;
    }

    const isValid = this.parsedData.every(
      (row) => row.TaskId && row.UserId && row.Date && row.TotalHours
    );

    if (!isValid) {
      alert(
        'Some rows have missing required fields (TaskId, UserId, Date, TotalHours).'
      );
      return;
    }

    this.http
      .post(`${this.baseURL}/timesheet/upload`, this.parsedData)
      .subscribe({
        next: () => {
          alert('Timesheets uploaded successfully.');
          location.reload();
        },
        error: (err) => {
          console.error('Upload error:', err);

          // if (err.status === 400 && err.error) {
          //   // Backend sends readable error message
          //   if (typeof err.error === 'string') {
          //     alert(`Upload failed: ${err.error}`);
          //   } else if (err.error.message) {
          //     alert(`Upload failed: ${err.error.message}`);
          //   } else {
          //     alert('Upload failed due to bad request.');
          //   }
          // } else if (err.status === 0) {
          //   alert('Server is unreachable. Please check your connection.');
          // } else {
          //   alert('An unexpected error occurred during upload.');
          // }

          if (err.error.errors) {
            const errors = err.error.errors;
            let errorMessage = 'Validation failed:\n';
  
            // Collect all error messages
            if (errors.invalidUserIds && errors.invalidUserIds.length > 0) {
              errorMessage += `Invalid Users: ${errors.invalidUserIds.join(', ')}\n`;
            }
            if (errors.invalidTaskIds && errors.invalidTaskIds.length > 0) {
              errorMessage += `Invalid Task IDs: ${errors.invalidTaskIds.join(', ')}\n`;
            }
            if (errors.unassignedTaskUserPairs && errors.unassignedTaskUserPairs.length > 0) {
              errorMessage += `Unassigned User-Task Pairs: ${errors.unassignedTaskUserPairs.join(', ')}\n`;
            }
                      // Show alert with all errors
          this.showAlert(errorMessage);

          }

          if (err.status === 400 && err.error?.errors) {
            this.errorMap = err.error.errors;
            // alert(`Error: ${err.error.message}`);
          } else {
            alert('Something went wrong.');
          }
          this.cdr.detectChanges();
        },
      });
  }

  showAlert(message: string) {
    // You can use Angular Material Dialog to show the alert or simply use a browser alert
    alert(message); // This can be replaced with a MatDialog for better UI
  }

  // isError(row: any): boolean {
  //   const isUserInvalid = this.errorMap.invalidUserIds.includes(row.UserId);
  //   const isTaskInvalid = this.errorMap.invalidTaskIds.includes(row.TaskId);
  //   const pairKey = this.getPairKey(row);
  //   const isUnassigned = this.errorMap.unassignedTaskUserPairs.includes(pairKey);

  //   return isUserInvalid || isTaskInvalid || isUnassigned;
  // }

  // getPairKey(row: any): string {
  //   const empId = 'you-can-store-a-map-of-userId-to-empId-if-needed'; // optional enhancement
  //   return `${row.UserId}_${row.TaskId}`; // since backend used EmpId, you'll need to map if needed
  // }

  displayedColumns: string[] = [
    'UserId',
    'TaskId',
    'TotalHours',
    'Date',
    'Notes',
  ];

  isError(row: any): boolean {
    const key = `${row.UserId}_${row.TaskId}`;
    return (
      this.errorMap.invalidUserIds.includes(row.UserId) ||
      this.errorMap.invalidTaskIds.includes(row.TaskId) ||
      this.errorMap.unassignedTaskUserPairs.includes(key)
    );
  }

  getErrorMessage(row: any): string {
    const messages: string[] = [];
    const key = `${row.UserId}_${row.TaskId}`;

    if (this.errorMap.invalidUserIds.includes(row.UserId)) {
      messages.push(`Invalid UserId: ${row.UserId}`);
    }

    if (this.errorMap.invalidTaskIds.includes(row.TaskId)) {
      messages.push(`Invalid TaskId: ${row.TaskId}`);
    }

    if (this.errorMap.unassignedTaskUserPairs.includes(key)) {
      messages.push(`User not assigned to Task`);
    }

    // console.log(this.errorMap);
    // console.log(messages);
    return messages.join(', ');
  }


    // Method for opening dialog to show full cell content
    openCellDialog(title: string, content: string): void {
      this.dialog.open(CellContentDialogComponent, {
        width: '500px',
        data: { title, content },
        panelClass: 'cell-expansion-dialog'
      });
    }

  removeFile(index: number, event: Event) {
    const removedFile = this.files[index];
    this.files.splice(index, 1);
    this.parsedData = this.parsedData.filter(
      (ts) => ts.EmpId !== removedFile.name
    );

    if (this.files.length === 0) {
      this.parsedData = [];
      event.stopPropagation();
      this.fileInput.nativeElement.value = '';
    }

    console.log(this.parsedData);
  }
}

















// Dialog component for showing full cell content
@Component({
  selector: 'app-cell-content-dialog',
  template: `
    <h2 class="dialog-title">{{ data.title }}</h2>
    <div class="dialog-content">{{ data.content }}</div>
    <div class="dialog-actions">
      <button mat-button (click)="dialogRef.close()">Close</button>
    </div>
  `
})
export class CellContentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CellContentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) {}
}

