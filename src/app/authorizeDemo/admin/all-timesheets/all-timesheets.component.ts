import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ExportPopupComponent } from '../../../export-popup/export-popup.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
// import * as Papa from 'papaparse';  // CSV Export Library
import saveAs from 'file-saver';

import * as XLSX from 'xlsx'; // ✅ For exporting Excel
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCard, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { MatButton } from '@angular/material/button';
import { MinutesToHoursPipe } from "../../../shared/pipes/minutes-to-hours.pipe";
import { TimeFormatPipe } from "../../../shared/pipes/time-format.pipe";

enum ApiStatus {
  INITIAL = 'INITIAL',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Component({
  selector: 'app-all-timesheets',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatExpansionModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatButton,
    MatDateRangePicker,
    MinutesToHoursPipe,
    TimeFormatPipe
],
  templateUrl: './all-timesheets.component.html',
  styleUrl: './all-timesheets.component.scss',
})
export class AllTimesheetsComponent {
  //   range = new FormGroup({
  //     start: new FormControl<Date | null>(this.getStartOfWeek()),
  //     end: new FormControl<Date | null>(this.getEndOfWeek()),
  //   });

  //   timesheets: any[] = [];
  //   filteredTimeSheets: any[] = [];
  //   groupedTimeSheets: any[] = [];

  //   @Input() billingType = '';

  //   // Function to get the start of the current week (Sunday)
  //   getStartOfWeek(): Date {
  //     const today = new Date();
  //     const day = today.getDay(); // Get day of the week (0 = Sunday, 6 = Saturday)
  //     const startOfWeek = new Date(today);
  //     startOfWeek.setDate(today.getDate() - day); // Move back to Sunday
  //     return startOfWeek;
  //   }

  //   // Function to get the end of the current week (Saturday)
  //   getEndOfWeek(): Date {
  //     const today = new Date();
  //     const day = today.getDay();
  //     const endOfWeek = new Date(today);
  //     endOfWeek.setDate(today.getDate() + (6 - day)); // Move forward to Saturday
  //     return endOfWeek;
  //   }

  //   constructor(private http: HttpClient, private dialog: MatDialog) {}
  //   baseURL = environment.apiBaseUrl;

  //   ngOnInit() {
  //     this.fetchTimeSheets();
  //     this.range.valueChanges.subscribe(() => {
  //       this.filterTimeSheets();
  //     });
  //   }

  //   fetchTimeSheets() {
  //     let params = new HttpParams();

  //     if (this.billingType) {
  //       params = params.set('billingType', this.billingType);
  //     }

  //     params.set('pageNumber', 1);
  //     params.set('pageSize', 5);

  //     this.http.get<any[]>(`${this.baseURL}/timesheet/filtered-timesheets`, {params}).subscribe({
  //       next: (res: any) => {
  //         this.timesheets = res;
  //         // this.filterTimeSheets(); // Apply filter initially
  //         console.log(this.billingType)
  //         console.log(res);
  //       },
  //       error: (err) => {
  //         console.log(err);
  //       },
  //     });
  //   }

  //   filterTimeSheets(): void {
  //     const startDate = this.range.value.start
  //       ? new Date(this.range.value.start)
  //       : null;
  //     const endDate = this.range.value.end
  //       ? new Date(this.range.value.end)
  //       : null;

  //     if (startDate) {
  //       startDate.setHours(0, 0, 0, 0); // Set to 00:00:00
  //     }

  //     if (endDate) {
  //       endDate.setHours(23, 59, 59, 999); // Optional: Set to end of the day
  //     }

  //     this.filteredTimeSheets = this.timesheets.filter((timesheet) => {
  //       const timesheetDate = new Date(timesheet.date);
  //       return (
  //         (!startDate || timesheetDate >= startDate) &&
  //         (!endDate || timesheetDate <= endDate)
  //       );
  //     });

  //     const groupedTimesheets = this.filteredTimeSheets.reduce((acc, entry) => {
  //       let user = acc.find(
  //         (u: { userName: any }) => u.userName === entry.userName
  //       );

  //       if (user) {
  //         user.timesheets.push({
  //           taskId: entry.taskId,
  //           taskName: entry.taskName,
  //           date: entry.date,
  //           totalMinutes: entry.totalMinutes,
  //           billingType: entry.billingType,
  //           notes: entry.notes
  //         });
  //       } else {
  //         acc.push({
  //           userName: entry.userName,
  //           timesheets: [
  //             {
  //               taskId: entry.taskId,
  //               taskName: entry.taskName,
  //               date: entry.date,
  //               totalMinutes: entry.totalMinutes,
  //               billingType: entry.billingType,
  //               notes: entry.notes
  //             },
  //           ],
  //         });
  //       }

  //       return acc;
  //     }, []);
  //     this.groupedTimeSheets = groupedTimesheets;
  //     console.log(groupedTimesheets);
  //   }

  //   openExportTimeSheetsPopup(filteredTimeSheets: any) {
  //     this.dialog.open(ExportPopupComponent, {
  //       width: '50%',
  //       data: { filteredTimeSheets },
  //     });
  //   }

  //   format(num: number) {
  //     return (num + '').length === 1 ? '0' + num : num + '';
  //   }

  //   convert(num: number) {
  //     let x = Math.round(num / 60);
  //     let y = num % 60;
  //     // console.log(y);
  //     return this.format(x) + ':' + this.format(y);
  //   }

  //   Sum(timeSheets: any) {
  //     let sum = 0;
  //     for (let x of timeSheets) {
  //       sum += x.totalMinutes;
  //     }
  //     return this.convert(sum);
  //     // return sum;
  //   }

  //   onResetFilters() {
  //     this.range.reset();
  //     console.log(this.range);
  //     this.filterTimeSheets();
  //   }
  //   // Add this method to your component class
  // getInitials(name: string): string {
  //   if (!name) return '';
  //   return name
  //     .split(' ')
  //     .map(part => part.charAt(0))
  //     .join('')
  //     .toUpperCase()
  //     .substring(0, 2);
  // }

  @Input() billingType: string = '';
  baseURL = environment.apiBaseUrl;

  timesheetsData: any[] = [];
  paginatedTimesheets: any[] = [];
  expandedIndexes: Set<number> = new Set();

  currentPage: number = 1;
  pageSize: number = 50;
  totalPages: number = 0;

  range: FormGroup;

  apiStatus: ApiStatus = ApiStatus.INITIAL;
  errorMessage: string = '';
  errorStatus: number | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private errorHandler: ErrorHandlerService
  ) {
    const today = new Date();
    const currentDay = today.getDay();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    this.range = this.fb.group({
      start: [startOfWeek],
      end: [endOfWeek],
    });
    
    this.expandedUsers = new Array(this.timesheetsData.length).fill(true);
  }

  ngOnInit(): void {
    this.fetchTimesheets();
      this.range.valueChanges.subscribe(() => {
        this.fetchTimesheets();
      });
  }

  expandedUsers: boolean[] = [];

  toggleUser(index: number) {
    this.expandedUsers[index] = !this.expandedUsers[index];
  }

  totalUsers: number = 0;


  fetchTimesheets() {
    if (!this.range.value.start || !this.range.value.end) return;

    let params = new HttpParams()
      .set('startDate', this.formatDate(this.range.value.start))
      .set('endDate', this.formatDate(this.range.value.end))
      .set('billingType', this.billingType)
      .set('page', this.currentPage)  // Send current page
      .set('pageSize', this.pageSize); // Send page size;

    console.log(this.currentPage,this.pageSize)

    console.log(
      this.formatDate(this.range.value.start),
      this.formatDate(this.range.value.end)
    );

    this.apiStatus = ApiStatus.IN_PROGRESS;
    this.http
      .get<any>(`${this.baseURL}/timesheet/filtered-timesheets`, { params })
      .subscribe({
        next: (response) => {
          console.log(response);
          this.apiStatus = ApiStatus.SUCCESS;
          this.timesheetsData = [...response.timesheets];

          // this.totalPages = Math.ceil(response.totalUsers / this.pageSize); // Correct total pages
          // this.currentPage = 1; // Reset to first page on new fetch


          this.totalUsers = response.totalUsers;
          this.totalPages = Math.ceil(this.totalUsers / this.pageSize);

          // this.updatePaginatedTimesheets();
          this.expandedUsers = new Array(this.timesheetsData.length).fill(true);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.apiStatus = ApiStatus.FAILURE;
          this.handleError(error);
          console.error('Error fetching timesheets:', error);
          this.cdr.detectChanges();
        },
      });
  }
    private handleError(error: HttpErrorResponse) {
      const errorInfo = this.errorHandler.getErrorMessage(error);
      this.errorStatus = errorInfo.status;
      this.errorMessage = errorInfo.message;
    } 


    onRetry(){
      this.fetchTimesheets();
    }
  
  private formatDate(date: Date | null): string {
    if (!date) return '';
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().split('T')[0];
  }

  openExportPopup() {
    const filteredTimeSheets: any[] = this.flattenTimesheets();
    console.log(filteredTimeSheets);
    this.dialog.open(ExportPopupComponent, {
      width: '400px',
      data: filteredTimeSheets,
    });
  }

  getTotalTime(timesheets: any[]): string {
    const totalMinutes = timesheets.reduce((sum, t) => sum + t.totalMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  

  private flattenTimesheets(): any[] {
    return this.timesheetsData.flatMap((user) =>
      user.timesheets.map((task: any) => ({
        id: task.timesheetId,
        empId: user.empId,
        taskId: task.taskId,
        date: task.date,
        totalMinutes: task.totalMinutes,
        userName: user.userName,
        taskName: task.taskName,
        billingType: task.billingType,
        notes: task.notes,
      }))
    );
  }
}
