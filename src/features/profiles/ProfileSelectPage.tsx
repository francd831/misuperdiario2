import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Delete, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import carouselFoyer from "../../assets/profiles/profile-carousel-foyer-family-control-title.png";
import baseDoor from "../../assets/profiles/doors/door-base-v2.png";
import animalsDoor from "../../assets/profiles/doors/door-animals-v2.png";
import dinosaurDoor from "../../assets/profiles/doors/door-dinosaurs-v3.png";
import artDoor from "../../assets/profiles/doors/door-arte-pintura-v2.png";
import pirateDoor from "../../assets/profiles/doors/door-aventura-pirata-v2.png";
import basketballDoor from "../../assets/profiles/doors/door-baloncesto-v2.png";
import pastryDoor from "../../assets/profiles/doors/door-dulce-pasteleria-v2.png";
import magicSchoolDoor from "../../assets/profiles/doors/door-escuela-magia-v2.png";
import spaceDoor from "../../assets/profiles/doors/door-espacio-v2.png";
import footballDoor from "../../assets/profiles/doors/door-futbol-v3.png";
import magicKingdomDoor from "../../assets/profiles/doors/door-reino-magico-v2.png";
import speedDoor from "../../assets/profiles/doors/door-super-velocidad-v2.png";
import { useProfiles } from "../../core/profiles/ProfileContext";
import type { Profile } from "../../core/profiles/types";
import { ProfileAvatar } from "../../shared/ui/ProfileAvatar";

type DoorDefinition = {
  url: string;
  theme: string;
};

const baseDoorDefinition: DoorDefinition = { url: baseDoor, theme: "base" };

function doorForPack(packId: string | undefined): DoorDefinition {
  if (packId === "animalesDivertidos") return { url: animalsDoor, theme: "animals" };
  if (packId === "dinosaurios") return { url: dinosaurDoor, theme: "dinosaurs" };
  if (packId === "futbol") return { url: footballDoor, theme: "football" };
  if (packId === "artePintura") return { url: artDoor, theme: "art" };
  if (packId === "aventuraPirata") return { url: pirateDoor, theme: "pirate" };
  if (packId === "baloncesto") return { url: basketballDoor, theme: "basketball" };
  if (packId === "dulcePasteleria") return { url: pastryDoor, theme: "pastry" };
  if (packId === "escuelaMagia") return { url: magicSchoolDoor, theme: "magic-school" };
  if (packId === "espacio") return { url: spaceDoor, theme: "space" };
  if (packId === "reinoMagico") return { url: magicKingdomDoor, theme: "magic-kingdom" };
  if (packId === "superVelocidad") return { url: speedDoor, theme: "speed" };
  return baseDoorDefinition;
}

function nameSize(name: string) {
  if (name.length >= 11) return "long";
  if (name.length >= 8) return "medium";
  return "short";
}

export default function ProfileSelectPage() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const { children, login } = useProfiles();
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [centeredIndex, setCenteredIndex] = useState(0);
  const doorCount = children.length + 1;

  const updateCarouselPerspective = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    const doors = Array.from(track.querySelectorAll<HTMLElement>(".profile-carousel__door"));
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    doors.forEach((door, index) => {
      const doorCenter = door.offsetLeft + door.offsetWidth / 2;
      const normalizedDistance = (doorCenter - center) / Math.max(door.offsetWidth * .72, 1);
      const clampedDistance = Math.max(-3, Math.min(3, normalizedDistance));
      door.style.setProperty("--carousel-distance", clampedDistance.toFixed(3));
      door.style.setProperty("--carousel-abs-distance", Math.abs(clampedDistance).toFixed(3));
      door.style.zIndex = String(Math.max(1, doors.length * 10 - Math.round(Math.abs(clampedDistance) * 10)));
      const distance = Math.abs(doorCenter - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    doors.forEach((door, index) => {
      if (index === closestIndex) door.setAttribute("aria-current", "true");
      else door.removeAttribute("aria-current");
    });
    setCenteredIndex((current) => current === closestIndex ? current : closestIndex);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let animationFrame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateCarouselPerspective);
    };
    scheduleUpdate();
    track.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(animationFrame);
      track.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [children.length, updateCarouselPerspective]);

  async function enterProfile(profile: Profile, profilePin = "") {
    setError("");
    const ok = await login(profile.id, profilePin);
    if (!ok) { setError("Ese PIN no es correcto."); setPin(""); return; }
    navigate("/home");
  }

  function selectProfile(profile: Profile) {
    if (!profile.pinHash) { void enterProfile(profile); return; }
    setPin(""); setError(""); setSelectedProfile(profile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedProfile) await enterProfile(selectedProfile, pin);
  }

  function closePin() { setSelectedProfile(undefined); setPin(""); setError(""); }

  function addPinDigit(digit: string) {
    setError("");
    setPin((value) => `${value}${digit}`.slice(0, 4));
  }

  function moveCarousel(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const door = track.querySelector<HTMLElement>(".profile-carousel__door");
    track.scrollBy({ left: direction * ((door?.offsetWidth ?? track.clientWidth * .55) + 24), behavior: "smooth" });
  }

  function focusDoor(index: number) {
    const track = trackRef.current;
    const doors = track ? Array.from(track.querySelectorAll<HTMLElement>(".profile-carousel__door")) : [];
    const door = doors[index];
    if (!track || !door) return;
    track.scrollTo({ left: door.offsetLeft + door.offsetWidth / 2 - track.clientWidth / 2, behavior: "smooth" });
  }

  return (
    <section className="profile-carousel" aria-label="Seleccionar perfil" style={{ backgroundImage: `url(${carouselFoyer})` }}>
      <h1 className="visually-hidden">¿Quién eres?</h1>
      <button className="profile-carousel__arrow profile-carousel__arrow--left" type="button" aria-label="Puerta anterior" onClick={() => moveCarousel(-1)}><ChevronLeft /></button>
      <div ref={trackRef} className="profile-carousel__track" role="group" aria-label="Puertas de perfiles">
        {[...children, undefined].map((profile, index) => {
          const door = doorForPack(profile?.activePackId);
          if (!profile) return (
            <Link key={`empty-${index}`} className="profile-carousel__door profile-carousel__door--empty" data-door-theme="base" data-name-size="long" to={`/profiles/new?door=${index + 1}`} aria-label={`Crear perfil en la puerta ${index + 1}`} aria-posinset={index + 1} aria-setsize={doorCount}>
              <img src={baseDoor} alt="" aria-hidden="true" />
              <span className="profile-carousel__nameplate"><strong>Nuevo perfil</strong></span>
              <span className="profile-carousel__plus"><Plus /></span>
            </Link>
          );
          return (
            <button key={profile.id} className="profile-carousel__door" data-door-theme={door.theme} data-name-size={nameSize(profile.name)} type="button" aria-label={`Entrar como ${profile.name}`} aria-posinset={index + 1} aria-setsize={doorCount} onClick={() => selectProfile(profile)}>
              <img src={door.url} alt="" aria-hidden="true" />
              <span className="profile-carousel__nameplate"><strong>{profile.name}</strong></span>
            </button>
          );
        })}
      </div>
      <button className="profile-carousel__arrow profile-carousel__arrow--right" type="button" aria-label="Puerta siguiente" onClick={() => moveCarousel(1)}><ChevronRight /></button>

      {doorCount > 1 && (
        <nav className="profile-carousel__positions" aria-label="Perfiles disponibles">
          {[...children, undefined].map((profile, index) => (
            <button
              key={profile?.id ?? "new-profile"}
              type="button"
              className={index === centeredIndex ? "is-active" : ""}
              aria-current={index === centeredIndex ? "true" : undefined}
              aria-label={profile ? `Mostrar la puerta de ${profile.name}` : "Mostrar la puerta para crear un perfil"}
              onClick={() => focusDoor(index)}
            />
          ))}
        </nav>
      )}

      <Link className="profile-carousel__family-control" to="/admin" aria-label="Abrir Control familiar">
        <span className="visually-hidden">Control familiar</span>
      </Link>

      {selectedProfile && (
        <div className="profile-pin-backdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) closePin(); }}>
          <form className="profile-pin-panel" onSubmit={(event) => void handleSubmit(event)}>
            <button className="profile-pin-panel__close" type="button" aria-label="Cerrar" onClick={closePin}><X /></button>
            <div className="profile-pin-panel__main">
              <ProfileAvatar profile={selectedProfile} className="profile-pin-panel__avatar" />
              <h2>{selectedProfile.name}</h2>
              <label><span>PIN</span><input aria-live="polite" inputMode="none" maxLength={4} placeholder="••••" type="password" value={pin} readOnly /></label>
              {error && <p className="profile-pin-panel__error" role="alert">{error}</p>}
              <button className="profile-pin-panel__enter" type="submit" disabled={pin.length !== 4}>Entrar <ArrowRight aria-hidden="true" /></button>
            </div>
            <div className="profile-pin-panel__keypad" aria-label="Teclado numérico">
              {["1","2","3","4","5","6","7","8","9"].map((digit) => <button key={digit} type="button" onClick={() => addPinDigit(digit)}>{digit}</button>)}
              <button type="button" aria-label="Borrar todo" onClick={() => { setError(""); setPin(""); }}><X /></button>
              <button type="button" onClick={() => addPinDigit("0")}>0</button>
              <button type="button" aria-label="Borrar último número" onClick={() => { setError(""); setPin((value) => value.slice(0, -1)); }}><Delete /></button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
