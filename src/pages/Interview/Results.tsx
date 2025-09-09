import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';
import { apiService } from '../../services/api';

interface InterviewResult {
  overallScore: number;
  performanceLevel: string;
  totalQuestions: number;
  domain: string;
  difficulty: string;
  strengths: string[];
  weaknesses: string[];
  questionAnalysis: Array<{
    questionNumber: number;
    question: string;
    userAnswer: string;
    score: number;
    feedback: string;
  }>;
  recommendations: string[];
  conceptMastery: {
    wellUnderstood: string[];
    needsWork: string[];
  };
}

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log('Fetching results for interview ID:', id);
        const response = await apiService.getResults(id);
        console.log('Raw API response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response || {}));

        // The API returns the report directly (not nested)
        setResults(response);
        console.log('Results set successfully');
      } catch (error) {
        console.error('Failed to load results:', error);
        alert('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing your interview...</p>
        </div>
      </div>
    );
  }

  if (!results || typeof results !== 'object') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No results found</p>
        <Button onClick={() => navigate('/interview')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Interview Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {results.domain || 'Unknown'} • {results.difficulty || 'Unknown'} Level
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            Export PDF
          </Button>
          <Button onClick={() => navigate('/interview')}>
            New Interview
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <ComponentCard title="Overall Performance">
        <div className="text-center py-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(results.overallScore)} mb-4`}>
            <span className={`text-4xl font-bold ${getScoreColor(results.overallScore || 0)}`}>
              {results.overallScore || 0}%
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {results.performanceLevel || 'Performance Level'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {results.totalQuestions || 0} questions completed
          </p>
        </div>
      </ComponentCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <ComponentCard title="Strengths">
          <div className="space-y-3">
            {Array.isArray(results.strengths) && results.strengths.length > 0 ? (
              results.strengths.map((strength: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">{strength}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No strengths identified</p>
            )}
          </div>
        </ComponentCard>

        {/* Areas for Improvement */}
        <ComponentCard title="Areas for Improvement">
          <div className="space-y-3">
            {Array.isArray(results.weaknesses) && results.weaknesses.length > 0 ? (
              results.weaknesses.map((weakness: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">{weakness}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No areas for improvement identified</p>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Question-by-Question Analysis */}
      <ComponentCard title="Detailed Analysis">
        <div className="space-y-6">
          {Array.isArray(results.questionAnalysis) && results.questionAnalysis.length > 0 ? (
            results.questionAnalysis.map((analysis: any, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Question {analysis.questionNumber || index + 1}
                    </h4>
                    <div className="space-y-3">
                      {analysis.question && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question:</h5>
                          <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            {analysis.question}
                          </p>
                        </div>
                      )}
                      {analysis.userAnswer && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Answer:</h5>
                          <p className="text-gray-600 dark:text-gray-400 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                            {analysis.userAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(analysis.score || 0)} ${getScoreColor(analysis.score || 0)}`}>
                    {analysis.score || 0}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback:</h5>
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.feedback || 'No feedback available'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No detailed analysis available</p>
          )}
        </div>
      </ComponentCard>

      {/* Recommendations */}
      <ComponentCard title="Recommendations">
        <div className="space-y-3">
          {Array.isArray(results.recommendations) && results.recommendations.length > 0 ? (
            results.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No recommendations available</p>
          )}
        </div>
      </ComponentCard>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button variant="outline" onClick={() => navigate('/interview')}>
          Back to Dashboard
        </Button>
        <Button onClick={() => navigate('/interview')}>
          Practice Again
        </Button>
      </div>
    </div>
  );
};

export default Results;