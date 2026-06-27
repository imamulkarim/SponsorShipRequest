import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SponsorshipRoutingModule } from './sponsorship-routing-module';

// Components
import { SponsorshipDashboardComponent } from './sponsorship-dashboard/sponsorship-dashboard.component';
import { SponsorshipFormComponent } from './sponsorship-form/sponsorship-form.component';
import { SponsorshipDetailComponent } from './sponsorship-detail/sponsorship-detail.component';
import { ApprovalListComponent } from './approval-list/approval-list.component';
import { ApprovalReviewComponent } from './approval-review/approval-review.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { WorkflowHistoryComponent } from './workflow-history/workflow-history';

// Services
import { SponsorshipService } from '../services/sponsorship.service';
import { ApprovalService } from '../services/approval.service';
import { SponsorshipTypeService } from '../services/sponsorship-type.service';
import { WorkflowService } from '../services/workflow.service';

@NgModule({
  declarations: [
    SponsorshipDashboardComponent,
    SponsorshipFormComponent,
    SponsorshipDetailComponent,
    ApprovalListComponent,
    ApprovalReviewComponent,
    AdminDashboardComponent,
    WorkflowHistoryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SponsorshipRoutingModule
  ],
  providers: [
    SponsorshipService,
    ApprovalService,
    SponsorshipTypeService,
    WorkflowService
  ]
})
export class SponsorshipModule { }
