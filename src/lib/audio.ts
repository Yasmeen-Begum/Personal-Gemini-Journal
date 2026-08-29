/**
 * Audio Synthesizer & Speech Recognition Engine
 */

export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // Stop any active speech

  const cleanText = text
    .replace(/[#*`_~>[\]]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .slice(0, 1500);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Pick an English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')));
  if (naturalVoice) utterance.voice = naturalVoice;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser Web Speech API helper
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let current = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      current += event.results[i][0].transcript;
    }
    onResult(current);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
