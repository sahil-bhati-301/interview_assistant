import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Button from '../../components/ui/button/Button';
import ComponentCard from '../../components/common/ComponentCard';
import { apiService, InterviewSettings } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDomain, setSelectedDomain] = useState('machinelearning');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const domains = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨', category: 'technical' },
    { id: 'python', name: 'Python', icon: '🐍', category: 'technical' },
    { id: 'react', name: 'React', icon: '⚛️', category: 'technical' },
    { id: 'java', name: 'Java', icon: '☕', category: 'technical' },
    { id: 'nodejs', name: 'Node.js', icon: '🟢', category: 'technical' },
    { id: 'systemdesign', name: 'System Design', icon: '🏗️', category: 'technical' },
    { id: 'machinelearning', name: 'Machine Learning', icon: '🤖', category: 'technical' },
    { id: 'dsa', name: 'Data Structures & Algorithms', icon: '🧠', category: 'technical' },
    { id: 'aws', name: 'AWS', icon: '☁️', category: 'technical' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒', category: 'technical' },
    { id: 'pseudocode', name: 'Pseudocode', icon: '📝', category: 'technical' },
    { id: 'capgemini', name: 'Capgemini', icon: '🏢', category: 'company' },
    { id: 'accenture', name: 'Accenture', icon: '🏛️', category: 'company' },
    { id: 'google', name: 'Google', icon: '🔍', category: 'company' },
  ];

  const categories = [
    { id: 'all', name: 'All Domains', icon: '🎯' },
    { id: 'technical', name: 'Technical', icon: '💻' },
    { id: 'company', name: 'Company Specific', icon: '🏢' },
  ];

  const filteredDomains = selectedCategory === 'all'
    ? domains
    : domains.filter(domain => domain.category === selectedCategory);

  // Reset selected domain if it's not in the filtered list
  useEffect(() => {
    if (selectedDomain && !filteredDomains.find(d => d.id === selectedDomain)) {
      setSelectedDomain(filteredDomains[0]?.id || '');
    }
  }, [selectedCategory, filteredDomains, selectedDomain]);

  const difficulties = [
    { id: 'beginner', name: 'Beginner', description: 'Basic concepts and fundamentals' },
    { id: 'intermediate', name: 'Intermediate', description: 'Core concepts and best practices' },
    { id: 'advanced', name: 'Advanced', description: 'Complex topics and architecture' },
  ];

  // Fetch interview history for stats
  useEffect(() => {
    const loadInterviewHistory = async () => {
      if (!user) {
        setInterviewHistory([]);
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        console.log('Dashboard: Loading interview history for user:', user.uid);
        const history = await apiService.getInterviewHistory(user.uid);
        console.log('Dashboard: History response:', history);
        console.log('Dashboard: History length:', history?.length || 0);
        setInterviewHistory(history);
      } catch (error) {
        console.error('Dashboard: Failed to load interview history:', error);
        setInterviewHistory([]);
      } finally {
        setLoadingStats(false);
      }
    };

    loadInterviewHistory();
  }, [user]);

  // Listen for history cleared event to refresh stats
  useEffect(() => {
    const handleHistoryCleared = () => {
      // Refresh interview history when cleared from History page
      if (user) {
        apiService.getInterviewHistory(user.uid)
          .then(history => {
            setInterviewHistory(history);
          })
          .catch(error => {
            console.error('Failed to refresh interview history:', error);
            setInterviewHistory([]);
          });
      } else {
        setInterviewHistory([]);
      }
    };

    window.addEventListener('interviewHistoryCleared', handleHistoryCleared);

    return () => {
      window.removeEventListener('interviewHistoryCleared', handleHistoryCleared);
    };
  }, [user]);

  // Calculate stats from interview history
  const calculateStats = () => {
    if (!Array.isArray(interviewHistory) || interviewHistory.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        domainsPracticed: 0
      };
    }

    const totalInterviews = interviewHistory.length;
    const averageScore = Math.round(
      interviewHistory.reduce((sum, interview) => sum + (interview.score || 0), 0) / totalInterviews
    );
    const domainsPracticed = new Set(interviewHistory.map(i => i.domain)).size;

    return {
      totalInterviews,
      averageScore,
      domainsPracticed
    };
  };

  const stats = calculateStats();

  const handleStartInterview = async () => {
    try {
      if (!user) {
        alert('Please log in to start an interview');
        return;
      }

      const settings: InterviewSettings = {
        domain: selectedDomain,
        difficulty: selectedDifficulty,
        questionCount: questionCount
      };

      const response = await apiService.startInterview({ ...settings, userId: user.uid });
      console.log('Interview started:', response);

      // Navigate to interview session
      navigate(`/interview/${response.interviewId}`);
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Interview Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Practice technical interviews with AI-powered questions and analysis
          </p>
        </div>
        <Link to="/interview/history">
          <Button variant="outline" size="sm">
            View History
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Selection */}
        <ComponentCard title="Choose Domain">
          {/* Category Filter */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Filter by Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Domain List */}
          <div className="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {filteredDomains.map((domain) => (
              <div
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDomain === domain.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{domain.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {domain.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Technical interview questions
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredDomains.length > 4 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              Scroll to see all {selectedCategory === 'all' ? 'domains' : `${selectedCategory} domains`}
            </div>
          )}
          {filteredDomains.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-600 dark:text-gray-400">
                No domains available in this category yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Future updates will add more domains
              </p>
            </div>
          )}
        </ComponentCard>

        {/* Difficulty & Settings */}
        <ComponentCard title="Interview Settings">
          <div className="space-y-6">
            {/* Difficulty Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Difficulty Level
              </h3>
              <div className="space-y-2">
                {difficulties.map((difficulty) => (
                  <div
                    key={difficulty.id}
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDifficulty === difficulty.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {difficulty.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {difficulty.description}
                        </p>
                      </div>
                      {selectedDifficulty === difficulty.id && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Number of Questions
              </h3>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartInterview}
              className="w-full"
            >
              Start Interview
            </Button>
          </div>
        </ComponentCard>
      </div>

      {/* Quick Stats */}
      <ComponentCard title="Your Progress">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {loadingStats ? '...' : stats.totalInterviews}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Interviews Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? '...' : `${stats.averageScore}%`}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {loadingStats ? '...' : stats.domainsPracticed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Domains Practiced</div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default Dashboard;