import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Branch } from './location.service';

// Child branches now use the Branch interface with parent_branch_id set
// Keeping ChildBranch as an alias for backward compatibility
export type ChildBranch = Branch;

export interface BranchInfrastructure {
  id?: number;
  branch_id: number;
  type: string;
  count: number;
  created_on?: string;
  updated_on?: string;
  created_by?: string;
  updated_by?: string;
}

export interface BranchMember {
  id?: number;
  branch_id: number;
  member_type: string;
  name: string;
  branch_role?: string;
  responsibility?: string;
  age?: number;
  date_of_samarpan?: string;
  qualification?: string;
  date_of_birth?: string;
  created_on?: string;
  updated_on?: string;
  created_by?: string;
  updated_by?: string;
}

// Legacy interfaces for backward compatibility (will be removed in future)
export type ChildBranchInfrastructure = BranchInfrastructure;
export type ChildBranchMember = BranchMember;

export interface ChildBranchPayload {
  parent_branch_id: number;
  name: string;
  email?: string;
  coordinator_name?: string;
  contact_number: string;
  established_on?: string;
  aashram_area?: number;
  country_id?: number;
  state_id?: number;
  district_id?: number;
  city_id?: number;
  address?: string;
  pincode?: string;
  post_office?: string;
  police_station?: string;
  open_days?: string;
  daily_start_time?: string;
  daily_end_time?: string;
  status?: boolean;
  ncr?: boolean;
  region_id?: number;
  branch_code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChildBranchService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all child branches (branches with parent_branch_id set)
   */
  getAllChildBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiBaseUrl}/api/child-branches`);
  }

  /**
   * Get child branch by ID
   */
  getChildBranchById(childBranchId: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiBaseUrl}/api/child-branches/${childBranchId}`);
  }

  /**
   * Get child branches by parent branch ID
   */
  getChildBranchesByParent(parentBranchId: number): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiBaseUrl}/api/child-branches/parent/${parentBranchId}`);
  }

  /**
   * Create a new child branch
   */
  createChildBranch(childBranch: ChildBranchPayload): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiBaseUrl}/api/child-branches`, childBranch);
  }

  /**
   * Update an existing child branch
   */
  updateChildBranch(childBranchId: number, childBranchData: Partial<ChildBranchPayload> | any): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiBaseUrl}/api/child-branches/${childBranchId}`, childBranchData);
  }

  /**
   * Delete a child branch by ID
   */
  deleteChildBranch(childBranchId: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/api/child-branches/${childBranchId}`);
  }

  /**
   * Get infrastructure for a child branch (now uses BranchInfrastructure)
   */
  getChildBranchInfrastructure(childBranchId: number): Observable<BranchInfrastructure[]> {
    return this.http.get<BranchInfrastructure[]>(`${this.apiBaseUrl}/api/child-branches/${childBranchId}/infrastructure`);
  }

  /**
   * Create infrastructure for a child branch (now uses BranchInfrastructure with branch_id)
   */
  createChildBranchInfrastructure(childBranchId: number, infrastructure: Omit<BranchInfrastructure, 'id' | 'branch_id'>): Observable<BranchInfrastructure> {
    return this.http.post<BranchInfrastructure>(`${this.apiBaseUrl}/api/child-branches/${childBranchId}/infrastructure`, {
      ...infrastructure,
      branch_id: childBranchId
    });
  }

  /**
   * Get members for a child branch (now uses BranchMember)
   */
  getChildBranchMembers(childBranchId: number): Observable<BranchMember[]> {
    return this.http.get<BranchMember[]>(`${this.apiBaseUrl}/api/child-branches/${childBranchId}/members`);
  }

  /**
   * Create a member for a child branch (now uses BranchMember with branch_id)
   */
  createChildBranchMember(childBranchId: number, member: Omit<BranchMember, 'id' | 'branch_id'>): Observable<BranchMember> {
    return this.http.post<BranchMember>(`${this.apiBaseUrl}/api/child-branches/${childBranchId}/members`, {
      ...member,
      branch_id: childBranchId
    });
  }

  /**
   * Update a child branch member
   */
  updateChildBranchMember(memberId: number, memberData: Partial<BranchMember>): Observable<BranchMember> {
    return this.http.put<BranchMember>(`${this.apiBaseUrl}/api/child-branch-members/${memberId}`, memberData);
  }

  /**
   * Delete a child branch member
   */
  deleteChildBranchMember(memberId: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/api/child-branch-members/${memberId}`);
  }
}



