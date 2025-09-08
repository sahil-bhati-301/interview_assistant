import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';
import AnswerInput from '../../components/interview/AnswerInput';
import { Question, API_BASE_URL } from '../../services/api';

const Session: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Get all questions for this interview (using plural endpoint)
        const response = await fetch(`${API_BASE_URL}/interview/${id}/questions`);
        const data = await response.json();

        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          // Initialize answers array with empty strings
          setAnswers(new Array(data.questions.length).fill(''));
        } else {
          console.error('No questions found in response');
          alert('No questions available for this interview.');
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        alert('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [id]);

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitInterview = async () => {
    if (!id) return;

    setIsSubmitting(true);

    try {
      // Step 1: Submit all answers at once to complete the interview (fast operation)
      const allAnswers = answers.map((answer, index) => ({
        questionId: questions[index].id,
        text: answer
      }));

      console.log('Submitting interview completion...');
      const completeResponse = await fetch(`${API_BASE_URL}/interview/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: allAnswers
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete interview');
      }

      const completeData = await completeResponse.json();
      console.log('Interview completed:', completeData);

      // Step 2: Get the analysis report (this may take longer)
      console.log('Generating analysis report...');
      const reportResponse = await fetch(`${API_BASE_URL}/interview/${id}/report`);

      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        console.log('Report generated:', reportData);

        // Navigate to results with report data
        navigate(`/interview/${id}/results`, {
          state: { report: reportData }
        });
      } else {
        // If report generation fails, still navigate to results (will show loading)
        console.warn('Report generation failed, navigating to results anyway');
        navigate(`/interview/${id}/results`);
      }
    } catch (error) {
      console.error('Error submitting interview:', error);
      alert('Failed to submit interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading questions...</p>
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
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {questions[currentQuestionIndex]?.domain} • {questions[currentQuestionIndex]?.difficulty}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
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
                  {questions[currentQuestionIndex]?.text}
                </p>
              </div>
            </div>

          {/* Answer Input */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Your Answer
            </h3>
            <AnswerInput
              onSubmit={(answer) => {
                handleAnswerChange(answer);
                // Auto-advance to next question after submission
                if (currentQuestionIndex < questions.length - 1) {
                  setTimeout(() => handleNext(), 500);
                }
              }}
              disabled={isSubmitting}
            />
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                💡 Choose text or voice input • Answers are saved automatically
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || isSubmitting}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1 || isSubmitting}
              >
                Next
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/interview')}
                disabled={isSubmitting}
              >
                End Interview
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitInterview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Interview'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(questions.length - 1)}
                  disabled={isSubmitting}
                >
                  Jump to Last
                </Button>
              )}
            </div>
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
          <p>• Choose between text or voice input based on your preference</p>
          <p>• Voice input works best in quiet environments with clear speech</p>
          <p>• Supported browsers: Chrome, Edge, Safari, Opera</p>
          <p>• You can review and edit your voice transcript before submitting</p>
        </div>
      </ComponentCard>
    </div>
  );
};

export default Session;