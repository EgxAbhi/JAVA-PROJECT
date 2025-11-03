
export enum Role {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
}

export interface User {
  id: string;
  name: string;
  role: Role;
}

export enum QuestionType {
  MultipleChoice = 'MULTIPLE_CHOICE',
  TrueFalse = 'TRUE_FALSE',
}

export interface Question {
  id: string;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
  createdBy: string; // User ID of the teacher
}

export interface QuizAttempt {
  id:string;
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: string }; // Map of questionId to selected answer
  score: number;
  totalQuestions: number;
  completedAt: string; // ISO string
}

export interface GeminiQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}
