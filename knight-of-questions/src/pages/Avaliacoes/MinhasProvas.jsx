import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import {
    addPontos,
    createAvaliacao,
    createAvaliacaoPorDisciplina,
    createPergunta,
    deleteAvaliacao,
    deletePergunta,
    getAvaliacaoById,
    getAvaliacoesByUser,
    getAvaliacoesVestibulares,
    getConteudosByDisciplina,
    getDisciplinas,
    updatePergunta
} from '../../services/api';
import chestImg from '../../assets/dragon-pixel.png';
import './MinhasProvas.css';
import emptyBau from '../../assets/empty-bau.png';


const STORAGE_KEY = 'aulafront_auth';

const emptyAlternativas = [
    { texto: '', is_correta: true, descricao: '' },
    { texto: '', is_correta: false, descricao: '' },
    { texto: '', is_correta: false, descricao: '' },
    { texto: '', is_correta: false, descricao: '' }
];

const difficultyLabels = {
    1: 'Facil',
    2: 'Medio',
    3: 'Dificil'
};

function getAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function getDynamicFontSize(text) {
    if (!text) return '24px';
    const len = text.length;
    if (len <= 10) return '28px';
    const size = Math.max(14, 28 - (len - 10) * 0.4);
    return `${Math.round(size)}px`;
}

function buildQuestionForm(question, examId) {
    const alternativas = question?.alternativas?.length ? question.alternativas : emptyAlternativas;
    return {
        enunciado: question?.enunciado || '',
        nivel_dificuldade: String(question?.nivel_dificuldade || 1),
        disciplina_id: String(question?.disciplina_id || 1),
        conteudo_id: String(question?.conteudo_id || 1),
        id_avaliacao: question?.id_avaliacao || examId,
        alternativas: alternativas.map((alt, index) => ({
            id: alt.id,
            texto: alt.texto || '',
            descricao: alt.descricao || '',
            is_correta: !!alt.is_correta || (!question && index === 0)
        }))
    };
}

export default function MinhasProvas({ currentUser, logout, perfilPontos }) {
    const navigate = useNavigate();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('minhas');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showManualExamModal, setShowManualExamModal] = useState(false);
    const [newExamName, setNewExamName] = useState('');
    const [linkedQuestions, setLinkedQuestions] = useState([]);

    const [selectedDiscipline, setSelectedDiscipline] = useState('1');
    const [selectedContent, setSelectedContent] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [disciplinas, setDisciplinas] = useState([]);
    const [conteudos, setConteudos] = useState([]);
    const [questionConteudos, setQuestionConteudos] = useState([]);

    const [activeExam, setActiveExam] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [questionModal, setQuestionModal] = useState(null);
    const [questionForm, setQuestionForm] = useState(buildQuestionForm(null, null));
    const [answers, setAnswers] = useState({});
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [result, setResult] = useState(null);
    const [showDeleteExamConfirmModal, setShowDeleteExamConfirmModal] = useState(false);

    const { token, user } = getAuth();
    const userId = user?.id || currentUser?.id;
    const canManageQuestions = filter === 'minhas';

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

    const carregarAvaliacoes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data = [];
            if (filter === 'minhas') {
                if (userId) data = await getAvaliacoesByUser(userId, token);
            } else {
                data = await getAvaliacoesVestibulares(token);
            }
            setAvaliacoes(data);
        } catch (e) {
            setError(e.message || 'Não foi possivel carregar as avaliacoes.');
        } finally {
            setLoading(false);
        }
    }, [filter, token, userId]);

    const reloadActiveExam = async (examId = activeExam?.id) => {
        if (!examId) return null;
        const examDetails = await getAvaliacaoById(examId, token);
        setActiveExam(examDetails);
        return examDetails;
    };

    useEffect(() => {
        carregarAvaliacoes();
    }, [carregarAvaliacoes]);

    useEffect(() => {
        async function loadDisciplinas() {
            if (!token) return;
            try {
                const data = await getDisciplinas(token);
                setDisciplinas(data);
                if (data.length > 0 && !selectedDiscipline) {
                    setSelectedDiscipline(String(data[0].id));
                }
            } catch (err) {
                console.warn('Não foi possivel carregar disciplinas:', err.message);
            }
        }

        loadDisciplinas();
    }, [selectedDiscipline, token]);

    useEffect(() => {
        async function loadConteudos() {
            if (!token || !selectedDiscipline) return;
            try {
                const data = await getConteudosByDisciplina(selectedDiscipline, token);
                setConteudos(data);
                setSelectedContent((current) => {
                    if (data.some((item) => String(item.id) === String(current))) return current;
                    return data[0]?.id ? String(data[0].id) : '';
                });
            } catch (err) {
                setConteudos([]);
                setSelectedContent('');
                console.warn('Não foi possivel carregar conteudos:', err.message);
            }
        }

        loadConteudos();
    }, [selectedDiscipline, token]);

    useEffect(() => {
        async function loadQuestionConteudos() {
            if (!token || !questionModal || !questionForm.disciplina_id) return;
            try {
                const data = await getConteudosByDisciplina(questionForm.disciplina_id, token);
                setQuestionConteudos(data);
                setQuestionForm((prev) => {
                    if (data.some((item) => String(item.id) === String(prev.conteudo_id))) return prev;
                    return { ...prev, conteudo_id: data[0]?.id ? String(data[0].id) : '' };
                });
            } catch (err) {
                setQuestionConteudos([]);
                console.warn('Não foi possivel carregar conteudos da questao:', err.message);
            }
        }

        loadQuestionConteudos();
    }, [questionForm.disciplina_id, questionModal, token]);

    const handleCreateExam = async (e) => {
        e.preventDefault();
        if (!selectedDiscipline || !selectedContent) {
            alert('Escolha uma disciplina e um conteudo.');
            return;
        }

        try {
            const response = await createAvaliacaoPorDisciplina({
                disciplina_id: parseInt(selectedDiscipline, 10),
                conteudo_id: parseInt(selectedContent, 10),
                quantidade: parseInt(numQuestions, 10),
                id_user: userId
            }, token);
            setShowCreateModal(false);
            setFilter('minhas');
            await carregarAvaliacoes();
            if (response?.avaliacao?.id) {
                await handleOpenExam(response.avaliacao.id);
            }
        } catch (err) {
            alert(err.message || 'Erro ao criar prova personalizada');
        }
    };

    const handleSaveManualExam = async (e) => {
        e.preventDefault();
        if (!newExamName.trim()) {
            alert('Digite o nome da prova.');
            return;
        }
        if (linkedQuestions.length === 0) {
            alert('Adicione pelo menos uma questão na prova.');
            return;
        }

        try {
            const payload = {
                titulo: newExamName.trim(),
                is_vestibular: false,
                id_user: userId,
                perguntas: linkedQuestions
            };
            await createAvaliacao(payload, token);
            setShowManualExamModal(false);
            setNewExamName('');
            setLinkedQuestions([]);
            await carregarAvaliacoes();
        } catch (err) {
            alert(err.message || 'Erro ao criar prova manual');
        }
    };

    const handleOpenExam = async (examId) => {
        try {
            setLoading(true);
            await reloadActiveExam(examId);
            setViewMode('details');
            setAnswers({});
            setResult(null);
        } catch (err) {
            alert(err.message || 'Erro ao carregar prova');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (viewMode === 'study') {
            setViewMode('details');
            setAnswers({});
            setResult(null);
            return;
        }
        if (viewMode === 'details') {
            setActiveExam(null);
            setViewMode('grid');
            carregarAvaliacoes();
            return;
        }
        navigate('/');
    };

    const openQuestionModal = (type, question = null) => {
        setQuestionModal({ type, question });
        const form = buildQuestionForm(question, activeExam?.id);
        if (!question && disciplinas.length > 0) {
            form.disciplina_id = String(disciplinas[0].id);
        }
        setQuestionForm(form);
    };

    const closeQuestionModal = () => {
        setQuestionModal(null);
        setQuestionForm(buildQuestionForm(null, activeExam?.id));
    };

    const updateAlternativeForm = (index, field, value) => {
        setQuestionForm((prev) => ({
            ...prev,
            alternativas: prev.alternativas.map((alt, altIndex) => {
                if (field === 'is_correta') {
                    return { ...alt, is_correta: altIndex === index };
                }
                return altIndex === index ? { ...alt, [field]: value } : alt;
            })
        }));
    };

    const addAlternativeField = () => {
        setQuestionForm((prev) => ({
            ...prev,
            alternativas: [
                ...prev.alternativas,
                { texto: '', is_correta: prev.alternativas.length === 0, descricao: '' }
            ]
        }));
    };

    const removeAlternativeField = (index) => {
        setQuestionForm((prev) => {
            const alternativas = prev.alternativas.filter((_, altIndex) => altIndex !== index);
            if (!alternativas.some((alt) => alt.is_correta) && alternativas.length > 0) {
                alternativas[0] = { ...alternativas[0], is_correta: true };
            }
            return { ...prev, alternativas };
        });
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        const alternativasValidas = questionForm.alternativas.filter((alt) => alt.texto.trim());
        if (!questionForm.enunciado.trim() || alternativasValidas.length < 2) {
            alert('Informe o enunciado e pelo menos duas alternativas.');
            return;
        }

        const payload = {
            ...questionForm,
            nivel_dificuldade: parseInt(questionForm.nivel_dificuldade, 10),
            disciplina_id: parseInt(questionForm.disciplina_id, 10),
            conteudo_id: questionForm.conteudo_id ? parseInt(questionForm.conteudo_id, 10) : null,
            alternativas: alternativasValidas.map((alt) => ({
                ...alt,
                texto: alt.texto.trim(),
                is_correta: !!alt.is_correta,
                descricao: alt.descricao?.trim() || null
            }))
        };

        if (showManualExamModal) {
            setLinkedQuestions((prev) => [...prev, payload]);
            closeQuestionModal();
            return;
        }

        try {
            if (questionModal?.type === 'edit') {
                await updatePergunta(questionModal.question.id, payload, token);
            } else {
                await createPergunta(payload, token);
            }
            await reloadActiveExam();
            await carregarAvaliacoes();
            closeQuestionModal();
        } catch (err) {
            alert(err.message || 'Erro ao salvar questao');
        }
    };

    const handleDeleteQuestion = async () => {
        try {
            await deletePergunta(questionModal.question.id, token);
            await reloadActiveExam();
            await carregarAvaliacoes();
            closeQuestionModal();
        } catch (err) {
            alert(err.message || 'Erro ao excluir questao');
        }
    };

    const handleDeleteExam = () => {
        setShowDeleteExamConfirmModal(true);
    };

    const confirmDeleteExam = async () => {
        if (!activeExam) return;
        try {
            await deleteAvaliacao(activeExam.id, token);
            setShowDeleteExamConfirmModal(false);
            setActiveExam(null);
            setViewMode('grid');
            await carregarAvaliacoes();
        } catch (err) {
            alert(err.message || 'Erro ao excluir prova');
        }
    };

    const startStudy = () => {
        if (!activeExam?.perguntas?.length) {
            alert('Esta prova não contem questões cadastradas.');
            return;
        }
        setAnswers({});
        setResult(null);
        setViewMode('study');
    };

    const selectAnswer = (questionId, alternativeId) => {
        setAnswers((prev) => ({ ...prev, [questionId]: alternativeId }));
    };

    const finishExam = async () => {
        const correct = activeExam.perguntas.reduce((total, question) => {
            const alternativa = question.alternativas?.find((alt) => alt.id === answers[question.id]);
            return total + (alternativa?.is_correta ? 1 : 0);
        }, 0);
        setResult({ correct, total: activeExam.perguntas.length });
        setShowSubmitConfirm(false);

        if (correct > 0) {
            try {
                await addPontos({ acao: 'questoes', quantidade: correct }, token);
            } catch (err) {
                console.warn('Não foi possivel registrar pontos:', err.message);
            }
        }
    };

    const renderCreateExamModal = () => {
        if (!showManualExamModal) return null;

        return (
            <div className="kq-modal-overlay">
                <div className="kq-modal-content" style={{ maxWidth: '650px' }}>
                    <div className="kq-modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
                        <h2 className="pixel-text" style={{ fontSize: '1.8rem', letterSpacing: '2px' }}>CADASTRO DE PROVA</h2>
                        <button className="close-btn" style={{ position: 'absolute', right: '15px' }} onClick={() => setShowManualExamModal(false)}>&times;</button>
                    </div>

                    <form onSubmit={handleSaveManualExam} className="kq-modal-form" style={{ background: '#fff', borderRadius: '12px', padding: '25px', marginTop: '15px' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '25px' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="pixel-text label-sm" style={{ fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>Nome da prova</label>
                                <input
                                    type="text"
                                    className="kq-input"
                                    placeholder="Digite o título da prova"
                                    value={newExamName}
                                    onChange={(e) => setNewExamName(e.target.value)}
                                    style={{ background: '#b8d0bc', border: '1px solid #7a9a82', borderRadius: '4px', color: '#555' }}
                                    required
                                />
                            </div>
                            <button 
                                type="button" 
                                className="provas-btn action-btn-green" 
                                onClick={() => openQuestionModal('create')}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '42px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Cadastrar nova questão +
                            </button>
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                            <label className="pixel-text label-sm" style={{ fontWeight: 'bold', color: '#000' }}>Questões vinculadas:</label>
                            {linkedQuestions.length === 0 ? (
                                <p style={{ color: '#999', fontStyle: 'italic', marginTop: '5px' }}>Nenhuma questão foi cadastrada ainda...</p>
                            ) : (
                                <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#333' }}>
                                    {linkedQuestions.map((q, idx) => (
                                        <li key={idx} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span><strong>Q{idx + 1}:</strong> {q.enunciado.substring(0, 40)}...</span>
                                            <button 
                                                type="button" 
                                                onClick={() => setLinkedQuestions((prev) => prev.filter((_, i) => i !== idx))}
                                                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', padding: '0 5px' }}
                                                title="Remover questão"
                                            >
                                                &times;
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button type="button" className="kq-btn kq-btn-secondary" onClick={() => setShowManualExamModal(false)}>Cancelar</button>
                            <button type="submit" className="kq-btn kq-btn-primary">Salvar Prova</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderQuestionModal = () => {
        if (!questionModal) return null;
        const { type, question } = questionModal;
        const title = type === 'view' ? 'VISUALIZAR QUESTAO' : type === 'delete' ? 'EXCLUIR QUESTAO' : type === 'edit' ? 'EDITAR QUESTAO' : 'ADICIONAR QUESTAO';

        return (
            <div className="kq-modal-overlay">
                <div className="kq-modal-content question-modal-content">
                    <div className="kq-modal-header">
                        <h3 className="pixel-text">{title}</h3>
                        <button className="close-btn" onClick={closeQuestionModal}>&times;</button>
                    </div>

                    {type === 'view' && (
                        <div className="question-readonly">
                            <span className="question-meta">{difficultyLabels[question.nivel_dificuldade] || 'Facil'}</span>
                            <h4>{question.enunciado}</h4>
                            <div className="readonly-alternatives">
                                {question.alternativas?.map((alt) => (
                                    <div key={alt.id} className={`readonly-alt ${alt.is_correta ? 'correct' : ''}`}>
                                        <span>{alt.is_correta ? 'OK' : '-'}</span>
                                        <p>{alt.texto}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {type === 'delete' && (
                        <div className="question-readonly">
                            <p>Tem certeza que deseja excluir esta questao?</p>
                            <strong>{question.enunciado}</strong>
                            <div className="form-actions">
                                <button type="button" className="kq-btn kq-btn-secondary" onClick={closeQuestionModal}>Cancelar</button>
                                <button type="button" className="kq-btn kq-btn-danger" onClick={handleDeleteQuestion}>Excluir</button>
                            </div>
                        </div>
                    )}

                    {(type === 'edit' || type === 'create') && (
                        <form onSubmit={handleSaveQuestion} className="kq-modal-form">
                            <div className="form-group">
                                <label className="pixel-text label-sm">ENUNCIADO</label>
                                <textarea
                                    className="kq-input kq-textarea"
                                    value={questionForm.enunciado}
                                    onChange={(e) => setQuestionForm((prev) => ({ ...prev, enunciado: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="question-form-row">
                                <div className="form-group">
                                    <label className="pixel-text label-sm">DIFICULDADE</label>
                                    <select
                                        className="kq-select"
                                        value={questionForm.nivel_dificuldade}
                                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, nivel_dificuldade: e.target.value }))}
                                    >
                                        <option value="1">Facil</option>
                                        <option value="2">Medio</option>
                                        <option value="3">Dificil</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="pixel-text label-sm">DISCIPLINA</label>
                                    <select
                                        className="kq-select"
                                        value={questionForm.disciplina_id}
                                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, disciplina_id: e.target.value, conteudo_id: '' }))}
                                    >
                                        {disciplinas.map((disciplina) => (
                                            <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="pixel-text label-sm">CONTEUDO</label>
                                    <select
                                        className="kq-select"
                                        value={questionForm.conteudo_id}
                                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, conteudo_id: e.target.value }))}
                                    >
                                        {questionConteudos.map((conteudo) => (
                                            <option key={conteudo.id} value={conteudo.id}>{conteudo.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="question-form-alts">
                                {questionForm.alternativas.map((alt, index) => (
                                    <div className="alt-edit-row" key={index}>
                                        <input
                                            type="radio"
                                            name="correct-alt"
                                            checked={alt.is_correta}
                                            onChange={() => updateAlternativeForm(index, 'is_correta', true)}
                                            title="Marcar como correta"
                                        />
                                        <input
                                            className="kq-input"
                                            value={alt.texto}
                                            onChange={(e) => updateAlternativeForm(index, 'texto', e.target.value)}
                                            placeholder={`Alternativa ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            className="alt-remove-btn"
                                            onClick={() => removeAlternativeField(index)}
                                            disabled={questionForm.alternativas.length <= 2}
                                            title="Remover alternativa"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className="alt-add-btn" onClick={addAlternativeField}>
                                    Adicionar alternativa
                                </button>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="kq-btn kq-btn-secondary" onClick={closeQuestionModal}>Cancelar</button>
                                <button type="submit" className="kq-btn kq-btn-primary">Salvar</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    const renderGrid = () => (
        <>
            {avaliacoes.length === 0 ? (
                <div className="provas-empty">
                    <img src={emptyBau} alt="Bau vazio" className="empty-chest" />

                    <h3 className="pixel-text">Baú de Provas Vazio</h3>
                    <p>Que tal criar sua primeira avaliação e começar a jornada?</p>
                    <button className="provas-btn" onClick={() => setShowManualExamModal(true)}>Criar Nova Prova</button>
                </div>
            ) : (
                <div className="provas-grid">
                    {avaliacoes.map((item) => (
                        <button key={item.id} className="prova-card" onClick={() => handleOpenExam(item.id)}>
                            <span className="prova-card__chest">
                                <img src={chestImg} alt="Dragao de Provas" className="chest-img" />
                            </span>
                            <span className="prova-card__info">
                                <span className="pixel-text card-title">{item.titulo.toUpperCase()}</span>
                                <span className="pixel-text card-questions">{item.perguntas?.length || 0} QUESTÕES</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </>
    );

    const renderDetails = () => (
        <div className="exam-detail-view">
            <div className="exam-detail-header">
                <h2 className="pixel-text exam-detail-title">{activeExam.titulo.toUpperCase()}</h2>
                <div className="exam-detail-actions">
                    <button className="provas-btn" onClick={startStudy}>Estudar Agora</button>
                    {canManageQuestions && (
                        <>
                            <button className="provas-btn action-btn-green" onClick={() => openQuestionModal('create')}>
                                Adicionar Questao
                            </button>
                            <button className="provas-btn kq-btn-danger" onClick={handleDeleteExam}>
                                Excluir Prova
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="questions-grid">
                {activeExam.perguntas?.map((question) => (
                    <article className="question-card" key={question.id}>
                        <span className="question-card-meta">
                            {question.disciplina?.nome || 'Disciplina'} - {question.conteudo?.nome || 'Conteudo'}
                        </span>
                        <h3 className="pixel-text">{question.enunciado}</h3>
                        <div className="question-card-footer">
                            <span>{difficultyLabels[question.nivel_dificuldade] || 'Facil'}</span>
                            <div className="question-card-actions">
                                {canManageQuestions && (
                                    <>aqui
                                        <button title="Editar" onClick={() => openQuestionModal('edit', question)}>✏️</button>
                                        <button title="Excluir" onClick={() => openQuestionModal('delete', question)}>🗑️</button>
                                    </>
                                )}
                                <button title="Visualizar" onClick={() => openQuestionModal('view', question)}>👁️</button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );

    const renderStudy = () => (
        <div className="study-view">
            <div className="study-title pixel-text">{activeExam.titulo.toUpperCase()}</div>
            <div className="study-layout">
                <aside>
                </aside>
                <main className="study-questions">
                    {activeExam.perguntas.map((question, index) => (
                        <section className="study-question" id={`study-question-${question.id}`} key={question.id}>
                            <h3>Questao {index + 1}:</h3>
                            <p>{question.enunciado}</p>
                            <div className="study-alternatives">
                                {question.alternativas?.length ? question.alternativas.map((alt) => (
                                    <label key={alt.id} className="study-alt">
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={answers[question.id] === alt.id}
                                            onChange={() => selectAnswer(question.id, alt.id)}
                                        />
                                        <span>{alt.texto}</span>
                                    </label>
                                )) : <p className="missing-alts">Questao sem alternativas cadastradas.</p>}
                            </div>
                        </section>
                    ))}
                </main>
                <aside className="study-index">
                    {activeExam.perguntas.map((question, index) => (
                        <button
                            key={question.id}
                            className={answers[question.id] ? 'answered' : ''}
                            onClick={() => document.getElementById(`study-question-${question.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            {index + 1}
                        </button>
                    ))}
                </aside>
            </div>
            <div className="study-actions">
                <span>{answeredCount} de {activeExam.perguntas.length} respondidas</span>
                <button className="kq-btn kq-btn-primary" onClick={() => setShowSubmitConfirm(true)}>Entregar Agora</button>
            </div>
        </div>
    );

    return (
        <div className="provas-page">
            <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />

            <div className="provas-content">
                <div className="provas-action-bar">
                    <div className="provas-title-section">
                        <button className="back-button" onClick={handleBack} title="Voltar">
                            <span className="back-arrow">&#9664;</span>
                        </button>
                        <h2 className="pixel-text section-title uppercase">
                            {viewMode === 'grid' ? (filter === 'minhas' ? 'Questões' : 'Vestibulares') : activeExam?.titulo}
                        </h2>
                    </div>

                    {viewMode === 'grid' && (
                        <div className="provas-buttons">
                            <button className={`provas-btn ${filter === 'minhas' ? 'active' : ''}`} onClick={() => setFilter('minhas')}>Minhas Provas</button>
                            <button className={`provas-btn ${filter === 'vestibulares' ? 'active' : ''}`} onClick={() => setFilter('vestibulares')}>Vestibulares</button>
                            {filter === 'minhas' && (
                                <button className="provas-btn" onClick={() => setShowManualExamModal(true)}>Criar Nova Prova</button>
                            )}
                            <button className="provas-btn action-btn-green" onClick={() => setShowCreateModal(true)}>Estudar por Disciplina</button>
                        </div>
                    )}
                </div>

                {error && <p className="provas-error">{error}</p>}

                {loading && (
                    <div className="provas-loading">
                        <div className="spinner"></div>
                        <p className="pixel-text">Carregando baus...</p>
                    </div>
                )}

                {!loading && !error && viewMode === 'grid' && renderGrid()}
                {!loading && !error && viewMode === 'details' && activeExam && renderDetails()}
                {!loading && !error && viewMode === 'study' && activeExam && renderStudy()}
            </div>

            {showCreateModal && (
                <div className="kq-modal-overlay">
                    <div className="kq-modal-content">
                        <div className="kq-modal-header">
                            <h3 className="pixel-text">CONFIGURAR PROVA POR DISCIPLINA</h3>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateExam} className="kq-modal-form discipline-exam-form">
                            <div className="form-group">
                                <label className="pixel-text label-sm">DISCIPLINA</label>
                                <select className="kq-select" value={selectedDiscipline} onChange={(e) => setSelectedDiscipline(e.target.value)}>
                                    {disciplinas.map((disciplina) => (
                                        <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="pixel-text label-sm">CONTEUDO</label>
                                <select className="kq-select" value={selectedContent} onChange={(e) => setSelectedContent(e.target.value)} disabled={conteudos.length === 0}>
                                    {conteudos.map((conteudo) => (
                                        <option key={conteudo.id} value={conteudo.id}>{conteudo.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="pixel-text label-sm">QUANTIDADE DE QUESTÕES</label>
                                <select className="kq-select" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}>
                                    <option value="5">5 questões</option>
                                    <option value="10">10 questões</option>
                                    <option value="15">15 questões</option>
                                    <option value="20">20 questões</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="kq-btn kq-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                                <button type="submit" className="kq-btn kq-btn-primary" disabled={!selectedContent}>Iniciar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {renderCreateExamModal()}
            {renderQuestionModal()}

            {showDeleteExamConfirmModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal-content">
                        <h2 className="confirm-modal-title">
                            Tem certeza que deseja excluir a prova:
                        </h2>
                        <div className="modal-bracket-box">
                            <span className="corner-bl"></span>
                            <span className="corner-br"></span>
                            <span className="confirm-modal-target pixel-text" style={{ fontSize: getDynamicFontSize(activeExam?.titulo) }}>
                                {activeExam?.titulo}
                            </span>
                        </div>
                        <div className="confirm-modal-footer">
                            <button className="btn-confirm-yes" onClick={confirmDeleteExam}>
                                Sim
                            </button>
                            <button className="btn-confirm-no" onClick={() => setShowDeleteExamConfirmModal(false)}>
                                Não
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSubmitConfirm && (
                <div className="kq-modal-overlay">
                    <div className="kq-modal-content">
                        <div className="kq-modal-header">
                            <h3 className="pixel-text">ENTREGAR PROVA</h3>
                            <button className="close-btn" onClick={() => setShowSubmitConfirm(false)}>&times;</button>
                        </div>
                        <div className="question-readonly">
                            <p>Deseja entregar agora? Voce respondeu {answeredCount} de {activeExam.perguntas.length} questoes.</p>
                            <div className="form-actions">
                                <button className="kq-btn kq-btn-secondary" onClick={() => setShowSubmitConfirm(false)}>Continuar estudando</button>
                                <button className="kq-btn kq-btn-primary" onClick={finishExam}>Entregar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <div className="kq-modal-overlay">
                    <div className="kq-modal-content">
                        <div className="kq-modal-header">
                            <h3 className="pixel-text">RESULTADO</h3>
                            <button className="close-btn" onClick={() => setResult(null)}>&times;</button>
                        </div>
                        <div className="result-box">
                            <strong>{result.correct}</strong>
                            <p>Voce acertou {result.correct} de {result.total} questoes.</p>
                            <button className="kq-btn kq-btn-primary" onClick={() => { setResult(null); setViewMode('details'); }}>
                                Voltar para a prova
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
