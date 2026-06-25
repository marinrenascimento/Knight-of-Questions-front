import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import BarChart from '../../components/BarChart/BarChart';
import '../RelatorioMensal/RelatorioMensal.css';
import './RelatorioSemanal.css';
import { getDadosSemanal } from '../../services/relatorioService';

const STORAGE_KEY = 'aulafront_auth';

function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function RelatorioSemanal({ currentUser, logout, perfilPontos }) {
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const { token, user } = getAuth();
        const userId = user?.id || currentUser?.id;
        const resultado = await getDadosSemanal(token, userId);
        setDados(resultado);
      } catch (e) {
        setErro('Não foi possível carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [currentUser?.id]);

  return (
    <div className="page-layout">
      <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />

      <main className="report-content">
        <div className="report-header">
          <div className="report-title-area">
            <button className="back-btn" onClick={() => navigate('/')} title="Sair (Home)">
              <span className="back-icon">✖</span>
            </button>
            <h1 className="pixel-text report-title">RELATÓRIO SEMANAL</h1>
          </div>
          <button className="toggle-btn" onClick={() => navigate('/mensal')} title="Próximo relatório (Mensal)">
            <span className="toggle-icon">⏭</span>
          </button>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text pixel-text">CARREGANDO DADOS...</p>
          </div>
        )}

        {erro && !loading && (
          <div className="error-container">
            <p className="error-text pixel-text">⚠ {erro}</p>
          </div>
        )}

        {!loading && !erro && dados && (
          <>
            <div className="summary-cards-row">
              <SummaryCard icon="🕒" value={dados.horasEstudo} label="Horas de uso total" />
              <SummaryCard icon="🎯" value={String(dados.questoesRespondidas)} label="Questões acertadas esta semana" />
              <SummaryCard icon="⭐" value={String(dados.pontos)} label={`Pontos • Nível ${dados.nivel}`} />
              <SummaryCard icon="🔥" value={dados.sequenciaDias} label="Sequência atual" />
            </div>

            <section className="report-section">
              <h2 className="pixel-text section-title">PONTOS GANHOS — ÚLTIMOS 7 DIAS</h2>
              <BarChart data={dados.chartData} direction="vertical" />
            </section>

            <section className="report-section">
              <h2 className="pixel-text section-title">ATIVIDADES ESTA SEMANA</h2>
              <div className="atividades-container">
                {dados.atividadesData.map((item, index) => (
                  <div key={index} className="atividade-item">
                    <span className="atividade-icon">{item.icon}</span>
                    <div className="atividade-info">
                      <span className="atividade-label pixel-text">{item.label}</span>
                      <span className="atividade-value pixel-text">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
