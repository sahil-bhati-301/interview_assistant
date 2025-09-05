import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';
import { apiService, InterviewResult } from '../../services/api';

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
        const interviewResults = await apiService.getResults(id);
        setResults(interviewResults);
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

  if (!results) {
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
            {results.domain} • {results.difficulty} Level
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
            <span className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
              {results.overallScore}%
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {results.performanceLevel}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {results.totalQuestions} questions completed
          </p>
        </div>
      </ComponentCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <ComponentCard title="Strengths">
          <div className="space-y-3">
            {results.strengths.map((strength: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">{strength}</p>
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* Areas for Improvement */}
        <ComponentCard title="Areas for Improvement">
          <div className="space-y-3">
            {results.weaknesses.map((weakness: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">{weakness}</p>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>

      {/* Question-by-Question Analysis */}
      <ComponentCard title="Detailed Analysis">
        <div className="space-y-6">
          {results.questionAnalysis.map((analysis: any, index: number) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Question {index + 1}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {analysis.question}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(analysis.score)} ${getScoreColor(analysis.score)}`}>
                  {analysis.score}%
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {analysis.feedback}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* Recommendations */}
      <ComponentCard title="Recommendations">
        <div className="space-y-3">
          {results.recommendations.map((recommendation: string, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
            </div>
          ))}
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