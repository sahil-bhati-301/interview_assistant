import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const History: React.FC = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setInterviews([]);
          return;
        }

        console.log('Loading interview history for user:', user.uid);
        const history = await apiService.getInterviewHistory(user.uid);
        console.log('History response:', history);

        // Ensure we always have an array
        setInterviews(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error('Failed to load interview history:', error);
        setError('Failed to load interview history. Please try again.');
        // Set empty array as fallback to prevent undefined errors
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

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

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all your interview history? This action cannot be undone.')) {
      return;
    }

    if (!user) {
      alert('Please log in to clear your history');
      return;
    }

    try {
      setClearing(true);
      const response = await apiService.clearInterviewHistory(user.uid);
      console.log('History cleared:', response);

      // Refresh the history
      setInterviews([]);

      // Dispatch custom event to refresh dashboard stats
      window.dispatchEvent(new CustomEvent('interviewHistoryCleared'));

      alert(`Successfully cleared ${response.deletedCount} interviews from your history.`);
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history. Please try again.');
    } finally {
      setClearing(false);
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to Load History</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
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
        <div className="flex items-center space-x-3">
          {interviews.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearHistory}
              disabled={clearing}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
            >
              {clearing ? 'Clearing...' : 'Clear History'}
            </Button>
          )}
          <Link to="/interview">
            <Button>
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{interviews?.length || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {interviews && interviews.length > 0
                ? Math.round(interviews.reduce((sum, interview) => sum + (interview?.score || 0), 0) / interviews.length) + '%'
                : '0%'
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {interviews && interviews.length > 0
                ? new Set(interviews.map(i => i?.domain || 'Unknown')).size
                : 0
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Domains Practiced</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {interviews && interviews.length > 0
                ? Math.max(...interviews.map(i => i?.score || 0)) + '%'
                : '0%'
              }
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
            {interviews && interviews.length > 0 ? (
              interviews.map((interview) => (
                <div
                  key={interview?.id || Math.random()}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBgColor(interview?.score || 0)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(interview?.score || 0)}`}>
                          {interview?.score || 0}%
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {interview?.domain || 'Unknown'} Interview
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {interview?.difficulty || 'Unknown'} • {interview?.questionsCount || 0} questions • {
                            (() => {
                              const interviewDate = interview?.date || interview?.createdAt;
                              if (interviewDate) {
                                try {
                                  const date = new Date(interviewDate);
                                  if (!isNaN(date.getTime())) {
                                    return date.toLocaleDateString();
                                  }
                                } catch (error) {
                                  console.warn('Invalid date format:', interviewDate);
                                }
                              }
                              return 'Date not available';
                            })()
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (interview?.score || 0) >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        (interview?.score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {(interview?.score || 0) >= 80 ? 'Excellent' : (interview?.score || 0) >= 60 ? 'Good' : 'Needs Work'}
                      </span>
                      <Link to={`/interview/${interview?.id}/results`}>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No interviews to display</p>
              </div>
            )}
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default History;