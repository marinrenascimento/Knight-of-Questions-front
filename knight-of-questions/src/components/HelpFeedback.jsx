import './HelpFeedback.css';

export default function HelpFeedback({ onBack }) {
    return (
        <main className="help-feedback-container">
            <header className="help-feedback-topbar">
                <div className="help-feedback-logo">KNIGHT OF<br />QUESTIONS</div>

                <nav className="help-feedback-nav">
                    <span>Casa</span>
                    <span>Patente</span>
                    <strong>Ajuda</strong>
                </nav>

                <div className="help-feedback-user">
                    <span>10.000</span>
                    <small>Sr. Cavaleiro...</small>
                </div>
            </header>

            <button className="help-feedback-back" onClick={onBack}>◀</button>

            <section className="help-feedback-title">
                <div className="help-feedback-icon">💬</div>
                <h1>FEEDBACK</h1>
                <p>Envie sugestões, reporte bugs ou compartilhe ideias.</p>
            </section>

            <section className="help-feedback-cards">
                <div className="help-feedback-card">
                    <h2>REPORTAR UM BUG</h2>
                    <p>Descreva o problema encontrado, a página onde aconteceu e o dispositivo usado.</p>
                </div>

                <div className="help-feedback-card">
                    <h2>ENVIAR SUGESTÃO DE FUNCIONALIDADE</h2>
                    <p>Envie sua ideia para melhorar a plataforma e ajudar outros estudantes.</p>
                </div>

                <div className="help-feedback-card">
                    <h2>FEEDBACK GERAL</h2>
                    <p>Sua opinião é importante para melhorar a experiência dentro do Knight of Questions.</p>
                </div>
            </section>

            <section className="help-feedback-support">
                <p>Não encontrou o que procurava?</p>
                <button>▣ Falar com o suporte</button>
            </section>
        </main>
    );
12}