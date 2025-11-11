import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReminderListComponent } from './reminders/reminder-list/reminder-list.component';
import { ReminderFormComponent } from './reminders/reminder-form/reminder-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'reminders', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reminders', component: ReminderListComponent },
  { path: 'reminders/new', component: ReminderFormComponent },
  { path: 'reminders/edit/:id', component: ReminderFormComponent },
  { path: '**', redirectTo: 'reminders' },
];
