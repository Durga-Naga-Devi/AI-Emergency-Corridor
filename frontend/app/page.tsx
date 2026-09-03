"use client";

import { useEffect, useState } from "react";
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

const API_URL = "https://ai-emergency-corridor-production.up.railway.app";

type BackendData = {
  eta?: number;
  confidence?: number;
  traffic?: number;
  signals?: number;
  timeSaved?: number;
  detectedVehicle?: string;
};

type EventProps = {
  active: boolean;
  text: string;
};

function Event({ active, text }: EventProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-all ${
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-slate-200"
          : "border-slate-800 bg-slate-900/40 text-slate-600"
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full ${
          active
            ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            : "bg-slate-700"
        }`}
      />

      <span className="text-xs">{text}</span>

      {active && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />}
    </div>
  );
}

function Junction({
  left,
  top,
  active,
  label,
}: {
  left: string;
  top: string;
  active: boolean;
  label: string;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left, top }}
    >
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
            active
              ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_18px_rgba(52,211,153,0.45)]"
              : "border-slate-600 bg-slate-800"
          }`}
        >
          <TrafficCone
            className={`h-4 w-4 ${
              active ? "text-emerald-300" : "text-slate-500"
            }`}
          />
        </div>

        <span className="whitespace-nowrap text-[9px] font-medium text-slate-500">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("Waiting for emergency...");
  const [backendData, setBackendData] = useState<BackendData>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const corridorActive = simulationStep >= 5 && simulationStep < 7;
  const signalsActive = simulationStep >= 4 && simulationStep < 7;
  const ambulanceArrived = simulationStep >= 6;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startSimulation = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setEmergencyActive(true);
    setElapsedSeconds(0);
    setSimulationStep(1);
    setMessage("AI Vision monitoring road...");

    try {
      const detectResponse = await fetch(`${API_URL}/detect`);

      if (detectResponse.ok) {
        const detectData = await detectResponse.json();

        setBackendData((previous) => ({
          ...previous,
          confidence: detectData.confidence,
          detectedVehicle: detectData.detected_vehicle,
        }));
      }
    } catch (error) {
      console.error("Detection API error:", error);
      setMessage("AI detection running in simulation mode...");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSimulationStep(2);
    setMessage("Analyzing traffic density...");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSimulationStep(3);
    setMessage("Calculating optimal emergency route...");

    try {
      const emergencyResponse = await fetch(`${API_URL}/emergency`, {
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

      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json();

        setBackendData((previous) => ({
          ...previous,
          eta: emergencyData.route?.eta_minutes,
          timeSaved: emergencyData.route?.time_saved_minutes,
          traffic: emergencyData.traffic_analysis?.density,
          signals: emergencyData.signals?.coordinated,
          confidence: emergencyData.ai_confidence ?? previous.confidence,
        }));
      }
    } catch (error) {
      console.error("Emergency API error:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSimulationStep(4);
    setMessage("Coordinating 4 traffic signals...");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSimulationStep(5);
    setMessage("Emergency corridor activated.");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    setSimulationStep(6);
    setMessage("Ambulance reached City Hospital.");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await fetch(`${API_URL}/deactivate`, {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Deactivation request failed");
      }
    } catch (error) {
      console.error("Deactivation API error:", error);
    }

    setSimulationStep(7);
    setMessage("Emergency completed — traffic signals restored.");
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setEmergencyActive(false);
    setSimulationStep(0);
    setIsRunning(false);
    setElapsedSeconds(0);
    setBackendData({});
    setMessage("Waiting for emergency...");
  };

  const displayConfidence =
    backendData.confidence !== undefined
      ? `${backendData.confidence.toFixed(2)}%`
      : "--";

  const displayEta =
    backendData.eta !== undefined
      ? `${backendData.eta.toFixed(2)} min`
      : "6.42 min";

  const displayTraffic =
    backendData.traffic !== undefined ? `${backendData.traffic}%` : "42%";

  const displaySignals = signalsActive
    ? `${backendData.signals ?? 4}/4`
    : "0/4";

  const displayTimeSaved =
    backendData.timeSaved !== undefined
      ? `${backendData.timeSaved} min`
      : "8 min";

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-[#070a0f]/95">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
              <Siren className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-[0.2em]">
                  E-CORRIDOR
                </h1>

                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400">
                  LIVE
                </span>
              </div>

              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                AI Emergency Traffic Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <Wifi className="h-4 w-4 text-emerald-400" />
              System Online
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Radio className="h-4 w-4" />
              Emergency Operations Center
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        {/* TITLE */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Emergency Response System
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight">
            Emergency Corridor Control
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            AI-powered ambulance detection, route optimization and traffic
            signal coordination
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-red-500/20 bg-[#0a0d12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Emergency Status
              </span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>

            <div className="text-xl font-bold text-red-400">
              {emergencyActive ? "EMERGENCY DETECTED" : "STANDBY"}
            </div>

            <p className="mt-1 text-xs text-slate-600">
              {emergencyActive
                ? "Emergency response active"
                : "Waiting for emergency"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a0d12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Ambulance
              </span>
              <Ambulance className="h-4 w-4 text-red-400" />
            </div>

            <div className="text-xl font-bold">AMB-104</div>

            <p className="mt-1 text-xs text-slate-600">
              {emergencyActive ? "Emergency detected" : "Standby vehicle"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a0d12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Estimated ETA
              </span>
              <Clock3 className="h-4 w-4 text-cyan-400" />
            </div>

            <div className="text-xl font-bold text-cyan-400">{displayEta}</div>

            <p className="mt-1 text-xs text-slate-600">Optimal route</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a0d12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Traffic Density
              </span>
              <Gauge className="h-4 w-4 text-amber-400" />
            </div>

            <div className="text-xl font-bold text-amber-400">
              {displayTraffic}
            </div>

            <p className="mt-1 text-xs text-slate-600">Current road load</p>
          </div>
        </div>

        {/* SECONDARY STATS */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-[#0a0d12] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  AI Confidence
                </p>

                <p className="mt-2 text-2xl font-bold text-violet-400">
                  {displayConfidence}
                </p>

                <p className="mt-1 text-xs text-slate-600">Vehicle candidate</p>
              </div>

              <Brain className="h-6 w-6 text-violet-400" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a0d12] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Elapsed Response Time
                </p>

                <p className="mt-2 text-2xl font-bold text-cyan-400">
                  {elapsedSeconds}s
                </p>

                <p className="mt-1 text-xs text-slate-600">Simulation timer</p>
              </div>

              <Clock3 className="h-6 w-6 text-cyan-400" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a0d12] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Vehicle Candidate
                </p>

                <p className="mt-2 text-2xl font-bold uppercase text-slate-200">
                  {backendData.detectedVehicle ?? "TRUCK"}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  YOLO detection result
                </p>
              </div>

              <Navigation className="h-6 w-6 text-slate-400" />
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* MAP */}
            <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0a0d12]">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    Live Traffic Map
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Simulated city network
                  </p>
                </div>

                <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  REAL-TIME
                </span>
              </div>

              <div className="relative h-[470px] overflow-hidden bg-[#080b10]">
                {/* ROAD NETWORK */}
                <div className="absolute left-0 right-0 top-1/2 h-20 -translate-y-1/2 bg-[#11161d]" />
                <div className="absolute bottom-0 left-[72%] top-0 w-20 -translate-x-1/2 bg-[#11161d]" />

                <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-700" />
                <div className="absolute bottom-0 left-[72%] top-0 border-l border-dashed border-slate-700" />

                {/* ROUTE */}
                <div
                  className={`absolute left-[10%] top-1/2 h-1 -translate-y-1/2 rounded-full transition-all duration-1000 ${
                    simulationStep >= 3
                      ? "w-[62%] bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.65)]"
                      : "w-0"
                  }`}
                />

                <div
                  className={`absolute left-[72%] top-1/2 h-[22%] w-1 bg-emerald-400 transition-all duration-1000 ${
                    simulationStep >= 3
                      ? "opacity-100 shadow-[0_0_14px_rgba(52,211,153,0.65)]"
                      : "opacity-0"
                  }`}
                />

                {/* ROAD LABELS */}
                <div className="absolute left-[18%] top-[43%] text-[9px] font-semibold tracking-widest text-slate-600">
                  CENTRAL ROAD
                </div>

                <div className="absolute left-[43%] top-[43%] text-[9px] font-semibold tracking-widest text-slate-600">
                  MAIN JUNCTION
                </div>

                {/* JUNCTIONS */}
                <Junction
                  left="25%"
                  top="50%"
                  active={simulationStep >= 4}
                  label="SIG-01"
                />

                <Junction
                  left="48%"
                  top="50%"
                  active={simulationStep >= 4}
                  label="SIG-02"
                />

                <Junction
                  left="72%"
                  top="50%"
                  active={simulationStep >= 4}
                  label="SIG-03"
                />

                <Junction
                  left="72%"
                  top="72%"
                  active={simulationStep >= 4}
                  label="SIG-04"
                />

                {/* AMBULANCE */}
                <div
                  className="absolute top-[calc(50%-20px)] z-20 transition-all duration-[3000ms] ease-in-out"
                  style={{
                    left: ambulanceArrived
                      ? "68%"
                      : simulationStep >= 3
                        ? "58%"
                        : "10%",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/50 bg-red-500/20 shadow-[0_0_20px_rgba(248,113,113,0.45)]">
                      <Ambulance className="h-6 w-6 text-red-300" />
                    </div>

                    <span className="mt-1 rounded bg-slate-950/90 px-1.5 py-0.5 text-[8px] font-bold text-red-300">
                      AMB-104
                    </span>
                  </div>
                </div>

                {/* HOSPITAL */}
                <div className="absolute left-[72%] top-[78%] -translate-x-1/2">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <Hospital className="h-6 w-6 text-cyan-300" />
                    </div>

                    <span className="mt-1 text-[9px] font-bold tracking-wider text-cyan-300">
                      CITY HOSPITAL
                    </span>
                  </div>
                </div>

                {/* MAP STATUS */}
                <div className="absolute left-4 top-4 rounded-lg border border-slate-800 bg-black/50 px-3 py-2 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        corridorActive
                          ? "animate-pulse bg-red-400"
                          : "bg-slate-600"
                      }`}
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {corridorActive
                        ? "Emergency Corridor Active"
                        : "Network Monitoring"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 border-t border-slate-800 px-5 py-3">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="h-2 w-5 rounded bg-emerald-400" />
                  Emergency route
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Green signal
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Hospital className="h-3 w-3 text-cyan-400" />
                  Hospital
                </div>
              </div>
            </section>

            {/* VIDEO */}
            <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0a0d12]">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Video className="h-4 w-4 text-red-400" />
                    Ambulance Feed
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Computer vision input
                  </p>
                </div>

                <span className="text-[9px] font-bold text-red-400">
                  YOLO INPUT
                </span>
              </div>

              <div className="bg-black">
                <video
                  src="/videos/ambulance.mp4"
                  controls
                  muted
                  playsInline
                  className="max-h-[430px] w-full object-contain"
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* AI VISION */}
            <section className="rounded-xl border border-violet-500/20 bg-[#0a0d12]">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Brain className="h-4 w-4 text-violet-400" />
                    AI Vision
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-600">
                    YOLO Detection Engine
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                    emergencyActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {emergencyActive ? "DETECTED" : "STANDBY"}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Vehicle candidate
                    </span>

                    <Ambulance className="h-4 w-4 text-red-400" />
                  </div>

                  <div className="text-lg font-bold uppercase">
                    {backendData.detectedVehicle ?? "TRUCK"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      AI confidence
                    </p>

                    <p className="mt-2 text-xl font-bold text-violet-400">
                      {displayConfidence}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Frames analyzed
                    </p>

                    <p className="mt-2 text-xl font-bold text-cyan-400">30</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CORRIDOR */}
            <section className="rounded-xl border border-slate-800 bg-[#0a0d12]">
              <div className="border-b border-slate-800 px-5 py-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Route className="h-4 w-4 text-emerald-400" />
                  Emergency Corridor
                </h3>

                <p className="mt-1 text-[10px] text-slate-600">
                  Route coordination
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Status
                  </p>

                  <p
                    className={`mt-2 text-lg font-bold ${
                      corridorActive
                        ? "text-emerald-400"
                        : simulationStep >= 7
                          ? "text-slate-400"
                          : "text-amber-400"
                    }`}
                  >
                    {corridorActive
                      ? "ACTIVE"
                      : simulationStep >= 7
                        ? "COMPLETED"
                        : "STANDBY"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Signals
                  </p>

                  <p className="mt-2 text-lg font-bold text-emerald-400">
                    {displaySignals}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Time Saved
                  </p>

                  <p className="mt-2 text-lg font-bold text-cyan-400">
                    {displayTimeSaved}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Route
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    4.8 km
                  </p>
                </div>
              </div>
            </section>

            {/* EVENTS */}
            <section className="rounded-xl border border-slate-800 bg-[#0a0d12]">
              <div className="border-b border-slate-800 px-5 py-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Event Stream
                </h3>

                <p className="mt-1 text-[10px] text-slate-600">
                  Live system events
                </p>
              </div>

              <div className="space-y-2 p-4">
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

        {/* CONTROL */}
        <section className="mt-6 rounded-xl border border-red-500/20 bg-[#0a0d12] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-400" />

                <h3 className="font-semibold">Emergency Response Simulation</h3>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Run the complete AI detection and emergency corridor workflow.
              </p>

              <p className="mt-2 text-xs text-slate-600">{message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetSimulation}
                disabled={isRunning}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-xs font-semibold text-slate-400 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                RESET
              </button>

              <button
                onClick={startSimulation}
                disabled={isRunning}
                className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-6 py-3 text-xs font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isRunning ? (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    SIMULATION RUNNING
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    START EMERGENCY SIMULATION
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col gap-2 border-t border-slate-900 py-6 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>E-CORRIDOR AI RESPONSE SYSTEM</span>

          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" />
            Prototype • AI + Computer Vision
          </span>
        </footer>
      </div>
    </main>
  );
}
