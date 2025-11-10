import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login';
import { RegisterComponent } from './auth/register';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	// add more routes here
];
