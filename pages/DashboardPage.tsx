
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role, Quiz, QuizAttempt } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md">
            <nav className="container flex items-center justify-between p-4 mx-auto">
                <div className="flex items-center gap-2">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    <span className="text-xl font-bold text-gray-800">Gemini Quiz Master</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Welcome, <span className="font-semibold">{user?.name}</span></span>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary-600 hover:bg-primary-700">
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    );
};


const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <>
      <Header />
      <main className="container p-4 mx-auto md:p-8">
        {user?.role === Role.Teacher ? <TeacherDashboard /> : <StudentDashboard />}
      </main>
    </>
  );
};

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>('quizzes', []);
  const teacherQuizzes = quizzes.filter(q => q.createdBy === user?.id);
  const [attempts] = useLocalStorage<QuizAttempt[]>('quiz-attempts', []);
  
  const getQuizAttemptsCount = (quizId: string) => {
    return attempts.filter(a => a.quizId === quizId).length;
  };

  const deleteQuiz = (quizId: string) => {
    if(window.confirm("Are you sure you want to delete this quiz and all its attempts?")) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Quizzes</h1>
        <Link to="/quiz/create" className="flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-lg shadow-md bg-primary-600 hover:bg-primary-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Create New Quiz
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teacherQuizzes.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">You haven't created any quizzes yet.</p>
        ) : (
          teacherQuizzes.map(quiz => (
            <div key={quiz.id} className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-800">{quiz.title}</h3>
              <p className="mt-2 text-gray-600">{quiz.questions.length} questions</p>
              <p className="text-gray-600">{quiz.durationMinutes} minutes</p>
              <p className="mt-4 text-sm font-semibold text-primary-700">{getQuizAttemptsCount(quiz.id)} attempts</p>
              <div className="flex justify-end gap-2 mt-4">
                <Link to={`/quiz/edit/${quiz.id}`} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">Edit</Link>
                <button onClick={() => deleteQuiz(quiz.id)} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [quizzes] = useLocalStorage<Quiz[]>('quizzes', []);
  const [attempts] = useLocalStorage<QuizAttempt[]>('quiz-attempts', []);
  const studentAttempts = attempts.filter(a => a.studentId === user?.id);

  const availableQuizzes = quizzes.filter(q => !studentAttempts.some(a => a.quizId === q.id));

  return (
    <div>
      <div className="mb-12">
        <h1 className="mb-6 text-4xl font-bold text-gray-800">Available Quizzes</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableQuizzes.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 text-lg">No new quizzes available.</p>
          ) : (
            availableQuizzes.map(quiz => (
              <div key={quiz.id} className="flex flex-col justify-between p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{quiz.title}</h3>
                  <p className="mt-2 text-gray-600">{quiz.questions.length} questions</p>
                  <p className="text-gray-600">{quiz.durationMinutes} minutes</p>
                </div>
                <Link to={`/quiz/take/${quiz.id}`} className="block w-full px-4 py-3 mt-6 font-semibold text-center text-white rounded-lg bg-primary-600 hover:bg-primary-700">
                  Start Quiz
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
      <div>
        <h1 className="mb-6 text-4xl font-bold text-gray-800">Completed Quizzes</h1>
         <div className="space-y-4">
            {studentAttempts.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">You haven't completed any quizzes yet.</p>
            ) : (
                studentAttempts.map(attempt => {
                    const quiz = quizzes.find(q => q.id === attempt.quizId);
                    return (
                        <div key={attempt.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">{quiz?.title}</h3>
                                <p className="text-sm text-gray-500">Completed on: {new Date(attempt.completedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-primary-700">Score: {attempt.score}/{attempt.totalQuestions}</p>
                                <Link to={`/results/${attempt.id}`} className="text-sm font-semibold text-primary-600 hover:underline">View Results</Link>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
