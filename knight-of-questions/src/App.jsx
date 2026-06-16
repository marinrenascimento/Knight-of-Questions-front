import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import PostList from './components/PostList.jsx';
import UserForm from './components/UserForm.jsx';
import UserList from './components/UserList.jsx';
import Home from './components/Home.jsx';
import { useToast } from './components/Toast';
import RelatorioMensal from './pages/RelatorioMensal/RelatorioMensal';
import RelatorioSemanal from './pages/RelatorioSemanal/RelatorioSemanal';
import { createUser, getPostsByUserId, getUsers, login, register, getPontos } from './services/api.js';

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
  const [screen, setScreen] = useState('home');
  const [authScreen, setAuthScreen] = useState('login');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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
      showToast(`Bem-vindo, ${data.user.nome || data.user.username}!`, 'success');
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

  async function loadUsers() {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts() {
    if (!token || !currentUser?.id) {
      return;
    }

    setLoading(true);
    try {
      const data = await getPostsByUserId(currentUser.id, token);
      setPosts(data);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(payload) {
    setLoading(true);
    try {
      await createUser(payload, token);
      await loadUsers();
    } catch (error) {
      window.alert(error.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    if (screen === 'users') {
      loadUsers();
      return;
    }

    loadPosts();
  }, [token, screen, currentUser?.id]);

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
    
    <main className="container">
      <header className="header">
        <h1>React Web + API de Alunos</h1>
        <p>
          Usuário autenticado: <strong>{currentUser?.name || currentUser?.email}</strong>
        </p>
      </header>

      <section className="card nav-card">
        <button type="button" onClick={() => setScreen('users')} disabled={screen === 'users'}>
          Tela de usuários
        </button>
        <button type="button" onClick={() => setScreen('posts')} disabled={screen === 'posts'}>
          Tela de posts
        </button>
        <button type="button" className="secondary" onClick={logout}>
          Sair
        </button>
      </section>

      {screen === 'users' ? (
        <>
          <UserForm onCreate={handleCreateUser} loading={loading} />
          <UserList users={users} loading={loading} onReload={loadUsers} />
        </>
      ) : (
        <PostList posts={posts} loading={loading} onReload={loadPosts} />
      )}
    </main>
  );
}
