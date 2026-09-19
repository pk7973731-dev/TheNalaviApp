/**
 * Audio helpers for Nalavi:
 * - Speech-to-Text (STT) for Indian languages (Tamil, Hindi, Telugu, Kannada, English)
 * - Text-to-Speech (TTS) via Sarvam AI API (bulbul:v3 native Indian voices) or Browser SpeechSynthesis fallback
 */

export interface SpeechRecognitionResultEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

// Check browser SpeechRecognition availability
export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  const Win = window as any;
  const SpeechRec = Win.SpeechRecognition || Win.webkitSpeechRecognition;
  return SpeechRec ? new SpeechRec() : null;
}

let activeAudioElement: HTMLAudioElement | null = null;

export async function speakText(
  text: string,
  lang: string = 'ta',
  onEnd?: () => void
): Promise<void> {
  if (!text) {
    onEnd?.();
    return;
  }

  // Stop any active audio before playing next
  stopSpeaking();

  // Clean markdown and emojis for clean natural pronunciation
  const cleanText = text
    .replace(/[#*_~`]/g, '')
    .replace(/🚩|⚠️|🔸|🌾|📌|🎁|📋|📄|🏛️|📞|✅|❌|🛑|🎙️/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const langCodeMap: Record<string, string> = {
    ta: 'ta-IN',
    hi: 'hi-IN',
    en: 'en-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
  };
  const targetCode = langCodeMap[lang] || 'ta-IN';

  // 1. Try Sarvam AI TTS (using verified bulbul:v3 endpoint)
  try {
    const response = await fetch('/api/sarvam/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText.slice(0, 480), // Sarvam character threshold
        target_language_code: targetCode,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        activeAudioElement = audio;
        audio.onended = () => {
          activeAudioElement = null;
          onEnd?.();
        };
        audio.onerror = (e) => {
          console.warn('Sarvam Audio playback error, falling back to speech synthesis', e);
          activeAudioElement = null;
          fallbackBrowserSpeech(cleanText, targetCode, lang, onEnd);
        };
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('Sarvam TTS failed, switching to browser speech synthesis:', err);
  }

  // 2. Fallback to browser SpeechSynthesis
  fallbackBrowserSpeech(cleanText, targetCode, lang, onEnd);
}

function fallbackBrowserSpeech(
  cleanText: string,
  targetCode: string,
  lang: string,
  onEnd?: () => void
): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetCode;
    utterance.rate = 0.95; // comfortable pace for rural farmers
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) => v.lang === targetCode || v.lang.replace('_', '-').toLowerCase() === targetCode.toLowerCase() || v.lang.startsWith(lang)
    );
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      onEnd?.();
    };
    window.speechSynthesis.speak(utterance);
  } else {
    onEnd?.();
  }
}

export function stopSpeaking(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (e) {}
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
