import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SponsorshipService } from '../../services/sponsorship.service';
import { SponsorshipTypeService } from '../../services/sponsorship-type.service';
import { SponsorshipType } from '../../models/sponsorship-type.model';
import { SponsorshipRequest } from '../../models/sponsorship-request.model';

@Component({
  standalone: false,
  selector: 'app-sponsorship-form',
  templateUrl: './sponsorship-form.component.html',
  styleUrls: ['./sponsorship-form.component.scss']
})
export class SponsorshipFormComponent implements OnInit {
  form!: FormGroup;
  sponsorshipTypes: SponsorshipType[] = [];
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  requestId?: number;

  constructor(
    private fb: FormBuilder,
    private sponsorshipService: SponsorshipService,
    private sponsorshipTypeService: SponsorshipTypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadSponsorshipTypes();
    this.checkEditMode();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      department: ['', Validators.required],
      sponsorshipTypeId: ['', Validators.required],
      eventName: ['', Validators.required],
      eventDate: ['', Validators.required],
      requestedAmount: ['', [Validators.required, Validators.min(0.01)]],
      purpose: ['', [Validators.required, Validators.minLength(10)]],
      businessBenefit: [''],
      supportingDocumentUrl: ['']
    });
  }

  private loadSponsorshipTypes(): void {
    this.sponsorshipTypeService.types$.subscribe(types => {
      this.sponsorshipTypes = types;
    });
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.requestId = params['id'];
        this.loadRequest(params['id']);
      }
    });
  }

  private loadRequest(id: number): void {
    this.sponsorshipService.getRequestDetail(id).subscribe({
      next: (request) => {
        this.populateForm(request);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load request';
      }
    });
  }

  private populateForm(request: SponsorshipRequest): void {
    this.form.patchValue({
      title: request.title,
      department: request.department,
      sponsorshipTypeId: request.sponsorshipType,
      eventName: request.eventName,
      eventDate: new Date(request.eventDate).toISOString().split('T')[0],
      requestedAmount: request.requestedAmount,
      purpose: request.purpose,
      businessBenefit: request.businessBenefit,
      supportingDocumentUrl: request.supportingDocumentUrl
    });
  }

  saveAsDraft(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    if (this.isEditMode && this.requestId) {
      this.sponsorshipService.updateDraftRequest(this.requestId, formValue).subscribe({
        next: () => {
          this.successMessage = 'Request saved as draft';
          this.router.navigate(['/sponsorship']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to save request';
          this.isSubmitting = false;
        }
      });
    } else {
      this.sponsorshipService.createRequest(formValue).subscribe({
        next: (id) => {
          this.successMessage = 'Request created successfully';
          this.router.navigate(['/sponsorship']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create request';
          this.isSubmitting = false;
        }
      });
    }
  }

  submitRequest(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.requestId) {
      const formValue = this.form.value;
      this.sponsorshipService.updateDraftRequest(this.requestId, formValue).subscribe({
        next: () => {
          this.sponsorshipService.submitRequest(this.requestId!).subscribe({
            next: () => {
              this.successMessage = 'Request submitted for approval';
              this.router.navigate(['/sponsorship']);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Failed to submit request';
              this.isSubmitting = false;
            }
          });
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to save request';
          this.isSubmitting = false;
        }
      });
    } else {
      this.sponsorshipService.createRequest(this.form.value).subscribe({
        next: (id) => {
          this.sponsorshipService.submitRequest(id).subscribe({
            next: () => {
              this.successMessage = 'Request submitted for approval';
              this.router.navigate(['/sponsorship']);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Failed to submit request';
              this.isSubmitting = false;
            }
          });
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create request';
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/sponsorship']);
  }
}
