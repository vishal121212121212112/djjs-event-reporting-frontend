import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Country {
  id: number;
  name: string;
  [key: string]: any;
}

export interface State {
  id: number;
  name: string;
  country_id?: number;
  [key: string]: any;
}

export interface District {
  id: number;
  name: string;
  state_id?: number;
  country_id?: number;
  [key: string]: any;
}

export interface City {
  id: number;
  name: string;
  state_id?: number;
  [key: string]: any;
}

export interface Coordinator {
  id: number;
  name: string;
  member_type?: string;
  branch_id?: number;
  branch?: {
    id: number;
    name: string;
    contact_number?: string;
    created_on?: string;
  };
  created_on?: string;
  [key: string]: any;
}

/**
 * Branch response interface (from GET /api/branches)
 * Location fields are nested objects with id and name
 */
export interface Branch {
  id: number;
  name: string;
  email: string;
  coordinator_name: string;
  contact_number: string;
  established_on: string;
  aashram_area: number;
  country_id: number | null;
  country: {
    id: number;
    name: string;
  };
  state_id: number | null;
  state: {
    id: number;
    name: string;
    country_id: number;
  };
  district_id: number | null;
  district: {
    id: number;
    name: string;
    state_id: number;
    country_id: number;
  };
  city_id: number | null;
  city: {
    id: number;
    name: string;
    state_id: number;
  };
  address?: string;
  pincode?: string;
  post_office?: string;
  police_station?: string;
  open_days?: string;
  daily_start_time?: string;
  daily_end_time?: string;
  status?: boolean;
  ncr?: boolean;
  region_id?: number | null;
  branch_code?: string;
  parent_branch_id?: number | null;
  children?: Branch[]; // Child branches if this is a parent
  infrastructure?: Array<{
    id: number;
    type: string;
    count: number;
  }>;
  members?: Array<{
    id: number;
    name: string;
    member_type: string;
    branch_role?: string;
    responsibility?: string;
    age?: number;
    date_of_samarpan?: string;
    qualification?: string;
    date_of_birth?: string;
    branch_id: number;
  }>;
  branch_members?: Array<{
    id: number;
    name: string;
    member_type: string;
    branch_role?: string;
    responsibility?: string;
    age?: number;
    date_of_samarpan?: string;
    qualification?: string;
    date_of_birth?: string;
    branch_id: number;
  }>;
  created_on: string;
  created_by?: string;
  updated_on?: string;
  updated_by?: string;
}

/**
 * Branch creation/update payload interface (for POST/PUT /api/branches)
 * Location fields are strings (names), not objects
 */
export interface BranchPayload {
  aashram_area: number;
  address?: string;
  city_id?: number | null; // Location ID
  city?: string; // Location name (for backward compatibility)
  contact_number: string;
  coordinator_name: string;
  country_id?: number | null; // Location ID
  country?: string; // Location name (for backward compatibility)
  created_by?: string;
  created_on?: string;
  daily_end_time?: string;
  daily_start_time?: string;
  district_id?: number | null; // Location ID
  district?: string; // Location name (for backward compatibility)
  email: string;
  established_on: string;
  id?: number; // Optional for create, required for update
  name: string;
  open_days?: string;
  pincode?: string;
  police_station?: string;
  post_office?: string;
  state_id?: number | null; // Location ID
  state?: string; // Location name (for backward compatibility)
  status?: boolean;
  ncr?: boolean;
  region_id?: number | null;
  branch_code?: string;
  parent_branch_id?: number | null; // Parent branch ID for child branches
  updated_by?: string;
  updated_on?: string;
}

export interface BranchInfra {
  id: number;
  branch_id: number;
  branch: {
    id: number;
    name: string;
    email: string;
    coordinator_name: string;
    contact_number: string;
    established_on: string;
    aashram_area: number;
    country_id: number | null;
    country: {
      id: number;
      name: string;
    };
    state_id: number | null;
    state: {
      id: number;
      name: string;
      country_id: number;
    };
    district_id: number | null;
    district: {
      id: number;
      name: string;
      state_id: number;
      country_id: number;
    };
    city_id: number | null;
    city: {
      id: number;
      name: string;
      state_id: number;
    };
    created_on: string;
    created_by: string;
  };
  type: string;
  count: number;
  created_on: string;
  updated_on: string;
  created_by: string;
  updated_by: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all countries
   */
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiBaseUrl}/api/countries`);
  }

  /**
   * Get all states
   */
  getAllStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiBaseUrl}/api/states`);
  }

  /**
   * Get states by country ID
   */
  getStatesByCountry(countryId: number): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiBaseUrl}/api/countries/${countryId}/states`);
  }

  /**
   * Get all districts
   */
  getAllDistricts(): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiBaseUrl}/api/districts/all`);
  }

  /**
   * Get districts by state ID and country ID
   */
  getDistrictsByStateAndCountry(stateId: number, countryId: number): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiBaseUrl}/api/districts?state_id=${stateId}&country_id=${countryId}`);
  }

  /**
   * Get districts by country ID only
   */
  getDistrictsByCountry(countryId: number): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiBaseUrl}/api/districts?country_id=${countryId}`);
  }

  /**
   * Get cities by state ID
   */
  getCitiesByState(stateId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiBaseUrl}/api/cities/by-state?state_id=${stateId}`);
  }

  /**
   * Get all coordinators
   */
  getCoordinators(): Observable<Coordinator[]> {
    return this.http.get<Coordinator[]>(`${this.apiBaseUrl}/api/coordinators`);
  }

  /**
   * Create a new branch
   */
  createBranch(branchData: BranchPayload): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiBaseUrl}/api/branches`, branchData);
  }

  /**
   * Get all branches
   */
  getAllBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiBaseUrl}/api/branches`);
  }

  /**
   * Get all branch members
   */
  getAllBranchMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/api/branch-member`);
  }

  /**
   * Get branch members by branch ID
   */
  getBranchMembers(branchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/api/branch-member/branch/${branchId}`);
  }

  /**
   * Create a new branch member
   */
  createBranchMember(memberData: any): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/api/branch-member`, memberData);
  }

  /**
   * Update a branch member by ID
   */
  updateBranchMember(memberId: number, memberData: any): Observable<any> {
    return this.http.put<any>(`${this.apiBaseUrl}/api/branch-member/${memberId}`, memberData);
  }

  /**
   * Delete a branch member by ID
   */
  deleteBranchMember(memberId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiBaseUrl}/api/branch-member/${memberId}`);
  }

  /**
   * Get branch by ID
   */
  getBranchById(branchId: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiBaseUrl}/api/branches/${branchId}`);
  }

  /**
   * Get child branches by parent branch ID
   */
  getChildBranches(parentBranchId: number): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiBaseUrl}/api/branches/parent/${parentBranchId}/children`);
  }

  /**
   * Update an existing branch
   * Accepts partial BranchPayload since backend accepts map[string]interface{}
   */
  updateBranch(branchId: number, branchData: Partial<BranchPayload> | any): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiBaseUrl}/api/branches/${branchId}`, branchData);
  }

  /**
   * Delete a branch by ID
   */
  deleteBranch(branchId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiBaseUrl}/api/branches/${branchId}`);
  }

  /**
   * Search branches by name or coordinator (or get all if no params provided)
   */
  searchBranches(name?: string, coordinator?: string): Observable<Branch[]> {
    let url = `${this.apiBaseUrl}/api/branches/search`;
    const params: string[] = [];

    // Only add non-empty parameters
    if (name && name.trim()) {
      params.push(`name=${encodeURIComponent(name.trim())}`);
    }
    if (coordinator && coordinator.trim()) {
      params.push(`coordinator=${encodeURIComponent(coordinator.trim())}`);
    }

    // If we have parameters, add them to URL
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<Branch[]>(url);
  }

  /**
   * Get all branch infrastructure data
   */
  getBranchInfra(): Observable<BranchInfra[]> {
    return this.http.get<BranchInfra[]>(`${this.apiBaseUrl}/api/branch-infra`);
  }

  /**
   * Get branch infrastructure by branch ID
   */
  getBranchInfraByBranchId(branchId: number): Observable<BranchInfra[]> {
    return this.http.get<BranchInfra[]>(`${this.apiBaseUrl}/api/branch-infra?branch_id=${branchId}`);
  }

  /**
   * Export branches to Excel with optional search filter
   */
  exportBranchesToExcel(search?: string): Observable<Blob> {
    let url = `${this.apiBaseUrl}/api/branches/export`;
    const params: string[] = [];

    if (search && search.trim()) {
      params.push(`search=${encodeURIComponent(search.trim())}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get(url, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  }

  /**
   * Export branch members to Excel with optional filters
   */
  exportMembersToExcel(search?: string, memberType?: string, branchType?: string): Observable<Blob> {
    let url = `${this.apiBaseUrl}/api/branch-member/export`;
    const params: string[] = [];

    if (search && search.trim()) {
      params.push(`search=${encodeURIComponent(search.trim())}`);
    }
    if (memberType && memberType !== 'all') {
      params.push(`member_type=${encodeURIComponent(memberType)}`);
    }
    if (branchType && branchType !== 'all') {
      params.push(`branch_type=${encodeURIComponent(branchType)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get(url, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  }
}

