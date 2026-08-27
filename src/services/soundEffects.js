// FITUP Web Audio API Sound Synthesizer
let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

export const soundEffects = {
    // Subtle, high-tech button click tone
    playClick() {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) {
            // Audio context fallback safeguard
        }
    },

    // Success chord chime for verification & payout approvals (C5 -> E5 -> G5 -> C6)
    playSuccessChime() {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                const startTime = ctx.currentTime + index * 0.08;
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.12, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.3);
            });
        } catch (e) {}
    },

    // Error tone for wrong password or invalid input
    playError() {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            [220, 180].forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const startTime = ctx.currentTime + index * 0.1;

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.12);
            });
        } catch (e) {}
    },

    // Pulsing scanner audio tone during OCR verification
    playScanBeep() {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.06);
        } catch (e) {}
    }
};
