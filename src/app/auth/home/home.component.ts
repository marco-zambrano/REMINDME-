import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home.component',
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private router: Router) { }

  // Método para manejar la acción del botón de inicio de sesión
  iniciarSesion() {
    this.router.navigate(['/login']); // Redirige al usuario a la ruta de inicio de sesión
  }

  // Método para la navegación a Crear Cuenta
  crearCuenta() {
    this.router.navigate(['/register']); // Navega a /register
  }
}
