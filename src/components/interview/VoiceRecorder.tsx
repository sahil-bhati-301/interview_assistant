import React, { useState, useEffect, useRef } from 'react';

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  transcript: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptChange, transcript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check browser support for Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition ||
                             window.webkitSpeechRecognition ||
                             (window as any).mozSpeechRecognition ||
                             (window as any).msSpeechRecognition;

    // Get browser information
    const userAgent = navigator.userAgent;
    const isOperaGX = userAgent.includes('OPR') && userAgent.includes('GX');
    // Browser detection variables (kept for future use)
    // const isOpera = userAgent.includes('OPR') || userAgent.includes('Opera');
    // const isChrome = userAgent.includes('Chrome') && !userAgent.includes('OPR');
    // const isEdge = userAgent.includes('Edg');
    // const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');

    if (!SpeechRecognition) {
      let recommendedBrowsers = 'Chrome, Edge, Safari, or Opera';
      if (isOperaGX) {
        recommendedBrowsers = 'Opera GX should support voice input. Try enabling experimental features in opera://flags';
      }

      setIsSupported(false);
      setError(`Voice input is not supported in this browser. Please use ${recommendedBrowsers}.`);
      return;
    }

    // Special handling for Opera GX
    if (isOperaGX) {
      console.log('Opera GX detected - voice input should be supported');
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Handle speech recognition results
    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment;
        }
      }

      // Update transcript with final results
      if (finalTranscript) {
        onTranscriptChange(transcript + finalTranscript);
      }
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    // Handle end of recognition
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscriptChange]);

  const startRecording = () => {
    if (!recognitionRef.current) return;

    try {
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const clearTranscript = () => {
    onTranscriptChange('');
  };

  const retryRecording = () => {
    clearTranscript();
    startRecording();
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <div className="text-yellow-600 dark:text-yellow-400 mb-2">
          🎤 Voice Input Not Supported
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
          Your browser doesn't support voice input. Please use Chrome, Edge, Safari, or Opera for the best experience.
        </p>
        {navigator.userAgent.includes('OPR') && (
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 If using Opera GX, try enabling experimental features in <code>opera://flags</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!error}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="text-lg">{isRecording ? '🔴' : '🎤'}</span>
            <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>

          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {transcript && !isRecording && (
            <>
              <button
                onClick={clearTranscript}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={retryRecording}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Transcript Display */}
      <div className="min-h-32 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        {transcript ? (
          <div className="text-gray-900 dark:text-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transcript:</span>
            </div>
            <p className="leading-relaxed">{transcript}</p>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {isRecording ? (
              <div>
                <div className="text-2xl mb-2">🎤</div>
                <p>Speak now... Your words will appear here.</p>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2">🎤</div>
                <p>Click "Start Recording" to begin voice input</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <strong>💡 Tips:</strong> Speak clearly and at a normal pace. Click "Stop Recording" when finished.
        You can retry or clear the transcript if needed. Works best in Chrome, Edge, Safari, or Opera.
        {navigator.userAgent.includes('OPR') && navigator.userAgent.includes('GX') && (
          <div className="mt-1 text-blue-600 dark:text-blue-400">
            <strong>Opera GX:</strong> If voice input doesn't work, enable experimental features in <code>opera://flags</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;