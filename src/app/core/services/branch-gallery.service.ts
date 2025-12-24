import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchGalleryService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get branch media (works for both branches and child branches)
   * @param branchId Branch ID (optional - if not provided, returns all)
   */
  getBranchMedia(branchId?: number): Observable<any> {
    if (branchId) {
      return this.http.get(`${this.apiBaseUrl}/api/branch-media/branch/${branchId}`);
    } else {
      return this.http.get(`${this.apiBaseUrl}/api/branch-media`);
    }
  }

  /**
   * Get presigned download URL for a file
   * @param mediaId Media ID
   */
  getDownloadUrl(mediaId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/api/files/${mediaId}/download`);
  }

  /**
   * Upload multiple files to S3 (works for both branches and child branches)
   * @param files Array of files to upload
   * @param branchId Branch ID
   * @param category File category
   */
  uploadMultipleFiles(files: File[], branchId: number, category?: string): Observable<any> {
    const formData = new FormData();

    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });

    formData.append('branch_id', branchId.toString());
    if (category) {
      formData.append('category', category);
    }

    return this.http.post(`${this.apiBaseUrl}/api/files/upload-branch`, formData);
  }

  /**
   * Delete file from S3 (works for both branches and child branches)
   * @param mediaId Media ID
   * @param branchId Optional branch ID for validation
   * @param deleteRecord Whether to delete the media record (default: true)
   */
  deleteFile(mediaId: number, branchId?: number, deleteRecord: boolean = true): Observable<any> {
    let params = new HttpParams().set('delete_record', deleteRecord.toString());
    if (branchId) {
      params = params.set('branch_id', branchId.toString());
    }
    return this.http.delete(`${this.apiBaseUrl}/api/files/${mediaId}`, { params });
  }
}



