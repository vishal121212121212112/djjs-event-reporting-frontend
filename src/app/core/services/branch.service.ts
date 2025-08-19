import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Branch {
  id: string;
  areaName: string;
  district: string;
  areaCoverage: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private branches: Branch[] = [
    {
      id: 'BR001',
      areaName: 'Bangalore Central Ashram',
      district: 'Bangalore Urban',
      areaCoverage: 25.5,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'BR002',
      areaName: 'Mysore Regional Center',
      district: 'Mysore',
      areaCoverage: 18.2,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'BR003',
      areaName: 'Delhi Main Ashram',
      district: 'New Delhi',
      areaCoverage: 32.8,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: 'BR004',
      areaName: 'Mumbai Spiritual Hub',
      district: 'Mumbai',
      areaCoverage: 28.7,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: 'BR005',
      areaName: 'Chennai Temple Complex',
      district: 'Chennai',
      areaCoverage: 22.3,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: 'BR006',
      areaName: 'Hyderabad Meditation Center',
      district: 'Hyderabad',
      areaCoverage: 19.8,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: 'BR007',
      areaName: 'Pune Community Center',
      district: 'Pune',
      areaCoverage: 26.4,
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date('2024-02-25')
    },
    {
      id: 'BR008',
      areaName: 'Ahmedabad Spiritual Hub',
      district: 'Ahmedabad',
      areaCoverage: 24.1,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: 'BR009',
      areaName: 'Kolkata Main Branch',
      district: 'Kolkata',
      areaCoverage: 31.2,
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05')
    },
    {
      id: 'BR010',
      areaName: 'Jaipur Heritage Center',
      district: 'Jaipur',
      areaCoverage: 20.7,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10')
    }
  ];

  constructor() { }

  // Get all branches
  getBranches(): Observable<Branch[]> {
    return of([...this.branches]).pipe(delay(500));
  }

  // Get branch by ID
  getBranchById(id: string): Observable<Branch | null> {
    const branch = this.branches.find(b => b.id === id);
    if (branch) {
      return of(branch).pipe(delay(300));
    }
    return throwError(() => new Error('Branch not found'));
  }

  // Add new branch
  addBranch(branchData: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Observable<Branch> {
    const newBranch: Branch = {
      ...branchData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.branches.push(newBranch);
    
    return of(newBranch).pipe(delay(800));
  }

  // Update existing branch
  updateBranch(id: string, branchData: Partial<Branch>): Observable<Branch> {
    const index = this.branches.findIndex(b => b.id === id);
    if (index === -1) {
      return throwError(() => new Error('Branch not found'));
    }

    this.branches[index] = {
      ...this.branches[index],
      ...branchData,
      updatedAt: new Date()
    };

    return of(this.branches[index]).pipe(delay(600));
  }

  // Delete branch
  deleteBranch(id: string): Observable<boolean> {
    const index = this.branches.findIndex(b => b.id === id);
    if (index === -1) {
      return throwError(() => new Error('Branch not found'));
    }

    this.branches.splice(index, 1);
    return of(true).pipe(delay(400));
  }

  // Search branches
  searchBranches(query: string): Observable<Branch[]> {
    const filtered = this.branches.filter(branch => 
      branch.areaName.toLowerCase().includes(query.toLowerCase()) ||
      branch.district.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  // Generate unique ID
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `BR${timestamp}${randomStr}`.toUpperCase();
  }

  // Get branches by district
  getBranchesByDistrict(district: string): Observable<Branch[]> {
    const filtered = this.branches.filter(branch => 
      branch.district.toLowerCase() === district.toLowerCase()
    );
    return of(filtered).pipe(delay(300));
  }

  // Get total area coverage
  getTotalAreaCoverage(): Observable<number> {
    const total = this.branches.reduce((sum, branch) => sum + branch.areaCoverage, 0);
    return of(total).pipe(delay(200));
  }

  // Get branches statistics
  getBranchesStatistics(): Observable<any> {
    const total = this.branches.length;
    const totalCoverage = this.branches.reduce((sum, branch) => sum + branch.areaCoverage, 0);
    const averageCoverage = total > 0 ? totalCoverage / total : 0;
    const districts = [...new Set(this.branches.map(b => b.district))];
    
    const stats = {
      totalBranches: total,
      totalCoverage: totalCoverage,
      averageCoverage: averageCoverage,
      uniqueDistricts: districts.length,
      districts: districts,
      largestBranch: this.branches.reduce((max, branch) => 
        branch.areaCoverage > max.areaCoverage ? branch : max
      ),
      smallestBranch: this.branches.reduce((min, branch) => 
        branch.areaCoverage < min.areaCoverage ? branch : min
      )
    };

    return of(stats).pipe(delay(400));
  }

  // Get branches by coverage range
  getBranchesByCoverageRange(min: number, max: number): Observable<Branch[]> {
    const filtered = this.branches.filter(branch => 
      branch.areaCoverage >= min && branch.areaCoverage <= max
    );
    return of(filtered).pipe(delay(300));
  }

  // Get recent branches (last 30 days)
  getRecentBranches(): Observable<Branch[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = this.branches.filter(branch => 
      branch.createdAt >= thirtyDaysAgo
    );
    
    return of(recent).pipe(delay(300));
  }

  // Get branches by year
  getBranchesByYear(year: number): Observable<Branch[]> {
    const filtered = this.branches.filter(branch => 
      branch.createdAt.getFullYear() === year
    );
    return of(filtered).pipe(delay(300));
  }

  // Get top branches by coverage
  getTopBranchesByCoverage(limit: number = 5): Observable<Branch[]> {
    const sorted = [...this.branches].sort((a, b) => b.areaCoverage - a.areaCoverage);
    return of(sorted.slice(0, limit)).pipe(delay(300));
  }
}
