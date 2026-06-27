import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/api-authorization/auth.guard';

// Components
import { SponsorshipDashboardComponent } from './sponsorship-dashboard/sponsorship-dashboard.component';
import { SponsorshipFormComponent } from './sponsorship-form/sponsorship-form.component';
import { SponsorshipDetailComponent } from './sponsorship-detail/sponsorship-detail.component';
import { ApprovalListComponent } from './approval-list/approval-list.component';
import { ApprovalReviewComponent } from './approval-review/approval-review.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { WorkflowHistoryComponent } from './workflow-history/workflow-history';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: SponsorshipDashboardComponent
  },
  {
    path: 'list',
    canActivate: [AuthGuard],
    component: SponsorshipDashboardComponent
  },
  {
    path: 'create',
    canActivate: [AuthGuard],
    component: SponsorshipFormComponent
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard],
    component: SponsorshipFormComponent
  },
  
  {
    path: 'approvals/manager',
    canActivate: [AuthGuard],
    component: ApprovalListComponent,
    data: { roles: ['Manager'] }
  },
  {
    path: 'approvals/manager/:id',
    canActivate: [AuthGuard],
    component: ApprovalReviewComponent,
    data: { roles: ['Manager'] }
  },
  {
    path: 'approvals/finance',
    canActivate: [AuthGuard],
    component: ApprovalListComponent,
    data: { roles: ['FinanceAdmin'] }
  },
  {
    path: 'approvals/finance/:id',
    canActivate: [AuthGuard],
    component: ApprovalReviewComponent,
    data: { roles: ['FinanceAdmin'] }
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminDashboardComponent,
    data: { roles: ['SystemAdmin'] }
  },
  {
    path: 'admin/history/:id',
    canActivate: [AuthGuard],
    component: WorkflowHistoryComponent,
    data: { roles: ['SystemAdmin'] }
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: SponsorshipDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SponsorshipRoutingModule { }
