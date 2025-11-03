
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { Quiz, QuizAttempt, Question } from '../types';
import { useAuth } from '../context/AuthContext';

const Timer: React.FC<{ initialMinutes: number; onTimeUp: () => void }> = ({ initialMinutes, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, onTimeUp]);
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const timeColor = timeLeft < 60 ? 'text-red-500' : 'text-gray-700';

    return <div className={`text-2xl font-bold ${timeColor}`}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div>;
};

const TakeQuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quizzes] = useLocalStorage<Quiz[]>('quizzes', []);
    const [attempts, setAttempts] = useLocalStorage<QuizAttempt[]>('quiz-attempts', []);
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});

    useEffect(() => {
        const foundQuiz = quizzes.find(q => q.id === quizId);
        if (foundQuiz) {
            setQuiz(foundQuiz);
            // Shuffle questions and options once
            const shuffledQs = [...foundQuiz.questions].sort(() => Math.random() - 0.5);
            const shuffledQsWithOptions = shuffledQs.map(q => ({
              ...q,
              options: [...q.options].sort(() => Math.random() - 0.5)
            }));
            setShuffledQuestions(shuffledQsWithOptions);
        } else {
            navigate('/dashboard');
        }
    }, [quizId, quizzes, navigate]);

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const submitQuiz = useCallback(() => {
        if (!quiz || !user) return;
        
        let score = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                score++;
            }
        });

        const newAttempt: QuizAttempt = {
            id: `attempt-${Date.now()}`,
            quizId: quiz.id,
            studentId: user.id,
            answers,
            score,
            totalQuestions: quiz.questions.length,
            completedAt: new Date().toISOString(),
        };

        setAttempts([...attempts, newAttempt]);
        navigate(`/results/${newAttempt.id}`);
    }, [quiz, user, answers, attempts, setAttempts, navigate]);

    if (!quiz || shuffledQuestions.length === 0) {
        return <div className="flex items-center justify-center h-screen">Loading Quiz...</div>;
    }

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="sticky top-0 z-10 p-4 bg-white shadow-md">
                <div className="container flex items-center justify-between mx-auto">
                    <h1 className="text-xl font-bold md:text-2xl">{quiz.title}</h1>
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-600">Question {currentQuestionIndex + 1}/{quiz.questions.length}</span>
                        <Timer initialMinutes={quiz.durationMinutes} onTimeUp={submitQuiz} />
                    </div>
                </div>
            </header>
            <main className="container flex-grow p-4 mx-auto md:p-8">
                <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-xl">
                    <h2 className="mb-6 text-2xl font-semibold leading-relaxed text-gray-800">{currentQuestion.questionText}</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                                className={`p-4 text-left border-2 rounded-lg transition-all text-lg ${answers[currentQuestion.id] === option ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-300 hover:border-primary-400'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
            <footer className="sticky bottom-0 z-10 p-4 bg-white border-t">
                <div className="container flex items-center justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <button onClick={submitQuiz} className="px-8 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === quiz.questions.length - 1}
                            className="px-6 py-3 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default TakeQuizPage;
