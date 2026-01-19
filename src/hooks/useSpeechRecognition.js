import { useState, useCallback, useRef, useEffect } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  
  // Timing state
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Calculate duration in seconds
  const duration = startTime && endTime ? (endTime - startTime) / 1000 : null;

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStartTime(Date.now());
      setEndTime(null);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setEndTime(Date.now());
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Don't treat 'no-speech' as a fatal error
      if (event.error === 'no-speech') {
        return;
      }
      
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      setEndTime(Date.now());
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current = final.trim();
        setTranscript(final.trim());
      }
      setInterimTranscript(interim);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    // Reset transcripts and timing
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setStartTime(null);
    setEndTime(null);
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Recognition might already be running
      console.error('Start error:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Stop error:', err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setStartTime(null);
    setEndTime(null);
  }, []);

  // Combine final and interim for display
  const fullTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  return {
    isListening,
    transcript: fullTranscript.trim(),
    finalTranscript: transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    // Timing
    startTime,
    endTime,
    duration,
  };
}
