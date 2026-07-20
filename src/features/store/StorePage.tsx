import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, Lock, ShoppingBag, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import worldBoutique from "../../assets/store/world-boutique-base.webp";
import { packService, PREVIEW_ALL_PACKS } from "../../core/packs/packService";
import type { PackWithAssets } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";
import type { WalletSummary } from "../../core/wallet/types";

export default function StorePage() {
  const { activeProfile, refresh } = useProfiles();
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => PREVIEW_ALL_PACKS ? new Set(packs.map((pack) => pack.manifest.id)) : new Set(["base"]));
  const [wallet, setWallet] = useState<WalletSummary>({ balance: 0, transactions: [] });
  const [openPackId, setOpenPackId] = useState<string | null>(null);
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
    <section className="page-stack store-page">
      <section className="store-world" style={{ backgroundImage: `url(${worldBoutique})` }}>
        <Link className="world-scene__back store-world__back" to="/home" aria-label="Volver al inicio"><ArrowLeft size={22} /></Link>
        <div className="store-world__balance" aria-label={`Tienes ${wallet.balance} estrellas`}>
          <Star size={20} fill="currentColor" /> <strong>{wallet.balance}</strong>
        </div>

      {(PREVIEW_ALL_PACKS || import.meta.env.DEV) && (
        <p className="store-world__beta">Modo de pruebas · todo abierto</p>
      )}

      {message && <p className={`store-world__message ${messageTone === "success" ? "is-success" : "is-error"}`}>{message}</p>}

      <div className="pack-grid store-world__packs">
        {sortedPacks.map(({ manifest, previewUrl, stickers, frames, filters, speechBubbles, stamps, masks, effects }) => {
          const unlocked = unlockedIds.has(manifest.id);
          const active = activePackId === manifest.id;
          const open = openPackId === manifest.id;
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
                  <Sparkles size={14} /> {stickers.length} stickers / {frames.length} marcos / {filters.length + speechBubbles.length + stamps.length + masks.length + effects.length} extras
                </p>
                <div className="pack-card__actions">
                  <button className="secondary-action" type="button" onClick={() => setOpenPackId(open ? null : manifest.id)}>
                    <Eye size={16} /> Ver
                  </button>
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
                {open && (
                  <section className="status-panel" aria-label={`Contenido del pack ${manifest.name}`}>
                    <h3>Incluye</h3>
                    <PackAssetGroup title="Stickers" assets={stickers} />
                    <PackAssetGroup title="Marcos" assets={frames} />
                    <PackAssetGroup title="Filtros" assets={filters} />
                    <PackAssetGroup title="Bocadillos" assets={speechBubbles} />
                    <PackAssetGroup title="Sellos" assets={stamps} />
                    <PackAssetGroup title="Máscaras" assets={masks} />
                    <PackAssetGroup title="Efectos animados" assets={effects} />
                    <button className="secondary-action" type="button" onClick={() => setOpenPackId(null)}>
                      Cerrar
                    </button>
                  </section>
                )}
              </div>
            </article>
          );
        })}
      </div>
      </section>

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

function PackAssetGroup({ title, assets }: { title: string; assets: PackWithAssets["stickers"] }) {
  return (
    <div>
      <p className="pack-card__meta">
        <Sparkles size={14} /> {title}: {assets.length}
      </p>
      <div className="sticker-tray" aria-label={title}>
        {assets.map((asset) => (
          <button key={`${asset.packId}:${asset.id}`} type="button" aria-label={asset.name}>
            <img src={asset.url} alt={asset.name} />
          </button>
        ))}
      </div>
    </div>
  );
}
