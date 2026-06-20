import './HelpConta.css';

export default function HelpConta({ onBack }) {
    return (
        <main className="help-conta-container">
            <header className="help-conta-topbar">
                <div className="help-conta-logo">KNIGHT OF<br />QUESTIONS</div>

                <nav className="help-conta-nav">
                    <span>Casa</span>
                    <span>Patente</span>
                    <strong>Ajuda</strong>
                </nav>

                <div className="help-conta-user">
                    <span>10.000</span>
                    <small>Sr. Cavaleiro...</small>
                </div>
            </header>

            <button className="help-conta-back" onClick={onBack}>◀</button>

            <section className="help-conta-title">
                <div className="help-conta-icon">👤</div>
                <h1>CONTA</h1>
                <p>Gerencie seu perfil, avatar e configurações pessoais.</p>
            </section>

            <section className="help-conta-cards">
                <div className="help-conta-card">
                    <h2>EDITANDO SEU PERFIL</h2>
                    <p>Acesse seu perfil clicando no ícone do avatar no canto superior direito.</p>
                </div>

                <div className="help-conta-card">
                    <h2>ESCOLHENDO SEU AVATAR</h2>
                    <p>Escolha entre os avatares disponíveis na área de configurações da conta.</p>
                </div>

                <div className="help-conta-card">
                    <h2>ALTERANDO SENHA</h2>
                    <p>Vá em Configurações, depois em Segurança, para alterar sua senha.</p>
                </div>
            </section>

            <section className="help-conta-support">
                <p>Não encontrou o que procurava?</p>
                <button>▣ Falar com o suporte</button>
            </section>
        </main>
    );
}