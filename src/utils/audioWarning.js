// Audio Warning Engine - Minimalist, high-efficiency synthesizers
// Uses Web Audio API for synthesized sounds (zero network load) and Web Speech API for TTS.

let audioCtx = null;
const spokenHazards = new Set(); // Prevent spamming warnings for the same hazard

// Initialise Audio Context on user interaction
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a futuristic radar-like alarm sweep (Beep-Beep)
 */
export function playAlertSynth() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First chirp
    createChirp(ctx, now);
    // Second chirp slightly delayed
    createChirp(ctx, now + 0.15);
  } catch (err) {
    console.error("Failed to play synthesized alert:", err);
  }
}

function createChirp(ctx, startTime) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Futuristic chirpy sound using a fast exponential sweep
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, startTime); // A5 note
  osc.frequency.exponentialRampToValueAtTime(1760, startTime + 0.1); // Octave up

  gain.gain.setValueAtTime(0.15, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

  osc.start(startTime);
  osc.stop(startTime + 0.13);
}

/**
 * Speaks a warning message using Web Speech API (Indonesian primary, fallback English)
 * @param {string} text 
 * @param {string} hazardId
 */
export function speakWarning(text, hazardId) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported on this browser.");
    return;
  }

  // Prevent repeat warnings for the same hazard in a 1-minute window
  if (hazardId && spokenHazards.has(hazardId)) {
    return;
  }

  if (hazardId) {
    spokenHazards.add(hazardId);
    // Automatically clear from cache after 60 seconds
    setTimeout(() => {
      spokenHazards.delete(hazardId);
    }, 60000);
  }

  // Cancel any ongoing speech to prioritize the warning
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.1; // Slightly higher pitch for futuristic synth-voice feel

  // Try to find an Indonesian voice, fallback to default
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(voice => voice.lang.includes('id') || voice.lang.includes('ID'));
  if (idVoice) {
    utterance.voice = idVoice;
    utterance.lang = 'id-ID';
  } else {
    utterance.lang = 'en-US';
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Reset spoken hazards history (e.g. when resetting route)
 */
export function resetWarningCache() {
  spokenHazards.clear();
}
