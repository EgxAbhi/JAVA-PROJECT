
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateQuizPage from './pages/CreateQuizPage';
import TakeQuizPage from './pages/TakeQuizPage';
import ResultsPage from './pages/ResultsPage';
import { Role } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/quiz/create" element={
          <ProtectedRoute requiredRole={Role.Teacher}>
            <CreateQuizPage />
          </ProtectedRoute>
        } />

        <Route path="/quiz/edit/:quizId" element={
          <ProtectedRoute requiredRole={Role.Teacher}>
            <CreateQuizPage />
          </ProtectedRoute>
        } />
        
        <Route path="/quiz/take/:quizId" element={
          <ProtectedRoute requiredRole={Role.Student}>
            <TakeQuizPage />
          </ProtectedRoute>
        } />
        
        <Route path="/results/:attemptId" element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: Role;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default App;
