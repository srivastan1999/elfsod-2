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
  const isListeningRef = useRef<boolean>(false); // Track listening state for callbacks

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
    
    // Enhanced settings for better voice recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Try multiple language codes for better recognition
    // en-US is most widely supported, but also try en-IN for Indian accents
    recognition.lang = 'en-US';
    
    // Additional settings for better accuracy (if supported)
    if ('maxAlternatives' in recognition) {
      (recognition as any).maxAlternatives = 1;
    }
    
    // Enable service URI for cloud-based recognition (better accuracy)
    if ('serviceURI' in recognition) {
      // Use default service URI for better cloud processing
    }

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
        // No speech detected, but keep listening - auto-restart after a delay
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.stop();
              const newRecognition = createRecognition();
              if (newRecognition) {
                recognitionRef.current = newRecognition;
                setTimeout(() => {
                  if (recognitionRef.current) {
                    recognitionRef.current.start();
                  }
                }, 100);
              }
            } catch (e) {
              console.warn('Error restarting recognition:', e);
            }
          }
        }, 2000); // Restart after 2 seconds of no speech
        return;
      }
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings and try again.');
        setIsListening(false);
        isListeningRef.current = false;
        finalTranscriptRef.current = '';
        setTranscript('');
      } else if (event.error === 'network') {
        alert('Network error. Please check your internet connection and try again.');
        setIsListening(false);
        isListeningRef.current = false;
        finalTranscriptRef.current = '';
        setTranscript('');
      } else if (event.error === 'aborted') {
        // User stopped manually, don't show error
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'audio-capture') {
        alert('No microphone found. Please connect a microphone and try again.');
        setIsListening(false);
        isListeningRef.current = false;
        finalTranscriptRef.current = '';
        setTranscript('');
      } else {
        // Other errors - try to auto-restart for better reliability
        console.warn('Speech recognition error (attempting restart):', event.error);
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              const newRecognition = createRecognition();
              if (newRecognition) {
                recognitionRef.current = newRecognition;
                setTimeout(() => {
                  if (recognitionRef.current) {
                    recognitionRef.current.start();
                  }
                }, 500);
              }
            } catch (e) {
              console.error('Error restarting recognition:', e);
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              const newRecognition = createRecognition();
              if (newRecognition) {
                recognitionRef.current = newRecognition;
                setTimeout(() => {
                  if (recognitionRef.current) {
                    recognitionRef.current.start();
                  }
                }, 100);
              }
            } catch (e) {
              console.warn('Error auto-restarting recognition:', e);
            }
          }
        }, 100);
      } else {
        // Clear state if we're not supposed to be listening
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

    // Request microphone permission with enhanced audio constraints for better voice pickup
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1, // Mono for speech recognition
          // Additional constraints for better voice pickup
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googNoiseReduction: true
        } as any
      })
        .then((stream) => {
          // Store stream reference for cleanup
          (window as any).__voiceStream = stream;
        })
        .catch((error) => {
          console.error('Microphone access error:', error);
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
            isListeningRef.current = true;
          }
        } catch (error: any) {
          // Handle "already started" error by creating a new instance
          if (error.name === 'InvalidStateError' || error.message?.includes('started')) {
            const freshRecognition = createRecognition();
            if (freshRecognition) {
              recognitionRef.current = freshRecognition;
              freshRecognition.start();
              setIsListening(true);
              isListeningRef.current = true;
            }
          } else {
            console.error('Error starting speech recognition:', error);
            alert('Could not start voice input. Please check your microphone permissions.');
            setIsListening(false);
            isListeningRef.current = false;
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
    
    // Stop and cleanup microphone stream
    if ((window as any).__voiceStream) {
      const tracks = (window as any).__voiceStream.getTracks();
      tracks.forEach((track: MediaStreamTrack) => track.stop());
      delete (window as any).__voiceStream;
    }
    
    // Don't add transcript here - it's already been added in onresult
    // The value already contains all final transcripts
    
    // Clear state
    setIsListening(false);
    isListeningRef.current = false;
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

