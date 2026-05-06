/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio */
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scenario": "bottom",
  "speed": 4,
  "running": true,
  "debug": false
}/*EDITMODE-END*/;

const pad2 = (n) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
const fmtDepth = (m) => Math.max(0, m).toFixed(1);

function useDiveSim({ scenario, speed, running }) {
  const [depth, setDepth] = useState(15);
  const [diveTime, setDive] = useState(18 * 60);
  const [ndl, setNdl] = useState(53);
  const [asc, setAsc] = useState(0);
  const [clock, setClock] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  const ref = useRef({ depth: 15, diveTime: 18 * 60, ndl: 53, vel: 0, phase: "bottom" });

  useEffect(() => {
    if (scenario === "descent")  ref.current = { depth:0,  diveTime:0,    ndl:99, vel:12, phase:"descent" };
    if (scenario === "bottom")   ref.current = { depth:15, diveTime:18*60,ndl:53, vel:0,  phase:"bottom" };
    if (scenario === "safety")   ref.current = { depth:5,  diveTime:27*60,ndl:0,  vel:0,  phase:"safety" };
    if (scenario === "ascent")   ref.current = { depth:15, diveTime:25*60,ndl:30, vel:-9, phase:"ascent" };
    if (scenario === "surface")  ref.current = { depth:0,  diveTime:32*60,ndl:0,  vel:0,  phase:"surface" };
    setDepth(ref.current.depth);
    setDive(ref.current.diveTime);
    setNdl(ref.current.ndl);
  }, [scenario]);

  useEffect(() => {
    if (!running) return;
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = Math.min(0.1, (t - last) / 1000) * speed;
      last = t;
      const s = ref.current;

      if (s.phase === "descent" && s.depth >= 18) { s.phase = "bottom"; s.vel = 0; }
      if (s.phase === "bottom"  && s.diveTime > 24 * 60) { s.phase = "ascent"; s.vel = -9; }
      if (s.phase === "ascent"  && s.depth <= 5) { s.phase = "safety"; s.vel = 0; }
      if (s.phase === "safety"  && s.diveTime > 30 * 60) { s.phase = "ascent"; s.vel = -3; }
      if (s.phase === "ascent"  && s.depth <= 0.2 && s.diveTime > 30 * 60) { s.phase = "surface"; s.vel = 0; }

      s.depth = Math.max(0, s.depth + (s.vel / 60) * dt);
      if (s.phase === "bottom") s.depth = 15 + Math.sin(t / 700) * 0.3;
      if (s.phase === "safety") s.depth = 5 + Math.sin(t / 600) * 0.2;

      if (s.depth > 1.2 || s.phase !== "surface") s.diveTime += dt;

      if (s.phase === "bottom")  s.ndl = Math.max(0, s.ndl - dt * 0.06);
      if (s.phase === "ascent")  s.ndl = Math.min(99, s.ndl + dt * 0.15);
      if (s.phase === "descent") s.ndl = Math.max(0, s.ndl - dt * 0.04);
      if (s.phase === "safety")  s.ndl = 0;
      if (s.phase === "surface") s.ndl = 99;

      let level = 0;
      if (s.phase === "ascent") {
        const r = -s.vel;
        level = r < 3 ? 1 : r < 6 ? 2 : r < 9 ? 3 : r < 12 ? 4 : 5;
      }
      setAsc(level);

      setDepth(s.depth);
      setDive(s.diveTime);
      setNdl(Math.round(s.ndl));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, scenario]);

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(d.getHours() * 60 + d.getMinutes());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return { depth, diveTime, ndl, asc, clock, phase: ref.current.phase };
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const sim = useDiveSim({
    scenario: t.scenario,
    speed: t.speed,
    running: t.running,
  });

  const [pressed, setPressed] = useState(null);
  const press = (k) => { setPressed(k); setTimeout(() => setPressed(null), 350); };

  const onMode = () => {
    const order = ["descent", "bottom", "ascent", "safety", "surface"];
    const i = order.indexOf(t.scenario);
    setTweak("scenario", order[(i + 1) % order.length]);
    press("mode");
  };
  const onSelect = () => press("select");
  const onUp   = () => { setTweak("speed", Math.min(20, t.speed + 1)); press("up"); };
  const onDown = () => { setTweak("speed", Math.max(0.5, t.speed - 1)); press("down"); };

  const hh = pad2(Math.floor(sim.clock / 60));
  const mm = pad2(sim.clock % 60);
  const dtMin = Math.floor(sim.diveTime / 60);

  return (
    <>
      <div className={"watch " + (t.debug ? "debug" : "")} data-screen-label="01 Dive Computer">
        <img className="bg" src="assets/dive-computer-bg.png" alt="" />

        {/* Row 1 — speaker, depth value, AC, m */}
        <div className="ov ov-speaker" data-label="speaker">((-</div>
        <div className="ov ov-depth"   data-label="depth">{fmtDepth(sim.depth)}</div>
        <div className="ov ov-ac"      data-label="AC">AC</div>
        <div className="ov ov-m"       data-label="m">m</div>

        {/* Row 2 — NDL big number + label */}
        <div className="ov ov-ndl"  data-label="ndl">{sim.phase === "surface" ? "--" : pad2(sim.ndl)}</div>
        <div className="ov ov-ndec" data-label="no-dec-time">NO DEC TIME</div>

        {/* Row 3 — TIME / DIVE TIME numbers + labels + separator */}
        <div className="ov ov-sep"            data-label="sep" />
        <div className="ov ov-time"           data-label="time">{hh}:{mm}</div>
        <div className="ov ov-divetime"       data-label="dive-time">{pad2(dtMin)}</div>
        <div className="ov ov-time-label"     data-label="time-lbl">TIME</div>
        <div className="ov ov-divetime-label" data-label="dive-time-lbl">DIVE TIME</div>

        {/* Buttons */}
        <button className={"pbtn select " + (pressed === "select" ? "pressed" : "")} onClick={onSelect} aria-label="Select" title="Select" />
        <button className={"pbtn mode "   + (pressed === "mode"   ? "pressed" : "")} onClick={onMode}   aria-label="Mode"   title="Mode — cycle phase" />
        <button className={"pbtn down "   + (pressed === "down"   ? "pressed" : "")} onClick={onDown}   aria-label="Down"   title="Down — slower" />
        <button className={"pbtn up "     + (pressed === "up"     ? "pressed" : "")} onClick={onUp}     aria-label="Up"     title="Up — faster" />

        <div className="status">
          phase: {sim.phase} · speed ×{t.speed.toFixed(1)} · MODE = next phase
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Simulation" />
        <TweakRadio
          label="Phase"
          value={t.scenario}
          options={["descent", "bottom", "ascent", "safety", "surface"]}
          onChange={(v) => setTweak("scenario", v)}
        />
        <TweakSlider
          label="Speed" value={t.speed} min={0.5} max={20} step={0.5} unit="×"
          onChange={(v) => setTweak("speed", v)}
        />
        <TweakToggle label="Running" value={t.running} onChange={(v) => setTweak("running", v)} />
        <TweakSection label="Calibration" />
        <TweakToggle label="Show overlay boxes" value={t.debug} onChange={(v) => setTweak("debug", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
