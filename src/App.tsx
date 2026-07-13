const milestones = [
  "Fundacion PWA, perfiles, admin y PIN seguro",
  "Diario con texto, audio, video y capsulas",
  "Foto diaria, timelapse y control de almacenamiento",
  "Packs, stickers, recompensas y tienda por estrellas",
  "Backups completos y tests criticos",
];

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <p className="eyebrow">Rebuild desde especificacion</p>
        <h1 id="app-title">Mi Super Diario</h1>
        <p className="lead">
          Diario creativo privado para guardar recuerdos con texto, voz, video,
          fotos diarias, stickers y recompensas.
        </p>
      </section>

      <section className="panel" aria-labelledby="next-title">
        <h2 id="next-title">Ruta de construccion</h2>
        <ol>
          {milestones.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
