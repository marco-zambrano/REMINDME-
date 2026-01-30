# Guía de Contribución para Desarrolladores

¡Gracias por tu interés en contribuir a REMINDME! Esta guía te ayudará a entender cómo puedes colaborar efectivamente en el proyecto.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Primeros Pasos](#primeros-pasos)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Flujo de Trabajo para Contribuciones](#flujo-de-trabajo-para-contribuciones)
- [Estándares de Código](#estándares-de-código)
- [Pruebas](#pruebas)
- [Commits y Pull Requests](#commits-y-pull-requests)
- [Documentación](#documentación)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Funcionalidades](#solicitar-funcionalidades)

## Código de Conducta

Este proyecto se adhiere a un código de conducta profesional y respetuoso. Al participar, te comprometes a:

- Ser respetuoso con todos los colaboradores
- Aceptar críticas constructivas
- Enfocarte en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

## Primeros Pasos

1. **Familiarízate con el proyecto**: Lee el [README.md](README.md) y [GETTING_STARTED.md](GETTING_STARTED.md)
2. **Explora la documentación existente**: Revisa [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) y otros documentos técnicos
3. **Ejecuta el proyecto localmente**: Sigue las instrucciones en [GETTING_STARTED.md](GETTING_STARTED.md)
4. **Revisa los issues abiertos**: Busca etiquetas como `good first issue` o `help wanted`

## Configuración del Entorno de Desarrollo

### Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Git
- Cuenta en Supabase (para desarrollo con backend)
- API Key de Google Maps (para funcionalidades de geolocalización)

### Instalación

```bash
# 1. Fork el repositorio y clónalo
git clone https://github.com/TU_USUARIO/REMINDME-.git
cd REMINDME-

# 2. Instala las dependencias
npm install

# 3. Configura las variables de entorno
# Crea un archivo de configuración con tus credenciales
# (consulta con el equipo las variables necesarias)

# 4. Ejecuta el proyecto en modo desarrollo
npm start

# 5. Ejecuta las pruebas para verificar que todo funciona
npm test
```

### Herramientas Recomendadas

- **IDE**: Visual Studio Code con las siguientes extensiones:
  - Angular Language Service
  - ESLint
  - Prettier
  - GitLens
- **Navegador**: Chrome o Firefox con DevTools
- **Control de Versiones**: Git

## Flujo de Trabajo para Contribuciones

### 1. Crear una Rama

```bash
# Asegúrate de estar en la rama principal actualizada
git checkout main
git pull origin main

# Crea una nueva rama con un nombre descriptivo
git checkout -b feature/nombre-de-funcionalidad
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Convenciones de Nombres de Ramas

- `feature/` - Para nuevas funcionalidades
- `fix/` - Para corrección de bugs
- `docs/` - Para cambios en documentación
- `refactor/` - Para refactorización de código
- `test/` - Para agregar o mejorar pruebas
- `chore/` - Para tareas de mantenimiento

### 3. Realizar Cambios

- Escribe código limpio y legible
- Sigue los estándares de código del proyecto
- Agrega comentarios cuando sea necesario
- Asegúrate de que tu código sea accesible

### 4. Confirmar Cambios

```bash
# Agrega los archivos modificados
git add .

# Realiza un commit con un mensaje descriptivo
git commit -m "tipo: descripción breve del cambio"
```

### 5. Subir Cambios

```bash
# Sube tu rama al repositorio remoto
git push origin nombre-de-tu-rama
```

### 6. Crear Pull Request

1. Ve al repositorio en GitHub
2. Crea un Pull Request desde tu rama hacia `main`
3. Completa la plantilla de PR con toda la información necesaria
4. Espera la revisión del equipo

## Estándares de Código

### TypeScript/Angular

- **Formato**: Usa Prettier para formatear automáticamente
- **Linting**: El código debe pasar todas las reglas de ESLint
- **Tipos**: Siempre usa tipado estricto, evita `any`
- **Nomenclatura**:
  - Componentes: PascalCase (`ReminderListComponent`)
  - Servicios: PascalCase con sufijo Service (`ReminderService`)
  - Interfaces/Modelos: PascalCase (`Reminder`, `Category`)
  - Variables/funciones: camelCase (`getUserReminders`)
  - Constantes: UPPER_SNAKE_CASE (`MAX_REMINDERS`)

### Estructura de Componentes

```typescript
// 1. Imports
import { Component } from '@angular/core';

// 2. Decorador
@Component({
  selector: 'app-componente',
  templateUrl: './componente.html',
  styleUrls: ['./componente.css']
})

// 3. Clase
export class ComponenteComponent {
  // 3.1 Propiedades públicas
  // 3.2 Propiedades privadas
  // 3.3 Constructor
  // 3.4 Lifecycle hooks
  // 3.5 Métodos públicos
  // 3.6 Métodos privados
}
```

### HTML/Templates

- Usa indentación de 2 espacios
- Mantén las plantillas legibles y organizadas
- Usa directivas estructurales de forma clara
- Agrega atributos ARIA para accesibilidad

### CSS

- Usa clases descriptivas
- Sigue BEM cuando sea apropiado
- Evita estilos inline en HTML
- Usa variables CSS para valores reutilizables

## Pruebas

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

### Escribir Pruebas

- **Cobertura mínima**: 80% para nuevo código
- **Tipos de pruebas**:
  - Unitarias: Para componentes, servicios y pipes
  - Integración: Para flujos completos
  - E2E: Para casos de uso críticos

### Estructura de Pruebas

```typescript
describe('NombreDelComponente', () => {
  let component: NombreDelComponente;
  let fixture: ComponentFixture<NombreDelComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NombreDelComponente]
    }).compileComponents();

    fixture = TestBed.createComponent(NombreDelComponente);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('método específico', () => {
    it('should comportamiento esperado', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

Para más información sobre pruebas, consulta [HOW_TO_RUN_TESTS.md](HOW_TO_RUN_TESTS.md) y [TESTS_SUMMARY.md](TESTS_SUMMARY.md).

## Commits y Pull Requests

### Mensajes de Commit

Usamos Conventional Commits:

```
tipo(alcance): descripción breve

[cuerpo opcional]

[footer opcional]
```

**Tipos permitidos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (sin afectar lógica)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar pruebas
- `chore`: Tareas de mantenimiento

**Ejemplos**:
```bash
git commit -m "feat(reminders): agregar filtro por categoría"
git commit -m "fix(auth): corregir validación de email"
git commit -m "docs: actualizar guía de contribución"
git commit -m "test(services): agregar pruebas para ReminderService"
```

### Pull Requests

#### Título del PR
Sigue el mismo formato que los commits:
```
tipo(alcance): descripción breve
```

#### Descripción del PR

Incluye:
1. **Qué**: Descripción de los cambios
2. **Por qué**: Razón/motivación de los cambios
3. **Cómo**: Enfoque técnico utilizado
4. **Testing**: Cómo se probaron los cambios
5. **Screenshots**: Si aplica, capturas de pantalla
6. **Checklist**:
   - [ ] El código compila sin errores
   - [ ] Todas las pruebas pasan
   - [ ] Se agregaron pruebas para nuevo código
   - [ ] La documentación está actualizada
   - [ ] El código sigue los estándares del proyecto

#### Proceso de Revisión

- Al menos 1 aprobación requerida
- Todos los comentarios deben ser resueltos
- Las pruebas de CI/CD deben pasar
- No debe haber conflictos con la rama principal

## Documentación

### Cuándo Actualizar la Documentación

- Nuevas funcionalidades requieren documentación
- Cambios en APIs o interfaces públicas
- Nuevas dependencias o configuraciones
- Cambios en el proceso de desarrollo

### Tipos de Documentación

1. **README.md**: Información general del proyecto
2. **GETTING_STARTED.md**: Guía de inicio rápido
3. **Comentarios en código**: Para lógica compleja
4. **JSDoc**: Para funciones y clases públicas
5. **Documentación técnica**: Arquitectura y diseño

## Reportar Bugs

### Antes de Reportar

1. Verifica que no sea un duplicado
2. Asegúrate de estar usando la última versión
3. Intenta reproducir el bug de forma consistente

### Template para Reportar Bugs

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

**Comportamiento Esperado**
Qué esperabas que sucediera.

**Comportamiento Actual**
Qué sucedió en realidad.

**Screenshots**
Si aplica, agrega capturas de pantalla.

**Entorno**
- OS: [e.g., Windows 11]
- Navegador: [e.g., Chrome 120]
- Versión: [e.g., 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

## Solicitar Funcionalidades

### Template para Nuevas Funcionalidades

```markdown
**¿Es tu solicitud relacionada con un problema?**
Descripción clara del problema.

**Describe la Solución que te Gustaría**
Descripción clara de lo que quieres que suceda.

**Alternativas Consideradas**
Otras soluciones o funcionalidades que consideraste.

**Contexto Adicional**
Capturas de pantalla, ejemplos, etc.
```

## Recursos Adicionales

- [Angular Documentation](https://angular.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Maps API](https://developers.google.com/maps/documentation)
- [Testing Angular](https://angular.dev/guide/testing)

## Contacto

Si tienes preguntas o necesitas ayuda:
- Abre un issue con la etiqueta `question`
- Contacta al equipo de desarrollo

## Agradecimientos

¡Gracias por contribuir a REMINDME! Tu ayuda hace que este proyecto sea mejor para todos. 🎉

---

**Última actualización**: Enero 2026
