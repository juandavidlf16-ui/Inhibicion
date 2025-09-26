
import { useRef, useCallback } from 'react';

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

export const useSounds = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const moveSoundSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current && typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
            try {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser");
            }
        }
        return audioCtxRef.current;
    }, []);

    const playNote = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.5) => {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    }, [getAudioContext]);

    const playArpeggio = useCallback((notes: number[], duration: number, type: OscillatorType = 'sine') => {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;
        
        const noteDuration = duration / notes.length;
        notes.forEach((note, index) => {
             const osc = audioCtx.createOscillator();
             const gainNode = audioCtx.createGain();
             osc.type = type;
             osc.frequency.setValueAtTime(note, audioCtx.currentTime + index * noteDuration);
             gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime + index * noteDuration);
             gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (index + 1) * noteDuration);
             osc.connect(gainNode);
             gainNode.connect(audioCtx.destination);
             osc.start(audioCtx.currentTime + index * noteDuration);
             osc.stop(audioCtx.currentTime + (index + 1) * noteDuration);
        });
    }, [getAudioContext]);

    const playClick = useCallback(() => playNote(880, 0.1, 'triangle', 0.3), [playNote]);
    const playStart = useCallback(() => playArpeggio([261, 329, 392, 523], 0.4, 'square'), [playArpeggio]);
    const playGreenLight = useCallback(() => playNote(622.25, 0.2, 'sine', 0.4), [playNote]);
    const playRedLight = useCallback(() => playNote(207.65, 0.2, 'sine', 0.4), [playNote]);
    const playWin = useCallback(() => playArpeggio([523, 659, 784, 1046], 0.6, 'sawtooth'), [playArpeggio]);
    const playLose = useCallback(() => playArpeggio([392, 349, 311, 261], 0.8, 'square'), [playArpeggio]);
    const playCaught = useCallback(() => {
        playNote(155.56, 0.3, 'sawtooth');
        playNote(164.81, 0.3, 'sawtooth');
    }, [playNote]);
    
    const playMove = useCallback(() => {
        const audioCtx = getAudioContext();
        if (!audioCtx || (moveSoundSourceRef.current && moveSoundSourceRef.current.context.state === 'running')) return;

        const duration = 0.15;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        source.start();
        moveSoundSourceRef.current = source;
    }, [getAudioContext]);

    const stopMove = useCallback(() => {
        if (moveSoundSourceRef.current) {
            try {
                moveSoundSourceRef.current.stop();
                moveSoundSourceRef.current.disconnect();
            } catch (e) {
                 // Ignore errors from stopping an already stopped source
            } finally {
                moveSoundSourceRef.current = null;
            }
        }
    }, []);

    return { playClick, playStart, playGreenLight, playRedLight, playWin, playLose, playCaught, playMove, stopMove };
};
