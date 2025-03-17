import { Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ExportPopupComponent } from '../../../export-popup/export-popup.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-all-timesheets',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './all-timesheets.component.html',
  styleUrl: './all-timesheets.component.css',
})
export class AllTimesheetsComponent {
  range = new FormGroup({
    start: new FormControl<Date | null>(this.getStartOfWeek()),
    end: new FormControl<Date | null>(this.getEndOfWeek()),
  });

  timesheets: any[] = [];
  filteredTimeSheets: any[] = [];
  groupedTimeSheets: any[] = [];

  @Input() billingType = '';

  // Function to get the start of the current week (Sunday)
  getStartOfWeek(): Date {
    const today = new Date();
    const day = today.getDay(); // Get day of the week (0 = Sunday, 6 = Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day); // Move back to Sunday
    return startOfWeek;
  }

  // Function to get the end of the current week (Saturday)
  getEndOfWeek(): Date {
    const today = new Date();
    const day = today.getDay();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - day)); // Move forward to Saturday
    return endOfWeek;
  }

  constructor(private http: HttpClient, private dialog: MatDialog) {}
  baseURL = environment.apiBaseUrl;

  ngOnInit() {
    this.fetchTimeSheets();
    this.range.valueChanges.subscribe(() => {
      this.filterTimeSheets();
    });
  }

  fetchTimeSheets() {
    let params = new HttpParams();

    if (this.billingType) {
      params = params.set('billingType', this.billingType);
    }

    this.http.get<any[]>(`${this.baseURL}/timesheet`, {params}).subscribe({
      next: (res: any) => {
        this.timesheets = res;
        this.filterTimeSheets(); // Apply filter initially
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  filterTimeSheets(): void {
    const startDate = this.range.value.start
      ? new Date(this.range.value.start)
      : null;
    const endDate = this.range.value.end
      ? new Date(this.range.value.end)
      : null;

    if (startDate) {
      startDate.setHours(0, 0, 0, 0); // Set to 00:00:00
    }

    if (endDate) {
      endDate.setHours(23, 59, 59, 999); // Optional: Set to end of the day
    }

    this.filteredTimeSheets = this.timesheets.filter((timesheet) => {
      const timesheetDate = new Date(timesheet.date);
      return (
        (!startDate || timesheetDate >= startDate) &&
        (!endDate || timesheetDate <= endDate)
      );
    });

    const groupedTimesheets = this.filteredTimeSheets.reduce((acc, entry) => {
      let user = acc.find(
        (u: { userName: any }) => u.userName === entry.userName
      );

      if (user) {
        user.timesheets.push({
          taskId: entry.taskId,
          taskName: entry.taskName,
          date: entry.date,
          totalMinutes: entry.totalMinutes,
          billingType: entry.billingType,
          notes: entry.notes
        });
      } else {
        acc.push({
          userName: entry.userName,
          timesheets: [
            {
              taskId: entry.taskId,
              taskName: entry.taskName,
              date: entry.date,
              totalMinutes: entry.totalMinutes,
              billingType: entry.billingType,
              notes: entry.notes
            },
          ],
        });
      }

      return acc;
    }, []);
    this.groupedTimeSheets = groupedTimesheets;
    console.log(groupedTimesheets);
  }

  openExportTimeSheetsPopup(filteredTimeSheets: any) {
    this.dialog.open(ExportPopupComponent, {
      width: '50%',
      data: { filteredTimeSheets },
    });
  }

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  convert(num: number) {
    let x = Math.round(num / 60);
    let y = num % 60;
    // console.log(y);
    return this.format(x) + ':' + this.format(y);
  }

  Sum(timeSheets: any) {
    let sum = 0;
    for (let x of timeSheets) {
      sum += x.totalMinutes;
    }
    return this.convert(sum);
    // return sum;
  }

  onResetFilters() {
    this.range.reset();
    console.log(this.range);
    this.filterTimeSheets();
  }
}
