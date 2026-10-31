/**
 * UNMESS Ambient Soundscape Synthesizer
 * Uses native Web Audio API to generate zero-latency, offline focus audio:
 * - Rain (filtered noise with drops)
 * - 40Hz Binaural Beat (gamma wave focus)
 * - Brown Noise (deep cognitive calm)
 */

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
    this.currentTrack = 'none';
    this.volume = 0.5;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  stop() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.currentTrack = 'none';
    this.isPlaying = false;
  }

  playTrack(trackName) {
    this.init();
    if (!this.ctx) return;
    this.stop();

    if (trackName === 'none') return;

    this.currentTrack = trackName;
    this.isPlaying = true;

    if (trackName === 'binaural') {
      this.createBinauralBeats();
    } else if (trackName === 'rain') {
      this.createRainEffect();
    } else if (trackName === 'brown') {
      this.createBrownNoise();
    }
  }

  createBinauralBeats() {
    // 200Hz in left ear, 240Hz in right ear -> 40Hz Gamma Focus
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(240, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    osc1.connect(merger, 0, 0);
    osc2.connect(merger, 0, 1);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    merger.connect(subGain);
    subGain.connect(this.gainNode);

    osc1.start();
    osc2.start();

    this.activeNodes.push(osc1, osc2, merger, subGain);
  }

  createBrownNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNode);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, noiseGain);
  }

  createRainEffect() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.gainNode);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }
}

export const ambientSound = new AmbientSoundEngine();

