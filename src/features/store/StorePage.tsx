import { useEffect, useMemo, useState } from "react";
import { Check, Lock, ShoppingBag, Sparkles, Star } from "lucide-react";
import { packService } from "../../core/packs/packService";
import type { PackWithAssets } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";
import type { WalletSummary } from "../../core/wallet/types";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function StorePage() {
  const { activeProfile, refresh } = useProfiles();
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set(["base"]));
  const [wallet, setWallet] = useState<WalletSummary>({ balance: 0, transactions: [] });
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const activePackId = activeProfile?.activePackId ?? "base";

  async function refreshEntitlements() {
    if (!activeProfile) return;
    setUnlockedIds(await packService.listUnlockedPackIds(activeProfile.id));
    setWallet(await walletService.getSummary(activeProfile.id));
  }

  useEffect(() => {
    void refreshEntitlements();
  }, [activeProfile?.id]);

  const sortedPacks = useMemo(
    () => [...packs].sort((a, b) => Number(unlockedIds.has(b.manifest.id)) - Number(unlockedIds.has(a.manifest.id))),
    [packs, unlockedIds],
  );

  async function buyPack(packId: string) {
    if (!activeProfile) return;
    setMessage("");
    try {
      await packService.purchasePack(activeProfile.id, packId);
      await refreshEntitlements();
      setMessageTone("success");
      setMessage("Pack comprado con estrellas.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "No se pudo comprar el pack.");
    }
  }

  async function activatePack(packId: string) {
    if (!activeProfile) return;
    setMessage("");
    try {
      await packService.setActivePack(activeProfile.id, packId);
      await refresh();
      setMessageTone("success");
      setMessage("Pack activado.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "No se pudo activar el pack.");
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Tienda"
        title="Cofre de packs"
        description="Desbloquea nuevos mundos visuales con las estrellas que ganas en tu diario."
        backTo="/home"
      />

      <section className="game-hud" aria-label="Saldo de estrellas">
        <div>
          <span className="game-hud__label">Tus estrellas</span>
          <strong>
            <Star size={24} fill="currentColor" /> {wallet.balance}
          </strong>
        </div>
        <p>Guarda recuerdos y desbloquea logros para conseguir mas.</p>
      </section>

      {message && <p className={messageTone === "success" ? "form-success" : "form-error"}>{message}</p>}

      <div className="pack-grid">
        {sortedPacks.map(({ manifest, previewUrl, stickers, frames }) => {
          const unlocked = unlockedIds.has(manifest.id);
          const active = activePackId === manifest.id;
          return (
            <article key={manifest.id} className={`pack-card ${active ? "pack-card--active" : ""}`}>
              <div className="pack-card__media">
                {previewUrl ? (
                  <img src={previewUrl} alt="" />
                ) : (
                  <div className="pack-card__preview">
                    <ShoppingBag size={28} />
                  </div>
                )}
                <span className={`pack-card__status ${active ? "pack-card__status--active" : unlocked ? "pack-card__status--unlocked" : ""}`}>
                  {active ? <><Check size={14} /> En uso</> : unlocked ? "Listo" : <><Lock size={14} /> Cerrado</>}
                </span>
              </div>
              <div className="pack-card__body">
                <div className="pack-card__title">
                  <h2>{manifest.name}</h2>
                  <span className="pack-card__price">
                    <Star size={15} fill="currentColor" /> {manifest.priceStars ?? 0}
                  </span>
                </div>
                <p>{manifest.description}</p>
                <p className="pack-card__meta">
                  <Sparkles size={14} /> {stickers.length} stickers / {frames.length} marcos
                </p>
                <div className="pack-card__actions">
                  {!unlocked ? (
                    <button className="primary-action" type="button" onClick={() => void buyPack(manifest.id)}>
                      Comprar
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

      <section className="status-panel">
        <h2>Ultimos movimientos</h2>
        {wallet.transactions.length === 0 ? (
          <p>Aun no hay movimientos.</p>
        ) : (
          <div className="transaction-list">
            {wallet.transactions.slice(0, 5).map((transaction) => (
              <p key={transaction.id}>
                <strong>{transaction.amount > 0 ? "+" : ""}{transaction.amount}</strong> {transaction.reason}
              </p>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
