import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { Console } from 'console';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  fill: ApexFill;
  markers: ApexMarkers;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-line-chart',
  imports: [NgApexchartsModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent implements OnChanges {
  // @ViewChild("chart") chart!: ChartComponent;
  // // public chartOptions: Partial<ChartOptions>;
  // public chartOptions: Partial<ChartOptions> = {
  //   series: [], // Initialize as an empty array to avoid `undefined`
  // };

  // constructor() {
  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: "Likes",
  //         data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5],
  //       },
  //     ],
  //     chart: {
  //       height: 350,
  //       type: "line",
  //     },
  //     stroke: {
  //       width: 7,
  //       curve: "smooth",
  //     },
  //     xaxis: {
  //       type: "datetime",
  //       categories: [
  //         "1/11/2000",
  //         "2/11/2000",
  //         "3/11/2000",
  //         "4/11/2000",
  //         "5/11/2000",
  //         "6/11/2000",
  //         "7/11/2000",
  //         "8/11/2000",
  //         "9/11/2000",
  //         "10/11/2000",
  //         "11/11/2000",
  //         "12/11/2000",
  //         "1/11/2001",
  //         "2/11/2001",
  //         "3/11/2001",
  //         "4/11/2001",
  //         "5/11/2001",
  //         "6/11/2001",
  //       ],
  //     },
  //     title: {
  //       text: "Time Sheets",
  //       align: "left",
  //       style: {
  //         fontSize: "16px",
  //         color: "#666",
  //       },
  //     },
  //     fill: {
  //       type: "gradient",
  //       gradient: {
  //         shade: "dark",
  //         gradientToColors: ["#FDD835"],
  //         shadeIntensity: 1,
  //         type: "horizontal",
  //         opacityFrom: 1,
  //         opacityTo: 1,
  //         stops: [0, 100, 100, 100],
  //       },
  //     },
  //     markers: {
  //       size: 4,
  //       colors: ["#FFA41B"],
  //       strokeColors: "#fff",
  //       strokeWidth: 2,
  //       hover: {
  //         size: 7,
  //       },
  //     },
  //     yaxis: {
  //       min: -10,
  //       max: 40,
  //       title: {
  //         text: "Hours",
  //       },
  //     },
  //   };
  // }

  // @ViewChild("chart") chart!: ChartComponent;
  // @Input() timesheets: any[] = [];
  // // public chartOptions: Partial<ChartOptions>;
  //   public chartOptions: Partial<ChartOptions> = { };

  // constructor() {}

  // ngOnChanges(): void {
  //   if (this.timesheets && this.timesheets.length) {
  //     this.updateChart();
  //   }
  // }

  // updateChart() {
  //   const categories = this.timesheets.map((t) => new Date(t.date).toISOString().split("T")[0]);
  //   const hoursData = this.timesheets.map((t) => t.totalHours);

  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: "Hours Worked",
  //         data: hoursData,
  //       },
  //     ],
  //     chart: {
  //       height: 350,
  //       type: "line",
  //     },
  //     stroke: {
  //       width: 7,
  //       curve: "smooth",
  //     },
  //     xaxis: {
  //       type: "datetime",
  //       categories: categories,
  //     },
  //     title: {
  //       text: "Time Sheets",
  //       align: "left",
  //       style: {
  //         fontSize: "16px",
  //         color: "#666",
  //       },
  //     },
  //     fill: {
  //       type: "gradient",
  //       gradient: {
  //         shade: "dark",
  //         gradientToColors: ["#FDD835"],
  //         shadeIntensity: 1,
  //         type: "horizontal",
  //         opacityFrom: 1,
  //         opacityTo: 1,
  //         stops: [0, 100, 100, 100],
  //       },
  //     },
  //     markers: {
  //       size: 4,
  //       colors: ["#FFA41B"],
  //       strokeColors: "#fff",
  //       strokeWidth: 2,
  //       hover: {
  //         size: 7,
  //       },
  //     },
  //     yaxis: {
  //       min: 0,
  //       max: Math.max(...hoursData) + 2,
  //       title: {
  //         text: "Hours",
  //       },
  //     },
  //   };
  // }

  @ViewChild('chart') chart!: ChartComponent;
  @Input() timesheets: any[] = [];

  public chartOptions: Partial<ChartOptions> = {}; // Initialize to avoid undefined error

  constructor() {}

  ngOnChanges(): void {
    // if (this.timesheets && this.timesheets.length) {
    //   this.updateChart();
    // }

    this.updateChart();

  }

  updateChart() {
    let categories: string[] = [];
    let hoursData: number[] = [];

    if (!this.timesheets || this.timesheets.length === 0) {
      categories = ['No Data'];
      hoursData = [0];
      // return;
    } else {
      const groupedData = new Map<string, number>();

      this.timesheets.forEach((t) => {
        // const date = new Date(t.date).toISOString().split("T")[0];
        const date = new Date(t.date).toLocaleDateString('en-CA');
        const hours = t.totalMinutes / 60;

        // if (groupedData.has(date)) {
        //   groupedData.set(date, groupedData.get(date)! + hours); // Sum hours
        // } else {
        //   groupedData.set(date, hours);
        // }

        groupedData.set(date, (groupedData.get(date) || 0) + hours);

      });

      // Sort the dates in ascending order
      const sortedEntries = Array.from(groupedData.entries()).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
      );

      categories = sortedEntries.map((entry) => entry[0]); // Sorted dates
      hoursData = sortedEntries.map((entry) => entry[1]); // Corresponding hours
    }

    this.chartOptions = {
      series: [
        {
          name: 'Hours Worked',
          data: hoursData,
        },
      ],
      chart: {
        height: 350,
        type: 'line',
      },
      stroke: {
        width: 7,
        curve: 'smooth',
      },
      xaxis: {
        type: 'category', // Change to "category" instead of "datetime"
        categories: categories,
      },
      title: {
        text: 'Time Sheets',
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#666',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#FDD835'],
          shadeIntensity: 1,
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100, 100, 100],
        },
      },
      markers: {
        size: 4,
        colors: ['#FFA41B'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      yaxis: {
        min: 0,
        max: Math.max(...hoursData) + 2,
        title: {
          text: 'Hours',
        },
      },
    };
  }

  // @ViewChild("chart") chart!: ChartComponent;
  // @Input() timesheets: any[] = [];

  // public chartOptions: Partial<ChartOptions> = {
  //   series: [],
  //   chart: {
  //     height: 350,
  //     type: "line",
  //   },
  //   xaxis: {
  //     categories: [],
  //   },
  // }; // **Initialize chartOptions to avoid undefined issues**

  // constructor(private cdr: ChangeDetectorRef) {}

  // ngOnInit(): void {
  //   console.log("ngOnInit in TimesheetChartComponent");
  //   if (this.timesheets && this.timesheets.length > 0) {
  //     this.updateChart();
  //   }
  // }

  // ngOnChanges(): void {
  //   console.log("Received timesheets:", this.timesheets);

  //   if (this.timesheets && this.timesheets.length > 0) {
  //     this.updateChart();
  //     this.cdr.detectChanges(); // Force change detection
  //   } else {
  //     console.log("Timesheets array is empty or undefined.");
  //   }
  // }

  // updateChart() {
  //   // console.log("HELLO");

  //   // if (!this.timesheets || this.timesheets.length === 0) {
  //   //   return; // Prevent running if timesheets are empty
  //   // }

  //   // console.log("HI");

  //   // const categories = this.timesheets.map((t) =>
  //   //   new Date(t.date).toISOString().split("T")[0]
  //   // );
  //   // const hoursData = this.timesheets.map((t) => t.totalHours);

  //   // this.chartOptions = {
  //   //   series: [
  //   //     {
  //   //       name: "Hours Worked",
  //   //       data: hoursData,
  //   //     },
  //   //   ],
  //   //   chart: {
  //   //     height: 350,
  //   //     type: "line",
  //   //   },
  //   //   stroke: {
  //   //     width: 7,
  //   //     curve: "smooth",
  //   //   },
  //   //   xaxis: {
  //   //     type: "category", // Use category instead of datetime
  //   //     categories: categories,
  //   //   },
  //   //   title: {
  //   //     text: "Time Sheets",
  //   //     align: "left",
  //   //     style: {
  //   //       fontSize: "16px",
  //   //       color: "#666",
  //   //     },
  //   //   },
  //   //   fill: {
  //   //     type: "gradient",
  //   //     gradient: {
  //   //       shade: "dark",
  //   //       gradientToColors: ["#FDD835"],
  //   //       shadeIntensity: 1,
  //   //       type: "horizontal",
  //   //       opacityFrom: 1,
  //   //       opacityTo: 1,
  //   //       stops: [0, 100, 100, 100],
  //   //     },
  //   //   },
  //   //   markers: {
  //   //     size: 4,
  //   //     colors: ["#FFA41B"],
  //   //     strokeColors: "#fff",
  //   //     strokeWidth: 2,
  //   //     hover: {
  //   //       size: 7,
  //   //     },
  //   //   },
  //   //   yaxis: {
  //   //     min: 0,
  //   //     max: Math.max(...hoursData) + 2,
  //   //     title: {
  //   //       text: "Hours",
  //   //     },
  //   //   },
  //   // };
  //   // this.cdr.detectChanges(); // Force chart update

  //   if (!this.timesheets || this.timesheets.length === 0) {
  //     console.log("Skipping chart update: No data");
  //     return;
  //   }

  //   // Ensure date format is correct
  //   const categories = this.timesheets.map(t =>
  //     t.date ? new Date(t.date).toISOString().split("T")[0] : "Unknown"
  //   );
  //   const hoursData = this.timesheets.map(t => t.totalHours ?? 0);

  //   console.log("Categories:", categories);
  //   console.log("Hours Data:", hoursData);

  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: "Hours Worked",
  //         data: hoursData
  //       }
  //     ],
  //     chart: {
  //       height: 350,
  //       type: "line"
  //     },
  //     xaxis: {
  //       type: "datetime",
  //       categories: categories
  //     },
  //     yaxis: {
  //       min: 0,
  //       max: Math.max(...hoursData) + 2
  //     }
  //   };

  //   setTimeout(() => {
  //     if (this.chart) {
  //       this.chart.updateOptions(this.chartOptions);
  //     }
  //   }, 500);

  // }
}
