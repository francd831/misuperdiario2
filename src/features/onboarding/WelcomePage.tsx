import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import launchCover from "../../assets/onboarding/launch-cover-house-v1.jpg";
import foyer from "../../assets/profiles/profile-carousel-foyer-family-control-title.png";

const LAUNCH_DURATION_MS = 2600;

export default function WelcomePage() {
  const navigate = useNavigate();
  const enterFoyer = useCallback(() => navigate("/profiles", { replace: true }), [navigate]);

  useEffect(() => {
    const foyerPreload = new Image();
    foyerPreload.src = foyer;
    const timer = window.setTimeout(enterFoyer, LAUNCH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [enterFoyer]);

  return (
    <section className="launch-cover" aria-label="Mi Super Diario">
      <button className="launch-cover__scene" type="button" onClick={enterFoyer} aria-label="Entrar al recibidor">
        <img src={launchCover} alt="Entrada de Mi Super Diario" />
        <span className="launch-cover__light" aria-hidden="true" />
        <span className="launch-cover__progress" aria-hidden="true"><i /></span>
      </button>
    </section>
  );
}
