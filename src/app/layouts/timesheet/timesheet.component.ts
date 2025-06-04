import { Component, type OnInit, ViewChild } from "@angular/core"
import { TimesheetService } from "../../shared/services/timesheet.service"
import { MatPaginator } from "@angular/material/paginator"
import { UserService } from "../../shared/services/user.service"
import { finalize, catchError } from "rxjs/operators"
import { of } from "rxjs"
import { trigger, state, style, transition, animate } from "@angular/animations"

// Import Angular Material modules
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatChipsModule } from "@angular/material/chips"
import { MatDividerModule } from "@angular/material/divider"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatExpansionModule } from "@angular/material/expansion"
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field"
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
} from "@angular/material/datepicker"
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { MatNativeDateModule } from "@angular/material/core"
import { EditLogPopupComponent } from "../../edit-log-popup/edit-log-popup.component"
import { MatDialog } from "@angular/material/dialog"
import { DeleteTimesheetPopupComponent } from "../../delete-timesheet-popup/delete-timesheet-popup.component"
import { AddTimesheetComponent } from "../../add-timesheet/add-timesheet.component"
import { AddLogModalComponent } from "../add-log-modal/add-log-modal.component"

interface Timesheet {
  taskId: string
  taskName: string
  totalMinutes: number
  notes: string
  billingType: string
  projectCode?: string
  status?: string
}

interface TimesheetGroup {
  date: Date
  timesheets: Timesheet[]
  totalMinutes: number
}

@Component({
  selector: "app-timesheet",
  templateUrl: "./timesheet.component.html",
  styleUrls: ["./timesheet.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatLabel,
    MatDateRangePicker,
    MatDateRangeInput,
    MatDatepickerToggle,
    FormsModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  animations: [
    trigger("expandCollapse", [
      state(
        "collapsed",
        style({
          height: "0",
          overflow: "hidden",
          opacity: "0",
        }),
      ),
      state(
        "expanded",
        style({
          height: "*",
          opacity: "1",
        }),
      ),
      transition("collapsed <=> expanded", [animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)")]),
    ]),
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("400ms ease-in", style({ opacity: 1 }))])]),
    trigger("rotateAnimation", [
      state("collapsed", style({ transform: "rotate(0deg)" })),
      state("expanded", style({ transform: "rotate(180deg)" })),
      transition("collapsed <=> expanded", [animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)")]),
    ]),
  ],
})
export class TimesheetComponent implements OnInit {
  // Data
  groupedData: TimesheetGroup[] = []
  totalGroups = 0
  pageSize = 5
  pageNumber = 1
  empId: any
  totalHoursToday = 0
  totalHoursThisWeek = 0

  totalMinutesInDateRange = 0

  // UI States
  loading = true
  pageLoading = false
  error = false
  errorMessage = "Failed to load timesheets. Please try again."
  expandedDays: Record<string, boolean> = {}

  // Date range variables
  startDate: Date | null = null
  endDate: Date | null = null

  range: FormGroup

  // Add this property
  totalPages = 1

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private userService: UserService,
  ) {
    const today = new Date()
    const currentDay = today.getDay()

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1))

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    this.range = this.fb.group({
      start: [startOfWeek],
      end: [endOfWeek],
    })
  }

  ngOnInit(): void {
    this.initializeUser()
    this.range.valueChanges.subscribe(() => {
      this.pageNumber = 1
      this.fetchTimesheets()
    })
  }

  initializeUser(): void {
    const userDetails = this.userService.getUserDetails()

    if (!userDetails()) {
      this.userService
        .getUserProfile()
        .pipe(
          catchError((err) => {
            this.handleError(err, "Failed to retrieve user profile")
            return of(null)
          }),
        )
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.empId = res.empId
              this.fetchTimesheets()
            }
          },
        })
    } else {
      this.empId = userDetails().empId
      this.fetchTimesheets()
    }
  }

  // Update fetchTimesheets to calculate totalPages
  fetchTimesheets(): void {
    // Reset error state
    this.error = false

    // Set appropriate loading state
    if (this.groupedData.length === 0) {
      this.loading = true
    } else {
      this.pageLoading = true
    }

    this.timesheetService
      .getUserTimesheets(
        this.pageNumber,
        this.pageSize,
        this.empId,
        this.formatDate(this.range.value.start),
        this.formatDate(this.range.value.end),
      )
      .pipe(
        catchError((err) => {
          this.handleError(err, "Failed to fetch timesheets")
          return of(null)
        }),
        finalize(() => {
          this.loading = false
          this.pageLoading = false
        }),
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.totalGroups = response.totalGroups
            // Calculate total pages
            this.totalPages = Math.ceil(this.totalGroups / this.pageSize)

            this.groupedData = response.groupedTimesheets.map((group: any) => {
              // Calculate total minutes for each group
              const totalMinutes = group.timesheets.reduce(
                (sum: number, entry: Timesheet) => sum + entry.totalMinutes,
                0,
              )

              return {
                date: new Date(group.date),
                timesheets: group.timesheets,
                totalMinutes: totalMinutes,
              }
            })

            // Initialize all days as expanded
            this.groupedData.forEach((group) => {
              this.expandedDays[group.date.toISOString()] = true
            })

            // Calculate summary statistics
            this.calculateSummaryStats()
          }
        },
      })
  }

  // Add these methods for pagination
  onPrevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--
      this.fetchTimesheets()
    }
  }

  onNextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++
      this.fetchTimesheets()
    }
  }

  private formatDate(date: Date | null): string {
    if (!date) return ""
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return localDate.toISOString().split("T")[0]
  }

  calculateSummaryStats(): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)

    this.totalHoursToday = 0
    this.totalHoursThisWeek = 0

    this.totalMinutesInDateRange = 0

    console.log(this.groupedData);

    this.groupedData.forEach((group) => {
      const groupDate = new Date(group.date)
      groupDate.setHours(0, 0, 0, 0)

      if (groupDate.getTime() === today.getTime()) {
        this.totalHoursToday += group.totalMinutes
      }

      if (groupDate >= weekStart && groupDate <= today) {
        this.totalHoursThisWeek += group.totalMinutes
      }

      this.totalMinutesInDateRange += group.totalMinutes;
    })

    // Convert minutes to hours
    this.totalHoursToday = Math.round((this.totalHoursToday / 60) * 10) / 10
    this.totalHoursThisWeek = Math.round((this.totalHoursThisWeek / 60) * 10) / 10

    console.log(this.totalMinutesInDateRange);
  }

  onPageChange(event: any): void {
    this.pageNumber = event.pageIndex + 1
    this.pageSize = event.pageSize
    this.fetchTimesheets()
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    // if (hours === 0) {
    //   return `${mins}m`
    // } else if (mins === 0) {
    //   return `${hours}h`
    // } else {
    //   return `${hours}h ${mins}m`
    // }

      return `${hours}h ${mins}m`

  }

  getBillingTypeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case "billable":
        return "billing-billable"
      case "non-billable":
        return "billing-non-billable"
      case "internal":
        return "billing-internal"
      default:
        return "billing-default"
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case "completed":
        return "status-completed"
      case "in progress":
        return "status-in-progress"
      case "pending":
        return "status-pending"
      default:
        return "status-default"
    }
  }

  toggleDayExpansion(dateString: string): void {
    this.expandedDays[dateString] = !this.expandedDays[dateString]
  }

  isDayExpanded(dateString: string): boolean {
    return !!this.expandedDays[dateString]
  }

  retryFetch(): void {
    this.fetchTimesheets()
  }

  refreshPage(): void {
    window.location.reload()
  }

  private handleError(error: any, defaultMessage: string): void {
    console.error("Error:", error)
    this.error = true
    this.loading = false;
    this.errorMessage = error?.message || defaultMessage
  }

  onAddTimesheet(){
        const dialogRef = this.dialog.open(AddTimesheetComponent, {
          width: '50%',
          data:{empId: this.empId}
        });
    
        dialogRef.afterClosed().subscribe((updatedLog: any) => {
          console.log(updatedLog);
          if(updatedLog){
            this.fetchTimesheets();
          }
        });
  }

  onEditTimesheet(entry: any){
    console.log(entry);
    entry = {
      ...entry,
      empId: this.empId,
      timesheetId: entry.id
    }
        const dialogRef = this.dialog.open(EditLogPopupComponent, {
          width: '50%',
          data: { log: entry },
        });
    
        dialogRef.afterClosed().subscribe((updatedLog: any) => {
          console.log(updatedLog);
          if(updatedLog){
            this.fetchTimesheets();
          }
        });
  }

  onDeleteTimesheet(entry: any){
        console.log(entry.id);
        
        const dialogRef = this.dialog.open(DeleteTimesheetPopupComponent, {
          width: '50%',
          data: { id: entry.id },
        });
    
    
        dialogRef.afterClosed().subscribe((deletedId) => {
          if (deletedId) {
            // let deletedTimeSheet = this.timesheets.find(
            //   (each: any) => each.id === deletedId
            // );
            // this.totalTimeInMinutes -= deletedTimeSheet.totalMinutes;
            // this.timesheets = this.timesheets.filter((t) => t.id !== deletedId);
    
            // this.timesheets = [...this.timesheets]; // Ensure UI refresh
    
    
            this.fetchTimesheets();
          }
        });
  }
}
