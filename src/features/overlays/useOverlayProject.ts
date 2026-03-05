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
  const initializedRef = useRef(false);
  const initialJsonRef = useRef<string>("");

  // Sync when initial changes (e.g. route change) – compare by JSON to avoid loops
  useEffect(() => {
    const json = JSON.stringify(initial);
    if (json !== initialJsonRef.current) {
      initialJsonRef.current = json;
      if (initializedRef.current) {
        setOverlays(initial);
        setSelectedId(null);
      }
      initializedRef.current = true;
    }
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
      setOverlays((prev) => {
        const next = [...prev, item];
        scheduleSave(next);
        return next;
      });
      setSelectedId(item.id);
    },
    [scheduleSave],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setOverlays((prev) => {
      const next = removeById(prev, selectedId);
      scheduleSave(next);
      return next;
    });
    setSelectedId(null);
  }, [selectedId, scheduleSave]);

  return {
    overlays,
    selectedId,
    setSelectedId,
    setOverlays: update,
    addOverlay,
    deleteSelected,
  };
}
