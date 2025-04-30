import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Inject, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-task-upload',
  imports: [FormsModule, CommonModule, MatTooltipModule, MatTableModule],
  templateUrl: './task-upload.component.html',
  styleUrl: './task-upload.component.scss',
})

export class TaskUploadComponent {
  files: File[] = [];
  parsedData: any[] = [];

  displayedColumns: string[] = ['index', 'task', 'taskID', 'empId', 'startDate', 'dueDate', 'billingType'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild('fileInput') fileInput!: ElementRef;
  // selectedFile: File | null = null;

  handleClick() {
    if (this.files.length == 0) {
      this.fileInput.nativeElement.click();
    }
  }

  constructor(private http: HttpClient,     private cdr: ChangeDetectorRef, private dialog: MatDialog
  ) {}
  baseURL = environment.apiBaseUrl;

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
      Array.from(event.dataTransfer.files).forEach(file => {
        if(this.files.some(f => f.name === file.name)){
          alert(`${file.name} is already selected`)
        }
        else if (file.name.endsWith('.xlsx')) {
          this.files.push(file);
          this.readFile(file);
        }
        else {
          alert('Please select a valid .xlsx file.');
        }
      });
    }
  }

  onFileChange(event: any) {
    const selectedFiles = Array.from(event.target.files);
    selectedFiles.forEach((file: any) => {
      if(this.files.some(f => f.name === file.name)){
        alert(`${file.name} is already selected`)
      }
      else if (file.name.endsWith('.xlsx')) {
        this.files.push(file);
        this.readFile(file);
      }
     else {
        alert('Please select a valid .xlsx file.');
      }
    });
    event.target.value = '';
  }

  // readFile(file: File) {
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const arrayBuffer = e.target.result;
  //     const data = new Uint8Array(arrayBuffer);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];
  //     let parsedData = XLSX.utils.sheet_to_json(worksheet);

  //     parsedData = parsedData.map((item: any) => ({
  //       ...item,
  //       // "TASK ID": uuidv4(),
  //       fileName: file.name
  //     }));

  //     parsedData.forEach((task: any) => {
  //       let assignees = task["ASSIGNEE NAMES"].split(',');
  //       let empIds = task["EMPID"].split(',');

  //       assignees.forEach((assignee: any, index: any) => {
  //         this.parsedData.push({
  //           task: task.TASK,
  //           // taskID: task["TASK ID"],
  //           taskID: typeof task["TASK ID"] === 'number' ? task["TASK ID"].toString() : task["TASK ID"],
  //           assignee: assignee.trim(),
  //           empId: empIds[index].trim(),
  //           startDate: new Date((task["START DATE"] - 25569) * 86400000),
  //           dueDate: new Date((task["DUE DATE"] - 25569) * 86400000),
  //           billingType: task["BILLING TYPE"],
  //           fileName: file.name
  //         });
  //       });
  //     });

  //     console.log(this.parsedData);
  //   };
  //   reader.readAsArrayBuffer(file);
  // }


  // readFile(file: File) {
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const arrayBuffer = e.target.result;
  //     const data = new Uint8Array(arrayBuffer);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];
  //     let parsedData = XLSX.utils.sheet_to_json(worksheet);
  
  //     parsedData = parsedData.map((item: any) => ({
  //       ...item,
  //       fileName: file.name
  //     }));
  
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
  //     const due = new Date(today);
  //     due.setDate(due.getDate() + 60); // Add 60 days
      
  //     parsedData.forEach((task: any) => {
  //       const empIds = task.UserId.split(','); // split multiple EmpIds
  
  //       empIds.forEach((empId: string) => {
  //         this.parsedData.push({
  //           task: task.StoryName,
  //           taskID: typeof task["StoryId"] === 'number' ? task["StoryId"].toString() : task["StoryId"],
  //           assignee: "", // no assignee column
  //           empId: empId.trim(),
  //           startDate: today.toISOString(),      // "2025-04-28T00:00:00.000Z"
  //           dueDate: due.toISOString(),          // "2025-06-27T00:00:00.000Z"            
  //           billingType: task["Billing Type"],
  //           fileName: file.name
  //         });
  //       });
  //     });
  
  //     console.log(this.parsedData);
  //   };
  //   reader.readAsArrayBuffer(file);
  // }
  

  // uploadFiles() {
  //   if (this.files.length > 0 && this.parsedData.length > 0) {
  //     this.http
  //       .post(`${this.baseURL}/tasks/upload`, this.parsedData)
  //       .subscribe({
  //         next: (res: any) => {
  //           alert('Files uploaded successfully');
  //           location.reload();
  //         },
  //         error: (err) => {
  //           console.log(err);
  //           alert('Error uploading files');
  //         },
  //       });
  //   } else {
  //     alert('No files selected or data missing.');
  //   }
  // }


  rawData: any;

  readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const arrayBuffer = e.target.result;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let parsedData = XLSX.utils.sheet_to_json(worksheet);
      this.rawData = [...parsedData];
      // console.log(rawData);
  
      parsedData = parsedData.map((item: any) => ({
        ...item,
        fileName: file.name
      }));
  
      // Frontend Validation
      const validationErrors: string[] = [];
  
      parsedData.forEach((task: any, index: number) => {
        // Validate required fields
        if (!task.StoryName) {
          validationErrors.push(`Row ${index + 1}: StoryName is required.`);
        }
        if (!task.StoryId) {
          validationErrors.push(`Row ${index + 1}: StoryId is required.`);
        }
        if (!task["UserId"]) {
          validationErrors.push(`Row ${index + 1}: UserId is required.`);
        }
        if (!task["Billing Type"]) {
          validationErrors.push(`Row ${index + 1}: Billing Type is required.`);
        }
  
        // Validate Employee IDs (should not be empty and should be in valid format)
        const empIds = task.UserId.split(',');
        empIds.forEach((empId: string, subIndex: number) => {
          if (!empId.trim()) {
            validationErrors.push(`Row ${index + 1}: Employee ID cannot be empty in assignee column.`);
          }
        });
  
        // Validate dates (startDate and dueDate)
        const today = new Date();
        today.setHours(0, 0, 0, 0);  // Set time to 00:00:00.000
        const due = new Date(today);
        due.setDate(due.getDate() + 60);  // Add 60 days to get due date
        const startDate = new Date(task.startDate);
        const dueDate = new Date(task.dueDate);
  
        if (startDate < today) {
          validationErrors.push(`Row ${index + 1}: Start Date cannot be in the past.`);
        }
        if (dueDate < startDate) {
          validationErrors.push(`Row ${index + 1}: Due Date cannot be earlier than Start Date.`);
        }
  
      });
  
      if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'));
        return;
      }
  
      // Process valid data
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // Set time to 00:00:00.000
      const due = new Date(today);
      due.setDate(due.getDate() + 60);  // Add 60 days to get due date
      
      this.parsedData = [];
  
      parsedData.forEach((task: any) => {
        const empIds = task.UserId.split(','); // split multiple EmpIds
  
        empIds.forEach((empId: string) => {
          this.parsedData.push({
            task: task.StoryName,
            taskID: typeof task["StoryId"] === 'number' ? task["StoryId"].toString() : task["StoryId"],
            assignee: "", // no assignee column
            empId: empId.trim(),
            startDate: today.toISOString(), // "2025-04-28T00:00:00.000Z"
            dueDate: due.toISOString(), // "2025-06-27T00:00:00.000Z"
            billingType: task["Billing Type"],
            fileName: file.name
          });
        });
      });
  
      console.log(this.parsedData, this.parsedData.length);
      this.parsedData = [...this.parsedData];
      console.log(this.rawData);
      this.errorEmpIds = [];
      this.cdr.detectChanges();

    };
    reader.readAsArrayBuffer(file);
  }
  
  errorEmpIds: string[] = []; // ✅ initialized to empty array
  uploadFiles() {
    if (this.files.length > 0 && this.parsedData.length > 0) {
      this.http
        .post(`${this.baseURL}/tasks/upload`, this.parsedData)
        .subscribe({
          next: (res: any) => {
            // If the response contains success
            alert('Files uploaded successfully');
            location.reload();
          },
          error: (err) => {
            // // Handling network or server errors
            // if (err.status === 0) {
            //   // Network error (e.g., server not reachable)
            //   alert('Network error: Unable to reach the server. Please try again later.');
            // } else if (err.status >= 400 && err.status < 500) {
            //   // Client errors, e.g., bad data sent from the frontend
            //   if (err.error && err.error.message) {
            //     alert(`Error: ${err.error.message}`);
            //   } else {
            //     alert('Client-side error occurred. Please check the uploaded data and try again.');
            //   }
            // } else if (err.status >= 500) {
            //   // Server errors
            //   alert('Server error occurred. Please try again later.');
            // } else {
            //   // Unknown error
            //   alert('An unknown error occurred. Please try again.');
            // }

            if (err.status === 400 && err.error?.invalidEmpIds) {
              this.errorEmpIds = err.error.invalidEmpIds;
              alert(`Error: ${err.error.message}`);
              this.cdr.detectChanges();
            } else {
            }
  
            console.error('Upload error:', err); // Log the error for debugging
          },
        });
    } else {
      alert('No files selected or data missing.');
    }
  }
  








  
  isError(row: any): boolean {
    return this.errorEmpIds.includes(row.empId);
  }

  getErrorMessage(row: any): string {
    if (this.errorEmpIds.includes(row.empId)) {
      return 'Invalid Employee ID';
    }
    return '';
  }



    // Method for opening dialog to show full cell content
    openCellDialog(title: string, content: string): void {
      this.dialog.open(CellContentDialogComponent, {
        width: '500px',
        data: { title, content },
        panelClass: 'cell-expansion-dialog'
      });
    }


  removeFile(index: number, event:Event) {
    const removedFile = this.files[index];
    this.files.splice(index, 1);
    this.parsedData = this.parsedData.filter(task => task.fileName !== removedFile.name);

    if (this.files.length === 0) {
      this.parsedData = [];
      event.stopPropagation(); // Prevent reopening file explorer
      this.fileInput.nativeElement.value = ''; // Reset file input
      console.log(this.files);
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
  `,
})
export class CellContentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CellContentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) {}
}

// Pipe for truncating text
@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 25, completeWords = false, ellipsis = '...') {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (completeWords) {
      limit = value.substring(0, limit).lastIndexOf(' ');
    }
    return `${value.substring(0, limit)}${ellipsis}`;
  }
}