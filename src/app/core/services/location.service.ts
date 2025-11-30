import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
   * Get states by country ID
   */
  getStatesByCountry(countryId: number): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiBaseUrl}/api/countries/${countryId}/states`);
  }

  /**
   * Get districts by state ID and country ID
   */
  getDistrictsByStateAndCountry(stateId: number, countryId: number): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiBaseUrl}/api/districts?state_id=${stateId}&country_id=${countryId}`);
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
  createBranch(branchData: any): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/api/branches`, branchData);
  }

  /**
   * Get all branches
   */
  getAllBranches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/api/branches`);
  }

  /**
   * Get branch members by branch ID
   */
  getBranchMembers(branchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/api/branch-member/branch/${branchId}`);
  }

  /**
   * Get branch by ID
   */
  getBranchById(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/api/branches/${branchId}`);
  }

  /**
   * Update an existing branch
   */
  updateBranch(branchId: number, branchData: any): Observable<any> {
    return this.http.put<any>(`${this.apiBaseUrl}/api/branches/${branchId}`, branchData);
  }
}

