# Mi Super Diario - especificacion beta privada

## Objetivo

Preparar Mi Super Diario para una beta privada usable, segura a nivel local y mantenible, integrando las piezas parciales existentes sin borrar funcionalidad. La beta debe permitir que una familia use la app con perfiles separados, contenido multimedia local, stickers, recompensas, tienda por estrellas, backups completos y una experiencia PWA en espanol.

## Principios

- La app funciona offline-first y guarda los datos principales en IndexedDB.
- Los perfiles infantiles no acceden a pantallas de administracion.
- El PIN nunca se guarda en claro.
- Las compras de packs se hacen con estrellas del perfil activo, no con desbloqueos simulados.
- Las fotos, audios, videos, stickers, recompensas y compras deben sobrevivir a cierre de app y backup/import.
- Las mejoras se implementan sobre lo que ya existe, migrando datos antiguos cuando sea razonable.
- Cada fase debe cerrar con build/test o una explicacion clara de lo que no se pudo ejecutar.

## Alcance de beta

Incluido:

- Metadata HTML y manifest PWA en espanol.
- Iconos PWA existentes y configuracion offline razonable.
- Rutas lazy con pantalla de carga.
- Perfiles activos por sesion.
- Perfil admin obligatorio y protegido.
- PIN hasheado en todos los caminos de creacion, cambio y verificacion.
- IndexedDB ampliado para media, overlays, logros, monedero, transacciones y compras.
- Stickers end-to-end en entradas, fotos diarias y packs.
- Monedero de estrellas por perfil.
- Recompensas por hitos y rachas.
- Tienda que compra packs con estrellas.
- Backups zip con datos JSON y blobs multimedia.
- Import de backup que restaura datos y blobs manteniendo profileId y fechas.
- Hooks reutilizables para object URLs.
- Mejoras de captura/reproduccion de foto, timelapse, audio y video.
- Tests unitarios de servicios criticos.

No incluido en beta privada:

- Sin backend remoto.
- Sin sincronizacion multi-dispositivo.
- Sin pagos reales.
- Sin cifrado completo de contenido local.
- Sin moderacion automatica de contenido.
- Sin sistema avanzado de permisos por perfil mas alla de admin/usuario.

## Estado actual detectado

Ya existen piezas parciales en el repo:

- React, Vite, React Router, Vitest, PWA, idb y JSZip.
- Rutas principales en `src/app/routes/AppRoutes.tsx`.
- Perfiles, admin setup, profile select y lock.
- `profileService` con hashing de PIN.
- `pinService` legacy que todavia puede guardar PIN en claro.
- IndexedDB con stores basicas: profiles, entries, daily_photos, settings, entitlements, avatar_blobs y achievements.
- Packs, pack loader, pack context, asset resolver y packs en `src/assets/packs`.
- Tienda de packs con desbloqueo simulado.
- Logros basicos sin monedero.
- Backups parciales con fotos, pero no media de entradas, recompensas ni compras completas.
- Uso manual de `URL.createObjectURL` en varios componentes.

Nota: antes de esta especificacion se hizo un cambio local minimo en `src/core/storage/indexeddb.ts` para empezar a ampliar stores y tipos. Puede mantenerse como base o revertirse si se decide reiniciar la implementacion desde esta spec.

## Fase 1 - Base beta, PWA, rutas y seguridad

### Requisitos

- Corregir textos mojibake en metadata, PWA y UI tocada por la fase.
- Configurar `index.html` con:
  - `lang="es"`.
  - title: `Mi Super Diario`.
  - description en espanol.
  - theme color.
  - viewport correcto.
  - apple/mobile web app metadata.
- Configurar manifest PWA en `vite.config.ts`:
  - name: `Mi Super Diario`.
  - short_name: `Super Diario`.
  - description en espanol correcto.
  - display standalone.
  - orientation portrait.
  - iconos 192, 512 y maskable.
- Convertir rutas principales a lazy imports usando `React.lazy` y `Suspense`.
- Crear guard explicito de admin:
  - Si perfil activo es admin, puede entrar a `/admin/*`.
  - Si perfil activo no es admin, `/admin/*` redirige a `/admin-lock` o `/`.
  - `/admin-lock` verifica PIN admin y activa la sesion admin.
- Unificar hashing de PIN:
  - Extraer helper unico para hash/verify.
  - `profileService` y `pinService` deben usar el mismo helper.
  - Si se detecta PIN legacy en claro y la verificacion es correcta, migrar a hash.

### Criterios de aceptacion

- No hay imports eager de paginas pesadas en `AppRoutes`.
- Un usuario normal no puede renderizar pantallas admin por URL directa.
- Ningun flujo nuevo guarda PIN en claro.
- PIN legacy puede verificarse una vez y queda migrado a hash.
- `npm run build` pasa.

### Tests

- Unit test de hash/verify/migracion de PIN.
- Unit test de decision de guard admin si se extrae a funcion pura.

## Fase 2 - Persistencia IndexedDB y perfiles activos

### Requisitos

- Definir schema IndexedDB versionado para:
  - profiles.
  - entries.
  - daily_photos.
  - settings por profileId.
  - entitlements por profileId + packId.
  - achievements.
  - wallet_transactions.
  - media blobs si se separan de entries.
- Cada entrada debe conservar:
  - id, profileId, date, type, title, note.
  - mediaBlob o referencia a media persistida.
  - duration.
  - overlayProject/stickerOverlays.
  - isLocked/unlockAt para capsulas.
  - createdAt/updatedAt.
- Cada foto diaria debe conservar:
  - id, profileId, date, blob, thumbnailBlob opcional.
  - caption.
  - overlayProject.
  - createdAt.
- Settings deben leerse y guardarse por perfil activo cuando aplique.
- Pack activo debe poder ser por perfil.

### Criterios de aceptacion

- Cambiar de perfil no mezcla entradas, fotos, packs ni recompensas.
- Las fotos diarias y timelapse usan el profileId activo, no `default`.
- Las migraciones no rompen datos existentes.

### Tests

- Repositorios filtran por profileId.
- Settings por perfil devuelven defaults correctos.
- Schema upgrade crea stores e indices esperados.

## Fase 3 - Recompensas, monedero y tienda

### Requisitos

- Crear servicio de monedero por perfil:
  - balance(profileId).
  - addStars(profileId, amount, reason, metadata).
  - spendStars(profileId, amount, reason, metadata).
  - listTransactions(profileId).
  - impedir saldo negativo.
  - idempotencia por evento cuando aplique.
- Conectar logros a recompensas:
  - Al desbloquear logro, otorgar estrellas una sola vez.
  - Cada logro define `starReward`.
  - Las rachas tambien pueden generar recompensa controlada.
- Tienda:
  - Cada pack premium tiene coste en estrellas.
  - Pack base siempre gratis.
  - Packs comprados quedan desbloqueados para el perfil activo.
  - Boton muestra precio, saldo y estado.
  - Compra falla con mensaje claro si no hay estrellas suficientes.
- Entitlements:
  - Deben ser por perfil, no globales, salvo packs gratuitos.

### Criterios de aceptacion

- No existe "desbloqueo simulado" en la beta.
- Comprar pack descuenta estrellas y desbloquea solo para ese perfil.
- Activar pack comprado actualiza el pack activo del perfil.
- Logro repetido no duplica estrellas.

### Tests

- Wallet suma/resta correctamente.
- Wallet no permite saldo negativo.
- Achievement reward es idempotente.
- Compra de pack descuenta y crea entitlement.

## Fase 4 - Stickers end-to-end

### Requisitos

- Mantener compatibilidad con stickers legacy.
- Usar `overlayProject` como modelo principal cuando exista.
- Stickers deben funcionar en:
  - grabacion de video.
  - detalle de video.
  - audio si se mantiene overlay decorativo.
  - foto diaria.
  - detalle de foto diaria.
  - entradas existentes con migracion legacy.
- Los stickers de pack deben resolverse de forma estable:
  - guardar identificador de pack + asset, no solo indice volatil, cuando sea posible.
  - mantener fallback para `pack-sticker-N`.
- Export de imagen con stickers debe renderizar assets reales cuando se guarde foto compuesta.

### Criterios de aceptacion

- Un sticker agregado persiste tras recargar.
- Un sticker de pack comprado se muestra en editor y detalle.
- El backup/import conserva overlays.

### Tests

- Migracion legacy stickerOverlays a overlayProject.
- Resolucion de asset de sticker por pack.

## Fase 5 - Media: fotos, timelapse, audio y video

### Requisitos

- Crear hook `useObjectUrl(blob)`:
  - crea URL al recibir blob.
  - revoca URL al cambiar blob o desmontar.
- Crear hook `useObjectUrls(blobs)` o helper equivalente para listas.
- Sustituir usos manuales propensos a leaks:
  - `PhotoList`.
  - `PhotoDetail`.
  - `TimelapsePlayer`.
  - `RecordAudio`.
  - `RecordVideo`.
  - `EntryDetail`.
- Foto diaria:
  - usar `useEffect` para iniciar camara, no `useState`.
  - parar tracks al desmontar.
  - caption en espanol.
  - guardar profileId activo.
- Timelapse:
  - cargar frames del perfil activo.
  - revocar object URLs.
  - manejar cambio de rango sin indice fuera de rango.
- Audio:
  - usar mime type soportado si `audio/webm` no lo esta.
  - revocar preview URL.
  - guardar duration real.
- Video:
  - usar mime type soportado.
  - parar tracks de forma segura.
  - revocar preview URL.
  - mantener controles de velocidad/reversa.

### Criterios de aceptacion

- No se crean object URLs dentro de render sin revocacion.
- Camara/micro se detienen al salir.
- Timelapse usa fotos del perfil activo.
- Build pasa sin errores.

### Tests

- Hook de object URL crea/revoca.
- Timelapse filtra por perfil.
- Seleccion de mime type con fallback.

## Fase 6 - Backups completos

### Requisitos

- Export zip con:
  - `backup.json` con version, exportedAt y colecciones no blob.
  - `media/daily-photos/{id}.jpg`.
  - `media/daily-thumbnails/{id}.jpg` si existe.
  - `media/entries/{id}` con extension segun mime si existe.
  - profiles.
  - entries sin duplicar blobs pesados en JSON.
  - settings.
  - entitlements.
  - achievements.
  - wallet_transactions.
- Import:
  - validar version.
  - restaurar colecciones.
  - restaurar blobs y asociarlos a su item original.
  - preservar profileId, date, caption, overlays, rewards y compras.
  - no forzar `profileId: default`.
- Preparar versionado para futuras migraciones.

### Criterios de aceptacion

- Export/import en una DB vacia restaura perfiles, fotos, entradas, packs comprados, estrellas y logros.
- Un backup antiguo parcial se importa con fallback razonable o error claro.

### Tests

- Export genera estructura esperada.
- Import restaura daily photos con profileId original.
- Import restaura entry mediaBlob.
- Import restaura wallet y entitlements.

## Fase 7 - Tests y checks finales

### Requisitos

- Tests unitarios para:
  - PIN hashing/migracion.
  - wallet.
  - entitlements por perfil.
  - pack loader.
  - backups.
  - object URL hooks.
  - repositorios o helpers de IndexedDB si son testeables.
- Mantener o corregir tests existentes.
- Ejecutar:
  - `npm run test`.
  - `npm run build`.
  - `npm run lint` si no esta bloqueado por deuda existente; si falla, separar fallos nuevos de existentes.

### Criterios de aceptacion

- Build verde.
- Tests criticos verdes.
- Lista final de archivos cambiados por fase.
- Lista de riesgos conocidos para la beta.

## Orden recomendado de implementacion

1. Fase 1: seguridad, rutas y PWA.
2. Fase 2: IndexedDB y perfil activo.
3. Fase 3: wallet, recompensas y tienda.
4. Fase 5: object URLs y media.
5. Fase 4: stickers end-to-end.
6. Fase 6: backups completos.
7. Fase 7: tests/checks finales.

El orden pone primero contratos de datos y seguridad, porque tienda, stickers, media y backups dependen de ellos.

## Decisiones pendientes

- Coste de cada pack premium en estrellas.
- Recompensa en estrellas por cada logro.
- Si las estrellas iniciales de un perfil son 0 o una cantidad de bienvenida.
- Si los entitlements son estrictamente por perfil o si admin puede desbloquear packs para todos.
- Si el backup importado debe fusionar con datos existentes o reemplazarlos.
- Si se quiere cifrado local de backup con contrasena en una fase posterior.

## Informe por fase

Al terminar cada fase se debe reportar:

- Archivos cambiados.
- Resumen de comportamiento.
- Tests o checks ejecutados.
- Riesgos o deuda que queda.
