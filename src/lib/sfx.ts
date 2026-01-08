// Simple WebAudio SFX helpers (no external assets)

let audioCtx: AudioContext | null = null;

const getCtx = async (): Promise<AudioContext> => {
  const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch {
      // ignore
    }
  }
  return audioCtx;
};

const playTone = async (opts: {
  frequency: number;
  durationMs: number;
  type?: OscillatorType;
  gain?: number;
  startInMs?: number;
}) => {
  const ctx = await getCtx();
  const now = ctx.currentTime;
  const startAt = now + (opts.startInMs ?? 0) / 1000;
  const dur = opts.durationMs / 1000;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.frequency, startAt);

  const peak = opts.gain ?? 0.08;
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(peak, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startAt);
  osc.stop(startAt + dur + 0.02);
};

export const sfx = {
  click: () => {
    // short, soft click
    void playTone({ frequency: 520, durationMs: 30, type: "triangle", gain: 0.035 });
  },
  purchase: () => {
    // two-note "bop"
    void playTone({ frequency: 660, durationMs: 60, type: "sine", gain: 0.07 });
    void playTone({ frequency: 880, durationMs: 70, type: "sine", gain: 0.07, startInMs: 70 });
  },
  complete: () => {
    // tiny celebratory arpeggio
    void playTone({ frequency: 523.25, durationMs: 90, gain: 0.08 });
    void playTone({ frequency: 659.25, durationMs: 90, gain: 0.08, startInMs: 90 });
    void playTone({ frequency: 783.99, durationMs: 140, gain: 0.08, startInMs: 180 });
  },
  redeem: () => {
    void playTone({ frequency: 784, durationMs: 90, gain: 0.08 });
    void playTone({ frequency: 988, durationMs: 130, gain: 0.08, startInMs: 90 });
  },
  notify: () => {
    void playTone({ frequency: 740, durationMs: 60, type: "sine", gain: 0.06 });
  },
};
