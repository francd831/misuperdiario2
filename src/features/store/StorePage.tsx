import { useEffect, useMemo, useState } from "react";
import { Check, Lock, ShoppingBag, Star } from "lucide-react";
import { packService } from "../../core/packs/packService";
import type { PackWithAssets } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function StorePage() {
  const { activeProfile, refresh } = useProfiles();
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set(["base"]));
  const [message, setMessage] = useState("");

  const activePackId = activeProfile?.activePackId ?? "base";

  async function refreshEntitlements() {
    if (!activeProfile) return;
    setUnlockedIds(await packService.listUnlockedPackIds(activeProfile.id));
  }

  useEffect(() => {
    void refreshEntitlements();
  }, [activeProfile?.id]);

  const sortedPacks = useMemo(
    () => [...packs].sort((a, b) => Number(unlockedIds.has(b.manifest.id)) - Number(unlockedIds.has(a.manifest.id))),
    [packs, unlockedIds],
  );

  async function unlockPack(packId: string) {
    if (!activeProfile) return;
    setMessage("");
    await packService.unlockForBeta(activeProfile.id, packId);
    await refreshEntitlements();
    setMessage("Pack desbloqueado para la beta. En Fase 6 se descontaran estrellas.");
  }

  async function activatePack(packId: string) {
    if (!activeProfile) return;
    setMessage("");
    try {
      await packService.setActivePack(activeProfile.id, packId);
      await refresh();
      setMessage("Pack activado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo activar el pack.");
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Tienda"
        title="Packs por estrellas"
        description="Explora packs cosmeticos. El cobro con estrellas se conectara al monedero en Fase 6."
      />

      {message && <p className="form-success">{message}</p>}

      <div className="pack-grid">
        {sortedPacks.map(({ manifest, previewUrl, stickers, frames }) => {
          const unlocked = unlockedIds.has(manifest.id);
          const active = activePackId === manifest.id;
          return (
            <article key={manifest.id} className={`pack-card ${active ? "pack-card--active" : ""}`}>
              {previewUrl ? <img src={previewUrl} alt="" /> : <div className="pack-card__preview"><ShoppingBag size={28} /></div>}
              <div className="pack-card__body">
                <div className="pack-card__title">
                  <h2>{manifest.name}</h2>
                  {active ? <span><Check size={14} /> Activo</span> : unlocked ? <span>Desbloqueado</span> : <span><Lock size={14} /> Bloqueado</span>}
                </div>
                <p>{manifest.description}</p>
                <p className="pack-card__meta">
                  {stickers.length} stickers · {frames.length} marcos · <Star size={14} /> {manifest.priceStars ?? 0}
                </p>
                <div className="pack-card__actions">
                  {!unlocked ? (
                    <button className="primary-action" type="button" onClick={() => void unlockPack(manifest.id)}>
                      Desbloquear beta
                    </button>
                  ) : (
                    <button className="secondary-action" type="button" disabled={active} onClick={() => void activatePack(manifest.id)}>
                      {active ? "Activo" : "Activar"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
