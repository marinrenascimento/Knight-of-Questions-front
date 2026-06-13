import { useState } from 'react';
import './RegisterForm.css';
import loginImage from '../assets/login.jpg';

export default function RegisterForm({ onRegister, onNavigateToLogin, loading }) {
    const [nome, setNome] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();

        const normalizedNome = nome.trim();
        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim();
        const normalizedPassword = password;
        const normalizedConfirmPassword = confirmPassword;

        if (!normalizedNome || !normalizedUsername || !normalizedEmail || !normalizedPassword || !normalizedConfirmPassword) {
            window.alert('Preencha todos os campos obrigatórios.');
            return;
        }

        if (normalizedPassword.length < 8) {
            window.alert('A senha deve conter ao menos 8 caracteres.');
            return;
        }

        if (normalizedPassword !== normalizedConfirmPassword) {
            window.alert('As senhas não coincidem.');
            return;
        }

        await onRegister({
            nome: normalizedNome,
            username: normalizedUsername,
            email: normalizedEmail,
            password: normalizedPassword,
        });
    }

    return (
        <div className="register-page">
            <div className="register-hero" style={{ backgroundImage: `url(${loginImage})` }} />
            <div className="register-panel">
                <div className="register-panel__wrapper">
                    <h1 className="register-panel__title">KNIGHT OF QUESTIONS</h1>

                    <h2 className="register-panel__subtitle">Crie uma nova conta!</h2>

                    <form onSubmit={handleSubmit} className="register-form">
                        <label className="register-form__label" htmlFor="nome">
                            Nome
                        </label>
                        <input
                            id="nome"
                            className="register-form__input"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite o seu usuário"
                            autoComplete="name"
                        />

                        <label className="register-form__label" htmlFor="username">
                            Usuário
                        </label>
                        <input
                            id="username"
                            className="register-form__input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Digite o seu usuário"
                            autoComplete="username"
                        />

                        <label className="register-form__label" htmlFor="email">
                            E-mail
                        </label>
                        <input
                            id="email"
                            className="register-form__input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite o seu usuário"
                            autoComplete="email"
                        />

                        <label className="register-form__label" htmlFor="password">
                            Senha
                        </label>
                        <input
                            id="password"
                            className="register-form__input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite o seu usuário"
                            autoComplete="new-password"
                        />

                        <label className="register-form__label" htmlFor="confirmPassword">
                            Repita a senha
                        </label>
                        <input
                            id="confirmPassword"
                            className="register-form__input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Digite o seu usuário"
                            autoComplete="new-password"
                        />

                        <button
                            className="register-form__btn-primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
                        </button>

                        <button
                            className="register-form__btn-link"
                            type="button"
                            onClick={onNavigateToLogin}
                        >
                            Já tem conta? Entrar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
