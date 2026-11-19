"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./adventure-create.css";

type World = "mountains" | "forest" | "lake";
type Mode = "hike" | "drive" | "ride" | "paddle";
type Weather = "sunny" | "misty" | "rainy";
type Duration = "day" | "weekend" | "week";
type Adventure = { id: string; world: World; mode: Mode; weather: Weather; duration: Duration; createdAt: string };

const worldOptions: { id: World; title: string; description: string; icon: string }[] = [
  { id: "mountains", title: "Mountains", description: "High peaks & wild trails", icon: "🏔️" },
  { id: "forest", title: "Forest", description: "Deep woods & hidden paths", icon: "🌲" },
  { id: "lake", title: "Lakeside", description: "Quiet shores & open water", icon: "🏞️" },
];
const modeOptions: { id: Mode; title: string; icon: string }[] = [
  { id: "hike", title: "Hike", icon: "🥾" },
  { id: "drive", title: "Drive", icon: "🚙" },
  { id: "ride", title: "Ride", icon: "🚴" },
  { id: "paddle", title: "Paddle", icon: "🛶" },
];
const weatherOptions: { id: Weather; title: string; icon: string }[] = [
  { id: "sunny", title: "Sunny", icon: "☀️" },
  { id: "misty", title: "Misty", icon: "🌫️" },
  { id: "rainy", title: "Rainy", icon: "🌧️" },
];
const durationOptions: { id: Duration; title: string }[] = [
  { id: "day", title: "One Day" },
  { id: "weekend", title: "Weekend" },
  { id: "week", title: "One Week" },
];

export default function AdventureCreatePage() {
  const [step, setStep] = useState(1);
  const [world, setWorld] = useState<World>("mountains");
  const [mode, setMode] = useState<Mode>("hike");
  const [weather, setWeather] = useState<Weather>("sunny");
  const [duration, setDuration] = useState<Duration>("weekend");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("roamlab-digireal-draft-v1");
      if (raw) {
        const draft = JSON.parse(raw) as Partial<Adventure>;
        if (worldOptions.some((x) => x.id === draft.world)) setWorld(draft.world as World);
        if (modeOptions.some((x) => x.id === draft.mode)) setMode(draft.mode as Mode);
        if (weatherOptions.some((x) => x.id === draft.weather)) setWeather(draft.weather as Weather);
        if (durationOptions.some((x) => x.id === draft.duration)) setDuration(draft.duration as Duration);
      }
    } catch { /* Ignore malformed local draft. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("roamlab-digireal-draft-v1", JSON.stringify({ world, mode, weather, duration }));
    } catch { /* Private browsing may disable local storage. */ }
  }, [world, mode, weather, duration, hydrated]);

  function saveAdventure() {
    const adventure: Adventure = {
      id: `adv-${Date.now()}`,
      world, mode, weather, duration,
      createdAt: new Date().toISOString(),
    };
    try {
      const raw = window.localStorage.getItem("roamlab-digireal-adventures-v1");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(parsed) ? parsed : [];
      window.localStorage.setItem("roamlab-digireal-adventures-v1", JSON.stringify([adventure, ...existing].slice(0, 50)));
      setSaved(true);
      setError("");
    } catch {
      setError("Could not save on this device. Check your browser storage settings.");
    }
  }

  const worldName = worldOptions.find((x) => x.id === world)?.title;
  const modeName = modeOptions.find((x) => x.id === mode)?.title;
  const weatherName = weatherOptions.find((x) => x.id === weather)?.title;
  const durationName = durationOptions.find((x) => x.id === duration)?.title;

  return (
    <main className="dac-page">
      <div className="dac-shell">
        <header className="dac-header">
          <Link href="/digireal-preview" className="dac-back" aria-label="Back to DigiReal homepage">←</Link>
          <div className="dac-brand"><strong>RoamLab</strong><span>DIGIREAL ADVENTURE</span></div>
          <span className="dac-progress">{step} / 3</span>
        </header>

        <div className="dac-progress-track" aria-label={`Step ${step} of 3`}><div style={{ width: `${(step / 3) * 100}%` }} /></div>

        <section className="dac-intro">
          <p className="dac-eyebrow">YOUR STORY BEGINS HERE</p>
          <h1>Build Your <em>Adventure.</em></h1>
          <p>Shape a world of your own, one choice at a time.</p>
        </section>

        <div className="dac-scene" aria-hidden="true">
          <div className="dac-sun" />
          <div className="dac-mountain dac-mountain-back" />
          <div className="dac-mountain dac-mountain-front" />
          <div className="dac-ground" />
          <span className="dac-scene-icon">{worldOptions.find((x) => x.id === world)?.icon}</span>
          <span className="dac-scene-caption">{worldName} · {weatherName}</span>
        </div>

        <section className="dac-panel" aria-live="polite">
          {step === 1 && (
            <>
              <div className="dac-section-heading"><span>01 — THE WORLD</span><h2>Choose Your World</h2><p>Where will your imagination take you?</p></div>
              <div className="dac-world-grid">
                {worldOptions.map((item) => (
                  <button key={item.id} type="button" className={`dac-world-option ${world === item.id ? "is-selected" : ""}`} onClick={() => { setWorld(item.id); setSaved(false); }} aria-pressed={world === item.id}>
                    <span className="dac-world-icon" aria-hidden="true">{item.icon}</span>
                    <strong>{item.title}</strong><small>{item.description}</small>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="dac-section-heading"><span>02 — THE JOURNEY</span><h2>Shape Your Journey</h2><p>Every adventure has its own rhythm.</p></div>
              <h3>How will you explore?</h3>
              <div className="dac-choice-grid">{modeOptions.map((item) => <button key={item.id} type="button" className={`dac-choice ${mode === item.id ? "is-selected" : ""}`} onClick={() => { setMode(item.id); setSaved(false); }} aria-pressed={mode === item.id}><span aria-hidden="true">{item.icon}</span>{item.title}</button>)}</div>
              <h3>Set the mood</h3>
              <div className="dac-choice-grid">{weatherOptions.map((item) => <button key={item.id} type="button" className={`dac-choice ${weather === item.id ? "is-selected" : ""}`} onClick={() => { setWeather(item.id); setSaved(false); }} aria-pressed={weather === item.id}><span aria-hidden="true">{item.icon}</span>{item.title}</button>)}</div>
              <h3>How long is the adventure?</h3>
              <div className="dac-duration-grid">{durationOptions.map((item) => <button key={item.id} type="button" className={`dac-duration ${duration === item.id ? "is-selected" : ""}`} onClick={() => { setDuration(item.id); setSaved(false); }} aria-pressed={duration === item.id}>{item.title}</button>)}</div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="dac-section-heading"><span>03 — YOUR ADVENTURE</span><h2>Your Journey Awaits</h2><p>A world made from your choices.</p></div>
              <div className="dac-summary">
                <div><span>WORLD</span><strong>{worldName}</strong></div>
                <div><span>EXPLORING</span><strong>{modeName}</strong></div>
                <div><span>WEATHER</span><strong>{weatherName}</strong></div>
                <div><span>DURATION</span><strong>{durationName}</strong></div>
              </div>
              {saved ? <p className="dac-success" role="status">✓ Adventure saved on this device. Your story is ready for the next chapter.</p> : <p className="dac-note">This first version saves your adventure settings locally. An interactive world and story generator will come later.</p>}
              {error && <p className="dac-error" role="alert">{error}</p>}
            </>
          )}
        </section>

        <nav className="dac-actions" aria-label="Adventure builder steps">
          {step > 1 && <button type="button" className="dac-secondary" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 ? <button type="button" className="dac-primary" onClick={() => setStep(step + 1)}>Continue →</button> : <button type="button" className="dac-primary" onClick={saveAdventure} disabled={saved}>{saved ? "Adventure Saved ✓" : "Create My Adventure →"}</button>}
        </nav>
        <footer className="dac-footer">CREATE YOUR OWN ADVENTURE · FROM IMAGINATION TO REALITY</footer>
      </div>
    </main>
  );
}
