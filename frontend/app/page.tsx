"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Brain,
  CheckCircle2,
  Clock3,
  Gauge,
  Hospital,
  MapPin,
  Navigation,
  Radio,
  Route,
  ShieldCheck,
  Siren,
  TrafficCone,
  Wifi,
  Zap,
  Play,
  RotateCcw,
  Video,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type BackendData = {
  eta?: number;
  confidence?: number;
  traffic?: number;
  signals?: number;
  timeSaved?: number;
  detectedVehicle?: string;
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function Home() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [message, setMessage] = useState("Waiting for emergency...");

  const [backendData, setBackendData] = useState<BackendData>({});

  const [yoloDetected, setYoloDetected] = useState(false);

  const [yoloLoading, setYoloLoading] = useState(false);

  const [yoloConfidence, setYoloConfidence] = useState(0);

  const [detectedVehicle, setDetectedVehicle] = useState("—");

  // ==========================================================
  // YOLO DETECTION
  // ==========================================================

  const runYoloDetection = async () => {
    setYoloLoading(true);

    setMessage("AI Vision analyzing ambulance video...");

    try {
      const response = await fetch("http://127.0.0.1:8000/detect");

      if (!response.ok) {
        throw new Error("YOLO detection failed");
      }

      const data = await response.json();

      console.log("YOLO RESULT:", data);

      const detected = data.emergency_vehicle_candidate === true;

      setYoloDetected(detected);

      setYoloConfidence(data.confidence || 0);

      setDetectedVehicle(data.detected_vehicle || "Unknown");

      setBackendData((previous) => ({
        ...previous,
        confidence: data.confidence || 0,
        detectedVehicle: data.detected_vehicle || "Unknown",
      }));

      if (detected) {
        setMessage(
          `Emergency vehicle candidate detected — ${data.confidence}% confidence`,
        );
      } else {
        setMessage("No emergency vehicle candidate detected.");
      }

      return detected;
    } catch (error) {
      console.error(error);

      setMessage("AI detection unavailable. Starting demo simulation.");

      return false;
    } finally {
      setYoloLoading(false);
    }
  };

  // ==========================================================
  // EMERGENCY API
  // ==========================================================

  const activateEmergency = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/emergency", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ambulance_id: "AMB-104",

          latitude: 17.6868,

          longitude: 83.2185,

          destination: "City Hospital",
        }),
      });

      if (!response.ok) {
        throw new Error("Emergency API failed");
      }

      const data = await response.json();

      setBackendData((previous) => ({
        ...previous,

        eta: data.route?.eta_minutes,

        confidence: previous.confidence || data.ai_confidence,

        traffic: data.traffic_analysis?.density,

        signals: data.signals?.coordinated,

        timeSaved: data.route?.time_saved_minutes || 8,
      }));

      return true;
    } catch (error) {
      console.error("Emergency API error:", error);

      // Demo still continues if backend
      // temporarily becomes unavailable.
      setBackendData({
        eta: 6.42,
        confidence: yoloConfidence || 96.8,
        traffic: 42,
        signals: 4,
        timeSaved: 8,
      });

      return false;
    }
  };

  // ==========================================================
  // START SIMULATION
  // ==========================================================

  const startSimulation = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setEmergencyActive(true);
    setSimulationStep(1);

    setMessage("AI Vision detecting emergency vehicle...");

    // --------------------------------------------------------
    // STEP 1 - YOLO DETECTION
    // --------------------------------------------------------

    const detected = await runYoloDetection();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Even if YOLO fails, continue the demo.
    if (detected || !detected) {
      setSimulationStep(2);

      setMessage("Analyzing traffic conditions...");
    }

    // --------------------------------------------------------
    // STEP 2 - TRAFFIC ANALYSIS
    // --------------------------------------------------------

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setBackendData((previous) => ({
      ...previous,
      traffic: previous.traffic || 42,
    }));

    setSimulationStep(3);

    setMessage("AI calculating optimal emergency route...");

    // --------------------------------------------------------
    // STEP 3 - ROUTE
    // --------------------------------------------------------

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const emergencyResult = await activateEmergency();

    setSimulationStep(4);

    setMessage("Coordinating traffic signals...");

    // --------------------------------------------------------
    // STEP 4 - SIGNALS
    // --------------------------------------------------------

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setBackendData((previous) => ({
      ...previous,
      signals: previous.signals || 4,
    }));

    setSimulationStep(5);

    setMessage("Emergency corridor ACTIVE");

    // --------------------------------------------------------
    // STEP 5 - CORRIDOR
    // --------------------------------------------------------

    setSimulationStep(6);

    setMessage("Ambulance reached City Hospital");

    // Wait briefly so the arrival is visible
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Deactivate emergency corridor
    try {
      const response = await fetch("http://127.0.0.1:8000/deactivate", {
        method: "POST",
      });

      if (response.ok) {
        console.log("Emergency corridor deactivated");
      }
    } catch (error) {
      console.error("Deactivation API error:", error);
    }

    setSimulationStep(7);

    setMessage("Emergency completed — traffic signals restored");

    setIsRunning(false);
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetSimulation = () => {
    setEmergencyActive(false);

    setSimulationStep(0);

    setIsRunning(false);

    setMessage("Waiting for emergency...");

    setBackendData({});

    setYoloDetected(false);

    setYoloLoading(false);

    setYoloConfidence(0);

    setDetectedVehicle("—");
  };

  // ==========================================================
  // STATUS HELPERS
  // ==========================================================

  const corridorActive = simulationStep >= 5 && simulationStep < 7;

  const ambulanceArrived = simulationStep >= 6;

  const signalsActive = simulationStep >= 4 && simulationStep < 7;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="border-b border-white/10 bg-[#080c12]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30">
              <Siren className="text-red-400" size={24} />
            </div>

            <div>
              <div className="text-lg font-bold tracking-[0.25em]">
                E-CORRIDOR
              </div>

              <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                AI Emergency Traffic Control
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 text-xs text-gray-400 md:flex">
              <Wifi size={14} className="text-green-400" />
              SYSTEM ONLINE
            </div>

            <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5 text-xs text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              LIVE
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-red-400">
            <Activity size={14} />
            Emergency Operations Center
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Emergency Corridor Control
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            AI-powered ambulance detection, route optimization and traffic
            signal coordination
          </p>
        </div>

        {/* ==================================================
            EMERGENCY STATUS
        ================================================== */}

        <div
          className={`mb-6 flex items-center justify-between rounded-2xl border p-4 transition-all ${
            emergencyActive
              ? "border-red-500/40 bg-red-500/10"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                emergencyActive ? "bg-red-500/20" : "bg-white/5"
              }`}
            >
              <AlertTriangle
                size={24}
                className={emergencyActive ? "text-red-400" : "text-gray-500"}
              />
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Emergency Status
              </div>

              <div
                className={`mt-1 font-semibold ${
                  emergencyActive ? "text-red-400" : "text-gray-300"
                }`}
              >
                {emergencyActive
                  ? corridorActive
                    ? "EMERGENCY CORRIDOR ACTIVE"
                    : "EMERGENCY DETECTED"
                  : "NO ACTIVE EMERGENCY"}
              </div>
            </div>
          </div>

          <div className="hidden text-right md:block">
            <div className="text-xs text-gray-500">SYSTEM MESSAGE</div>

            <div className="mt-1 text-sm text-gray-300">{message}</div>
          </div>
        </div>

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Ambulance size={20} />}
            label="Ambulance"
            value={emergencyActive ? "AMB-104" : "STANDBY"}
            sub={emergencyActive ? "Emergency detected" : "Monitoring"}
            active={emergencyActive}
          />

          <StatCard
            icon={<Clock3 size={20} />}
            label="Estimated ETA"
            value={backendData.eta ? `${backendData.eta} min` : "—"}
            sub="Optimal route"
          />

          <StatCard
            icon={<Gauge size={20} />}
            label="Traffic Density"
            value={
              backendData.traffic !== undefined
                ? `${backendData.traffic}%`
                : "—"
            }
            sub="Current road load"
          />

          <StatCard
            icon={<Brain size={20} />}
            label="AI Confidence"
            value={yoloConfidence ? `${yoloConfidence.toFixed(2)}%` : "—"}
            sub={yoloDetected ? "Vehicle candidate" : "AI Vision"}
            active={yoloDetected}
          />
        </div>

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid gap-6 xl:grid-cols-[1.65fr_0.8fr]">
          {/* =================================================
              MAP
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#080d14]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Navigation size={17} className="text-cyan-400" />

                <div>
                  <div className="text-sm font-semibold">Live Traffic Map</div>

                  <div className="text-[10px] uppercase tracking-widest text-gray-600">
                    Simulated city network
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Radio size={13} />
                REAL-TIME
              </div>
            </div>

            {/* MAP AREA */}

            <div className="relative h-[520px] overflow-hidden bg-[#071018]">
              {/* GRID */}

              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
                  backgroundSize: "45px 45px",
                }}
              />

              {/* ROADS */}

              <div className="absolute left-0 right-0 top-[50%] h-16 -translate-y-1/2 bg-[#151c25] border-y border-white/10" />

              <div className="absolute bottom-0 left-[48%] top-0 w-16 -translate-x-1/2 bg-[#151c25] border-x border-white/10" />

              <div className="absolute bottom-0 right-[25%] top-0 w-14 bg-[#151c25] border-x border-white/10" />

              <div className="absolute left-[25%] top-[50%] h-[55%] w-10 -translate-x-1/2 bg-[#151c25]" />

              {/* ROUTE GLOW */}

              {emergencyActive && (
                <div className="absolute left-[10%] right-[15%] top-[50%] h-1 -translate-y-1/2 bg-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.8)] transition-all duration-700" />
              )}

              {/* ROAD LABELS */}

              <div className="absolute left-8 top-[46%] text-[9px] font-semibold tracking-widest text-gray-600">
                CENTRAL ROAD
              </div>

              <div className="absolute left-[49%] top-5 -translate-x-1/2 text-[9px] font-semibold tracking-widest text-gray-600">
                MAIN JUNCTION
              </div>

              {/* JUNCTIONS */}

              <Junction left="25%" top="50%" active={signalsActive} />

              <Junction left="48%" top="50%" active={signalsActive} />

              <Junction left="72%" top="50%" active={signalsActive} />

              <Junction left="72%" top="72%" active={signalsActive} />

              {/* AMBULANCE */}

              <div
                className="absolute top-[50%] -translate-y-1/2 transition-all duration-[1500ms] ease-in-out"
                style={{
                  left: ambulanceArrived
                    ? "72%"
                    : simulationStep >= 3
                      ? "58%"
                      : "10%",
                }}
              >
                <div className="relative">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 shadow-xl ${
                      emergencyActive
                        ? "border-red-400 bg-red-500/20 shadow-red-500/30"
                        : "border-blue-400 bg-blue-500/20"
                    }`}
                  >
                    <Ambulance
                      size={22}
                      className={
                        emergencyActive ? "text-red-400" : "text-blue-400"
                      }
                    />
                  </div>

                  {emergencyActive && (
                    <div className="absolute -inset-2 -z-10 animate-ping rounded-xl bg-red-500/20" />
                  )}

                  <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-[9px] text-red-300">
                    AMB-104
                  </div>
                </div>
              </div>

              {/* HOSPITAL */}

              <div className="absolute right-[8%] top-[50%] -translate-y-1/2">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_25px_rgba(34,211,238,0.15)]">
                    <Hospital size={27} className="text-cyan-400" />
                  </div>

                  <div className="mt-2 text-[9px] font-semibold tracking-widest text-cyan-400">
                    CITY HOSPITAL
                  </div>
                </div>
              </div>

              {/* MAP LEGEND */}

              <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/50 p-3 backdrop-blur">
                <div className="mb-2 text-[9px] uppercase tracking-widest text-gray-500">
                  Legend
                </div>

                <div className="space-y-2">
                  <Legend dot="bg-red-400" label="Emergency route" />

                  <Legend dot="bg-green-400" label="Green signal" />

                  <Legend dot="bg-cyan-400" label="Hospital" />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT PANEL
          ================================================= */}

          <div className="space-y-6">
            {/* AI VISION */}

            <section className="rounded-2xl border border-white/10 bg-[#080d14] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                    <Brain size={18} className="text-purple-400" />
                  </div>

                  <div>
                    <div className="text-sm font-semibold">AI Vision</div>

                    <div className="text-[10px] uppercase tracking-widest text-gray-600">
                      YOLO Detection Engine
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-full px-2 py-1 text-[9px] ${
                    yoloDetected
                      ? "bg-green-500/10 text-green-400"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  {yoloDetected ? "DETECTED" : "STANDBY"}
                </div>
              </div>

              {/* VIDEO */}

              <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                <div className="relative">
                  <video
                    src="/videos/ambulance.mp4"
                    controls
                    muted
                    className="h-40 w-full object-cover"
                  />

                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/70 px-2 py-1 text-[9px] text-white">
                    <Video size={12} />
                    AMBULANCE FEED
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <AnalysisRow
                  label="Vehicle candidate"
                  value={yoloDetected ? detectedVehicle.toUpperCase() : "—"}
                  active={yoloDetected}
                />

                <AnalysisRow
                  label="AI confidence"
                  value={yoloConfidence ? `${yoloConfidence.toFixed(2)}%` : "—"}
                  active={yoloDetected}
                />

                <AnalysisRow
                  label="Frames analyzed"
                  value={yoloDetected ? "30" : "—"}
                />
              </div>
            </section>

            {/* CORRIDOR STATUS */}

            <section
              className={`rounded-2xl border p-5 transition-all ${
                corridorActive
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-white/10 bg-[#080d14]"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      corridorActive ? "bg-green-500/10" : "bg-white/5"
                    }`}
                  >
                    <Route
                      size={18}
                      className={
                        corridorActive ? "text-green-400" : "text-gray-500"
                      }
                    />
                  </div>

                  <div>
                    <div className="text-sm font-semibold">
                      Emergency Corridor
                    </div>

                    <div className="text-[10px] uppercase tracking-widest text-gray-600">
                      Route coordination
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs font-bold ${
                    corridorActive ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {corridorActive ? "ACTIVE" : "STANDBY"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MiniMetric
                  label="Signals"
                  value={backendData.signals ? `${backendData.signals}/4` : "—"}
                />

                <MiniMetric
                  label="Time Saved"
                  value={
                    backendData.timeSaved ? `${backendData.timeSaved} min` : "—"
                  }
                />
              </div>
            </section>

            {/* EVENT STREAM */}

            <section className="rounded-2xl border border-white/10 bg-[#080d14] p-5">
              <div className="mb-4 flex items-center gap-3">
                <Activity size={17} className="text-cyan-400" />

                <div>
                  <div className="text-sm font-semibold">Event Stream</div>

                  <div className="text-[10px] uppercase tracking-widest text-gray-600">
                    Live system events
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Event
                  active={simulationStep >= 1}
                  text="AI Vision monitoring road"
                />

                <Event
                  active={simulationStep >= 2}
                  text="Traffic density analyzed"
                />

                <Event
                  active={simulationStep >= 3}
                  text="Optimal route calculated"
                />

                <Event
                  active={simulationStep >= 4}
                  text="4 traffic signals coordinated"
                />

                <Event
                  active={simulationStep >= 5}
                  text="Emergency corridor activated"
                />

                <Event
                  active={simulationStep >= 6}
                  text="Ambulance reached hospital"
                />

                <Event
                  active={simulationStep >= 7}
                  text="Emergency corridor deactivated"
                />
              </div>
            </section>
          </div>
        </div>

        {/* ==================================================
            BOTTOM CONTROL PANEL
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#080d14] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrafficCone size={17} className="text-orange-400" />
                Emergency Response Simulation
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Run the complete AI detection and emergency corridor workflow.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetSimulation}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={15} />
                RESET
              </button>

              <button
                onClick={startSimulation}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-xs font-bold tracking-wide text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Activity size={16} className="animate-pulse" />
                    RUNNING...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    START EMERGENCY SIMULATION
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-5 flex flex-col items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-gray-700 md:flex-row">
          <div>E-CORRIDOR AI RESPONSE SYSTEM</div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={12} />
            Prototype • AI + Computer Vision
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
  sub,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        active
          ? "border-red-500/30 bg-red-500/5"
          : "border-white/10 bg-[#080d14]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-gray-500">{icon}</div>

        {active && (
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
        )}
      </div>

      <div className="mt-4 text-[10px] uppercase tracking-widest text-gray-600">
        {label}
      </div>

      <div className="mt-1 text-xl font-bold">{value}</div>

      <div className="mt-1 text-[10px] text-gray-500">{sub}</div>
    </div>
  );
}

// ============================================================
// JUNCTION
// ============================================================

function Junction({
  left,
  top,
  active,
}: {
  left: string;
  top: string;
  active: boolean;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left, top }}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
          active
            ? "border-green-400/50 bg-green-400/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >
        <div
          className={`h-3 w-3 rounded-full ${
            active
              ? "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]"
              : "bg-yellow-400"
          }`}
        />
      </div>
    </div>
  );
}

// ============================================================
// LEGEND
// ============================================================

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />

      <span className="text-[9px] text-gray-500">{label}</span>
    </div>
  );
}

// ============================================================
// ANALYSIS ROW
// ============================================================

function AnalysisRow({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-xs text-gray-500">{label}</span>

      <span
        className={`text-xs font-semibold ${
          active ? "text-green-400" : "text-gray-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// MINI METRIC
// ============================================================

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[9px] uppercase tracking-widest text-gray-600">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}

// ============================================================
// EVENT
// ============================================================

function Event({ active, text }: { active: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-3 text-xs transition-all ${
        active ? "text-gray-300" : "text-gray-700"
      }`}
    >
      <div
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-400" : "bg-gray-700"
        }`}
      />

      <span>{text}</span>

      {active && <CheckCircle2 size={12} className="ml-auto text-green-500" />}
    </div>
  );
}
