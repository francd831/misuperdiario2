

## Eliminar todo el sistema de sonidos

### Archivos a eliminar
- `src/core/media/ambient/ambientEngine.ts` — motor de sonido ambiente completo
- `src/hooks/useAmbientSound.ts` — hook que gestiona el sonido ambiente

### Archivos a modificar

**1. `src/features/settings/SettingsPage.tsx`**
- Eliminar import de `ambientEngine`, `Volume2`, `Slider`
- Eliminar constantes `AMBIENT_KEY`, `AMBIENT_VOL_KEY`
- Eliminar estados `ambientSound`, `ambientVolume`
- Eliminar toda la Card de "Audio" (líneas 136-180)

**2. `src/app/layout/AppLayout.tsx`**
- Eliminar import y llamada a `useAmbientSound()`

**3. `src/core/packs/PackContext.tsx`**
- Eliminar `sounds` del estado, interfaz y provider value
- Eliminar llamadas a `packLoader.getPackSounds()` en `loadAssets`

**4. `src/core/packs/packLoader.ts`**
- Eliminar método `getPackSounds()`
- Eliminar toda la sección de sounds en `getActivePackAssets()`

**5. `src/core/packs/assetResolver.ts`**
- Eliminar método `resolveSound()`

**6. `src/core/packs/types.ts`**
- Eliminar propiedad `sounds` de `PackManifest`

**7. Todos los manifest.json (12 packs)**
- Eliminar la línea `"sounds": {}` de cada uno

