import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";

const root = process.cwd();
const outputRoot = path.join(root, "artifacts", "remote-packs");
const uploadsRoot = path.join(outputRoot, "uploads");
const publicBase = "https://rydvdxiulcumonhoinwr.supabase.co/storage/v1/object/public/world-packs";

const packs = [
  {
    id: "dinosaurios",
    home: "src/assets/home/valley-of-eras-world-dinosaurs-v1.png",
    door: "src/assets/profiles/doors/door-dinosaurs-v3.png",
    mascot: "src/assets/mascots/realistic-trex-sprites-32-v2.png",
    scenes: {
      video: "src/assets/recording/crystal-cave-cinema-dinosaurs-v1.png",
      voice: "src/assets/recording/fossil-amphitheater-voice-dinosaurs-v1.png",
      writing: "src/assets/recording/ancient-tree-writing-dinosaurs-v1.png",
      photo: "src/assets/recording/prehistoric-lookout-photo-dinosaurs-v1.png",
      settings: "src/assets/settings/prehistoric-field-station-settings-dinosaurs-v1.png",
      store: "src/assets/store/prehistoric-explorer-market-store-dinosaurs-v1.png",
      gallery: "src/assets/diary/cliff-fossil-museum-gallery-dinosaurs-v1.png",
    },
  },
  {
    id: "futbol",
    home: "src/assets/home/concepts/world-futbol-v1.png",
    door: "src/assets/profiles/doors/door-futbol-v3.png",
    mascot: "src/assets/mascots/football-player-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/football-stadium-video-v1.png",
      voice: "src/assets/recording/football-commentary-voice-v1.png",
      writing: "src/assets/recording/football-tactics-writing-v1.png",
      photo: "src/assets/recording/football-press-photo-v4.png",
      settings: "src/assets/settings/football-locker-settings-v1.png",
      store: "src/assets/store/football-kit-store-v1.png",
      gallery: "src/assets/diary/football-club-museum-gallery-v1.png",
    },
  },
  {
    id: "artePintura",
    home: "src/assets/home/concepts/world-arte-pintura-v1.png",
    door: "src/assets/profiles/doors/door-arte-pintura-v2.png",
    mascot: "src/assets/mascots/living-paintbrush-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/painted-canvas-cinema-art-v2.png",
      voice: "src/assets/recording/artist-voice-studio-art-v1.png",
      writing: "src/assets/recording/artist-diary-art-v1.png",
      photo: "src/assets/recording/portrait-studio-art-v2.png",
      settings: "src/assets/settings/creative-workshop-settings-art-v1.png",
      store: "src/assets/store/market-of-colors-store-art-v1.png",
      gallery: "src/assets/diary/art-memory-museum-gallery-v1.png",
    },
  },
  {
    id: "aventuraPirata",
    home: "src/assets/home/concepts/world-aventura-pirata-v1.png",
    door: "src/assets/profiles/doors/door-aventura-pirata-v2.png",
    mascot: "src/assets/mascots/pirate-parrot-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/map-room-cinema-pirate-v2.png",
      voice: "src/assets/recording/captain-broadcast-voice-pirate-v1.png",
      writing: "src/assets/recording/captain-log-writing-pirate-v1.png",
      photo: "src/assets/recording/ship-lookout-photo-pirate-v2.png",
      settings: "src/assets/settings/captain-cabin-settings-pirate-v1.png",
      store: "src/assets/store/pirate-port-market-store-v1.png",
      gallery: "src/assets/diary/captain-memory-hall-gallery-pirate-v1.png",
    },
  },
  {
    id: "baloncesto",
    home: "src/assets/home/concepts/world-baloncesto-v1.png",
    door: "src/assets/profiles/doors/door-baloncesto-v2.png",
    mascot: "src/assets/mascots/basketball-player-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/arena-replay-video-basketball-v2.png",
      voice: "src/assets/recording/courtside-voice-basketball-v2.png",
      writing: "src/assets/recording/coach-playbook-writing-basketball-v1.png",
      photo: "src/assets/recording/press-photo-basketball-v2.png",
      settings: "src/assets/settings/locker-settings-basketball-v1.png",
      store: "src/assets/store/team-shop-basketball-v1.png",
      gallery: "src/assets/diary/club-memory-gallery-basketball-v1.png",
    },
  },
  {
    id: "dulcePasteleria",
    home: "src/assets/home/concepts/world-dulce-pasteleria-v1.png",
    door: "src/assets/profiles/doors/door-dulce-pasteleria-v2.png",
    mascot: "src/assets/mascots/cupcake-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/cake-theatre-video-pastry-v2.png",
      voice: "src/assets/recording/confectionery-voice-pastry-v2.png",
      writing: "src/assets/recording/recipe-diary-writing-pastry-v1.png",
      photo: "src/assets/recording/sweet-portrait-photo-pastry-v2.png",
      settings: "src/assets/settings/bakery-settings-pastry-v1.png",
      store: "src/assets/store/dessert-boutique-store-pastry-v1.png",
      gallery: "src/assets/diary/memory-patisserie-gallery-v1.png",
    },
  },
  {
    id: "escuelaMagia",
    home: "src/assets/home/concepts/world-escuela-magia-v1.png",
    door: "src/assets/profiles/doors/door-escuela-magia-v2.png",
    mascot: "src/assets/mascots/magic-owl-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/projection-hall-video-magic-school-v2.png",
      voice: "src/assets/recording/spell-recital-voice-magic-school-v2.png",
      writing: "src/assets/recording/spell-journal-writing-magic-school-v1.png",
      photo: "src/assets/recording/magical-portrait-photo-magic-school-v2.png",
      settings: "src/assets/settings/headmaster-settings-magic-school-v1.png",
      store: "src/assets/store/academy-supplies-store-magic-school-v1.png",
      gallery: "src/assets/diary/school-memory-archive-gallery-v1.png",
    },
  },
  {
    id: "espacio",
    home: "src/assets/home/concepts/world-espacio-v1.png",
    door: "src/assets/profiles/doors/door-espacio-v2.png",
    mascot: "src/assets/mascots/astronaut-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/orbital-cinema-video-space-v2.png",
      voice: "src/assets/recording/mission-voice-space-v1.png",
      writing: "src/assets/recording/astronaut-log-writing-space-v1.png",
      photo: "src/assets/recording/observatory-photo-space-v2.png",
      settings: "src/assets/settings/mission-control-settings-space-v1.png",
      store: "src/assets/store/interstellar-depot-store-space-v1.png",
      gallery: "src/assets/diary/cosmic-memory-archive-gallery-v1.png",
    },
  },
  {
    id: "reinoMagico",
    home: "src/assets/home/concepts/world-reino-magico-v1.png",
    door: "src/assets/profiles/doors/door-reino-magico-v2.png",
    mascot: "src/assets/mascots/unicorn-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/royal-story-video-kingdom-v2.png",
      voice: "src/assets/recording/royal-amphitheatre-voice-kingdom-v2.png",
      writing: "src/assets/recording/fairytale-diary-writing-kingdom-v1.png",
      photo: "src/assets/recording/storybook-photo-kingdom-v2.png",
      settings: "src/assets/settings/royal-observatory-settings-kingdom-v1.png",
      store: "src/assets/store/fairytale-market-store-kingdom-v1.png",
      gallery: "src/assets/diary/palace-memory-gallery-kingdom-v1.png",
    },
  },
  {
    id: "superVelocidad",
    home: "src/assets/home/concepts/world-super-velocidad-v1.png",
    door: "src/assets/profiles/doors/door-super-velocidad-v2.png",
    mascot: "src/assets/mascots/racing-car-sprites-32.webp",
    scenes: {
      video: "src/assets/recording/trackside-video-speed-v2.png",
      voice: "src/assets/recording/race-commentary-voice-speed-v2.png",
      writing: "src/assets/recording/driver-log-writing-speed-v1.png",
      photo: "src/assets/recording/pitlane-photo-speed-v2.png",
      settings: "src/assets/settings/pit-garage-settings-speed-v1.png",
      store: "src/assets/store/racing-shop-store-speed-v1.png",
      gallery: "src/assets/diary/racing-memory-hall-gallery-v1.png",
    },
  },
];

async function exists(file) {
  return fs.access(file).then(() => true, () => false);
}

async function copyDirectory(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyDirectory(from, to);
    else await fs.copyFile(from, to);
  }
}

async function addDirectoryToZip(zip, directory, prefix = "") {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) await addDirectoryToZip(zip, absolute, relative);
    else zip.file(relative, await fs.readFile(absolute));
  }
}

async function copyRequired(source, destination) {
  const absolute = path.join(root, source);
  if (!(await exists(absolute))) throw new Error(`Falta el recurso requerido: ${source}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(absolute, destination);
}

const existingCatalog = JSON.parse(await fs.readFile(path.join(root, "distribution", "world-packs", "catalog.json"), "utf8"));
const catalogById = new Map(existingCatalog.packs.map((entry) => [entry.id, entry]));

await fs.mkdir(uploadsRoot, { recursive: true });

for (const config of packs) {
  const sourcePack = path.join(root, "src", "assets", "packs", config.id);
  const packManifest = JSON.parse(await fs.readFile(path.join(sourcePack, "manifest.json"), "utf8"));
  const version = packManifest.version ?? "1.0.0";
  const buildRoot = path.join(outputRoot, config.id, version);
  const contentRoot = path.join(buildRoot, "content");
  const packRoot = path.join(contentRoot, "pack");
  await fs.rm(buildRoot, { recursive: true, force: true });
  await copyDirectory(sourcePack, packRoot);

  const preferredPreview = packManifest.preview || "preview.png";
  const previewSource = (await exists(path.join(packRoot, preferredPreview)))
    ? path.join(packRoot, preferredPreview)
    : path.join(packRoot, "preview.png");
  if (!(await exists(previewSource))) throw new Error(`El pack ${config.id} no contiene una miniatura.`);
  const previewName = path.basename(previewSource);

  await copyRequired(config.home, path.join(contentRoot, "scenes", "home.png"));
  for (const [scene, source] of Object.entries(config.scenes)) {
    await copyRequired(source, path.join(contentRoot, "scenes", `${scene}.png`));
  }
  await copyRequired(config.door, path.join(contentRoot, "profile", "door.png"));
  await copyRequired(config.mascot, path.join(contentRoot, "mascot", `sprite${path.extname(config.mascot)}`));

  const mascotName = `content/mascot/sprite${path.extname(config.mascot)}`;
  const distribution = {
    schemaVersion: 1,
    id: config.id,
    name: packManifest.name,
    description: packManifest.description,
    version,
    minimumAppVersion: "1.0.0",
    content: {
      packManifest: "content/pack/manifest.json",
      preview: `content/pack/${previewName}`,
      assetsRoot: "content/pack",
      scenes: {
        home: "content/scenes/home.png",
        video: "content/scenes/video.png",
        voice: "content/scenes/voice.png",
        writing: "content/scenes/writing.png",
        photo: "content/scenes/photo.png",
        settings: "content/scenes/settings.png",
        store: "content/scenes/store.png",
        gallery: "content/scenes/gallery.png",
      },
      profileDoor: "content/profile/door.png",
      mascotSprite: mascotName,
    },
  };
  await fs.writeFile(path.join(buildRoot, "manifest.json"), `${JSON.stringify(distribution, null, 2)}\n`);

  const zip = new JSZip();
  zip.file("manifest.json", `${JSON.stringify(distribution, null, 2)}\n`);
  await addDirectoryToZip(zip, contentRoot, "content");
  const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
  const checksumSha256 = createHash("sha256").update(archive).digest("hex").toUpperCase();
  const prefix = `${config.id}-${version}`;
  await fs.writeFile(path.join(uploadsRoot, `${prefix}.zip`), archive);
  await fs.writeFile(path.join(uploadsRoot, `${prefix}-manifest.json`), `${JSON.stringify(distribution, null, 2)}\n`);
  await fs.copyFile(previewSource, path.join(uploadsRoot, `${prefix}-preview.png`));

  const remoteFolder = `${publicBase}/${config.id}/${version}`;
  catalogById.set(config.id, {
    id: config.id,
    name: packManifest.name,
    description: packManifest.description,
    version,
    sizeBytes: archive.byteLength,
    checksumSha256,
    manifestUrl: `${remoteFolder}/${prefix}-manifest.json`,
    previewUrl: `${remoteFolder}/${prefix}-preview.png`,
    archiveUrl: `${remoteFolder}/${prefix}.zip`,
    priceStars: packManifest.priceStars ?? 60,
    free: Boolean(packManifest.free),
  });
  console.log(`${config.id} ${version}: ${(archive.byteLength / 1024 / 1024).toFixed(1)} MB`);
}

const catalog = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  packs: [...catalogById.values()],
};
await fs.writeFile(path.join(root, "distribution", "world-packs", "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
await fs.writeFile(path.join(uploadsRoot, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Catálogo generado con ${catalog.packs.length} mundos.`);
