import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Download, Eye, Lock, ShoppingBag, Sparkles, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { packService, PREVIEW_ALL_PACKS } from "../../core/packs/packService";
import { getPackSceneBackgrounds } from "../../core/packs/sceneBackgrounds";
import type { PackWithAssets } from "../../core/packs/types";
import { useRemotePacks } from "../../core/packs/RemotePackContext";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";
import type { WalletSummary } from "../../core/wallet/types";

export default function StorePage() {
  const { activeProfile, refresh } = useProfiles();
  const { packs: installedPacks, catalog, error: catalogError, install, remove, getResources, isInstalled } = useRemotePacks();
  const catalogPacks = useMemo<PackWithAssets[]>(() => catalog
    .filter((entry) => !isInstalled(entry.id))
    .map((entry) => ({
      manifest: {
        id: entry.id, name: entry.name, description: entry.description, version: entry.version,
        priceStars: entry.priceStars ?? 60, free: entry.free,
        theme: { primary: "#f3b53f", secondary: "#41352a", accent: "#fff3cf", background: "#fff8e8", foreground: "#24190e" },
      },
      previewUrl: entry.previewUrl,
      stickers: [], frames: [], filters: [], speechBubbles: [], stamps: [], masks: [], effects: [],
    })), [catalog, isInstalled]);
  const packs = useMemo(() => [...installedPacks, ...catalogPacks], [catalogPacks, installedPacks]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => PREVIEW_ALL_PACKS ? new Set(packs.map((pack) => pack.manifest.id)) : new Set(["base"]));
  const [wallet, setWallet] = useState<WalletSummary>({ balance: 0, transactions: [] });
  const [openPackId, setOpenPackId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  const activePackId = activeProfile?.activePackId ?? "base";
  const storeBackground = getPackSceneBackgrounds(activePackId, getResources(activePackId).scenes).store;

  async function refreshEntitlements() {
    if (!activeProfile) return;
    setUnlockedIds(await packService.listUnlockedPackIds(activeProfile.id, packs.map((pack) => pack.manifest.id)));
    setWallet(await walletService.getSummary(activeProfile.id));
  }

  useEffect(() => {
    void refreshEntitlements();
  }, [activeProfile?.id, packs]);

  const sortedPacks = useMemo(
    () => [...packs].sort((a, b) => Number(unlockedIds.has(b.manifest.id)) - Number(unlockedIds.has(a.manifest.id))),
    [packs, unlockedIds],
  );

  function hasUpdate(packId: string, installedVersion: string) {
    const remoteVersion = catalog.find((entry) => entry.id === packId)?.version;
    if (!remoteVersion) return false;
    const parts = (version: string) => version.split(".").map((value) => Number.parseInt(value, 10) || 0);
    const current = parts(installedVersion);
    const remote = parts(remoteVersion);
    return [0, 1, 2].some((index) => {
      if ((remote[index] ?? 0) === (current[index] ?? 0)) return false;
      return (remote[index] ?? 0) > (current[index] ?? 0)
        && [0, 1, 2].slice(0, index).every((previous) => (remote[previous] ?? 0) === (current[previous] ?? 0));
    });
  }

  async function buyPack(packId: string) {
    if (!activeProfile) return;
    setMessage("");
    try {
      const pack = packs.find((item) => item.manifest.id === packId);
      await packService.purchasePack(activeProfile.id, packId, pack?.manifest);
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
      const pack = packs.find((item) => item.manifest.id === packId);
      await packService.setActivePack(activeProfile.id, packId, pack?.manifest);
      await refresh();
      setMessageTone("success");
      setMessage("Pack activado.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "No se pudo activar el pack.");
    }
  }

  async function downloadPack(packId: string) {
    const entry = catalog.find((item) => item.id === packId);
    if (!entry) return;
    setMessage("");
    setDownloadProgress((current) => ({ ...current, [packId]: 0 }));
    try {
      await install(entry, (progress) => setDownloadProgress((current) => ({ ...current, [packId]: progress })));
      setMessageTone("success");
      setMessage(`${entry.name} está listo para usar, también sin conexión.`);
    } catch (cause) {
      setMessageTone("error");
      setMessage(cause instanceof Error ? cause.message : "No se pudo descargar el mundo.");
    } finally {
      setDownloadProgress((current) => {
        const next = { ...current };
        delete next[packId];
        return next;
      });
    }
  }

  async function removePack(packId: string) {
    if (packId === activePackId) {
      setMessageTone("error");
      setMessage("Activa primero otro mundo para poder borrar este.");
      return;
    }
    await remove(packId);
    setMessageTone("success");
    setMessage("Mundo eliminado del dispositivo. Podrás descargarlo de nuevo.");
  }

  return (
    <section className="page-stack store-page">
      <section className="store-world" data-pack={activePackId} style={{ backgroundImage: `url(${storeBackground})` }}>
        <Link className="world-scene__back store-world__back" to="/home" aria-label="Volver al inicio"><ArrowLeft size={22} /></Link>
        <div className="store-world__balance" aria-label={`Tienes ${wallet.balance} estrellas`}>
          <Star size={20} fill="currentColor" /> <strong>{wallet.balance}</strong>
        </div>

      {(PREVIEW_ALL_PACKS || import.meta.env.DEV) && (
        <p className="store-world__beta">Modo de pruebas · todo abierto</p>
      )}

      {(message || catalogError) && <p className={`store-world__message ${messageTone === "success" && !catalogError ? "is-success" : "is-error"}`}>{message || `${catalogError} Los mundos ya instalados siguen disponibles.`}</p>}

      <div className="pack-grid store-world__packs">
        {sortedPacks.map(({ manifest, previewUrl, stickers, frames, filters, speechBubbles, stamps, masks, effects }) => {
          const unlocked = unlockedIds.has(manifest.id);
          const active = activePackId === manifest.id;
          const open = openPackId === manifest.id;
          const installed = isInstalled(manifest.id);
          const updateAvailable = installed && manifest.id !== "base" && hasUpdate(manifest.id, manifest.version);
          const progress = downloadProgress[manifest.id];
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
                  {progress !== undefined
                    ? `${progress}%`
                    : updateAvailable
                      ? "Actualización"
                      : active
                        ? <><Check size={14} /> En uso</>
                        : installed
                          ? "Instalado"
                          : unlocked ? "Disponible" : <><Lock size={14} /> Cerrado</>}
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
                  {progress !== undefined ? (
                    <button className="primary-action" type="button" disabled>
                      <Download size={16} /> {progress}%
                    </button>
                  ) : updateAvailable ? (
                    <button className="primary-action" type="button" onClick={() => void downloadPack(manifest.id)}>
                      <Download size={16} /> Actualizar
                    </button>
                  ) : !unlocked ? (
                    <button className="primary-action" type="button" onClick={() => void buyPack(manifest.id)}>
                      Comprar
                    </button>
                  ) : !installed ? (
                    <button className="primary-action" type="button" onClick={() => void downloadPack(manifest.id)}>
                      <Download size={16} /> Descargar
                    </button>
                  ) : (
                    <button className="secondary-action" type="button" disabled={active} onClick={() => void activatePack(manifest.id)}>
                      {active ? "Activo" : "Activar"}
                    </button>
                  )}
                  {installed && manifest.id !== "base" && !active && (
                    <button className="secondary-action" type="button" aria-label={`Eliminar ${manifest.name}`} onClick={() => void removePack(manifest.id)}>
                      <Trash2 size={16} />
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
