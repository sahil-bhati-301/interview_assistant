import React, { useState, useEffect } from 'react';
import ComponentCard from '../components/common/ComponentCard';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) {
        setInterviewHistory([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const history = await apiService.getInterviewHistory(user.uid);
        setInterviewHistory(history);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        setInterviewHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]);

  // Prepare data for growth trend line graph
  const prepareGrowthData = (domainFilter: string = 'all') => {
    if (interviewHistory.length === 0) return [];

    // Filter interviews by domain if specified
    let filteredInterviews = interviewHistory;
    if (domainFilter !== 'all') {
      filteredInterviews = interviewHistory.filter(interview =>
        (interview.domain || 'Unknown') === domainFilter
      );
    }

    // Sort interviews by date
    const sortedInterviews = [...filteredInterviews].sort((a, b) =>
      new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime()
    );

    return sortedInterviews.map((interview, index) => {
      const interviewDate = interview.date || interview.createdAt;
      const formattedDate = interviewDate
        ? new Date(interviewDate).toLocaleDateString()
        : `Interview ${index + 1}`;

      return {
        interview: index + 1,
        score: interview.score || 0,
        date: formattedDate
      };
    });
  };

  // Prepare data for domain comparison bar graph
  const prepareDomainData = () => {
    if (interviewHistory.length === 0) return [];

    const domainMap = new Map<string, { totalScore: number; count: number }>();

    interviewHistory.forEach(interview => {
      const domain = interview.domain || 'Unknown';
      const score = interview.score || 0;

      if (domainMap.has(domain)) {
        const current = domainMap.get(domain)!;
        domainMap.set(domain, {
          totalScore: current.totalScore + score,
          count: current.count + 1
        });
      } else {
        domainMap.set(domain, { totalScore: score, count: 1 });
      }
    });

    return Array.from(domainMap.entries()).map(([domain, data]) => ({
      domain,
      averageScore: Math.round(data.totalScore / data.count),
      interviewCount: data.count
    }));
  };

  // Prepare data for domain distribution pie chart
  const preparePieChartData = () => {
    if (interviewHistory.length === 0) return [];

    const domainMap = new Map<string, number>();

    interviewHistory.forEach(interview => {
      const domain = interview.domain || 'Unknown';
      domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
    });

    const total = interviewHistory.length;
    return Array.from(domainMap.entries())
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  };

  const growthData = prepareGrowthData(selectedDomain);
  const domainData = prepareDomainData();
  const pieChartData = preparePieChartData();

  // Get unique domains for filter dropdown
  const getUniqueDomains = () => {
    if (interviewHistory.length === 0) return [];
    const domains = new Set(interviewHistory.map(i => i.domain || 'Unknown'));
    return Array.from(domains).sort();
  };

  const uniqueDomains = getUniqueDomains();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your interview performance and growth trends
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{interviewHistory.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {interviewHistory.length > 0
                ? Math.round(interviewHistory.reduce((sum, interview) => sum + (interview.score || 0), 0) / interviewHistory.length) + '%'
                : '0%'
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(interviewHistory.map(i => i.domain)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Domains Practiced</div>
          </div>
        </ComponentCard>
        <ComponentCard title="">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {interviewHistory.length > 0
                ? Math.max(...interviewHistory.map(i => i.score || 0)) + '%'
                : '0%'
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Best Score</div>
          </div>
        </ComponentCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Filter */}
        {uniqueDomains.length > 1 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="domain-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Domain:
              </label>
              <select
                id="domain-filter"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Domains</option>
                {uniqueDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDomain === 'all'
                ? `${interviewHistory.length} interviews`
                : `${interviewHistory.filter(i => (i.domain || 'Unknown') === selectedDomain).length} interviews`
              }
            </div>
          </div>
        )}

        {/* Growth Trend Line Graph */}
        <ComponentCard title={`Performance Growth Trend ${selectedDomain !== 'all' ? `(${selectedDomain})` : ''}`}>
          <div className="h-80">
            {growthData.length > 0 ? (
              <div className="space-y-4">
                {/* Line chart representation */}
                <div className="relative h-64">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <div
                        key={value}
                        className="absolute w-full border-t border-gray-200 dark:border-gray-700"
                        style={{ bottom: `${value * 2}px` }}
                      ></div>
                    ))}
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>

                  {/* Line chart */}
                  <div className="absolute inset-0 ml-8">
                    <svg className="w-full h-full" viewBox={`0 0 ${growthData.length * 60} 200`}>
                      {/* Line path */}
                      <path
                        d={growthData.map((point, index) =>
                          `${index === 0 ? 'M' : 'L'} ${index * 60 + 30} ${200 - (point.score / 100) * 200}`
                        ).join(' ')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data points */}
                      {growthData.map((point, index) => (
                        <circle
                          key={index}
                          cx={index * 60 + 30}
                          cy={200 - (point.score / 100) * 200}
                          r="6"
                          fill="#3b82f6"
                          className="hover:r-8 transition-all cursor-pointer"
                        />
                      ))}

                      {/* X-axis labels */}
                      {growthData.map((point, index) => (
                        <text
                          key={index}
                          x={index * 60 + 30}
                          y="220"
                          textAnchor="middle"
                          className="text-xs fill-gray-600 dark:fill-gray-400"
                        >
                          {point.interview}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Interview Number → Score Percentage
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <p>Complete interviews to see your growth trend</p>
                </div>
              </div>
            )}
          </div>
        </ComponentCard>

        {/* Domain Comparison Bar Graph */}
        <ComponentCard title="Domain Performance Comparison">
          <div className="h-80">
            {domainData.length > 0 ? (
              <div className="space-y-4">
                <div className="relative h-64">
                  <div className="absolute inset-0 flex items-end justify-around px-4">
                    {domainData.map((domain, index) => {
                      const height = (domain.averageScore / 100) * 200;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-12 bg-green-500 rounded-t"
                            style={{ height: `${height}px` }}
                          ></div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center max-w-16 truncate">
                            {domain.domain}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {domain.averageScore}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Domain → Average Score
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Complete interviews to see domain comparisons</p>
                </div>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Domain Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Domain Distribution">
          <div className="h-80 flex flex-col">
            {pieChartData.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                    {pieChartData.map((item, index) => {
                      const colors = [
                        '#3b82f6', // Blue
                        '#ef4444', // Red
                        '#10b981', // Green
                        '#f59e0b', // Yellow
                        '#8b5cf6', // Purple
                        '#06b6d4', // Cyan
                        '#f97316', // Orange
                        '#84cc16', // Lime
                        '#ec4899', // Pink
                        '#6b7280'  // Gray
                      ];

                      const color = colors[index % colors.length];
                      const total = pieChartData.reduce((sum, d) => sum + d.count, 0);
                      const startAngle = pieChartData.slice(0, index).reduce((sum, d) => sum + (d.count / total) * 360, 0);
                      const angle = (item.count / total) * 360;

                      const x1 = 100 + 70 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 100 + 70 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 100 + 70 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                      const y2 = 100 + 70 * Math.sin(((startAngle + angle) * Math.PI) / 180);

                      const largeArcFlag = angle > 180 ? 1 : 0;

                      return (
                        <path
                          key={index}
                          d={`M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Distribution of Interview Domains
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">🥧</div>
                  <p>Complete interviews to see domain distribution</p>
                </div>
              </div>
            )}
          </div>
        </ComponentCard>

        {/* Pie Chart Legend */}
        <ComponentCard title="Legend">
          <div className="h-80 overflow-y-auto">
            {pieChartData.length > 0 ? (
              <div className="space-y-2 pr-2">
                {pieChartData.map((item, index) => {
                  const colors = [
                    '#3b82f6', // Blue
                    '#ef4444', // Red
                    '#10b981', // Green
                    '#f59e0b', // Yellow
                    '#8b5cf6', // Purple
                    '#06b6d4', // Cyan
                    '#f97316', // Orange
                    '#84cc16', // Lime
                    '#ec4899', // Pink
                    '#6b7280'  // Gray
                  ];

                  const color = colors[index % colors.length];

                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {item.domain}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.percentage}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {item.count} int{item.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Legend will appear when you have interview data</p>
                </div>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Detailed Analytics */}
      {interviewHistory.length > 0 && (
        <ComponentCard title="Detailed Performance Metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Performance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Performance
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {interviewHistory.slice(-5).map((interview, index) => {
                  const interviewDate = interview.date || interview.createdAt;
                  let formattedDate = 'Date not available';

                  if (interviewDate) {
                    try {
                      const date = new Date(interviewDate);
                      if (!isNaN(date.getTime())) {
                        formattedDate = date.toLocaleDateString();
                      }
                    } catch (error) {
                      console.warn('Invalid date format:', interviewDate);
                    }
                  }

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {interview.domain || 'Unknown'} Interview
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {interview.difficulty || 'Unknown'} • {interview.questionsCount || 0} questions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {interview.score || 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {formattedDate}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Domain Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Domain Breakdown
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {domainData.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {domain.domain}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {domain.interviewCount} interview{domain.interviewCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {domain.averageScore}%
                      </div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
};

export default Analytics;