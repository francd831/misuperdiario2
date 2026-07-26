import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ProfileProvider } from "./core/profiles/ProfileContext";
import { RemotePackProvider } from "./core/packs/RemotePackContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RemotePackProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </RemotePackProvider>
    </BrowserRouter>
  </StrictMode>,
);
