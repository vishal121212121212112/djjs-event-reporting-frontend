import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError, map } from 'rxjs/operators';
import { LocationService, Branch } from './location.service';
import { ChildBranchService, ChildBranch } from './child-branch.service';
import { forkJoin } from 'rxjs';

/**
 * Branch Options Service
 * 
 * Provides cached access to all branches (parent and child) for use in dropdowns.
 * Uses shareReplay to cache the result and avoid multiple API calls.
 */
@Injectable({
  providedIn: 'root'
})
export class BranchOptionsService {
  private cachedBranches$: Observable<Array<{ id: number; name: string; isChildBranch: boolean }>> | null = null;

  constructor(
    private locationService: LocationService,
    private childBranchService: ChildBranchService
  ) {}

  /**
   * Get all branches (parent and child) as a cached observable.
   * The result is cached and shared across all subscribers.
   */
  getAllBranchesCached(): Observable<Array<{ id: number; name: string; isChildBranch: boolean }>> {
    if (!this.cachedBranches$) {
      this.cachedBranches$ = forkJoin({
        branches: this.locationService.getAllBranches().pipe(
          catchError(() => of([] as Branch[]))
        ),
        childBranches: this.childBranchService.getAllChildBranches().pipe(
          catchError(() => of([] as ChildBranch[]))
        )
      }).pipe(
        map(result => {
          const allBranches: Array<{ id: number; name: string; isChildBranch: boolean }> = [
            // Parent branches (no parent_branch_id)
            ...(result.branches
              .filter(b => !b.parent_branch_id && b.id)
              .map(b => ({ id: b.id!, name: b.name, isChildBranch: false }))),
            // Child branches (have parent_branch_id)
            ...(result.childBranches
              .filter(b => b.id)
              .map(b => ({ id: b.id!, name: b.name, isChildBranch: true })))
          ].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

          return allBranches;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }

    return this.cachedBranches$;
  }

  /**
   * Clear the cache (useful when branches are added/updated/deleted)
   */
  clearCache(): void {
    this.cachedBranches$ = null;
  }
}

