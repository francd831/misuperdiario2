

## Sistema de auto-logout al salir de la app

### Problema
Actualmente la sesión usa `sessionStorage`, que persiste mientras la pestaña esté abierta. Si el usuario minimiza la app o apaga la pantalla, la sesión sigue activa al volver.

### Solución propuesta

Usar el evento `visibilitychange` del navegador para detectar cuando la app pasa a segundo plano y cerrar la sesión automáticamente.

**Comportamiento:**
- Cuando `document.visibilityState` cambia a `"hidden"` (usuario sale, apaga pantalla, cambia de app), se ejecuta `logout()` inmediatamente.
- Al volver, el usuario verá la pantalla de selección de perfil y deberá introducir su PIN de nuevo.

### Implementación

**Archivo a modificar:** `src/core/auth/ProfileContext.tsx`

Añadir un `useEffect` dentro de `ProfileProvider` que:
1. Escuche el evento `visibilitychange` en `document`.
2. Cuando `document.visibilityState === "hidden"`, llame a `logout()`.
3. Limpie el listener en el cleanup del efecto.

Es una solución simple, robusta y compatible con PWA en móviles y tablets. No requiere archivos nuevos ni cambios en otros componentes.

### Consideración
- El admin también será deslogado al salir, lo cual refuerza la seguridad en dispositivos compartidos (que es el caso de uso principal).

