import { getPontos, getHistoricoPontos, getOfensiva, getTempoSessao } from './api.js';

/**
 * Filtra itens do histórico que estão dentro de um período (em dias atrás).
 */
function filtrarPorPeriodo(historico, diasAtras) {
  const limite = new Date();
  limite.setDate(limite.getDate() - diasAtras);
  return historico.filter((item) => new Date(item.criado_em) >= limite);
}

/**
 * Conta quantas entradas de uma ação específica existem no array.
 */
function contarAcao(historico, acao) {
  return historico.filter((item) => item.acao === acao).length;
}

/**
 * Soma pontos ganhos por ação.
 */
function somarPontosPorAcao(historico, acao) {
  return historico
    .filter((item) => item.acao === acao)
    .reduce((acc, item) => acc + (item.pontos_ganhos || 0), 0);
}

/**
 * Agrupa histórico de pontos por dia da semana (últimos 7 dias).
 * Retorna array com label (Seg, Ter...) e valor de pontos por dia.
 */
function agruparPorDiaSemana(historico) {
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const hoje = new Date();
  const resultado = [];

  for (let i = 6; i >= 0; i--) {
    const dia = new Date();
    dia.setDate(hoje.getDate() - i);
    dia.setHours(0, 0, 0, 0);

    const proximoDia = new Date(dia);
    proximoDia.setDate(proximoDia.getDate() + 1);

    const pontosDia = historico
      .filter((item) => {
        const data = new Date(item.criado_em);
        return data >= dia && data < proximoDia;
      })
      .reduce((acc, item) => acc + (item.pontos_ganhos || 0), 0);

    resultado.push({
      label: DIAS[dia.getDay()],
      value: pontosDia,
      formattedValue: `${pontosDia}pts`,
    });
  }

  // Normaliza percentagem em relação ao máximo do período
  const maxVal = Math.max(...resultado.map((d) => d.value), 1);
  return resultado.map((d) => ({ ...d, percentage: Math.round((d.value / maxVal) * 100) }));
}

/**
 * Agrupa pontos por mês: este mês vs. mês passado.
 */
function agruparPorMes(historico) {
  const agora = new Date();
  const inicioEsteMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioMesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

  const pontoEsteMes = historico
    .filter((item) => new Date(item.criado_em) >= inicioEsteMes)
    .reduce((acc, item) => acc + (item.pontos_ganhos || 0), 0);

  const pontoMesPassado = historico
    .filter((item) => {
      const d = new Date(item.criado_em);
      return d >= inicioMesPassado && d < inicioEsteMes;
    })
    .reduce((acc, item) => acc + (item.pontos_ganhos || 0), 0);

  const maxVal = Math.max(pontoEsteMes, pontoMesPassado, 1);

  return [
    {
      label: 'Este mês',
      value: pontoEsteMes,
      formattedValue: `${pontoEsteMes}pts`,
      percentage: Math.round((pontoEsteMes / maxVal) * 100),
    },
    {
      label: 'Mês passado',
      value: pontoMesPassado,
      formattedValue: `${pontoMesPassado}pts`,
      percentage: Math.round((pontoMesPassado / maxVal) * 100),
    },
  ];
}

/**
 * Busca e processa todos os dados para o Relatório Semanal.
 */
export async function getDadosSemanal(token, userId) {
  const [pontos, historico, ofensiva, sessao] = await Promise.all([
    getPontos(token),
    getHistoricoPontos(token),
    getOfensiva(token),
    getTempoSessao(userId, token).catch(() => ({ total_minutos: 0 })),
  ]);

  const historicoSemana = filtrarPorPeriodo(historico, 7);

  const totalMinutos = sessao?.total_minutos || 0;
  const horasFormatadas = (totalMinutos / 60).toFixed(1) + 'H';

  const questoesRespondidas = contarAcao(historicoSemana, 'questoes');
  const flashcardsRevisados = contarAcao(historicoSemana, 'cards');
  const jogosFeitos = contarAcao(historicoSemana, 'jogos');

  const sequenciaDias = ofensiva?.sequencia_dias ?? 0;

  const chartData = agruparPorDiaSemana(historico);

  const atividadesData = [
    { label: 'Questões acertadas', value: questoesRespondidas, icon: '📝' },
    { label: 'Flashcards revisados', value: flashcardsRevisados, icon: '🃏' },
    { label: 'Jogos jogados', value: jogosFeitos, icon: '🎮' },
  ];

  return {
    horasEstudo: horasFormatadas,
    questoesRespondidas,
    sequenciaDias: `${sequenciaDias} DIAS`,
    pontos: pontos?.pontos ?? 0,
    nivel: pontos?.nivel ?? 0,
    rank: pontos?.rank ?? '—',
    chartData,
    atividadesData,
  };
}

/**
 * Busca e processa todos os dados para o Relatório Mensal.
 */
export async function getDadosMensal(token, userId) {
  const [pontos, historico, ofensiva, sessao] = await Promise.all([
    getPontos(token),
    getHistoricoPontos(token),
    getOfensiva(token),
    getTempoSessao(userId, token).catch(() => ({ total_minutos: 0 })),
  ]);

  const historicoMes = filtrarPorPeriodo(historico, 30);

  const totalMinutos = sessao?.total_minutos || 0;
  const horasFormatadas = (totalMinutos / 60).toFixed(1) + 'H';

  const questoesRespondidas = contarAcao(historicoMes, 'questoes');
  const flashcardsRevisados = contarAcao(historicoMes, 'cards');
  const jogosFeitos = contarAcao(historicoMes, 'jogos');

  const sequenciaDias = ofensiva?.sequencia_dias ?? 0;

  const chartData = agruparPorMes(historico);

  const atividadesData = [
    { label: 'Questões acertadas', value: questoesRespondidas, icon: '📝' },
    { label: 'Flashcards revisados', value: flashcardsRevisados, icon: '🃏' },
    { label: 'Jogos jogados', value: jogosFeitos, icon: '🎮' },
  ];

  return {
    horasEstudo: horasFormatadas,
    questoesRespondidas,
    sequenciaDias: `${sequenciaDias} DIAS`,
    pontos: pontos?.pontos ?? 0,
    nivel: pontos?.nivel ?? 0,
    rank: pontos?.rank ?? '—',
    chartData,
    atividadesData,
  };
}
