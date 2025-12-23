import { Component, OnInit, ViewChild } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { ApexOptions } from "ng-apexcharts";
import { EventApiService, EventDetails } from "src/app/core/services/event-api.service";
import { LocationService, Branch } from "src/app/core/services/location.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { forkJoin, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

interface Volunteer {
  id?: number;
  volunteer_name?: string;
  branch_id?: number;
  event_id?: number;
  created_on?: string;
}

interface Donation {
  id?: number;
  event_id?: number;
  created_on?: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @ViewChild("eventsDonutChart") chart!: ChartComponent;

  selectedTimeFilter: string = "Year";
  selectedYear: number = new Date().getFullYear();
  selectedBranch: string = "All branches";
  
  // Available years for dropdown
  availableYears: number[] = [];
  
  // Data properties
  loading: boolean = true;
  branches: Branch[] = [];
  events: EventDetails[] = [];
  volunteers: Volunteer[] = [];
  
  // Statistics
  totalBranches: number = 0;
  totalPreachers: number = 0; // We'll calculate this from volunteers or branch members
  totalEvents: number = 0;
  eventsByType: { [key: string]: number } = {};
  eventsByTypeLabels: string[] = [];
  eventsByTypeSeries: number[] = [];
  
  totalInitiation: number = 0;
  initiationMen: number = 0;
  initiationWomen: number = 0;
  initiationKids: number = 0;
  
  // Chart data for branches
  topBranchesData: { name: string; events: { [key: string]: number } }[] = [];
  
  // Event trend data
  eventTrendData: { [key: string]: number[] } = {};
  eventTrendCategories: string[] = [];
  
  // Volunteers trend data
  volunteersTrendData: number[] = [];
  volunteersTrendCategories: string[] = [];
  currentVolunteersCount: number = 0;

  // Events chart options
  public eventsChartOptions: Partial<ApexOptions> = {
    series: [],
    chart: {
      type: "donut",
      height: 240,
      width: 240,
    },
    labels: [],
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
    series: [0, 0, 0],
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
    series: [],
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
      categories: [],
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
    series: [],
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
      categories: [],
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
        data: [],
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
      categories: [],
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

  private apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private eventApiService: EventApiService,
    private locationService: LocationService,
    private http: HttpClient
  ) {
    // Generate available years (current year and 4 previous years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.availableYears.push(currentYear - i);
    }
    this.availableYears.reverse(); // Sort ascending
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  // Method to handle time filter selection
  selectTimeFilter(filter: string) {
    this.selectedTimeFilter = filter;
    this.loadDashboardData();
  }

  // Method to handle year selection
  onYearChange(year: number) {
    this.selectedYear = year;
    this.loadDashboardData();
  }

  // Method to handle branch selection
  onBranchChange(branch: string) {
    this.selectedBranch = branch;
    this.loadDashboardData();
  }

  // Load all dashboard data
  loadDashboardData() {
    this.loading = true;
    
    const requests: Observable<any>[] = [
      this.locationService.getAllBranches().pipe(catchError(() => of([]))),
      this.eventApiService.getEvents().pipe(catchError(() => of([]))),
      this.http.get<Volunteer[]>(`${this.apiBaseUrl}/api/volunteers`).pipe(catchError(() => of([]))),
      this.http.get<Donation[]>(`${this.apiBaseUrl}/api/donations`).pipe(catchError(() => of([])))
    ];

    forkJoin(requests).subscribe({
      next: ([branches, events, volunteers, donations]) => {
        this.branches = branches || [];
        this.events = this.filterEventsByTime(events || []);
        this.volunteers = volunteers || [];
        
        this.calculateStatistics();
        this.updateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  // Filter events based on selected time filter and year
  filterEventsByTime(events: EventDetails[]): EventDetails[] {
    let filteredEvents = events;
    
    // Filter by branch if selected
    if (this.selectedBranch && this.selectedBranch !== 'All branches') {
      filteredEvents = filteredEvents.filter(event => 
        event.district === this.selectedBranch || 
        event.city === this.selectedBranch ||
        (this.branches.find(b => b.name === this.selectedBranch) && 
         (event.district === this.branches.find(b => b.name === this.selectedBranch)?.district?.name ||
          event.city === this.branches.find(b => b.name === this.selectedBranch)?.city?.name))
      );
    }
    
    const now = new Date();
    const currentYear = this.selectedYear;
    
    return filteredEvents.filter(event => {
      if (!event.start_date) return false;
      
      const eventDate = new Date(event.start_date);
      const eventYear = eventDate.getFullYear();
      
      if (eventYear !== currentYear) return false;
      
      if (this.selectedTimeFilter === 'Week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
      } else if (this.selectedTimeFilter === 'Month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return eventDate >= monthAgo;
      }
      // Year filter - already filtered by year
      return true;
    });
  }

  // Calculate statistics from real data
  calculateStatistics() {
    // Total branches
    this.totalBranches = this.branches.length;
    
    // Total events
    this.totalEvents = this.events.length;
    
    // Events by type
    this.eventsByType = {};
    this.events.forEach(event => {
      const eventTypeName = event.event_type?.name || 'Unknown';
      this.eventsByType[eventTypeName] = (this.eventsByType[eventTypeName] || 0) + 1;
    });
    
    // Sort event types by count and prepare chart data
    const sortedTypes = Object.entries(this.eventsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4); // Top 4 types
    
    this.eventsByTypeLabels = sortedTypes.map(([name]) => name);
    this.eventsByTypeSeries = sortedTypes.map(([, count]) => count);
    
    // Update events chart
    this.updateEventsChart();
    
    // Initiation statistics
    this.initiationMen = this.events.reduce((sum, event) => sum + (event.initiation_men || 0), 0);
    this.initiationWomen = this.events.reduce((sum, event) => sum + (event.initiation_women || 0), 0);
    this.initiationKids = this.events.reduce((sum, event) => sum + (event.initiation_child || 0), 0);
    this.totalInitiation = this.initiationMen + this.initiationWomen + this.initiationKids;
    
    // Update initiation chart
    this.updateInitiationChart();
    
    // Calculate preachers (approximate from volunteers or use branch members count)
    // For now, we'll use unique volunteers count as an approximation
    const uniqueVolunteers = new Set(this.volunteers.map(v => v.volunteer_name).filter(Boolean));
    this.totalPreachers = uniqueVolunteers.size;
  }

  // Update events donut chart
  updateEventsChart() {
    this.eventsChartOptions = {
      ...this.eventsChartOptions,
      series: this.eventsByTypeSeries.length > 0 ? this.eventsByTypeSeries : [0],
      labels: this.eventsByTypeLabels.length > 0 ? this.eventsByTypeLabels : ['No Events']
    };
  }

  // Update initiation donut chart
  updateInitiationChart() {
    this.initiationChartOptions = {
      ...this.initiationChartOptions,
      series: [
        this.initiationMen || 0,
        this.initiationWomen || 0,
        this.initiationKids || 0
      ]
    };
  }

  // Update all charts with processed data
  updateCharts() {
    this.updateTopBranchesChart();
    this.updateEventTrendChart();
    this.updateVolunteersTrendChart();
  }

  // Update top 10 branches chart
  updateTopBranchesChart() {
    // Group events by branch (using district as branch identifier for now)
    const branchEventMap: { [key: string]: { name: string; events: { [key: string]: number } } } = {};
    
    this.events.forEach(event => {
      const branchKey = event.district || event.city || 'Unknown';
      if (!branchEventMap[branchKey]) {
        branchEventMap[branchKey] = {
          name: branchKey,
          events: {}
        };
      }
      const eventTypeName = event.event_type?.name || 'Unknown';
      branchEventMap[branchKey].events[eventTypeName] = 
        (branchEventMap[branchKey].events[eventTypeName] || 0) + 1;
    });
    
    // Get top 10 branches by total events
    this.topBranchesData = Object.values(branchEventMap)
      .sort((a, b) => {
        const totalA = Object.values(a.events).reduce((sum, count) => sum + count, 0);
        const totalB = Object.values(b.events).reduce((sum, count) => sum + count, 0);
        return totalB - totalA;
      })
      .slice(0, 10);
    
    // Prepare chart series data
    const eventTypeNames = Array.from(new Set(
      this.topBranchesData.flatMap(branch => Object.keys(branch.events))
    )).slice(0, 4); // Top 4 event types
    
    const series = eventTypeNames.map(typeName => ({
      name: typeName,
      data: this.topBranchesData.map(branch => branch.events[typeName] || 0),
      color: this.getColorForEventType(typeName)
    }));
    
    this.topBranchesChartOptions = {
      ...this.topBranchesChartOptions,
      series: series,
      xaxis: {
        ...this.topBranchesChartOptions.xaxis,
        categories: this.topBranchesData.map(branch => branch.name)
      }
    };
  }

  // Update event trend chart
  updateEventTrendChart() {
    // Group events by month
    const monthMap: { [key: string]: { [key: string]: number } } = {};
    
    this.events.forEach(event => {
      if (!event.start_date) return;
      const date = new Date(event.start_date);
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().slice(-2)}`;
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {};
      }
      
      const eventTypeName = event.event_type?.name || 'Unknown';
      monthMap[monthKey][eventTypeName] = (monthMap[monthKey][eventTypeName] || 0) + 1;
    });
    
    // Sort by date and get last 5 months
    // Parse month strings properly for sorting
    const sortedMonths = Object.keys(monthMap)
      .sort((a, b) => {
        // Extract year and month from strings like "Jan 25"
        const parseMonth = (str: string) => {
          const parts = str.split(' ');
          const monthStr = parts[0];
          const year = parseInt('20' + parts[1]);
          const monthMap: { [key: string]: number } = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          return year * 12 + (monthMap[monthStr] || 0);
        };
        return parseMonth(a) - parseMonth(b);
      })
      .slice(-5);
    
    this.eventTrendCategories = sortedMonths;
    
    // Get event types
    const eventTypeNames = Array.from(new Set(
      Object.values(monthMap).flatMap(month => Object.keys(month))
    )).slice(0, 4); // Top 4 event types
    
    const series = eventTypeNames.map(typeName => ({
      name: typeName,
      data: sortedMonths.map(month => monthMap[month]?.[typeName] || 0),
      color: this.getColorForEventType(typeName)
    }));
    
    this.eventTrendChartOptions = {
      ...this.eventTrendChartOptions,
      series: series,
      xaxis: {
        ...this.eventTrendChartOptions.xaxis,
        categories: sortedMonths
      }
    };
  }

  // Update volunteers trend chart
  updateVolunteersTrendChart() {
    // Group volunteers by year
    const yearMap: { [key: number]: Set<number> } = {};
    
    this.volunteers.forEach(volunteer => {
      if (!volunteer.created_on) return;
      const year = new Date(volunteer.created_on).getFullYear();
      if (!yearMap[year]) {
        yearMap[year] = new Set();
      }
      if (volunteer.id) {
        yearMap[year].add(volunteer.id);
      }
    });
    
    // Get years from 2018 to current year
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = 2018; year <= currentYear; year++) {
      years.push(year);
    }
    
    this.volunteersTrendCategories = years.map(y => y.toString());
    this.volunteersTrendData = years.map(year => yearMap[year]?.size || 0);
    
    // Current year volunteers count
    this.currentVolunteersCount = yearMap[currentYear]?.size || 0;
    
    // Calculate percentage change (comparing to previous year)
    const previousYearCount = yearMap[currentYear - 1]?.size || 0;
    const changePercent = previousYearCount > 0 
      ? ((this.currentVolunteersCount - previousYearCount) / previousYearCount * 100).toFixed(0)
      : '0';
    
    this.volunteersTrendChartOptions = {
      ...this.volunteersTrendChartOptions,
      series: [{
        name: "Active Volunteers",
        data: this.volunteersTrendData,
        color: "#dc3545"
      }],
      xaxis: {
        ...this.volunteersTrendChartOptions.xaxis,
        categories: this.volunteersTrendCategories
      }
    };
  }

  // Helper method to get color for event type
  getColorForEventType(typeName: string): string {
    const colorMap: { [key: string]: string } = {
      'Spiritual': '#28a745',
      'Cultural': '#dc3545',
      'Peace procession': '#007bff',
      'Peace assembly': '#ffc107'
    };
    
    // Return mapped color or assign from default colors
    if (colorMap[typeName]) {
      return colorMap[typeName];
    }
    
    // Default color rotation
    const colors = ['#28a745', '#dc3545', '#007bff', '#ffc107', '#6f42c1', '#e83e8c'];
    const index = Object.keys(this.eventsByType).indexOf(typeName) % colors.length;
    return colors[index];
  }

  // Format number with commas
  formatNumber(num: number): string {
    return num.toLocaleString();
  }
}
