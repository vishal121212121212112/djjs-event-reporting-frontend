import { Component, OnInit, ViewChild } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { ApexOptions } from "ng-apexcharts";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @ViewChild("eventsDonutChart") chart!: ChartComponent;

  selectedTimeFilter: string = "Year";

  // Events chart options
  public eventsChartOptions: Partial<ApexOptions> = {
    series: [1200, 2300, 1100, 2000],
    chart: {
      type: "donut",
      height: 240,
      width: 240,
    },
    labels: ["Spiritual", "Peace procession", "Cultural", "Peace assembly"],
    colors: ["#28a745", "#dc3545", "#007bff", "#ffc107"],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
              color: "#263238",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 180,
            height: 180,
          },
        },
      },
    ],
  };

  // Initiation chart options
  public initiationChartOptions: Partial<ApexOptions> = {
    series: [1400, 1200, 600],
    chart: {
      type: "donut",
      height: 240,
      width: 240,
    },
    labels: ["Male", "Female", "Kids"],
    colors: ["#28a745", "#dc3545", "#007bff"],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
              color: "#263238",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 180,
            height: 180,
          },
        },
      },
    ],
  };

  // Top 10 Branches Chart - Horizontal Stacked Bar
  public topBranchesChartOptions: Partial<ApexOptions> = {
    chart: {
      type: "bar",
      height: 500,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    series: [
      {
        name: "Spiritual",
        data: [200, 180, 150, 120, 100, 80, 70, 60, 50, 40],
        color: "#28a745", // Green
      },
      {
        name: "Cultural",
        data: [300, 250, 200, 150, 120, 100, 80, 70, 60, 50],
        color: "#dc3545", // Red
      },
      {
        name: "Peace procession",
        data: [400, 350, 300, 250, 200, 150, 120, 100, 80, 60],
        color: "#007bff", // Blue
      },
      {
        name: "Peace assembly",
        data: [600, 520, 300, 130, 30, 70, 130, 120, 110, 150],
        color: "#ffc107", // Orange
      },
    ],
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: [
        "India",
        "Canada",
        "United Kingdom",
        "Netherlands",
        "Italy",
        "France",
        "Japan",
        "United States",
        "China",
        "Germany",
      ],
      labels: {
        formatter: function (val) {
          return val + "";
        },
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      shared: false,
      y: {
        formatter: function (val) {
          return val + " events";
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetX: 0,
    },
    fill: {
      opacity: 1,
    },
  };

  // Event Trend Chart - Vertical Stacked Bar
  public eventTrendChartOptions: Partial<ApexOptions> = {
    chart: {
      type: "bar",
      height: 250,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    series: [
      {
        name: "Spiritual",
        data: [20, 18, 22, 25, 28],
        color: "#28a745", // Green
      },
      {
        name: "Cultural",
        data: [15, 12, 18, 20, 22],
        color: "#dc3545", // Red
      },
      {
        name: "Peace procession",
        data: [25, 23, 28, 30, 25],
        color: "#007bff", // Blue
      },
      {
        name: "Peace assembly",
        data: [20, 22, 17, 10, 10],
        color: "#ffc107", // Orange
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25"],
    },
    yaxis: {
      title: {
        text: "Events",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " events";
        },
      },
    },
    legend: {
      position: "right",
      offsetY: 0,
    },
  };

  // Active Volunteers Trend Chart - Vertical Bar
  public volunteersTrendChartOptions: Partial<ApexOptions> = {
    chart: {
      type: "bar",
      height: 200,
      toolbar: {
        show: false,
      },
    },
    series: [
      {
        name: "Active Volunteers",
        data: [50, 25, 48, 58, 30, 48, 75, 50],
        color: "#dc3545",
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
        "2025",
      ],
    },
    yaxis: {
      title: {
        text: "Volunteers",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " volunteers";
        },
      },
    },
  };

  constructor() {}

  ngOnInit() {
    // Initialize chart data
  }

  // Method to handle time filter selection
  selectTimeFilter(filter: string) {
    this.selectedTimeFilter = filter;
  }
}
