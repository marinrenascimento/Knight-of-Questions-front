import './HelpPrivacidade.css';

export default function HelpPrivacidade({ onBack }) {
    return (
        <main className="help-privacidade-container">
            <header className="help-privacidade-topbar">
                <div className="help-privacidade-logo">KNIGHT OF<br />QUESTIONS</div>

                <nav className="help-privacidade-nav">
                    <span>Casa</span>
                    <span>Patente</span>
                    <strong>Ajuda</strong>
                </nav>

                <div className="help-privacidade-user">
                    <span>10.000</span>
                    <small>Sr. Cavaleiro...</small>
                </div>
            </header>

            <button className="help-privacidade-back" onClick={onBack}>◀</button>

            <section className="help-privacidade-title">
                <div className="help-privacidade-icon">🛡️</div>
                <h1>PRIVACIDADE E SEGURANÇA</h1>
                <p>Gerencie seus dados e mantenha sua conta protegida.</p>
            </section>

            <section className="help-privacidade-cards">
                <div className="help-privacidade-card">
                    <h2>COMO PROTEGEMOS SEUS DADOS</h2>
                    <p>Seus dados são armazenados com segurança e usados apenas para melhorar sua experiência.</p>
                </div>

                <div className="help-privacidade-card">
                    <h2>EXPORTAR OU EXCLUIR SEUS DADOS</h2>
                    <p>Você pode solicitar a exportação ou exclusão dos seus dados nas configurações da conta.</p>
                </div>

                <div className="help-privacidade-card">
                    <h2>AUTENTICAÇÃO EM DUAS ETAPAS</h2>
                    <p>Ative a autenticação em duas etapas para deixar sua conta mais segura.</p>
                </div>
            </section>

            <section className="help-privacidade-support">
                <p>Não encontrou o que procurava?</p>
                <button>▣ Falar com o suporte</button>
            </section>
        </main>
    );
}