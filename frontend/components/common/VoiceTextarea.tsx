'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

// TypeScript declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  minLength?: number;
}

export default function VoiceTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 8,
  minLength
}: VoiceTextareaProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const baseValueRef = useRef<string>(''); // Track value when recording starts
  const lastResultIndexRef = useRef<number>(0); // Track last processed result index

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
    }

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const createRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const Recognition = SpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Use en-US for better browser support, fallback to en-GB or en-IN
    recognition.lang = 'en-US'; // More widely supported

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process only new results (from resultIndex onwards, but ensure we don't process same results twice)
      const startIndex = Math.max(event.resultIndex, lastResultIndexRef.current);
      
      for (let i = startIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update last processed index
      lastResultIndexRef.current = event.results.length;

      // Accumulate final transcripts
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }

      // Show interim transcript for real-time feedback
      setTranscript(interimTranscript);

      // Update textarea: append voice transcript to base value
      // Always use baseValueRef to avoid duplication - never fall back to value
      const baseValue = baseValueRef.current;
      const voiceText = finalTranscriptRef.current + interimTranscript;
      const newValue = baseValue + voiceText;
      
      // Only update if it's different to avoid cursor jumping
      if (newValue !== value) {
        onChange(newValue);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // No speech detected, but keep listening
        return;
      }
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings and try again.');
        setIsListening(false);
        finalTranscriptRef.current = '';
        setTranscript('');
      } else if (event.error === 'network') {
        alert('Network error. Please check your internet connection and try again.');
        setIsListening(false);
        finalTranscriptRef.current = '';
        setTranscript('');
      } else if (event.error === 'aborted') {
        // User stopped manually, don't show error
        setIsListening(false);
      } else {
        // Other errors - try to continue but log
        console.warn('Speech recognition error (continuing):', event.error);
      }
    };

    recognition.onend = () => {
      // Don't add transcript here - it's already been added in onresult
      // Just clear state if we're not supposed to be listening
      if (!isListening) {
        finalTranscriptRef.current = '';
        setTranscript('');
      }
    };

    return recognition;
  };

  const startListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, Safari, or a Chromium-based browser.');
      return;
    }

    // Request microphone permission explicitly
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .catch(() => {
          alert('Microphone access is required for voice input. Please allow microphone access and try again.');
        });
    }

    try {
      // Stop and cleanup any existing recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors if already stopped
        }
        recognitionRef.current = null;
      }
      
      // Preserve existing text when starting a new recording (append mode)
      baseValueRef.current = value || '';
      
      // Reset state
      finalTranscriptRef.current = '';
      setTranscript('');
      lastResultIndexRef.current = 0;
      
      // Create a new recognition instance (required for restart)
      const newRecognition = createRecognition();
      if (!newRecognition) {
        alert('Could not initialize speech recognition.');
        return;
      }
      
      recognitionRef.current = newRecognition;
      
      // Start fresh recognition
      setTimeout(() => {
        try {
          if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
          }
        } catch (error: any) {
          // Handle "already started" error by creating a new instance
          if (error.name === 'InvalidStateError' || error.message?.includes('started')) {
            const freshRecognition = createRecognition();
            if (freshRecognition) {
              recognitionRef.current = freshRecognition;
              freshRecognition.start();
              setIsListening(true);
            }
          } else {
            console.error('Error starting speech recognition:', error);
            alert('Could not start voice input. Please check your microphone permissions.');
            setIsListening(false);
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Could not start voice input. Please check your microphone permissions.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    // Stop recognition immediately
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort(); // Force stop
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      // Clear the reference so we can create a new one next time
      recognitionRef.current = null;
    }
    
    // Don't add transcript here - it's already been added in onresult
    // The value already contains all final transcripts
    
    // Clear state
    setIsListening(false);
    finalTranscriptRef.current = '';
    setTranscript('');
    lastResultIndexRef.current = 0;
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => {
          // Allow manual editing - update value directly
          const newValue = e.target.value;
          onChange(newValue);
          // Update base value when user types manually during recording
          if (isListening) {
            // Remove voice transcript from the value to get the base
            const voiceText = finalTranscriptRef.current + transcript;
            if (newValue.endsWith(voiceText)) {
              baseValueRef.current = newValue.slice(0, -voiceText.length);
            } else {
              // User edited the text, use current value as new base
              baseValueRef.current = newValue;
              finalTranscriptRef.current = '';
              setTranscript('');
            }
          }
        }}
        placeholder={placeholder}
        rows={rows}
        className={`relative w-full p-4 pb-20 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E91E63] resize-none text-gray-900 transition-all cursor-text ${className} ${
          isListening 
            ? 'border-red-500' 
            : 'border-gray-300'
        }`}
      />
      
      {isSupported && (
        <>
          {/* Refined Mic/Stop Button with Aesthetic Ring Effects */}
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 ${isListening ? 'z-20' : 'z-10'}`}>
            {/* Subtle Concentric Rings - Only around stop button */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Ring 1 - Subtle outer */}
                <div 
                  className="absolute w-14 h-14 rounded-full border border-red-400/30 animate-ring-expand"
                  style={{
                    animationDelay: '0s'
                  }}
                ></div>
                {/* Ring 2 - Medium */}
                <div 
                  className="absolute w-12 h-12 rounded-full border border-red-500/40 animate-ring-expand"
                  style={{
                    animationDelay: '0s'
                  }}
                ></div>
                
                {/* Ring 3 - Second set */}
                <div 
                  className="absolute w-14 h-14 rounded-full border border-red-400/30 animate-ring-expand"
                  style={{ 
                    animationDelay: '0.6s'
                  }}
                ></div>
                <div 
                  className="absolute w-12 h-12 rounded-full border border-red-500/40 animate-ring-expand"
                  style={{ 
                    animationDelay: '0.6s'
                  }}
                ></div>
                
                {/* Ring 4 - Third set */}
                <div 
                  className="absolute w-14 h-14 rounded-full border border-red-400/30 animate-ring-expand"
                  style={{ 
                    animationDelay: '1.2s'
                  }}
                ></div>
                <div 
                  className="absolute w-12 h-12 rounded-full border border-red-500/40 animate-ring-expand"
                  style={{ 
                    animationDelay: '1.2s'
                  }}
                ></div>
              </div>
            )}
            
            {/* Mic Button - Smaller, refined */}
            {!isListening && (
              <button
                type="button"
                onClick={startListening}
                className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white hover:from-[#F50057] hover:to-[#E91E63] hover:scale-110 transition-all shadow-md hover:shadow-lg z-10"
                title="Start voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
            
            {/* Stop Button - Smaller, refined with rings */}
            {isListening && (
              <button
                type="button"
                onClick={stopListening}
                className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg z-10"
                title="Stop recording"
              >
                <Square className="w-4 h-4" fill="currentColor" />
              </button>
            )}
          </div>
          
          {/* Interim Transcript Display */}
          {transcript && isListening && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-2 rounded-lg shadow-md max-w-md text-center z-20">
              {transcript}
            </div>
          )}
        </>
      )}
    </div>
  );
}

