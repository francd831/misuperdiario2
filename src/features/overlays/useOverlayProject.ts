import { useState, useCallback, useRef, useEffect } from "react";
import type { OverlayItem, OverlayProject } from "@/core/media/overlays/overlayEngine";
import { removeById } from "@/core/media/overlays/overlayEngine";

/**
 * Hook managing overlay state + debounced auto-save.
 */
export function useOverlayProject(
  initial: OverlayProject,
  onPersist?: (project: OverlayProject) => void | Promise<void>,
  debounceMs = 400,
) {
  const [overlays, setOverlays] = useState<OverlayProject>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when initial changes (e.g. route change)
  useEffect(() => {
    setOverlays(initial);
    setSelectedId(null);
  }, [initial]);

  // Debounced persist
  const scheduleSave = useCallback(
    (project: OverlayProject) => {
      if (!onPersist) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onPersist(project), debounceMs);
    },
    [onPersist, debounceMs],
  );

  const update = useCallback(
    (updated: OverlayProject) => {
      setOverlays(updated);
      scheduleSave(updated);
    },
    [scheduleSave],
  );

  const addOverlay = useCallback(
    (item: OverlayItem) => {
      const next = [...overlays, item];
      update(next);
      setSelectedId(item.id);
    },
    [overlays, update],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const next = removeById(overlays, selectedId);
    update(next);
    setSelectedId(null);
  }, [overlays, selectedId, update]);

  return {
    overlays,
    selectedId,
    setSelectedId,
    setOverlays: update,
    addOverlay,
    deleteSelected,
  };
}
