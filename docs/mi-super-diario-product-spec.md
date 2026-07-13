# Mi Super Diario - Especificacion completa de producto

## 1. Resumen ejecutivo

Mi Super Diario es una aplicacion privada, familiar y offline-first para que ninos y ninas creen un diario personal con texto, voz, video, fotos diarias, stickers, fondos, marcos, capsulas del tiempo y recompensas. La app debe sentirse segura, alegre y sencilla para un menor, pero con herramientas de administracion claras para un adulto.

La primera version objetivo es una beta privada instalable como PWA, sin backend obligatorio, con datos locales en el dispositivo, perfiles separados, PIN de acceso, monedero de estrellas, tienda de packs cosmeticos y backups exportables.

## 2. Objetivo del producto

Crear una experiencia de diario infantil que convierta el habito de registrar el dia en algo emocionalmente positivo, creativo y seguro.

La app debe permitir:

- Guardar recuerdos en texto, audio, video y foto.
- Decorar recuerdos con stickers, marcos, fondos y efectos.
- Crear una foto diaria y reproducirla como timelapse.
- Proteger perfiles con PIN.
- Separar claramente perfiles infantiles y administracion adulta.
- Motivar el uso con logros, rachas y estrellas.
- Comprar packs cosmeticos con estrellas.
- Exportar e importar backups completos.
- Funcionar como PWA offline.

## 3. Publico objetivo

### Usuario principal: nino o nina

Edad orientativa: 6 a 12 anos.

Necesita:

- Interfaz visual, tactil y facil.
- Textos cortos y claros.
- Acciones grandes y reconocibles.
- Recompensas inmediatas.
- Sensacion de privacidad y pertenencia.
- Poder crear sin depender siempre de escribir.

### Usuario secundario: adulto administrador

Puede ser madre, padre, tutor o profesor.

Necesita:

- Crear y gestionar perfiles.
- Configurar PIN.
- Revisar almacenamiento.
- Exportar/importar backups.
- Ajustar limites de grabacion.
- Gestionar contenido y packs.
- Entrar a administracion sin que un menor pueda hacerlo accidentalmente.

## 4. Principios de experiencia

- Primero crear, despues gestionar.
- Las pantallas infantiles deben evitar complejidad administrativa.
- Todo contenido pertenece a un perfil.
- El usuario siempre debe entender donde esta y como volver.
- La app debe funcionar sin conexion.
- Nada importante debe depender de servidores externos.
- Las recompensas deben acompanar el habito, no manipularlo.
- El diseno debe ser expresivo, pero no saturado.
- La privacidad local es parte central del producto.

## 5. Plataformas y formato

### Version beta

- Aplicacion web PWA.
- Optimizada para movil en vertical.
- Compatible con escritorio/tablet de forma razonable.
- Instalacion desde navegador.
- Funcionamiento offline despues de la primera carga.

### Navegadores objetivo

- Chrome/Edge Android.
- Safari iOS.
- Chrome/Edge desktop.

Limitaciones esperadas:

- Algunas APIs de grabacion pueden variar por navegador.
- Web Speech API para dictado puede no estar disponible en todos los entornos.
- PWA en iOS puede tener restricciones de almacenamiento y media.

## 6. Roles y permisos

### Perfil infantil

Puede:

- Crear entradas.
- Ver sus propias entradas.
- Crear foto diaria.
- Ver su timelapse.
- Usar stickers y packs desbloqueados para su perfil.
- Ganar estrellas.
- Comprar packs con sus estrellas.
- Cambiar ajustes personales permitidos.

No puede:

- Entrar a administracion.
- Ver perfiles de otros ninos.
- Borrar otros perfiles.
- Exportar/importar backups globales.
- Cambiar PIN admin.

### Perfil admin

Puede:

- Crear perfiles infantiles.
- Editar nombres y avatares.
- Restablecer PIN de perfiles.
- Configurar limites de grabacion.
- Revisar almacenamiento.
- Exportar backup completo.
- Importar backup.
- Gestionar packs disponibles.
- Ver estado general de perfiles.

No debe:

- Mezclar accidentalmente su sesion con una infantil.

## 7. Conceptos principales

### Perfil

Identidad local de una persona usuaria. Cada perfil tiene:

- Nombre.
- Avatar.
- Rol: admin o infantil.
- PIN hasheado.
- Pack activo.
- Monedero de estrellas.
- Entradas propias.
- Fotos diarias propias.
- Logros propios.
- Packs desbloqueados propios.

### Entrada de diario

Recuerdo creado por un perfil. Puede ser:

- Texto.
- Audio.
- Video.

Puede incluir:

- Titulo opcional.
- Nota.
- Fecha.
- Media principal.
- Stickers/overlays.
- Capsula del tiempo.
- Duracion.
- Pack visual usado.

### Foto diaria

Una foto por dia y perfil. Puede incluir:

- Imagen.
- Miniatura.
- Caption.
- Stickers/overlays.
- Fecha.

### Capsula del tiempo

Entrada bloqueada hasta una fecha futura. El menor puede crearla como sorpresa personal. Hasta la fecha de desbloqueo se muestra una pantalla de espera.

### Pack

Conjunto cosmetico que puede incluir:

- Tema visual.
- Stickers.
- Marcos.
- Fondos.
- Efectos.
- Imagen preview.
- Precio en estrellas.

### Estrellas

Moneda interna no monetaria. Se obtiene por logros, rachas o acciones positivas. Se usa para comprar packs.

### Logro

Reconocimiento por hitos: primera entrada, racha, variedad de formatos, fotos acumuladas, capsulas creadas, etc.

## 8. Arquitectura funcional deseada

La app debe organizarse en dominios conceptuales:

- Autenticacion local y perfiles.
- Diario.
- Foto diaria y timelapse.
- Stickers/overlays.
- Packs y tienda.
- Recompensas y monedero.
- Administracion.
- Backups.
- Configuracion.
- PWA/offline.

La implementacion concreta puede cambiar, pero estos dominios deben mantenerse separados para evitar acoplamiento.

## 9. Pantallas publicas/infantiles

### 9.1 Arranque

Estados posibles:

- Cargando app.
- No hay perfiles.
- Falta admin.
- Seleccion de perfil.
- Perfil activo.

Comportamiento:

- Si no existe admin, iniciar flujo de creacion admin.
- Si existe admin pero no hay perfil activo, mostrar selector de perfiles.
- Si hay perfil activo, abrir inicio infantil o dashboard admin segun rol.

### 9.2 Crear admin

Objetivo:

- Crear el primer perfil administrador.

Campos:

- Nombre del adulto.
- PIN de 4 digitos.
- Confirmacion de PIN.

Reglas:

- El PIN debe guardarse hasheado.
- Solo puede existir un admin principal en beta.
- Tras crear admin, se dirige a administracion o creacion de primer perfil infantil.

### 9.3 Selector de perfil

Objetivo:

- Elegir quien usa la app.

Elementos:

- Lista de perfiles infantiles con avatar y nombre.
- Acceso discreto a admin.

Flujo infantil:

- Tocar perfil.
- Introducir PIN si tiene PIN.
- Entrar al inicio infantil.

Flujo admin:

- Tocar acceso admin.
- Introducir PIN admin.
- Entrar a dashboard admin.

Estados:

- PIN incorrecto.
- Bloqueo temporal tras varios intentos.
- Perfil sin PIN si el adulto lo permite.

### 9.4 Inicio infantil

Objetivo:

- Ser el centro de creacion diaria.

Contenido:

- Saludo personalizado.
- Nombre/avatar del perfil.
- Racha actual.
- Saldo de estrellas.
- Acciones principales:
  - Grabar video.
  - Grabar audio.
  - Escribir.
  - Foto diaria.
- Calendario/resumen visual.
- Ultimas entradas.
- Logros recientes.

Acciones:

- Crear nueva entrada.
- Abrir entrada existente.
- Ver todas las entradas.
- Ir a tienda.
- Ir a foto diaria.
- Cerrar sesion.

### 9.5 Crear entrada - selector

Objetivo:

- Elegir tipo de entrada.

Opciones:

- Video.
- Audio.
- Texto.

Tambien puede incluir acceso a capsula del tiempo como configuracion dentro de cada tipo.

### 9.6 Crear entrada de texto

Campos:

- Titulo opcional.
- Texto principal.
- Dictado por voz si disponible.
- Activar capsula del tiempo.
- Fecha de desbloqueo si es capsula.

Acciones:

- Guardar.
- Cancelar.

Reglas:

- No guardar entrada vacia.
- Si es capsula, requiere fecha futura valida.

### 9.7 Crear entrada de audio

Funciones:

- Pedir permiso de microfono.
- Grabar.
- Mostrar contador.
- Detener.
- Reproducir preview.
- Repetir.
- Titulo opcional.
- Capsula del tiempo.
- Guardar.

Reglas:

- Limite maximo configurable por admin.
- Guardar duracion real.
- Parar microfono al salir.

### 9.8 Crear entrada de video

Funciones:

- Pedir permiso de camara y microfono.
- Mostrar preview a pantalla completa.
- Grabar.
- Mostrar contador.
- Detener.
- Reproducir preview.
- Repetir.
- Anadir stickers/overlays.
- Titulo opcional.
- Capsula del tiempo.
- Guardar.

Reglas:

- Limite maximo configurable.
- Seleccionar codec soportado.
- Parar camara/micro al salir.

### 9.9 Detalle de entrada

Objetivo:

- Ver, reproducir, decorar o borrar una entrada.

Segun tipo:

- Texto: lectura clara.
- Audio: reproductor.
- Video: reproductor con controles.

Funciones:

- Ver titulo, fecha y duracion.
- Reproducir/pausar.
- Cambiar velocidad en video.
- Reversa en video si se mantiene como feature.
- Editar stickers/overlays en media.
- Borrar con confirmacion.

Capsula:

- Si esta bloqueada, mostrar pantalla de capsula.
- Mostrar fecha de desbloqueo.
- No mostrar contenido hasta la fecha.

### 9.10 Lista de entradas

Objetivo:

- Explorar recuerdos.

Funciones:

- Buscar por texto/titulo.
- Filtrar por tipo: todo, video, audio, texto, capsulas.
- Agrupar por fecha.
- Mostrar estado bloqueado/desbloqueado.

### 9.11 Foto diaria

Objetivo:

- Crear y revisar una foto por dia.

Pantalla lista:

- Estado de foto de hoy.
- Boton hacer foto o reemplazar.
- Grid de fotos anteriores.
- Acceso a timelapse.

Captura:

- Camara a pantalla completa.
- Capturar.
- Preview.
- Caption opcional.
- Stickers/overlays.
- Repetir.
- Guardar.

Reglas:

- Una foto por dia por perfil.
- Reemplazar debe pedir confirmacion o indicar claramente que sustituye.
- Parar camara al salir.

### 9.12 Detalle de foto diaria

Funciones:

- Ver foto.
- Editar caption.
- Editar stickers/overlays.
- Navegar anterior/siguiente.
- Borrar con confirmacion.

### 9.13 Timelapse

Objetivo:

- Reproducir secuencia de fotos diarias del perfil.

Funciones:

- Play/pause.
- Slider de posicion.
- Rango: todo, 30 dias, 90 dias, 1 ano.
- Velocidad: lenta, normal, rapida.
- Fecha visible del frame actual.

Reglas:

- Solo usa fotos del perfil activo.
- No filtra fotos de otros perfiles.
- Gestiona memoria revocando URLs.

### 9.14 Tienda

Objetivo:

- Comprar y activar packs con estrellas.

Contenido por pack:

- Preview.
- Nombre.
- Descripcion.
- Precio.
- Estado: gratis, comprado, activo, bloqueado.
- Boton comprar o activar.

Reglas:

- Pack base siempre gratis.
- Pack premium requiere estrellas suficientes.
- Compra descuenta estrellas.
- Compra crea entitlement para el perfil activo.
- Activar cambia pack activo del perfil.
- No existe compra simulada en beta.

### 9.15 Ajustes infantiles

Opcional para beta.

Funciones posibles:

- Ver perfil.
- Cambiar pack activo entre comprados.
- Cerrar sesion.
- Cambiar PIN propio si el adulto lo permite.

No debe incluir herramientas globales.

## 10. Pantallas admin

### 10.1 Admin lock

Objetivo:

- Proteger acceso admin.

Funciones:

- Input PIN.
- Bloqueo temporal tras varios fallos.
- Volver al selector/inicio.

### 10.2 Dashboard admin

Objetivo:

- Vista general del estado de la app.

Contenido:

- Numero de perfiles.
- Uso aproximado de almacenamiento.
- Ultimo backup.
- Accesos a:
  - Perfiles.
  - Contenido.
  - Packs/tienda.
  - Ajustes.
  - Backups.
  - Almacenamiento.

### 10.3 Gestion de perfiles

Funciones:

- Crear perfil infantil.
- Editar nombre.
- Cambiar avatar.
- Restablecer PIN.
- Eliminar perfil con confirmacion fuerte.
- Ver resumen: entradas, fotos, estrellas, packs.

Reglas:

- Eliminar perfil debe advertir que borra contenido asociado.
- Admin no se puede borrar accidentalmente.

### 10.4 Gestion de contenido

Funciones:

- Ver entradas por perfil.
- Ver fotos por perfil.
- Filtrar por fecha/tipo.
- Borrar contenido puntual.

En beta puede ser basico.

### 10.5 Gestion de packs

Funciones:

- Ver packs instalados.
- Ver precio.
- Marcar pack como disponible/no disponible para tienda si aplica.
- Desbloquear pack manualmente para un perfil si se decide incluir.

### 10.6 Ajustes admin

Funciones:

- Cambiar PIN admin.
- Configurar duracion maxima de audio.
- Configurar duracion maxima de video.
- Configurar limites de uso y almacenamiento.
- Configurar idioma, inicialmente espanol.
- Configurar politica de bloqueo por intentos.

### 10.7 Almacenamiento

Funciones:

- Ver uso estimado.
- Ver desglose por fotos, videos, audios y datos.
- Limpiar caches temporales si aplica.
- Advertencias por almacenamiento alto.
- Configurar cuota maxima total de la app.
- Configurar cuota maxima por perfil.
- Configurar calidad de foto/video.
- Configurar numero maximo de videos por dia.
- Configurar numero maximo de audios por dia.
- Configurar numero maximo de fotos diarias reemplazables por dia.
- Configurar duracion maxima de video.
- Configurar duracion maxima de audio.
- Configurar politica al alcanzar limites.

## 10.9 Politicas de uso y almacenamiento

Objetivo:

- Evitar que la app ocupe demasiado espacio en el dispositivo al guardar todo en local.
- Dar al adulto control claro sobre la cantidad y calidad de media que puede crear cada perfil.
- Explicar al menor los limites de forma amable y comprensible.

### Configuracion global administrable

El admin debe poder configurar:

- Duracion maxima de video.
- Duracion maxima de audio.
- Videos maximos por perfil y dia.
- Audios maximos por perfil y dia.
- Fotos diarias maximas por perfil y dia.
- Si la foto diaria se puede reemplazar.
- Calidad de video: baja, media, alta.
- Calidad de foto: baja, media, alta.
- Cuota maxima total de almacenamiento para la app.
- Cuota maxima por perfil.
- Umbral de aviso de almacenamiento.
- Politica al alcanzar limite: bloquear creacion nueva o pedir borrar contenido.

### Valores recomendados para beta

Configuracion inicial recomendada:

- Video: maximo 60 segundos.
- Audio: maximo 3 minutos.
- Videos por dia por perfil: 3.
- Audios por dia por perfil: 5.
- Foto diaria: 1 activa por dia, reemplazable.
- Calidad de video: media.
- Calidad de foto: media.
- Aviso de almacenamiento: al 80% de la cuota configurada.
- Bloqueo de nueva media: al 100% de la cuota configurada.

La app puede permitir al admin relajar estos limites, pero debe mostrar una advertencia si se eligen valores altos.

### Comportamiento para perfiles infantiles

Cuando un menor intenta crear contenido y se alcanza un limite:

- Mostrar mensaje corto y amable.
- Explicar el motivo sin tecnicismos.
- Ofrecer volver al inicio.
- Si procede, sugerir pedir ayuda al adulto.

Ejemplos:

- "Ya grabaste los videos de hoy. Puedes escribir o hacer una foto."
- "No queda mucho espacio. Pide ayuda a un adulto para liberar memoria."
- "Este video llego al tiempo maximo."

### Comportamiento para admin

El admin debe poder:

- Ver que perfil ocupa mas espacio.
- Ver desglose por tipo: videos, audios, fotos, datos.
- Borrar contenido antiguo por perfil.
- Exportar backup antes de borrar.
- Cambiar limites.
- Ver recomendaciones de limpieza.

### Reglas de producto

- Los limites se aplican por perfil.
- El admin puede cambiar limites globales.
- En beta no hace falta un limite distinto por cada perfil, pero la arquitectura debe permitirlo en el futuro.
- El limite de duracion debe aplicarse durante la grabacion, no solo al guardar.
- El limite de cantidad diaria debe comprobarse antes de iniciar la grabacion.
- La cuota de almacenamiento debe comprobarse antes de guardar y tambien mostrarse en administracion.
- La app nunca debe borrar recuerdos automaticamente sin confirmacion adulta.

### 10.8 Backups

Funciones:

- Exportar backup completo.
- Importar backup.
- Ver fecha de ultimo backup exportado.

Opciones de import:

- Fusionar con datos existentes.
- Reemplazar todo.

Para beta se recomienda empezar con fusion segura y advertencia clara. Reemplazar todo puede quedar para una version posterior o requerir confirmacion fuerte.

## 11. Sistema de recompensas

### Objetivo

Motivar el habito de crear recuerdos sin convertir la app en un juego de presion.

### Estrellas

Las estrellas se guardan por perfil y se obtienen mediante transacciones.

Reglas:

- El saldo nunca puede ser negativo.
- Toda suma/resta crea una transaccion.
- Las recompensas por logro son idempotentes.
- El adulto no necesita pagar dinero real.

### Logros iniciales sugeridos

- Primera entrada: 10 estrellas.
- Primera foto diaria: 10 estrellas.
- Tres dias de racha: 15 estrellas.
- Siete dias de racha: 30 estrellas.
- Diez entradas: 25 estrellas.
- Veinticinco fotos: 40 estrellas.
- Crear una capsula: 15 estrellas.
- Usar texto, audio y video: 30 estrellas.
- Primer pack comprado: 10 estrellas.

### Saldo inicial

Decision recomendada:

- Cada perfil infantil empieza con 20 estrellas de bienvenida.

Motivo:

- Permite comprar o acercarse a un pack barato sin romper el valor de las recompensas.

## 12. Tienda y packs

### Tipos de pack

- Base: gratis, siempre disponible.
- Premium normal: cuesta estrellas.
- Premium especial: puede tener coste mayor o requerir logro previo en futuras versiones.

### Costes sugeridos

- Pack pequeno: 30 estrellas.
- Pack normal: 60 estrellas.
- Pack grande: 100 estrellas.

Para beta:

- Todos los packs premium pueden empezar en 60 estrellas salvo decision editorial.

### Contenido de un pack

- Manifest con id, nombre, descripcion, version, precio, preview.
- Tema visual.
- Stickers.
- Marcos.
- Fondos.
- Efectos opcionales.

## 13. Stickers y overlays

### Modelo conceptual

Un overlay representa un elemento decorativo colocado sobre una foto, video o vista de audio.

Debe guardar:

- id.
- tipo: sticker, frame, texto decorativo o efecto si aplica.
- packId.
- assetId o ruta estable.
- posicion x/y relativa.
- escala.
- rotacion.
- zIndex.

### Requisitos

- Persisten tras recargar.
- Se exportan en backup.
- Se restauran en import.
- Funcionan con packs comprados.
- Mantienen compatibilidad con datos antiguos si existen.

### Editor

Funciones:

- Anadir sticker.
- Seleccionar.
- Mover con dedo/raton.
- Escalar.
- Rotar.
- Borrar.
- Guardar.

## 14. PWA, offline y metadata

### Metadata

- Idioma: espanol.
- Nombre: Mi Super Diario.
- Short name: Super Diario.
- Descripcion: Diario creativo privado para guardar recuerdos con texto, voz, video, fotos y stickers.
- Theme color definido.
- Iconos 192 y 512.
- Icono maskable.

### Offline

Debe cachear:

- Shell de la aplicacion.
- Assets principales.
- Iconos.
- Packs incluidos en build cuando sea razonable.

No debe depender de red para:

- Abrir app despues de instalada.
- Ver entradas ya creadas.
- Crear entradas locales.
- Comprar packs con estrellas.
- Exportar backup.

## 15. Persistencia local

### Entidades conceptuales

Profile:

- id.
- role.
- name.
- avatar.
- pinHash.
- activePackId.
- createdAt.
- updatedAt.

Entry:

- id.
- profileId.
- type.
- date.
- title.
- note.
- mediaRef o mediaBlob.
- duration.
- overlayProject.
- isLocked.
- unlockAt.
- createdAt.
- updatedAt.

DailyPhoto:

- id.
- profileId.
- date.
- blob/mediaRef.
- thumbnailBlob/thumbnailRef.
- caption.
- overlayProject.
- createdAt.
- updatedAt.

Pack:

- id.
- name.
- description.
- version.
- priceStars.
- free.
- preview.
- theme.
- assets.

Entitlement:

- id.
- profileId.
- packId.
- unlockedAt.
- source: free, purchase, admin, import.

WalletTransaction:

- id.
- profileId.
- amount.
- reason.
- idempotencyKey.
- metadata.
- createdAt.

Achievement:

- id.
- profileId.
- achievementId.
- unlockedAt.
- rewardStars.

Settings:

- id.
- scope: global or profile.
- values.

StoragePolicy:

- id.
- maxVideoSeconds.
- maxAudioSeconds.
- maxVideosPerDay.
- maxAudiosPerDay.
- maxDailyPhotosPerDay.
- allowDailyPhotoReplacement.
- videoQuality.
- photoQuality.
- maxTotalStorageBytes.
- maxProfileStorageBytes.
- warningThresholdPercent.
- limitBehavior.
- updatedAt.

BackupMetadata:

- version.
- exportedAt.
- appVersion.

## 16. Seguridad y privacidad

### PIN

- Nunca guardar PIN en claro.
- Usar hash con salt local.
- Migrar PIN legacy si existiera.
- Bloqueo temporal tras intentos fallidos.

### Sesion

- Perfil activo en sessionStorage o mecanismo equivalente.
- Cerrar sesion al ocultar app si se decide para beta.
- Admin requiere revalidacion para acceder.

### Privacidad

- Datos en local.
- Sin analiticas externas en beta.
- Sin subida automatica de media.
- Backups generados por accion explicita del adulto.

### Limite de seguridad

La beta no promete proteccion criptografica fuerte del contenido local. Protege acceso casual con PIN y separacion de perfiles.

## 17. Backups

### Export

Formato recomendado:

- Archivo `.zip`.
- `backup.json` con datos estructurados sin blobs pesados.
- Carpeta `media/entries`.
- Carpeta `media/daily-photos`.
- Carpeta `media/thumbnails`.

Debe incluir:

- Perfiles.
- Entradas.
- Fotos diarias.
- Settings.
- Entitlements.
- Logros.
- Transacciones de estrellas.
- Metadatos de version.
- Blobs de audio/video/foto.

### Import

Debe:

- Validar version.
- Restaurar perfiles.
- Restaurar datos por profileId original.
- Restaurar media.
- Restaurar compras, logros y estrellas.
- Evitar duplicados cuando sea posible.
- Mostrar errores comprensibles.

Decision beta recomendada:

- Import fusiona datos.
- Si hay ids duplicados, reemplaza el registro con el importado solo tras confirmacion o usa estrategia documentada.

## 18. Accesibilidad y usabilidad

Requisitos:

- Botones tactiles grandes.
- Contraste suficiente.
- Textos principales en espanol claro.
- Iconos acompanados de texto en acciones criticas.
- Estados de error comprensibles.
- No depender solo de color.
- Inputs PIN compatibles con teclado movil.
- Controles multimedia accesibles.

## 19. Estados vacios y errores

La app debe tener estados claros para:

- No hay perfiles.
- No hay entradas.
- No hay fotos.
- No hay permisos de camara.
- No hay permisos de microfono.
- Navegador no soporta grabacion.
- No hay almacenamiento suficiente.
- PIN incorrecto.
- Saldo insuficiente.
- Backup invalido.
- Pack no disponible.

## 20. Beta privada - alcance minimo

Para considerar lista la beta privada:

- Admin y al menos un perfil infantil funcionan.
- PIN hasheado.
- Crear/ver/borrar texto, audio y video.
- Crear/ver/borrar foto diaria.
- Timelapse por perfil.
- Stickers persistentes en foto/video.
- Packs incluidos y tienda por estrellas.
- Logros basicos y estrellas.
- Limites de grabacion y almacenamiento configurables por admin.
- Avisos claros cuando se alcance un limite.
- Backup export/import completo.
- PWA instalable con metadata en espanol.
- Rutas lazy.
- Tests unitarios de servicios criticos.
- Build verde.

## 21. Criterios de calidad

### Funcionales

- Cada contenido pertenece al perfil correcto.
- No hay acceso admin sin PIN admin.
- Las compras descuentan estrellas.
- Los backups restauran contenido y recompensas.
- La app sigue usable offline.
- Los limites de video/audio/cantidad diaria se cumplen por perfil.
- La app avisa antes de que el almacenamiento local sea un problema grave.

### Tecnicos

- Dominios separados.
- Servicios testeables.
- Datos versionados.
- Object URLs revocadas.
- Media tracks detenidos.
- Sin PIN en claro.
- Estimacion de almacenamiento disponible desde admin.

### Producto

- Una persona adulta puede entender como configurar la app sin documentacion externa.
- Un menor puede crear una entrada en menos de 3 toques desde inicio.
- La tienda se entiende sin explicar mecanicas.
- Los errores no culpan al usuario.

## 22. Fuera de alcance inicial

- Backend y cuentas online.
- Sincronizacion entre dispositivos.
- Compartir publico.
- Pagos reales.
- IA generativa.
- Cifrado avanzado de backups.
- Control parental remoto.
- Analiticas.
- Marketplace descargable de packs.

## 23. Roadmap sugerido

### Hito 1 - Fundacion

- PWA.
- Perfiles.
- Admin.
- PIN.
- Persistencia base.
- Rutas lazy.

### Hito 2 - Diario completo

- Texto.
- Audio.
- Video.
- Detalle.
- Capsulas.
- Lista y filtros.

### Hito 3 - Foto diaria

- Captura.
- Detalle.
- Timelapse.
- Object URL hooks.

### Hito 4 - Creatividad

- Packs.
- Stickers.
- Marcos/fondos.
- Editor overlays.

### Hito 5 - Motivacion

- Logros.
- Estrellas.
- Monedero.
- Tienda.

### Hito 6 - Seguridad de datos

- Backups completos.
- Import.
- Almacenamiento.
- Tests.

### Hito 7 - Pulido beta

- Estados vacios.
- Textos.
- Accesibilidad.
- Rendimiento.
- QA manual.

## 24. Preguntas de producto pendientes

- Cuantos perfiles infantiles debe soportar la beta.
- Si el admin puede ver todo el contenido infantil o solo gestionarlo.
- Si un perfil infantil puede no tener PIN.
- Si el import de backup debe fusionar o reemplazar.
- Si las estrellas de bienvenida son 20 u otra cantidad.
- Precio definitivo de cada pack.
- Si las capsulas pueden borrarse antes de abrirse.
- Si una foto diaria puede reemplazarse sin confirmacion.
- Si el cierre automatico de sesion al ocultar app debe estar activo en beta.
- Si se quiere export de una entrada individual en futuras versiones.

## 25. Entregables de desarrollo

Cada hito debe entregar:

- Implementacion.
- Tests unitarios relevantes.
- Build verificado.
- Lista de pantallas afectadas.
- Riesgos conocidos.
- Notas de migracion de datos si aplica.

## 26. Definicion de listo para beta privada

La beta privada esta lista cuando:

- La app se puede instalar como PWA.
- Un adulto puede crear admin y perfiles.
- Un menor puede crear y consultar recuerdos.
- Los datos persisten localmente.
- La separacion por perfil funciona.
- La tienda y recompensas funcionan sin dinero real.
- El backup restaura una instalacion nueva.
- No hay PIN en claro.
- La app compila y los tests criticos pasan.
- Hay una lista corta de limitaciones conocidas comunicables a testers.
