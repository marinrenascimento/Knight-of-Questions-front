import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './pages/Login/LoginForm.jsx';
import RegisterForm from './pages/Register/RegisterForm.jsx';
import Home from './pages/Home/Home.jsx';
import { useToast } from './components/Alerta/Toast.jsx';
import RelatorioMensal from './pages/RelatorioMensal/RelatorioMensal';
import RelatorioSemanal from './pages/RelatorioSemanal/RelatorioSemanal';
import Help from './components/Help.jsx';
import { login, register, getPontos } from './services/api.js';

const STORAGE_KEY = 'aulafront_auth';

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const storedAuth = readStoredAuth();

  const [token, setToken] = useState(storedAuth?.token || '');
  const [currentUser, setCurrentUser] = useState(storedAuth?.user || null);
  const [authScreen, setAuthScreen] = useState('login');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [perfilPontos, setPerfilPontos] = useState({
    pontos: 0,
    nivel: 0,
    rank: '—',
  });

  useEffect(() => {
    if (!token) return;

    async function carregarPerfil() {
      try {
        const dados = await getPontos(token);
        setPerfilPontos({
          pontos: dados.pontos ?? 0,
          nivel: dados.nivel ?? 0,
          rank: dados.rank ?? '—',
        });
      } catch {
      }
    }

    carregarPerfil();
  }, [token]);


  function persistAuth(nextToken, nextUser) {
    setToken(nextToken);
    setCurrentUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken('');
    setCurrentUser(null);
    setPerfilPontos({ pontos: 0, nivel: 0, rank: '—' });
    setAuthScreen('login');
  }

  async function handleLogin(payload) {
    setLoading(true);
    try {
      const data = await login(payload);
      persistAuth(data.accessToken, data.user);
      showToast(`Bem-vindo(a), ${data.user.nome || data.user.username}!`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload) {
    setLoading(true);
    try {
      await register(payload);
      showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
      setAuthScreen('login');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main style={{
        backgroundColor: 'var(--bg-color)',
        minHeight: '100vh',
        padding: '20px',
      }
      }>
        {authScreen === 'login' ? (
          <LoginForm
            onLogin={handleLogin}
            onNavigateToRegister={() => setAuthScreen('register')}
            loading={loading}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onNavigateToLogin={() => setAuthScreen('login')}
            loading={loading}
          />
        )}
      </main >
    );
  }

  const sharedProps = {
    currentUser,
    logout,
    perfilPontos,
  };

  return (
    <BrowserRouter>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home {...sharedProps} />} />
          <Route path="/semanal" element={<RelatorioSemanal {...sharedProps} />} />
          <Route path="/mensal" element={<RelatorioMensal {...sharedProps} />} />
          <Route path="/help" element={<Help {...sharedProps} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}