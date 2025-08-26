import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { AddDistrictComponent } from "../add-branch/add-branch.component";

interface EventData {
  id: string;
  state: string;
  district: string;
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
  @ViewChild("addDistrictComponent")
  addDistrictComponent!: AddDistrictComponent;

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

  // Column configuration for main table
  mainTableColumns: ColumnConfig[] = [
    {
      key: "branchName",
      label: "Branch Name",
      pinned: false,
      filterable: true,
      showFilter: false,
      filterValue: "",
    },
    {
      key: "branchManagerName",
      label: "Branch Manager Name",
      pinned: false,
      filterable: true,
      showFilter: false,
      filterValue: "",
    },
    {
      key: "assistantBranchManagerName",
      label: "Assistant Branch Manager Name",
      pinned: false,
      filterable: true,
      showFilter: false,
      filterValue: "",
    },
  ];

  // Column configuration for nested table
  nestedTableColumns: ColumnConfig[] = [
    {
      key: "state",
      label: "State",
      pinned: false,
      filterable: true,
      showFilter: false,
      filterValue: "",
    },
    {
      key: "district",
      label: "District",
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
        { id: "1", state: "Basavanagudi", district: "xyz" },
        { id: "2", state: "Jayanagar", district: "xyz" },
        { id: "3", state: "Malleshwaram", district: "xyz" },
        { id: "4", state: "Whitefield", district: "xyz" },
        { id: "5", state: "Koramangala", district: "xyz" },
        { id: "6", state: "Indiranagar", district: "xyz" },
      ],
    },
    {
      id: "2",
      branchName: "Mumbai Western Branch",
      branchManagerName: "Amit Patel",
      assistantBranchManagerName: "Neha Singh",
      events: [
        { id: "7", state: "Andheri West", district: "xyz" },
        { id: "8", state: "Bandra", district: "xyz" },
        { id: "9", state: "Dadar", district: "xyz" },
        { id: "10", state: "Goregaon", district: "xyz" },
        { id: "11", state: "Juhu", district: "xyz" },
        { id: "12", state: "Malad", district: "xyz" },
      ],
    },
    {
      id: "3",
      branchName: "Delhi North Branch",
      branchManagerName: "Suresh Verma",
      assistantBranchManagerName: "Kavita Gupta",
      events: [
        { id: "13", state: "Connaught Place", district: "xyz" },
        { id: "14", state: "Karol Bagh", district: "xyz" },
        { id: "15", state: "Chandni Chowk", district: "xyz" },
        { id: "16", state: "Rohini", district: "xyz" },
        { id: "17", state: "Pitampura", district: "xyz" },
        { id: "18", state: "Shalimar Bagh", district: "xyz" },
      ],
    },
  ];

  constructor(private router: Router, private messageService: MessageService) {}

  ngOnInit(): void {
    // Don't expand any branch by default
    this.expandedRows = {};
    console.log("Initial expandedRows:", this.expandedRows);
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

  // Main table column pinning methods
  pinMainColumn(columnKey: string): void {
    const column = this.mainTableColumns.find((col) => col.key === columnKey);
    if (column) {
      column.pinned = true;
    }
  }

  unpinMainColumn(columnKey: string): void {
    const column = this.mainTableColumns.find((col) => col.key === columnKey);
    if (column) {
      column.pinned = false;
    }
  }

  getPinnedMainColumns(): ColumnConfig[] {
    return this.mainTableColumns.filter((col) => col.pinned);
  }

  getRegularMainColumns(): ColumnConfig[] {
    return this.mainTableColumns.filter((col) => !col.pinned);
  }

  toggleMainFilter(columnKey: string): void {
    const column = this.mainTableColumns.find((col) => col.key === columnKey);
    if (column) {
      column.showFilter = !column.showFilter;
    }
  }

  applyMainFilters(): void {
    // This method will be called when filter input changes
    // The filtering is handled automatically by PrimeNG
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
    // Open the Add District modal using jQuery or native DOM manipulation
    const modal = document.getElementById("addDistrictModal");
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
    // Find the event data
    const eventData = this.findEventById(eventId);
    if (eventData && this.addDistrictComponent) {
      this.addDistrictComponent.populateFormForEdit(eventData);
      this.addEvent(); // Open the modal
    }
  }

  findEventById(eventId: string): EventData | null {
    for (const branch of this.branches) {
      const event = branch.events.find((e) => e.id === eventId);
      if (event) {
        return event;
      }
    }
    return null;
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
