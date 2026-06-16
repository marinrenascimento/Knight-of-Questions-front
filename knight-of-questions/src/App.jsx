import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import RelatorioMensal from './pages/RelatorioMensal/RelatorioMensal';
import RelatorioSemanal from './pages/RelatorioSemanal/RelatorioSemanal';
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

  // Dados de pontos/nível/rank do usuário — alimentam o Header
  const [perfilPontos, setPerfilPontos] = useState({
    pontos: 0,
    nivel: 0,
    rank: '—',
  });

  // Busca pontos reais sempre que o token muda (login ou refresh)
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
        // Silencioso: mantém valores padrão se falhar
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
    } catch (error) {
      window.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload) {
    setLoading(true);
    try {
      await register(payload);
      window.alert('Conta criada com sucesso! Faça login para continuar.');
      setAuthScreen('login');
    } catch (error) {
      window.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main>
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
      </main>
    );
  }

  // Props compartilhadas com todas as telas autenticadas
  const sharedProps = {
    currentUser,
    logout,
    perfilPontos,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<RelatorioMensal {...sharedProps} />}
        />
        <Route
          path="/semanal"
          element={<RelatorioSemanal {...sharedProps} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
