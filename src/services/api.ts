export const API_BASE_URL = 'http://localhost:5000/api';

export interface InterviewSettings {
  domain: string;
  difficulty: string;
  questionCount: number;
  userId?: string;
}

export interface Question {
  id: string;
  text: string;
  domain: string;
  difficulty: string;
  type: string;
}

export interface AnswerAnalysis {
  correctness: number;
  depth: number;
  conceptsIdentified: string[];
  missingConcepts: string[];
  suggestions: string;
  strengths: string;
  overallScore: number;
}

export interface InterviewResult {
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

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    try {
      return await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      throw new Error('Invalid response format from server');
    }
  }

  async startInterview(settings: InterviewSettings): Promise<{ interviewId: string }> {
    if (!settings.userId) {
      throw new Error('User ID is required to start an interview');
    }

    return this.request('/interview/start', {
      method: 'POST',
      body: JSON.stringify({
        userId: settings.userId,
        domain: settings.domain,
        difficulty: settings.difficulty,
        questionCount: settings.questionCount
      }),
    });
  }

  async getQuestion(interviewId: string): Promise<Question> {
    return this.request(`/interview/${interviewId}/question`);
  }

  async submitAnswer(interviewId: string, questionId: string, answer: string): Promise<AnswerAnalysis> {
    return this.request(`/interview/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async getResults(interviewId: string): Promise<InterviewResult> {
    console.log('API Service: Fetching results for interview:', interviewId);
    const result = await this.request<InterviewResult>(`/interview/${interviewId}/report`);
    console.log('API Service: Results received:', result);
    return result;
  }

  async getInterviewHistory(userId: string): Promise<any[]> {
    console.log('API: Fetching interview history for user:', userId);
    const result = await this.request<any[]>(`/interview/history/${userId}`);
    console.log('API: Interview history result:', result);
    return result;
  }

  async clearInterviewHistory(userId: string): Promise<{ message: string; deletedCount: number }> {
    return this.request(`/interview/history/${userId}`, {
      method: 'DELETE',
    });
  }

  async cleanupAbandonedInterviews(daysOld: number = 7): Promise<{ message: string; cleanedCount: number; cutoffDays: number }> {
    return this.request('/interview/cleanup', {
      method: 'POST',
      body: JSON.stringify({ daysOld }),
    });
  }

  async getIncompleteInterviews(userId: string): Promise<any[]> {
    return this.request(`/interview/incomplete/${userId}`);
  }
}

export const apiService = new ApiService();