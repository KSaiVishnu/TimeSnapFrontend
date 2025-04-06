// import { Component } from '@angular/core';
// import * as XLSX from 'xlsx';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';

// @Component({
//   selector: 'app-leaves-upload',
//   imports: [],
//   templateUrl: './leaves-upload.component.html',
//   styleUrl: './leaves-upload.component.css'
// })

// export class LeavesUploadComponent {
//   file: File | null = null;
//   parsedData: any[] = [];
//   baseURL = environment.apiBaseUrl;

//   constructor(private http: HttpClient) {}

//   onFileChange(event: any) {
//     const target: DataTransfer = <DataTransfer>(event.target);
//     if (target.files.length !== 1) return;

//     this.file = target.files[0];
//     const reader: FileReader = new FileReader();

//     reader.onload = (e: any) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
//       const sheetName: string = workbook.SheetNames[0];
//       const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
//       this.parsedData = XLSX.utils.sheet_to_json(worksheet);
//     };

//     reader.readAsArrayBuffer(this.file);
//   }

//   uploadFile() {
//     if (!this.file) return;

//     const formData = new FormData();
//     formData.append('file', this.file);

//     this.http.post(`${this.baseURL}/leaves/upload`, formData)
//       .subscribe(response => {
//         console.log('Upload successful:', response);
//       }, error => {
//         console.error('Upload error:', error);
//       });
//   }
// }



import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-leaves-upload',
  imports: [FormsModule, CommonModule],
  templateUrl: './leaves-upload.component.html',
  styleUrl: './leaves-upload.component.scss',
})

export class LeavesUploadComponent {
  file: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  handleClick() {
    if (!this.file) {
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
    if (event.dataTransfer?.files.length === 1) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx')) {
        this.file = droppedFile;
      } else {
        alert('Please select a valid .xlsx file.');
      }
    } else {
      alert('Only one file can be uploaded at a time.');
    }
  }

  onFileChange(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx')) {
        this.file = selectedFile;
      } else {
        alert('Please select a valid .xlsx file.');
      }
    }
    event.target.value = '';
  }

  uploadFile() {
    if (!this.file) return;

    const formData = new FormData();
    formData.append('file', this.file);

    this.http.post(`${this.baseURL}/leaves/upload`, formData)
      .subscribe({
        next: (res: any) => {
          alert('File uploaded successfully');
          this.file = null;
        },
        error: (err) => {
          console.log(err);
          alert('Error uploading file');
        },
      });
  }

  removeFile(event: Event) {
    this.file = null;
    event.stopPropagation();
    this.fileInput.nativeElement.value = ''; // Reset file input
  }
}
