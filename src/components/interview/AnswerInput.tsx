import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({ onSubmit, disabled = false }) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [textAnswer, setTextAnswer] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const handleSubmit = () => {
    const answer = inputMode === 'text' ? textAnswer : voiceTranscript;
    if (answer.trim()) {
      onSubmit(answer.trim());
      // Reset inputs after submission
      setTextAnswer('');
      setVoiceTranscript('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputMode === 'text') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Mode Toggle */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            inputMode === 'text'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>✏️</span>
          <span>Text</span>
        </button>
        <button
          onClick={() => setInputMode('voice')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            inputMode === 'voice'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>🎤</span>
          <span>Voice</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {inputMode === 'text' ? (
          <div className="space-y-3">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here... (Press Enter to submit)"
              disabled={disabled}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={4}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Press Enter to submit, or Shift+Enter for new line
            </div>
          </div>
        ) : (
          <VoiceRecorder
            transcript={voiceTranscript}
            onTranscriptChange={setVoiceTranscript}
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={disabled || (!textAnswer.trim() && !voiceTranscript.trim())}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          {disabled ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>

      {/* Character Count (for text mode) */}
      {inputMode === 'text' && (
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
          {textAnswer.length} characters
        </div>
      )}
    </div>
  );
};

export default AnswerInput;