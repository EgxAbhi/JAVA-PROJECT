
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Quiz, Question, QuestionType } from '../types';
import { generateQuestions } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';

const Spinner: React.FC = () => (
    <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CreateQuizPage: React.FC = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>('quizzes', []);
    
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(10);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const [aiTopic, setAiTopic] = useState('');
    const [aiNumQuestions, setAiNumQuestions] = useState(5);
    const [aiQuestionType, setAiQuestionType] = useState<QuestionType>(QuestionType.MultipleChoice);

    useEffect(() => {
        if (quizId) {
            const existingQuiz = quizzes.find(q => q.id === quizId);
            if (existingQuiz) {
                setTitle(existingQuiz.title);
                setDuration(existingQuiz.durationMinutes);
                setQuestions(existingQuiz.questions);
            }
        }
    }, [quizId, quizzes]);
    
    const handleGenerateQuestions = async () => {
        if (!aiTopic) {
            setError('Please enter a topic for question generation.');
            return;
        }
        setIsGenerating(true);
        setError('');
        try {
            const newQuestions = await generateQuestions(aiTopic, aiNumQuestions, aiQuestionType);
            setQuestions(prev => [...prev, ...newQuestions]);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSaveQuiz = () => {
        if (!title || questions.length === 0) {
            alert('Please provide a title and at least one question.');
            return;
        }
        const newQuiz: Quiz = {
            id: quizId || `quiz-${Date.now()}`,
            title,
            durationMinutes: duration,
            questions,
            createdBy: user!.id,
        };
        
        if(quizId){
            setQuizzes(quizzes.map(q => q.id === quizId ? newQuiz : q));
        } else {
            setQuizzes([...quizzes, newQuiz]);
        }

        navigate('/dashboard');
    };
    
    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="container flex items-center justify-between p-4 mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800">{quizId ? 'Edit Quiz' : 'Create Quiz'}</h1>
                    <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        Back to Dashboard
                    </Link>
                </div>
            </header>
            <main className="container p-4 mx-auto mt-8 md:p-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    <div className="p-8 bg-white rounded-lg shadow-lg lg:col-span-2">
                        <h2 className="mb-6 text-2xl font-semibold">Quiz Details</h2>
                        <div className="mb-6">
                            <label htmlFor="title" className="block mb-2 font-medium text-gray-700">Quiz Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="duration" className="block mb-2 font-medium text-gray-700">Duration (minutes)</label>
                            <input type="number" id="duration" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        
                        <h2 className="mt-10 mb-6 text-2xl font-semibold">Questions ({questions.length})</h2>
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={q.id} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <p className="font-semibold">{index + 1}. {q.questionText}</p>
                                        <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        {q.options.map((opt, i) => (
                                            <p key={i} className={`pl-4 text-sm ${opt === q.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-600'}`}>{opt} {opt === q.correctAnswer && '(Correct)'}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-8">
                            <button onClick={handleSaveQuiz} className="px-8 py-3 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700">
                                {quizId ? 'Update Quiz' : 'Save Quiz'}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-white rounded-lg shadow-lg">
                        <h2 className="mb-6 text-2xl font-semibold">AI Question Generator</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="topic" className="block mb-2 font-medium text-gray-700">Topic</label>
                                <input type="text" id="topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., React Hooks" />
                            </div>
                            <div>
                                <label htmlFor="numQuestions" className="block mb-2 font-medium text-gray-700">Number of Questions</label>
                                <input type="number" id="numQuestions" value={aiNumQuestions} onChange={e => setAiNumQuestions(parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="questionType" className="block mb-2 font-medium text-gray-700">Question Type</label>
                                <select id="questionType" value={aiQuestionType} onChange={e => setAiQuestionType(e.target.value as QuestionType)} className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500">
                                    <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                                    <option value={QuestionType.TrueFalse}>True / False</option>
                                </select>
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <button onClick={handleGenerateQuestions} disabled={isGenerating} className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400">
                                {isGenerating ? <><Spinner/> Generating...</> : 'Generate Questions'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateQuizPage;
