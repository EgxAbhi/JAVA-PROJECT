
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { Quiz, QuizAttempt, Question } from '../types';

const ResultsPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const [quizzes] = useLocalStorage<Quiz[]>('quizzes', []);
    const [attempts] = useLocalStorage<QuizAttempt[]>('quiz-attempts', []);
    
    const attempt = attempts.find(a => a.id === attemptId);
    const quiz = attempt ? quizzes.find(q => q.id === attempt.quizId) : null;

    if (!attempt || !quiz) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <h1 className="text-2xl font-bold">Result not found</h1>
                <Link to="/dashboard" className="mt-4 px-4 py-2 text-white bg-primary-600 rounded-md">
                    Go to Dashboard
                </Link>
            </div>
        );
    }
    
    const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="py-8 bg-white shadow-md">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-800">{quiz.title} - Results</h1>
                    <p className="mt-4 text-2xl font-semibold">
                        Your Score: <span className="text-primary-600">{attempt.score} / {attempt.totalQuestions} ({percentage}%)</span>
                    </p>
                    <Link to="/dashboard" className="inline-block px-6 py-3 mt-8 font-semibold text-white transition-colors rounded-lg shadow-md bg-primary-600 hover:bg-primary-700">
                        Back to Dashboard
                    </Link>
                </div>
            </header>
            <main className="container p-4 mx-auto mt-10 md:p-8">
                <h2 className="mb-8 text-3xl font-bold text-center text-gray-700">Review Your Answers</h2>
                <div className="max-w-4xl mx-auto space-y-6">
                    {quiz.questions.map((question, index) => {
                        const userAnswer = attempt.answers[question.id];
                        const isCorrect = userAnswer === question.correctAnswer;
                        return (
                            <div key={question.id} className="p-6 bg-white rounded-lg shadow-lg">
                                <p className="mb-4 text-lg font-semibold text-gray-800">{index + 1}. {question.questionText}</p>
                                <div className="space-y-2">
                                    {question.options.map((option, i) => {
                                        let optionClass = "border-gray-300";
                                        let icon = null;

                                        if (option === question.correctAnswer) {
                                            optionClass = "bg-green-100 border-green-500";
                                            icon = <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
                                        }
                                        if (option === userAnswer && !isCorrect) {
                                            optionClass = "bg-red-100 border-red-500";
                                            icon = <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
                                        }
                                        
                                        return (
                                            <div key={i} className={`flex items-center gap-3 p-3 border rounded-md ${optionClass}`}>
                                                {icon}
                                                <span>{option}</span>
                                                {option === userAnswer && <span className="ml-auto text-sm font-semibold text-gray-500">(Your Answer)</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default ResultsPage;
