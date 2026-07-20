# Android

La aplicación Android usa Capacitor 8 y comparte el mismo código React que la PWA.

## Requisitos

- JDK 21
- Android SDK 36
- Android Build Tools 36
- Variable `ANDROID_HOME` apuntando al SDK local

## APK de prueba

```powershell
pnpm run android:apk
```

El resultado se genera en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Paquete para Google Play

```powershell
pnpm run android:bundle
```

La variante de publicación necesitará una clave privada de firma y su configuración en Gradle. La clave no debe guardarse en Git.

## Configuración nativa actual

- Identificador: `com.misuperdiario.app`
- Orientación: horizontal con giro en ambos sentidos
- Pantalla: modo inmersivo
- SDK mínimo: Android 7.0, API 24
- SDK objetivo: Android 16, API 36
- Permisos: cámara, micrófono, audio e Internet
- Copia automática de datos de Android desactivada para proteger el diario local
- Service worker PWA excluido del paquete nativo

Antes de publicar en Google Play habrá que crear la clave de firma definitiva, generar el AAB de producción y completar la política de privacidad y la declaración de aplicaciones para familias.
