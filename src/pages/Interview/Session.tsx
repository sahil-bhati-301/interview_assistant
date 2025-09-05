import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';

const Session: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Mock questions for demonstration
  const mockQuestions = [
    {
      id: 'q1',
      text: 'What is the difference between var, let, and const in JavaScript?',
      domain: 'javascript',
      difficulty: 'intermediate',
      type: 'technical'
    },
    {
      id: 'q2',
      text: 'Explain the concept of closures in JavaScript with an example.',
      domain: 'javascript',
      difficulty: 'intermediate',
      type: 'technical'
    },
    {
      id: 'q3',
      text: 'What are the different ways to create objects in JavaScript?',
      domain: 'javascript',
      difficulty: 'intermediate',
      type: 'technical'
    },
    {
      id: 'q4',
      text: 'Explain the difference between == and === operators in JavaScript.',
      domain: 'javascript',
      difficulty: 'intermediate',
      type: 'technical'
    },
    {
      id: 'q5',
      text: 'What is the purpose of the useEffect hook in React?',
      domain: 'javascript',
      difficulty: 'intermediate',
      type: 'technical'
    }
  ];

  useEffect(() => {
    // Load first question
    setCurrentQuestion(mockQuestions[0]);
  }, []);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);

    try {
      // In a real implementation, this would call the API
      console.log('Submitting answer:', answer);

      // Mock response
      if (questionNumber < totalQuestions) {
        setQuestionNumber(prev => prev + 1);
        setAnswer('');
        // Load next question from mock questions
        const nextQuestion = mockQuestions[questionNumber];
        setCurrentQuestion(nextQuestion);
      } else {
        // Interview completed - navigate to results
        navigate(`/interview/${id}/results`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Interview Session
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {currentQuestion.domain} • {currentQuestion.difficulty}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Question
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>
            </div>

          {/* Answer Input */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Your Answer
            </h3>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {answer.length} characters
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Press Enter to submit
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/interview')}
              disabled={isSubmitting}
            >
              End Interview
            </Button>
            <Button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </div>
        </div>
      </div>
      </div>

      {/* Tips */}
      <ComponentCard title="Tips">
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>• Take your time to think through your answer</p>
          <p>• Be specific and provide examples when possible</p>
          <p>• Explain your thought process, not just the final answer</p>
          <p>• You can use the text area for notes before submitting</p>
        </div>
      </ComponentCard>
    </div>
  );
};

export default Session;