import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';
import { apiService } from '../../services/api';

const History: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // For now, use a mock user ID. In a real app, this would come from authentication
        const userId = 'user123';
        const history = await apiService.getInterviewHistory(userId);
        setInterviews(history);
      } catch (error) {
        console.error('Failed to load interview history:', error);
        // For demo purposes, show empty state instead of error
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Interview History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review your past interview performances
          </p>
        </div>
        <Link to="/interview">
          <Button>
            New Interview
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{interviews.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(interviews.reduce((sum, interview) => sum + interview.score, 0) / interviews.length)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(interviews.map(i => i.domain)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Domains Practiced</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...interviews.map(i => i.score))}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Best Score</div>
          </div>
        </ComponentCard>
      </div>

      {/* Interview List */}
      <ComponentCard title="Past Interviews">
        {interviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No interviews completed yet</p>
            <Link to="/interview">
              <Button>Start Your First Interview</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBgColor(interview.score)}`}>
                      <span className={`text-lg font-bold ${getScoreColor(interview.score)}`}>
                        {interview.score}%
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {interview.domain} Interview
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {interview.difficulty} • {interview.questionsCount} questions • {interview.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      interview.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      interview.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {interview.score >= 80 ? 'Excellent' : interview.score >= 60 ? 'Good' : 'Needs Work'}
                    </span>
                    <Link to={`/interview/${interview.id}/results`}>
                      <Button variant="outline" size="sm">
                        View Results
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default History;