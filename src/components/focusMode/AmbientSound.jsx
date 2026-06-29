import { useEffect, useRef, useCallback } from 'react';

const useAmbientSound = () => {
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const isPlayingRef = useRef(false);

  const stop = useCallback(() => {
    if (!audioCtxRef.current) return;
    nodesRef.current.forEach((node) => {
      try {
        node.stop?.();
        node.disconnect?.();
      } catch {
        // ignore
      }
    });
    nodesRef.current = [];
    isPlayingRef.current = false;
  }, []);

  const createNoiseBuffer = (ctx) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const playWhiteNoise = (ctx) => {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    nodesRef.current.push(source, gain);
  };

  const playOcean = (ctx) => {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    lfo.start();
    nodesRef.current.push(source, lfo, filter, gain, lfoGain);
  };

  const playRainforest = (ctx) => {
    playWhiteNoise(ctx);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 180;
    const gain = ctx.createGain();
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    nodesRef.current.push(osc, gain);
  };

  const playBirds = (ctx) => {
    const playChirp = () => {
      if (!isPlayingRef.current) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const freq = 800 + Math.random() * 1200;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      nodesRef.current.push(osc, gain);
      const next = 1 + Math.random() * 3;
      setTimeout(playChirp, next * 1000);
    };
    playChirp();
  };

  const play = useCallback((sound) => {
    stop();
    if (!sound || sound === 'none') return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    audioCtxRef.current.resume().then(() => {
      isPlayingRef.current = true;
      if (sound === 'noise') playWhiteNoise(audioCtxRef.current);
      else if (sound === 'ocean') playOcean(audioCtxRef.current);
      else if (sound === 'rainforest') playRainforest(audioCtxRef.current);
      else if (sound === 'birds') playBirds(audioCtxRef.current);
    });
  }, [stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { play, stop };
};

export default useAmbientSound;
