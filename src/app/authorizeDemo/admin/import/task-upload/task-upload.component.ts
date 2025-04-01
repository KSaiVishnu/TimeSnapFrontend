import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-task-upload',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-upload.component.html',
  styleUrl: './task-upload.component.scss',
})

export class TaskUploadComponent {
  files: File[] = [];
  parsedData: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef;
  // selectedFile: File | null = null;

  handleClick() {
    if (this.files.length == 0) {
      this.fileInput.nativeElement.click();
    }
  }

  constructor(private http: HttpClient) {}
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

  readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const arrayBuffer = e.target.result;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let parsedData = XLSX.utils.sheet_to_json(worksheet);

      parsedData = parsedData.map((item: any) => ({
        ...item,
        // "TASK ID": uuidv4(),
        fileName: file.name
      }));

      parsedData.forEach((task: any) => {
        let assignees = task["ASSIGNEE NAMES"].split(',');
        let empIds = task["EMPID"].split(',');

        assignees.forEach((assignee: any, index: any) => {
          this.parsedData.push({
            task: task.TASK,
            taskID: task["TASK ID"],
            assignee: assignee.trim(),
            empId: empIds[index].trim(),
            startDate: new Date((task["START DATE"] - 25569) * 86400000),
            dueDate: new Date((task["DUE DATE"] - 25569) * 86400000),
            billingType: task["BILLING TYPE"],
            fileName: file.name
          });
        });
      });

      console.log(this.parsedData);
    };
    reader.readAsArrayBuffer(file);
  }

  uploadFiles() {
    if (this.files.length > 0 && this.parsedData.length > 0) {
      this.http
        .post(`${this.baseURL}/tasks/upload`, this.parsedData)
        .subscribe({
          next: (res: any) => {
            alert('Files uploaded successfully');
            location.reload();
          },
          error: (err) => {
            console.log(err);
            alert('Error uploading files');
          },
        });
    } else {
      alert('No files selected or data missing.');
    }
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
