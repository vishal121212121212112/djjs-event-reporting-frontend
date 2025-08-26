import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";

interface EventData {
  id: string;
  areaName: string;
  areaCoverage: number;
}

interface ColumnConfig {
  key: string;
  label: string;
  pinned: boolean;
  filterable: boolean;
  showFilter: boolean;
  filterValue: string;
}

interface BranchData {
  id: string;
  branchName: string;
  branchManagerName: string;
  assistantBranchManagerName: string;
  events: EventData[];
}

@Component({
  selector: "app-events-list",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit {
  // PrimeNG Table Configuration
  expandedRows: { [key: string]: boolean } = {};

  // Pagination
  first = 0;
  rows = 10;
  rowsPerPageOptions = [5, 10, 20, 50];

  // Sorting
  sortField: string = "";
  sortOrder: number = 1;

  // Filtering
  filters: { [key: string]: any } = {};
  globalFilterValue: string = "";

  // Column pinning
  pinnedColumns: string[] = [];

  // Column configuration for nested table
  nestedTableColumns: ColumnConfig[] = [
    {
      key: "areaName",
      label: "Area Name",
      pinned: false,
      filterable: true,
      showFilter: false,
      filterValue: "",
    },
    {
      key: "areaCoverage",
      label: "Area Coverage (Sq. Km)",
      pinned: false,
      filterable: true,
      showFilter: false,
      filterValue: "",
    },
  ];

  // Sample data with new branch structure
  branches: BranchData[] = [
    {
      id: "1",
      branchName: "Bangalore Central Branch",
      branchManagerName: "Rajesh Kumar",
      assistantBranchManagerName: "Priya Sharma",
      events: [
        { id: "1", areaName: "Basavanagudi", areaCoverage: 15 },
        { id: "2", areaName: "Jayanagar", areaCoverage: 20 },
        { id: "3", areaName: "Malleshwaram", areaCoverage: 25 },
        { id: "4", areaName: "Whitefield", areaCoverage: 30 },
        { id: "5", areaName: "Koramangala", areaCoverage: 28 },
        { id: "6", areaName: "Indiranagar", areaCoverage: 22 },
      ],
    },
    {
      id: "2",
      branchName: "Mumbai Western Branch",
      branchManagerName: "Amit Patel",
      assistantBranchManagerName: "Neha Singh",
      events: [
        { id: "7", areaName: "Andheri West", areaCoverage: 18 },
        { id: "8", areaName: "Bandra", areaCoverage: 28 },
        { id: "9", areaName: "Dadar", areaCoverage: 25 },
        { id: "10", areaName: "Goregaon", areaCoverage: 21 },
        { id: "11", areaName: "Juhu", areaCoverage: 27 },
        { id: "12", areaName: "Malad", areaCoverage: 23 },
      ],
    },
    {
      id: "3",
      branchName: "Delhi North Branch",
      branchManagerName: "Suresh Verma",
      assistantBranchManagerName: "Kavita Gupta",
      events: [
        { id: "13", areaName: "Connaught Place", areaCoverage: 22 },
        { id: "14", areaName: "Karol Bagh", areaCoverage: 26 },
        { id: "15", areaName: "Chandni Chowk", areaCoverage: 30 },
        { id: "16", areaName: "Rohini", areaCoverage: 24 },
        { id: "17", areaName: "Pitampura", areaCoverage: 20 },
        { id: "18", areaName: "Shalimar Bagh", areaCoverage: 19 },
      ],
    },
  ];

  constructor(private router: Router, private messageService: MessageService) {}

  ngOnInit(): void {
    // Don't expand any branch by default
    this.expandedRows = {};
    console.log("Initial expandedRows:", this.expandedRows);
  }
  

  getTotalAreaCoverage(branches: BranchData): number {
    return branches.events?.reduce((sum, e) => sum + e.areaCoverage, 0) || 0;
  }

  // PrimeNG Table Methods
  onRowExpand(event: any): void {
    console.log("Row expanded:", event.data);
    console.log("Event object:", event);
    // Update the expandedRows object to reflect the expanded state
    this.expandedRows = { ...this.expandedRows, [event.data.id]: true };
    console.log("Updated expandedRows after expand:", this.expandedRows);
  }

  onRowCollapse(event: any): void {
    console.log("Row collapsed:", event.data);
    console.log("Event object:", event);
    // Update the expandedRows object to reflect the collapsed state
    // this.expandedRows = { ...this.expandedRows, [event.data.id]: false };
    console.log("Updated expandedRows after collapse:", this.expandedRows);
  }

  // Method to check if a row is expanded
  isRowExpanded(branch: BranchData): boolean {
    const isExpanded = this.expandedRows[branch.id] === true;
    console.log(`Branch ${branch.id} expanded:`, isExpanded);
    return isExpanded;
  }

  // Sorting methods
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  // Filtering methods
  onGlobalFilterChange(event: any): void {
    this.globalFilterValue = event.target.value;
  }

  clearFilter(column: string): void {
    if (this.filters[column]) {
      delete this.filters[column];
    }
  }

  innerPinnedColumns: string[] = [];
  currentBranchEvents: any[] = [];
  innerTableFilters: { [branchId: string]: any } = {};
  filteredInnerEvents: { [branchId: string]: any[] } = {};

  // Check if a column is pinned
  isInnerColumnPinned(col: string): boolean {
    return this.innerPinnedColumns.includes(col);
  }

  // Toggle pin/unpin
  toggleInnerColumnPin(col: string) {
    if (this.isInnerColumnPinned(col)) {
      this.innerPinnedColumns = this.innerPinnedColumns.filter(
        (c) => c !== col
      );
    } else {
      this.innerPinnedColumns.push(col);
    }
  }

  // Apply filter for inner table
  // applyInnerFilter(field: string) {
  //   const value = this.innerTableFilters[field]?.toLowerCase() || "";
  //   this.filteredInnerEvents = this.currentBranchEvents.filter((event: any) =>
  //     event[field]?.toLowerCase().includes(value)
  //   );
  // }

  // Additional filtering methods
  activeFilter: string | null = null;

  showFilter(column: string): void {
    this.activeFilter = this.activeFilter === column ? null : column;
  }

  applyFilter(): void {
    // This method will be called when filter input changes
    // The filtering is handled automatically by PrimeNG
  }

  // Column pinning methods
  toggleColumnPin(column: string): void {
    const index = this.pinnedColumns.indexOf(column);
    if (index > -1) {
      this.pinnedColumns.splice(index, 1);
    } else {
      this.pinnedColumns.push(column);
    }
  }

  isColumnPinned(column: string): boolean {
    return this.pinnedColumns.includes(column);
  }

  // Nested table column pinning methods
  pinNestedColumn(columnKey: string): void {
    const column = this.nestedTableColumns.find((col) => col.key === columnKey);
    if (column) {
      column.pinned = true;
    }
  }

  unpinNestedColumn(columnKey: string): void {
    const column = this.nestedTableColumns.find((col) => col.key === columnKey);
    if (column) {
      column.pinned = false;
    }
  }

  getPinnedNestedColumns(): ColumnConfig[] {
    return this.nestedTableColumns.filter((col) => col.pinned);
  }

  getRegularNestedColumns(): ColumnConfig[] {
    return this.nestedTableColumns.filter((col) => !col.pinned);
  }

  toggleNestedFilter(columnKey: string): void {
    const column = this.nestedTableColumns.find((col) => col.key === columnKey);
    if (column) {
      column.showFilter = !column.showFilter;
    }
  }

  applyNestedFilters(): void {
    // This method will be called when filter input changes
    // The filtering is handled automatically by PrimeNG
  }

  // Pagination methods
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  // Expand/Collapse All methods
  expandAll(): void {
    this.branches.forEach((branch) => {
      this.expandedRows[branch.id] = true;
    });
    this.expandedRows = { ...this.expandedRows };
  }

  collapseAll(): void {
    this.expandedRows = {};
  }

  getSeverity(scale: string): string {
    switch (scale) {
      case "S":
        return "success";
      case "M":
        return "warning";
      case "L":
        return "danger";
      default:
        return "info";
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "info";
    }
  }

  // Navigation
  addEvent(): void {
    // Open the Add Area modal using jQuery or native DOM manipulation
    const modal = document.getElementById("addAreaModal");
    if (modal) {
      // Try using Bootstrap 5 modal if available
      if (
        typeof (window as any).bootstrap !== "undefined" &&
        (window as any).bootstrap.Modal
      ) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
      } else {
        // Fallback: manually show the modal using CSS classes
        modal.classList.add("show");
        modal.style.display = "block";
        modal.setAttribute("aria-hidden", "false");

        // Add backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);

        // Add body class
        document.body.classList.add("modal-open");
      }
    }
  }

  editEvent(eventId: string): void {
    console.log("Edit event:", eventId);
    // Implement edit functionality
  }

  viewEventDetails(eventId: string): void {
    console.log("View event details:", eventId);
    // Implement view details functionality
  }

  downloadEvent(eventId: string): void {
    console.log("Download event:", eventId);
    // Implement download functionality
  }

  getTooltipText(
    type: "beneficiaries" | "initiation",
    event: EventData
  ): string {
    const data = event[type];
    return `${data.men} Men, ${data.women} Women, ${data.children} Children`;
  }
}
