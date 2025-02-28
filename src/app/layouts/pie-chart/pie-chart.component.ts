import { Component, Input, SimpleChanges } from '@angular/core';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexTitleSubtitle, NgApexchartsModule } from 'ng-apexcharts';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [NgApexchartsModule,CommonModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent {
  chartOptions: any = null; // Ensure it's initially null
  @Input() empId!: string;

  constructor(private http: HttpClient) {
    // this.fetchTaskStatus();
  }
  baseURL = environment.apiBaseUrl;

  ngOnInit() {
    this.fetchTaskStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['empId'] && changes['empId'].currentValue) {
      this.fetchTaskStatus(); // Call chart function when empId updates
    }
  }

  fetchTaskStatus() {
    this.http.get<{ status: string; count: number }[]>(`${this.baseURL}/tasks/status/${this.empId}`)
      .subscribe({
        next: (data) => {
          const labels = data.map(item => item.status);
          const series = data.map(item => item.count);
      
          const colorMapping: { [key: string]: string } = {
            'NotStarted': '#007bff',  // Blue
            'InProgress': '#ffc107',  // Yellow
            'Completed': '#28a745'    // Green
          };
      
          const colors = labels.map(label => colorMapping[label] || '#6c757d'); // Default Grey
          console.log(data);
          if (data && data.length > 0) {
            this.chartOptions = {
              chart: { type: 'pie' },
              labels: labels,
              series: series,
              colors: colors,
              responsive: [
                {
                  breakpoint: 480,
                  options: {
                    chart: { width: 200 },
                    legend: { position: 'bottom' }
                  }
                }
              ]
            };
          }
        },
        error: (err) => {
          console.error("Error fetching task status", err);
        }
      });
  }
  
}
