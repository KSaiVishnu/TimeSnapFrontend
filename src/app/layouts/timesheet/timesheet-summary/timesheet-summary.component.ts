import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { pulseAnimation } from '../../../shared/animations/timesheet-animations';

@Component({
  selector: 'app-timesheet-summary',
  templateUrl: './timesheet-summary.component.html',
  styleUrls: ['./timesheet-summary.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
  animations: [pulseAnimation]
})
export class TimesheetSummaryComponent {
  @Input() totalHoursToday: number = 0;
  @Input() totalHoursThisWeek: number = 0;
  
  // Calculate percentage for circular progress (max set at 10 hours for visual clarity)
  getDailyPercentage(): number {
    const maxHours = 10; // Visual ceiling
    return Math.min((this.totalHoursToday / maxHours) * 100, 100);
  }
  
  getWeeklyPercentage(): number {
    const maxHours = 40; // Standard work week
    return Math.min((this.totalHoursThisWeek / maxHours) * 100, 100);
  }
  
  // Determine color based on hours tracked
  getDailyColor(): string {
    if (this.totalHoursToday < 4) return 'low-hours';
    if (this.totalHoursToday < 8) return 'mid-hours';
    return 'high-hours';
  }
  
  getWeeklyColor(): string {
    if (this.totalHoursThisWeek < 20) return 'low-hours';
    if (this.totalHoursThisWeek < 35) return 'mid-hours';
    return 'high-hours';
  }
}