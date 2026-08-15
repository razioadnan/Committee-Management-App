class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private customGavelAudioBase64: string | null = null;
  private customAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('moic_custom_gavel_audio');
        if (saved) {
          this.customGavelAudioBase64 = saved;
          this.customAudioElement = new Audio(saved);
        }
      } catch {
        // ignore
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setCustomGavelAudio(base64Data: string | null) {
    this.customGavelAudioBase64 = base64Data;
    if (base64Data) {
      this.customAudioElement = new Audio(base64Data);
      try {
        localStorage.setItem('moic_custom_gavel_audio', base64Data);
      } catch {
        // ignore
      }
    } else {
      this.customAudioElement = null;
      try {
        localStorage.removeItem('moic_custom_gavel_audio');
      } catch {
        // ignore
      }
    }
  }

  public getCustomGavelAudio(): string | null {
    return this.customGavelAudioBase64;
  }

  // Realistic Solid Hardwood Diplomatic Gavel Strike
  public playGavel() {
    if (this.isMuted) return;

    // If a custom audio file was uploaded, play it directly
    if (this.customAudioElement) {
      try {
        this.customAudioElement.currentTime = 0;
        this.customAudioElement.play().catch(() => {
          this.playSynthesizedGavel();
        });
        return;
      } catch {
        // fallback
      }
    }

    this.playSynthesizedGavel();
  }

  private playSynthesizedGavel() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Authentic 3-strike solid wood gavel sequence
      this.synthesizeWoodKnock(t, 1.0, 120);
      this.synthesizeWoodKnock(t + 0.22, 0.9, 125);
      this.synthesizeWoodKnock(t + 0.46, 1.15, 115);
    } catch {
      // Audio fallback
    }
  }

  private synthesizeWoodKnock(startTime: number, volume: number = 1.0, baseFreq: number = 120) {
    if (!this.ctx) return;

    // 1. Heavy resonant wood soundboard thump (body)
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(baseFreq, startTime);
    bodyOsc.frequency.exponentialRampToValueAtTime(35, startTime + 0.14);

    bodyGain.gain.setValueAtTime(0.85 * volume, startTime);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start(startTime);
    bodyOsc.stop(startTime + 0.19);

    // 2. Mid-harmonic crack (hardwood hammer face impact)
    const midOsc = this.ctx.createOscillator();
    const midGain = this.ctx.createGain();
    midOsc.type = 'sine';
    midOsc.frequency.setValueAtTime(baseFreq * 2.8, startTime);
    midOsc.frequency.exponentialRampToValueAtTime(80, startTime + 0.08);

    midGain.gain.setValueAtTime(0.6 * volume, startTime);
    midGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

    midOsc.connect(midGain);
    midGain.connect(this.ctx.destination);
    midOsc.start(startTime);
    midOsc.stop(startTime + 0.1);

    // 3. Acoustic noise transient (sharp mechanical click / impact burst)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05); // 50ms noise
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, startTime);
    filter.Q.setValueAtTime(3.5, startTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9 * volume, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + 0.06);
  }

  // Elegant brass/crystal chime when timer expires
  public playTimerEnd() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.12);

        gain.gain.setValueAtTime(0.35, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 1.3);
      });
    } catch {
      // Ignore
    }
  }

  // Warning chime at 10 seconds remaining
  public playWarningTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch {
      // Ignore
    }
  }

  // Success chord when motion or resolution passes
  public playSuccessFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        gain.gain.setValueAtTime(0.3, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.85);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
