import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-timesheet-upload',
  imports: [CommonModule],
  templateUrl: './timesheet-upload.component.html',
  styleUrl: './timesheet-upload.component.scss'
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

  constructor(private http: HttpClient) {}

  baseURL = environment.apiBaseUrl;

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
      Array.from(event.dataTransfer.files).forEach(file => {
        if (this.files.some(f => f.name === file.name)) {
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
      if (this.files.some(f => f.name === file.name)) {
        alert(`${file.name} is already selected`);
      } else if (file.name.endsWith('.xlsx')) {
        this.files.push(file);
        this.readFile(file);
      } else {
        alert('Please select a valid .xlsx file.');
      }
    });
    event.target.value = '';
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
        TaskId: row['StoryId'], // Map StoryId to TaskId
        TaskName: row['StoryName'],
        UserId: row['UserId'], // Email from Excel
        Date: this.formatExcelDate(row['Date']),
        TotalHours: row['Daily Log'], // e.g., "02:00"
        Notes: row['Notes'],
        fileName: file.name, // Add file reference
      }));
  
      this.parsedData = [...this.parsedData, ...formattedData];
      console.log(this.parsedData);
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
    if (this.parsedData.length > 0) {
      this.http.post(`${this.baseURL}/timesheet/upload`, this.parsedData).subscribe({
        next: () => {
          alert('Files uploaded successfully');
          location.reload();
        },
        error: (err) => {
          console.log(err);
          alert('Error uploading files');
        },
      });
    } else {
      alert('No data to upload.');
    }
  }

  removeFile(index: number, event: Event) {
    const removedFile = this.files[index];
    this.files.splice(index, 1);
    this.parsedData = this.parsedData.filter(ts => ts.EmpId !== removedFile.name);

    if (this.files.length === 0) {
      this.parsedData = [];
      event.stopPropagation();
      this.fileInput.nativeElement.value = '';
    }

    console.log(this.parsedData);
  }
}
