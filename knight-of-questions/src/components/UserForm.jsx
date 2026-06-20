import { useState } from 'react';
import { useToast } from './Toast';

export default function UserForm({ onCreate, loading }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('123456');
    const { showToast } = useToast();

    async function handleSubmit(event) {
        event.preventDefault();

        const normalizedName = name.trim();
        const normalizedEmail = email.trim();
        const normalizedPassword = password.trim();

        if (!normalizedName || !normalizedEmail || !normalizedPassword) {
            showToast('Preencha nome, e-mail e senha.', 'warning');
            return;
        }

        await onCreate({
            name: normalizedName,
            email: normalizedEmail,
            password: normalizedPassword,
        });

        setName('');
        setEmail('');
        setPassword('123456');
    }

    return (
        <form className="card" onSubmit={handleSubmit}>
            <h2>Cadastrar usuário</h2>

            <label htmlFor="name">Nome</label>
            <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Digite o nome"
            />

            <label htmlFor="email">E-mail</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite o e-mail"
            />

            <label htmlFor="password">Senha</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar usuário'}
            </button>
        </form>
    );
}
