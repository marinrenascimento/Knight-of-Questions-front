import { useState } from 'react';
import './LoginForm.css';
import loginImage from '../../assets/login.jpg';
import { useToast } from '../../components/Alerta/Toast';

export default function LoginForm({ onLogin, onNavigateToRegister, loading }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const { showToast } = useToast();

    async function handleSubmit(event) {
        event.preventDefault();

        const normalizedUsername = username.trim();
        const normalizedPassword = password.trim();

        if (!normalizedUsername || !normalizedPassword) {
            showToast('Preencha usuário e senha.', 'warning');
            return;
        }

        await onLogin({ username: normalizedUsername, password: normalizedPassword, rememberMe });
    }

    return (
        <div className="login-page">
            <div className="login-hero" style={{ backgroundImage: `url(${loginImage})` }} />
            <div className="login-panel">
                <div className="login-panel__wrapper">
                    <h1 className="login-panel__title">KNIGHT OF QUESTIONS</h1>

                    <h2 className="login-panel__subtitle">Inicie sua sessão de estudos!</h2>

                    <form onSubmit={handleSubmit} className="login-form">
                        <label className="login-form__label" htmlFor="username">
                            Usuário
                        </label>
                        <input
                            id="username"
                            className="login-form__input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Digite o seu usuário"
                            autoComplete="username"
                        />

                        <label className="login-form__label" htmlFor="password">
                            Senha
                        </label>
                        <input
                            id="password"
                            className="login-form__input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a sua senha"
                            autoComplete="current-password"
                        />

                        <label className="login-form__remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Lembrar de mim
                        </label>

                        <button
                            className="login-form__btn-primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'ENTRANDO...' : 'LOGIN'}
                        </button>

                        <button
                            className="login-form__btn-secondary"
                            type="button"
                            onClick={onNavigateToRegister}
                        >
                            Não tem conta? Cadastre-se
                        </button>

                        <button
                            className="login-form__btn-link"
                            type="button"
                            onClick={() => {/* navegar para recuperar senha */ }}
                        >
                            Esqueceu sua senha?
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}