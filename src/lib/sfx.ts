import { playEliteTone } from './audioEngine';

export const sfx = {
  click: () => { void playEliteTone({ freq: 380, duration: 0.08, gain: 0.04, resonance: 0.5 }); },
  purchase: () => { void playEliteTone({ freq: 440, duration: 0.15, gain: 0.06, harmonics: true }); void playEliteTone({ freq: 659.25, duration: 0.2, gain: 0.05, harmonics: true, startDelay: 0.05 }); },
  complete: () => { [261.63, 329.63, 392.00, 523.25, 659.25].forEach((f, i) => { void playEliteTone({ freq: f, duration: 0.8, gain: 0.04, startDelay: i * 0.04, harmonics: true, resonance: 2, attack: 0.05 }); }); },
  redeem: () => { void playEliteTone({ freq: 880, duration: 0.4, type: "sine", gain: 0.05, harmonics: true }); void playEliteTone({ freq: 1318.51, duration: 0.6, type: "sine", gain: 0.02, startDelay: 0.05, resonance: 10 }); },
  notify: () => { void playEliteTone({ freq: 523.25, duration: 0.2, gain: 0.05, attack: 0.02 }); void playEliteTone({ freq: 392.00, duration: 0.25, gain: 0.05, startDelay: 0.12 }); },
  failure: () => { void playEliteTone({ freq: 220, duration: 0.4, type: "sawtooth", gain: 0.03, resonance: 10 }); void playEliteTone({ freq: 110, duration: 0.6, type: "sine", gain: 0.05, startDelay: 0.1 }); },
  milestone: () => { [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => { void playEliteTone({ freq: f, duration: 0.5, gain: 0.04, startDelay: i * 0.1, harmonics: true, resonance: 4, attack: 0.05 }); }); setTimeout(() => sfx.sparkle(), 400); },
  sparkle: () => { for(let i=0; i<8; i++) { void playEliteTone({ freq: 1200 + Math.random() * 2500, duration: 0.15, gain: 0.015, startDelay: i * 0.02, resonance: 8 }); } },
  trash: () => { void playEliteTone({ freq: 150, duration: 0.2, type: "sawtooth", gain: 0.03, resonance: 0.5 }); void playEliteTone({ freq: 100, duration: 0.3, type: "sine", gain: 0.04, startDelay: 0.05 }); }
};
