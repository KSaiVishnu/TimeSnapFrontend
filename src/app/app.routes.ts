import { Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { LoginComponent } from './user/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './shared/auth.guard';
import { AdminComponent } from './authorizeDemo/admin/admin.component';
import { AdminOrManagerComponent } from './authorizeDemo/admin-or-manager/admin-or-manager.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { claimReq } from './shared/utils/claimReq-utils';
import { VerificationComponent } from './user/verification/verification.component';
import { TasksComponent } from './layouts/tasks/tasks.component';
import { TaskDetailsComponent } from './layouts/task-details/task-details.component';
import { TaskUploadComponent } from './authorizeDemo/admin/import/task-upload/task-upload.component';
import { BillableComponent } from './authorizeDemo/admin/billable/billable.component';
import { NonBillableComponent } from './authorizeDemo/admin/non-billable/non-billable.component';
import { EmployeesComponent } from './authorizeDemo/admin/employees/employees.component';
import { AccountComponent } from './account/account.component';
import { WorklogLeavesComponent } from './authorizeDemo/admin/import/worklog-leaves/worklog-leaves.component';
import { ReportsComponent } from './authorizeDemo/admin/reports/reports.component';
import { ImportComponent } from './authorizeDemo/admin/import/import.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetVerifyOtpComponent } from './reset-verify-otp/reset-verify-otp.component';
import { SetNewPasswordComponent } from './set-new-password/set-new-password.component';

export const routes: Routes = [
    { path: '', redirectTo: '/signin', pathMatch: 'full' },
    {
      path: '', component: UserComponent,
      children: [
        { path: 'signup', component: RegistrationComponent },
        { path: 'signin', component: LoginComponent },
        { path: 'verify', component:VerificationComponent},
        { path: 'forgot-password', component:ForgotPasswordComponent},
        { path: 'reset-verify-otp', component:ResetVerifyOtpComponent},
        { path: 'set-new-password', component:SetNewPasswordComponent},
      ]
    },
    {
      path: '', component: MainLayoutComponent, canActivate: [authGuard],
      canActivateChild: [authGuard],
      children: [
        {
          path: 'dashboard', component: DashboardComponent
        },
        {
          path: 'account', component:AccountComponent
        },
        // {
        //   path: 'admin', component: AdminComponent,
        //   data: { claimReq: claimReq.admin }
        // },
        {
          path:'tasks',component:TasksComponent
        },
        // {
        //   path:`tasks/:id`, component:TaskDetailsComponent
        // },
        {
          path: 'tasks/:id', loadComponent: () => import('./layouts/task-details/task-details.component').then(m => m.TaskDetailsComponent)
        },
        {
          path: 'admin-or-manager', component: AdminOrManagerComponent,
          data: { claimReq: claimReq.adminOrManager }
        },
        {
          path: 'forbidden', component: ForbiddenComponent
        },
        {
          path: 'admin', component: AdminComponent, data: { claimReq: claimReq.admin },
          children: [
            // Define admin-specific child routes here
            { path: 'upload', component: ImportComponent },
            { path: 'billable', component: BillableComponent },
            { path: 'non-billable', component: NonBillableComponent },
            { path: 'all-employees', component: EmployeesComponent },
            { path: 'worklog-leaves', component: WorklogLeavesComponent },
            { path: 'reports', component: ReportsComponent },

            { path: '', redirectTo: 'upload', pathMatch: 'full' } // Default admin route
          ]
        }
      ]
    },

];
