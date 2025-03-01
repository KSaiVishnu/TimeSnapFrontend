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

export const routes: Routes = [
    { path: '', redirectTo: '/signin', pathMatch: 'full' },
    {
      path: '', component: UserComponent,
      children: [
        { path: 'signup', component: RegistrationComponent },
        { path: 'signin', component: LoginComponent },
        { path: 'verify', component:VerificationComponent}
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
          path: 'admin', component: AdminComponent,
          data: { claimReq: claimReq.admin }
        },
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
        }
      ]
    },

];
