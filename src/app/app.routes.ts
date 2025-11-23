import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReminderListComponent } from './reminders/reminder-list/reminder-list.component';
import { ReminderFormComponent } from './reminders/reminder-form/reminder-form.component';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './auth/home/home.component';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  
  { 
    path: 'reminders', 
    component: ReminderListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'reminders/new', 
    component: ReminderFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'reminders/edit/:id', 
    component: ReminderFormComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'home' },
];
