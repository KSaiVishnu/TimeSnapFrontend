import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../shared/services/timesheet.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dummy-timesheet',
  imports: [CommonModule],
  templateUrl: './dummy-timesheet.component.html',
  styleUrls: ['./dummy-timesheet.component.css']
})
export class DummyTimesheetComponent implements OnInit {
  timesheets: any[] = [];
  billingType = 'Non-Billable'; // Default billing type
  startDate = '2025-03-25'; // Default Start Date
  endDate = '2025-03-28'; // Default End Date
  pageNumber = 1;
  pageSize = 5; // Fetch 5 users' logs per page
  totalUsers = 0; // Total users count for pagination

  isLoading = false;
  errorMessage: string = '';

  constructor(private timesheetService: TimesheetService) {}

  ngOnInit(): void {
    this.fetchTimesheets();
  }

  fetchTimesheets(): void {
    this.isLoading = true;
    this.timesheetService
      .getTimesheets(this.billingType, this.startDate, this.endDate, this.pageNumber, this.pageSize)
      .subscribe({
        next: (response) => {
          this.timesheets = response.timesheets;
          this.totalUsers = response.totalUsers; // Get total user count from backend
          console.log(response);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error("Error fetching timesheets:", error);

          if (error.status === 400) {
            this.errorMessage = "Invalid request. Please check your inputs.";
          } else if (error.status === 404) {
            this.errorMessage = "No timesheets found for the given criteria.";
            this.timesheets = [];
          } else {
            this.errorMessage = "Something went wrong. Please try again later.";
          }
        },
      });
  }

  nextPage(): void {
    if (this.pageNumber * this.pageSize < this.totalUsers) {
      this.pageNumber++;
      this.fetchTimesheets();
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchTimesheets();
    }
  }
}
