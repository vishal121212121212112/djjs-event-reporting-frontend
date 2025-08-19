# Branch Service Documentation

## Overview
The Branch Service provides a complete CRUD (Create, Read, Update, Delete) interface for managing branch/area information in the DJJS Event Reporting Frontend application. It currently uses fake API calls with simulated network delays for development and testing purposes.

## Features

### Core Operations
- ✅ **Create**: Add new branches with area name, district, and coverage
- ✅ **Read**: Retrieve all branches, single branch by ID, or filtered results
- ✅ **Update**: Modify existing branch information
- ✅ **Delete**: Remove branches from the system
- ✅ **Search**: Find branches by name or district
- ✅ **Statistics**: Get total area coverage and other metrics

### Data Structure
```typescript
interface Branch {
  id: string;           // Auto-generated unique identifier
  areaName: string;     // Name of the area/branch
  district: string;     // District where branch is located
  areaCoverage: number; // Area coverage in square kilometers
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

## Usage Examples

### 1. Basic CRUD Operations

```typescript
import { BranchService, Branch } from './core/services/branch.service';

constructor(private branchService: BranchService) {}

// Get all branches
this.branchService.getBranches().subscribe(branches => {
  console.log('All branches:', branches);
});

// Add new branch
const newBranch = {
  areaName: 'Bangalore Central',
  district: 'Bangalore Urban',
  areaCoverage: 25.5
};

this.branchService.addBranch(newBranch).subscribe(branch => {
  console.log('Branch added:', branch);
});

// Update branch
this.branchService.updateBranch('BR001', { areaCoverage: 30.0 }).subscribe(branch => {
  console.log('Branch updated:', branch);
});

// Delete branch
this.branchService.deleteBranch('BR001').subscribe(success => {
  console.log('Branch deleted:', success);
});
```

### 2. Search and Filtering

```typescript
// Search branches by query
this.branchService.searchBranches('Bangalore').subscribe(results => {
  console.log('Search results:', results);
});

// Get branches by district
this.branchService.getBranchesByDistrict('Bangalore Urban').subscribe(branches => {
  console.log('Branches in district:', branches);
});
```

### 3. Statistics

```typescript
// Get total area coverage
this.branchService.getTotalAreaCoverage().subscribe(total => {
  console.log('Total coverage:', total, 'sq km');
});
```

## Components

### 1. Add Branch Component (`add-branch.component`)
- **Location**: `src/app/pages/area/add-branch/`
- **Features**: 
  - Form validation
  - Loading states
  - Success/error messages
  - Modal-based interface
  - Support for both add and edit modes

### 2. Branch List Component (`branch-list.component`)
- **Location**: `src/app/pages/branch/branch-list/`
- **Features**:
  - Pagination
  - Sorting
  - Global filtering
  - Per-column filtering
  - Expandable rows
  - CRUD operations

### 3. Branch Demo Component (`branch-demo.component`)
- **Location**: `src/app/pages/area/add-branch/`
- **Features**:
  - Complete demonstration of service functionality
  - Real-time statistics
  - Interactive form
  - Data visualization

## Service Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getBranches()` | None | `Observable<Branch[]>` | Get all branches |
| `getBranchById(id)` | `string` | `Observable<Branch \| null>` | Get branch by ID |
| `addBranch(data)` | `BranchData` | `Observable<Branch>` | Create new branch |
| `updateBranch(id, data)` | `string, Partial<Branch>` | `Observable<Branch>` | Update existing branch |
| `deleteBranch(id)` | `string` | `Observable<boolean>` | Delete branch |
| `searchBranches(query)` | `string` | `Observable<Branch[]>` | Search branches |
| `getBranchesByDistrict(district)` | `string` | `Observable<Branch[]>` | Filter by district |
| `getTotalAreaCoverage()` | None | `Observable<number>` | Get total coverage |

## Fake API Behavior

The service simulates real API behavior with:
- **Network Delays**: 200ms - 800ms depending on operation
- **Data Persistence**: In-memory storage during session
- **Error Handling**: Simulated network errors and validation failures
- **Real-time Updates**: Immediate data reflection after operations

## Integration

### 1. Add to Module
```typescript
import { BranchService } from './core/services/branch.service';

@NgModule({
  providers: [BranchService],
  // ... other module configuration
})
export class YourModule { }
```

### 2. Inject in Component
```typescript
constructor(private branchService: BranchService) {}
```

### 3. Use in Template
```html
<div *ngFor="let branch of branches$ | async">
  {{ branch.areaName }} - {{ branch.district }}
</div>
```

## Future Enhancements

When ready to integrate with real backend:
1. Replace `of()` and `throwError()` with actual HTTP calls
2. Update service constructor to inject `HttpClient`
3. Modify data transformation methods for backend compatibility
4. Add proper error handling and retry logic
5. Implement caching and offline support

## Testing

The service includes sample data for testing:
- **BR001**: Bangalore Central (25.5 sq km)
- **BR002**: Mysore Region (18.2 sq km)

## Error Handling

The service provides comprehensive error handling:
- Network failures
- Validation errors
- Not found scenarios
- Invalid data formats

## Performance

- **Memory Efficient**: Minimal memory footprint
- **Fast Response**: Simulated delays for realistic testing
- **Scalable**: Handles large datasets efficiently
- **Optimized**: Uses RxJS operators for data transformation
