import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { SponsorshipType } from '../models/sponsorship-type.model';
import { SponsorshipTypesClient } from '../web-api-client';

export interface SponsorshipTypesVm {
  sponsorshipTypes: SponsorshipType[];
}

@Injectable({
  providedIn: 'root'
})
export class SponsorshipTypeService {
  private typesSubject = new BehaviorSubject<SponsorshipType[]>([]);
  public types$ = this.typesSubject.asObservable();

  constructor(private sponsorshipTypesClient: SponsorshipTypesClient) {
    this.loadTypes();
  }

  private loadTypes(): void {
    this.getSponsorshipTypes().subscribe();
  }

  getSponsorshipTypes(): Observable<SponsorshipTypesVm> {
    return this.sponsorshipTypesClient.getTypes().pipe(
      take(1),
      map(vm => ({
        sponsorshipTypes: (vm.sponsorshipTypes ?? []).map(type => ({
          id: type.id ?? 0,
          name: type.name ?? '',
          description: type.description ?? '',
          isActive: true
        }))
      })),
      tap(vm => this.typesSubject.next(vm.sponsorshipTypes))
    );
  }
}
