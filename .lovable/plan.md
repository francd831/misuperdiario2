## Sistema de Eventos Especiales y Logros

### Concepto

Un sistema de **rachas (streaks)** y **hitos (milestones)** que recompensa al usuario por su constancia, mostrando celebraciones animadas cuando alcanza objetivos.

### Eventos propuestos

**Rachas de días consecutivos:**


| Racha    | Nombre                 | Emoji | Celebración                      |
| -------- | ---------------------- | ----- | -------------------------------- |
| 3 días   | "¡Buen comienzo!"      | 🌱    | Confeti suave                    |
| 5 días   | "Semana casi completa" | ⭐     | Lluvia de estrellas              |
| 7 días   | "¡Semana perfecta!"    | 🔥    | Explosión de fuegos artificiales |
| 14 días  | "Súper constante"      | 💎    | Diamantes cayendo                |
| 30 días  | "¡Un mes entero!"      | 🏆    | Trofeo dorado + confeti masivo   |
| 60 días  | "Imparable"            | 🚀    | Cohete despegando                |
| 100 días | "Leyenda del diario"   | 👑    | Corona + efecto épico            |
| 365 días | "¡Un año completo!"    | 🎂    | Tarta + fuegos artificiales      |


**Hitos por cantidad total:**


| Hito                      | Nombre               | Emoji |
| ------------------------- | -------------------- | ----- |
| 1ª entrada                | "¡Tu primera vez!"   | 🎉    |
| 10 entradas               | "Coleccionista"      | 📚    |
| 25 fotos diarias          | "Fotógrafo dedicado" | 📸    |
| 50 entradas               | "Medio centenar"     | 🌟    |
| 100 entradas              | "Centenario"         | 💯    |
| 1er vídeo + audio + texto | "Todoterreno"        | 🎨    |
| 10 cápsulas del tiempo    | "Viajero del tiempo" | ⏳     |


**Eventos especiales:**


| Evento                   | Nombre           | Emoji  |
| ------------------------ | ---------------- | ------ |
| Entrada en tu cumpleaños | "¡Feliz cumple!" | 🎂     |
| &nbsp;                   | &nbsp;           | &nbsp; |
| &nbsp;                   | &nbsp;           | &nbsp; |
| &nbsp;                   | &nbsp;           | &nbsp; |


### Cómo mostrarlo en pantalla

1. **Modal de celebración**: Un dialog a pantalla completa semitransparente con:
  - Emoji grande animado (bounce/pulse)
  - Título del logro en negrita
  - Subtítulo motivador ("¡Llevas 7 días seguidos!")
  - Efecto de partículas temático de fondo (confeti, estrellas, etc.)
  - Botón "¡Genial!" para cerrar
  - Se muestra UNA sola vez por logro
2. **Badge en DiaryHome**: Una sección "Mis logros" colapsable debajo del calendario con badges circulares de los logros desbloqueados (gris los pendientes).
3. **Indicador de racha actual**: Un pequeño chip en el header de DiaryHome mostrando "🔥 7 días" con la racha actual.

### Implementación técnica

1. **Nuevo store en IndexedDB**: Tabla `achievements` con `{ id, profileId, achievementId, unlockedAt }` para persistir logros desbloqueados.
2. **Servicio de logros** (`src/features/achievements/achievementService.ts`):
  - `calculateStreak(entries)`: calcula días consecutivos con actividad
  - `checkMilestones(entries, photos)`: evalúa hitos por cantidad
  - `getNewlyUnlocked(profileId)`: compara logros actuales vs guardados
3. **Componentes UI**:
  - `AchievementCelebration.tsx`: Modal animado de celebración
  - `AchievementBadges.tsx`: Grid de badges para DiaryHome
  - `StreakIndicator.tsx`: Chip de racha para el header
4. **Hook `useAchievements**`: Se ejecuta al cargar DiaryHome, calcula estado actual, detecta nuevos logros y dispara la celebración.
5. **Animaciones CSS**: Keyframes para bounce del emoji, fade-in del modal, y partículas de fondo reutilizando el motor de efectos existente (`EffectRenderer`).

### Archivos a crear/modificar

- Crear `src/features/achievements/` (servicio, tipos, hook, componentes)
- Modificar `src/core/storage/indexeddb.ts` (añadir store `achievements`)
- Modificar `src/features/diary/DiaryHome.tsx` (integrar streak indicator y badges)