import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-worklog-leaves',
  imports: [CommonModule],
  templateUrl: './worklog-leaves.component.html',
  styleUrls: ['./worklog-leaves.component.scss'],
})
export class WorklogLeavesComponent {

  constructor(private http: HttpClient) {}

  selectedFile: File | null = null;
  isDragOver = false;

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx')) {
        this.selectedFile = file;
      }
    }
  }

  clearFile(): void {
    this.selectedFile = null;
  }


  baseURL = environment.apiBaseUrl;

  // onFileSelected(event: any) {
  //   this.selectedFile = event.target.files[0];
  // }

  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http
      .post(`${this.baseURL}/excel/upload`, formData, {
        responseType: 'blob',
      })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'FilteredEmployees.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
