import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface InterviewState {
  currentInterview: any | null;
  currentQuestion: any | null;
  answers: any[];
  isLoading: boolean;
  error: string | null;
}

type InterviewAction =
  | { type: 'START_INTERVIEW'; payload: any }
  | { type: 'SET_QUESTION'; payload: any }
  | { type: 'SUBMIT_ANSWER'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_INTERVIEW' };

const initialState: InterviewState = {
  currentInterview: null,
  currentQuestion: null,
  answers: [],
  isLoading: false,
  error: null,
};

function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'START_INTERVIEW':
      return {
        ...state,
        currentInterview: action.payload,
        answers: [],
        error: null,
      };
    case 'SET_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
      };
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        answers: [...state.answers, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'RESET_INTERVIEW':
      return initialState;
    default:
      return state;
  }
}

const InterviewContext = createContext<{
  state: InterviewState;
  dispatch: React.Dispatch<InterviewAction>;
} | null>(null);

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};