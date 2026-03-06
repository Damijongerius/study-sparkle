let audioCtx: AudioContext | null = null;

export const getCtx = async (): Promise<AudioContext> => {
  const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") try { await audioCtx.resume(); } catch { /* ignore */ }
  return audioCtx;
};

export const playEliteTone = async (opts: { freq: number; duration: number; type?: OscillatorType; gain?: number; attack?: number; resonance?: number; harmonics?: boolean; startDelay?: number; }) => {
  const ctx = await getCtx();
  const now = ctx.currentTime + (opts.startDelay || 0);
  const dur = opts.duration;
  const attack = opts.attack ?? 0.01;
  const masterGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(opts.freq * 3, now);
  filter.frequency.exponentialRampToValueAtTime(opts.freq * 0.8, now + dur);
  filter.Q.setValueAtTime(opts.resonance ?? 3, now);
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.linearRampToValueAtTime(opts.gain ?? 0.1, now + attack);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  const createOsc = (f: number, t: OscillatorType, g: number) => {
    const osc = ctx.createOscillator(); const oscGain = ctx.createGain();
    osc.type = t; osc.frequency.setValueAtTime(f, now);
    oscGain.gain.value = g; osc.connect(oscGain); oscGain.connect(filter);
    osc.start(now); osc.stop(now + dur + 0.1);
  };
  createOsc(opts.freq, opts.type ?? "sine", 1);
  if (opts.harmonics) { createOsc(opts.freq * 1.5, "triangle", 0.15); createOsc(opts.freq * 2.0, "sine", 0.1); }
  filter.connect(masterGain); masterGain.connect(ctx.destination);
};
