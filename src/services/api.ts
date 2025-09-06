const API_BASE_URL = 'http://localhost:5000/api';

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

    return response.json();
  }

  async startInterview(settings: InterviewSettings): Promise<{ interviewId: string }> {
    return this.request('/interview/start', {
      method: 'POST',
      body: JSON.stringify({
        userId: settings.userId || 'user123',
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

  async getResults(interviewId: string): Promise<{ report: InterviewResult }> {
    return this.request(`/interview/${interviewId}/report`);
  }

  async getInterviewHistory(userId: string): Promise<any[]> {
    return this.request(`/interview/history/${userId}`);
  }

  async clearInterviewHistory(userId: string): Promise<{ message: string; deletedCount: number }> {
    return this.request(`/interview/history/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();