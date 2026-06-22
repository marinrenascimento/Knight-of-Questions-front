import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useToast } from '../../components/Alerta/Toast';
import bauImg from '../../assets/bau.png';
import './Decks.css';
import {
  getDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  getCards,
  reviewCard,
  createCard,
  editCard,
  deleteCard,
  getDisciplinas,
  getConteudosByDisciplina,
  addPontos,
  startDeckReview,
  finishDeckReview
} from '../../services/api';

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

export default function Decks({ currentUser, logout, perfilPontos }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { token, user } = getAuth();
  const userId = user?.id || currentUser?.id;
  const trackRef = useRef(null);

  const [decks, setDecks] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const activeIndex = decks.length > 0 ? (virtualIndex % decks.length + decks.length) % decks.length : 0;
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'grid'

  // Sub-view: null for Decks View, deck object when viewing a deck's cards
  const [viewingDeck, setViewingDeck] = useState(null);
  const [deckFlashcards, setDeckFlashcards] = useState([]);
  const [cardConteudosCache, setCardConteudosCache] = useState({});

  // Modals state
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showPreviewCardModal, setShowPreviewCardModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showDisciplineStudyModal, setShowDisciplineStudyModal] = useState(false);
  const [showConfirmCloseReviewModal, setShowConfirmCloseReviewModal] = useState(false);

  // Delete confirmation modals state (image3.png style)
  const [showDeleteDeckConfirmModal, setShowDeleteDeckConfirmModal] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [showDeleteCardConfirmModal, setShowDeleteCardConfirmModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // Deck form state
  const [deckNome, setDeckNome] = useState('');
  const [deckDescricao, setDeckDescricao] = useState('');
  
  // New Deck initial flashcards list
  const [newFlashcards, setNewFlashcards] = useState([]);

  // Individual card state (Add/Edit)
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardFrente, setCardFrente] = useState('');
  const [cardVerso, setCardVerso] = useState('');
  const [cardDisciplina, setCardDisciplina] = useState('');
  const [cardConteudo, setCardConteudo] = useState('');
  const [cardConteudosList, setCardConteudosList] = useState([]);

  // Study session state
  const [studyCards, setStudyCards] = useState([]);
  const [studyCurrentIndex, setStudyCurrentIndex] = useState(0);
  const [studyIsFlipped, setStudyIsFlipped] = useState(false);
  const [studyPointsWon, setStudyPointsWon] = useState(0);
  const [studyFinished, setStudyFinished] = useState(false);
  const [studyTitle, setStudyTitle] = useState('');
  const [pointsSaved, setPointsSaved] = useState(false);
  const [ratedCardIndices, setRatedCardIndices] = useState(new Set());
  const [currentReviewId, setCurrentReviewId] = useState(null);

  // Study by discipline selection
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('');

  // Load Decks & Disciplines on mount
  useEffect(() => {
    if (!token || !userId) {
      showToast('Sessão inválida. Faça login novamente.', 'error');
      navigate('/');
      return;
    }
    loadDecks();
    loadDisciplinas();
  }, [token, userId]);

  async function loadDecks() {
    try {
      setLoading(true);
      const userDecks = await getDecks(userId, token);
      
      // Fetch card count for each deck concurrently
      const formatted = await Promise.all(
        userDecks.map(async (d) => {
          try {
            const cards = await getCards(d.id, token);
            return { ...d, cardsCount: cards?.length || 0 };
          } catch {
            return { ...d, cardsCount: 0 };
          }
        })
      );
      
      setDecks(formatted);
      if (formatted.length > 0 && activeIndex >= formatted.length) {
        setVirtualIndex(formatted.length);
      }

      // If we are currently viewing a deck, update it
      if (viewingDeck) {
        const updatedViewingDeck = formatted.find(d => d.id === viewingDeck.id);
        if (updatedViewingDeck) {
          setViewingDeck(updatedViewingDeck);
          loadDeckFlashcards(updatedViewingDeck.id);
        } else {
          setViewingDeck(null);
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao carregar os decks.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadDisciplinas() {
    try {
      const data = await getDisciplinas(token);
      setDisciplinas(data || []);
    } catch (e) {
      console.error('Erro ao buscar disciplinas:', e);
    }
  }

  // Initialize virtualIndex to middle copy when decks load
  useEffect(() => {
    if (decks.length > 0 && virtualIndex === 0) {
      setVirtualIndex(decks.length);
    }
  }, [decks.length, virtualIndex]);

  // Load cards for the viewing deck and cache their content topics
  async function loadDeckFlashcards(deckId) {
    try {
      const cards = await getCards(deckId, token);
      setDeckFlashcards(cards || []);

      // Fetch content topics for unique disciplines represented in the cards
      const uniqueDiscIds = [...new Set(cards.map(c => c.id_disciplina))];
      const cache = { ...cardConteudosCache };
      
      await Promise.all(
        uniqueDiscIds.map(async (discId) => {
          if (!cache[discId]) {
            try {
              const topics = await getConteudosByDisciplina(discId, token);
              cache[discId] = topics || [];
            } catch (e) {
              console.error(e);
            }
          }
        })
      );

      setCardConteudosCache(cache);
    } catch (e) {
      console.error(e);
      showToast('Erro ao carregar os cards do deck.', 'error');
    }
  }

  // Handle deck selection to view flashcards listing screen
  function handleSelectDeck(deck) {
    setViewingDeck(deck);
    loadDeckFlashcards(deck.id);
  }



  // Create new deck submission
  async function handleCreateDeckSubmit(e) {
    e.preventDefault();
    if (!deckNome.trim()) {
      showToast('O nome do deck é obrigatório.', 'warning');
      return;
    }

    const invalidCard = newFlashcards.some(
      c => !c.frente.trim() || !c.verso.trim() || !c.id_disciplina || !c.id_conteudo
    );
    if (invalidCard) {
      showToast('Preencha frente, verso e categoria de todos os cards adicionados.', 'warning');
      return;
    }

    try {
      const payload = {
        nome: deckNome.trim(),
        descricao: deckDescricao.trim() || null,
        flashcards: newFlashcards.map(c => ({
          frente: c.frente.trim(),
          verso: c.verso.trim(),
          id_disciplina: parseInt(c.id_disciplina, 10),
          id_conteudo: parseInt(c.id_conteudo, 10)
        }))
      };

      await createDeck(userId, payload, token);
      showToast('Deck criado com sucesso!', 'success');
      setShowCreateDeckModal(false);
      resetCreateDeckForm();
      loadDecks();
    } catch (err) {
      showToast(err.message || 'Erro ao criar deck.', 'error');
    }
  }

  function resetCreateDeckForm() {
    setDeckNome('');
    setDeckDescricao('');
    setNewFlashcards([]);
  }

  // Open edit deck modal
  function handleOpenEditDeckModal() {
    if (!viewingDeck) return;
    setDeckNome(viewingDeck.nome);
    setDeckDescricao(viewingDeck.descricao || '');
    setShowEditDeckModal(true);
  }

  // Update deck metadata
  async function handleUpdateDeckSubmit(e) {
    e.preventDefault();
    if (!deckNome.trim()) {
      showToast('O nome do deck é obrigatório.', 'warning');
      return;
    }

    try {
      await updateDeck(userId, viewingDeck.id, { nome: deckNome.trim(), descricao: deckDescricao.trim() || null }, token);
      showToast('Deck atualizado!', 'success');
      setShowEditDeckModal(false);
      loadDecks();
    } catch (err) {
      showToast(err.message || 'Erro ao atualizar deck.', 'error');
    }
  }

  // Start deck delete confirmation flow
  function handleDeleteDeckStart(deck) {
    setDeckToDelete(deck);
    setShowDeleteDeckConfirmModal(true);
  }

  // Confirm deck delete execution
  async function confirmDeleteDeck() {
    if (!deckToDelete) return;
    try {
      await deleteDeck(userId, deckToDelete.id, token);
      showToast('Deck excluído com sucesso.', 'success');
      setShowDeleteDeckConfirmModal(false);
      setDeckToDelete(null);
      setViewingDeck(null);
      loadDecks();
    } catch (err) {
      showToast(err.message || 'Erro ao excluir deck.', 'error');
    }
  }

  // Open add card modal
  function handleOpenAddCardModal() {
    setCardFrente('');
    setCardVerso('');
    setCardDisciplina('');
    setCardConteudo('');
    setCardConteudosList([]);
    setShowAddCardModal(true);
  }

  // Handle discipline selection in single card forms
  async function handleCardDisciplineChangeSingle(discId) {
    setCardDisciplina(discId);
    setCardConteudo('');
    if (discId) {
      try {
        const topics = await getConteudosByDisciplina(discId, token);
        setCardConteudosList(topics || []);
      } catch (e) {
        console.error(e);
      }
    } else {
      setCardConteudosList([]);
    }
  }

  // Create single flashcard
  async function handleAddCardSubmit(e) {
    e.preventDefault();
    if (!cardFrente.trim() || !cardVerso.trim() || !cardDisciplina || !cardConteudo) {
      showToast('Preencha todos os campos do card.', 'warning');
      return;
    }

    if (showCreateDeckModal) {
      const selectedTopic = cardConteudosList.find(t => String(t.id) === String(cardConteudo));
      const topicName = selectedTopic ? selectedTopic.nome : 'Tópico';

      const newCard = {
        frente: cardFrente.trim(),
        verso: cardVerso.trim(),
        id_disciplina: parseInt(cardDisciplina, 10),
        id_conteudo: parseInt(cardConteudo, 10),
        nomeConteudo: topicName
      };

      setNewFlashcards(prev => [...prev, newCard]);

      showToast('Card vinculado!', 'success');
      setShowAddCardModal(false);

      setCardFrente('');
      setCardVerso('');
      setCardDisciplina('');
      setCardConteudo('');
      setCardConteudosList([]);
    } else {
      try {
        await createCard({
          frente: cardFrente.trim(),
          verso: cardVerso.trim(),
          id_disciplina: parseInt(cardDisciplina, 10),
          id_conteudo: parseInt(cardConteudo, 10),
          id_deck: viewingDeck.id
        }, token);

        showToast('Card criado com sucesso!', 'success');
        setShowAddCardModal(false);
        loadDecks();
        loadDeckFlashcards(viewingDeck.id);
      } catch (e) {
        showToast(e.message || 'Erro ao criar card.', 'error');
      }
    }
  }

  // Open edit card modal
  async function handleOpenEditCardModal(card) {
    setSelectedCard(card);
    setCardFrente(card.frente);
    setCardVerso(card.verso);
    setCardDisciplina(card.id_disciplina);
    
    // Load conteudos list for discipline
    try {
      const topics = await getConteudosByDisciplina(card.id_disciplina, token);
      setCardConteudosList(topics || []);
    } catch (e) {
      console.error(e);
    }
    setCardConteudo(card.id_conteudo);
    setShowEditCardModal(true);
  }

  // Submit edit card
  async function handleEditCardSubmit(e) {
    e.preventDefault();
    if (!cardFrente.trim() || !cardVerso.trim() || !cardDisciplina || !cardConteudo) {
      showToast('Preencha todos os campos.', 'warning');
      return;
    }

    try {
      await editCard(selectedCard.id, {
        frente: cardFrente.trim(),
        verso: cardVerso.trim(),
        id_disciplina: parseInt(cardDisciplina, 10),
        id_conteudo: parseInt(cardConteudo, 10)
      }, token);

      showToast('Card atualizado com sucesso!', 'success');
      setShowEditCardModal(false);
      loadDecks();
    } catch (e) {
      showToast(e.message || 'Erro ao editar card.', 'error');
    }
  }

  // Start card delete confirmation flow
  function handleDeleteCardStart(card) {
    setCardToDelete(card);
    setShowDeleteCardConfirmModal(true);
  }

  // Confirm card delete execution
  async function confirmDeleteCard() {
    if (!cardToDelete) return;
    try {
      await deleteCard(cardToDelete.id, token);
      showToast('Card excluído com sucesso.', 'success');
      setShowDeleteCardConfirmModal(false);
      setCardToDelete(null);
      loadDecks();
    } catch (err) {
      showToast(err.message || 'Erro ao excluir card.', 'error');
    }
  }

  // Open Preview Card Modal
  function handleOpenPreviewCardModal(card) {
    setSelectedCard(card);
    setStudyIsFlipped(false);
    setShowPreviewCardModal(true);
  }

  // Start study session for deck
  async function startDeckStudy(deck) {
    try {
      const cards = await getCards(deck.id, token);
      if (!cards || cards.length === 0) {
        showToast('Este deck está vazio. Adicione cards clicando no botão "Adicionar Card".', 'warning');
        return;
      }
      setStudyTitle(deck.nome);
      setStudyCards(cards);
      setStudyCurrentIndex(0);
      setStudyIsFlipped(false);
      setStudyPointsWon(0);
      setStudyFinished(false);
      setPointsSaved(false);
      setRatedCardIndices(new Set());
      setShowStudyModal(true);

      // Start backend deck review tracking
      try {
        const reviewRes = await startDeckReview(deck.id, token);
        if (reviewRes?.review?.id) {
          setCurrentReviewId(reviewRes.review.id);
        }
      } catch (err) {
        console.error('Erro ao registrar início de revisão:', err);
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao iniciar estudos.', 'error');
    }
  }

  // Review card feedback rating
  async function handleCardRating(rating) {
    const card = studyCards[studyCurrentIndex];
    let points = 2; 
    let difficultyId = 3;

    if (rating === 'easy') {
      points = 10;
      difficultyId = 1;
    } else if (rating === 'medium') {
      points = 5;
      difficultyId = 2;
    } else if (rating === 'hard') {
      points = 2;
      difficultyId = 3;
    } else if (rating === 'impossible') {
      points = 0;
      difficultyId = 4;
    }

    setRatedCardIndices(prev => {
      const next = new Set(prev);
      next.add(studyCurrentIndex);
      return next;
    });

    try {
      await reviewCard(card.id, {
        novaDificuldade: difficultyId,
        pontosGanhos: 0
      }, token);
    } catch (e) {
      console.error('Erro ao salvar rating:', e);
    }

    const nextPoints = studyPointsWon + points;
    setStudyPointsWon(nextPoints);

    if (studyCurrentIndex < studyCards.length - 1) {
      setStudyIsFlipped(false);
      setTimeout(() => {
        setStudyCurrentIndex(prev => prev + 1);
      }, 300);
    } else {
      setStudyFinished(true);
      loadDecks();
      await saveSessionPoints(nextPoints);
      await completeDeckReviewSession();
    }
  }

  async function completeDeckReviewSession() {
    if (!currentReviewId) return;
    try {
      const reviewedCount = ratedCardIndices.size;
      await finishDeckReview(currentReviewId, reviewedCount, token);
      setCurrentReviewId(null);
    } catch (e) {
      console.error('Erro ao finalizar deck review:', e);
    }
  }

  async function saveSessionPoints(overridePoints) {
    const pts = overridePoints !== undefined ? overridePoints : studyPointsWon;
    if (pointsSaved || pts <= 0) return;
    setPointsSaved(true);
    try {
      await addPontos(pts, token);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('points:updated'));
      }
    } catch (e) {
      console.error('Erro ao salvar pontos da sessão:', e);
      setPointsSaved(false);
    }
  }

  async function closeStudySession() {
    setShowStudyModal(false);
    await completeDeckReviewSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('points:updated'));
    }
  }

  // Study by discipline setup
  async function startDisciplineStudy() {
    if (!selectedDisciplineId) {
      showToast('Selecione uma disciplina.', 'warning');
      return;
    }

    try {
      const userDecks = await getDecks(userId, token);
      const discIdNum = parseInt(selectedDisciplineId, 10);
      
      const allCardsNested = await Promise.all(
        userDecks.map(async (d) => {
          try {
            return await getCards(d.id, token);
          } catch {
            return [];
          }
        })
      );
      
      const filteredCards = allCardsNested
        .flat()
        .filter(c => c.id_disciplina === discIdNum);

      if (filteredCards.length === 0) {
        showToast('Nenhum flashcard cadastrado para esta disciplina.', 'warning');
        return;
      }

      const discName = disciplinas.find(d => d.id === discIdNum)?.nome || 'Disciplina';

      setStudyTitle(`Estudo: ${discName}`);
      setStudyCards(filteredCards);
      setStudyCurrentIndex(0);
      setStudyIsFlipped(false);
      setStudyPointsWon(0);
      setStudyFinished(false);
      setPointsSaved(false);
      setRatedCardIndices(new Set());
      setShowDisciplineStudyModal(false);
      setShowStudyModal(true);
    } catch (e) {
      console.error(e);
      showToast('Erro ao iniciar estudos.', 'error');
    }
  }

  // Helper to resolve card category label (Discipline - Topic)
  function getCardSubjectLabel(card) {
    const discName = disciplinas.find(d => d.id === card.id_disciplina)?.nome || 'Matéria';
    const topics = cardConteudosCache[card.id_disciplina] || [];
    const topicName = topics.find(t => t.id === card.id_conteudo)?.nome || 'Tópico';
    return `${discName} - ${topicName}`;
  }

  // Loop carousel index calculations
  const handlePrev = () => {
    if (decks.length === 0) return;
    setVirtualIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (decks.length === 0) return;
    setVirtualIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    const N = decks.length;
    if (N === 0) return;

    if (virtualIndex < N || virtualIndex >= 2 * N) {
      setTransitionEnabled(false);
      const newVirtual = N + (((virtualIndex % N) + N) % N);
      setVirtualIndex(newVirtual);
    }
  };

  useEffect(() => {
    if (!transitionEnabled) {
      if (trackRef.current) {
        void trackRef.current.offsetHeight; // Force reflow
      }
      const animId = requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
      return () => cancelAnimationFrame(animId);
    }
  }, [transitionEnabled]);



  return (
    <div className="decks-page">
      <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />

      <div className="decks-content">
        {/* VIEW 1: Main Decks View (Carousel or Grid) */}
        {!viewingDeck ? (
          <div>
            {/* Header controls for decks */}
            <div className="decks-subheader">
              <div className="decks-subheader__left">
                <button className="btn-back" onClick={() => navigate('/')} title="Voltar para Home">
                  ◀
                </button>
                <h1 className="decks-title pixel-text">Meus Decks</h1>
              </div>

              <div className="decks-subheader__right">
                <div className="layout-toggle">
                  <button
                    className={`layout-toggle__btn ${viewMode === 'carousel' ? 'active' : ''}`}
                    onClick={() => setViewMode('carousel')}
                    title="Carrossel"
                  >
                    ☰
                  </button>
                  <div className="layout-toggle__divider" />
                  <button
                    className={`layout-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grade"
                  >
                    ⊞
                  </button>
                </div>

                <button className="btn-green" onClick={() => setShowCreateDeckModal(true)}>
                  Criar Novo Deck
                </button>
                <button className="btn-green" onClick={() => setShowDisciplineStudyModal(true)}>
                  Estudar por Disciplina
                </button>
              </div>
            </div>

            {loading ? (
              <div className="decks-loading">
                <span>Carregando seus Decks...</span>
              </div>
            ) : decks.length === 0 ? (
              <div className="decks-empty">
                <div className="decks-empty__icon">⚔</div>
                <p className="decks-empty__text">Nenhum deck de flashcards registrado!</p>
                <button className="btn-green" onClick={() => setShowCreateDeckModal(true)}>
                  Criar Primeiro Deck
                </button>
              </div>
            ) : viewMode === 'carousel' ? (() => {
                const extendedDecks = [...decks, ...decks, ...decks];
                return (
                  <div className="decks-carousel-container">
                    <button className="carousel-arrow" onClick={handlePrev}>
                      ◀
                    </button>

                    <div className="decks-carousel-viewport">
                      <div
                        ref={trackRef}
                        className="decks-carousel-track"
                        style={{
                          transform: `translateX(${(1 - virtualIndex) * 312}px)`,
                          transition: transitionEnabled ? undefined : 'none'
                        }}
                        onTransitionEnd={handleTransitionEnd}
                      >
                        {extendedDecks.map((deck, idx) => {
                          const isCenter = idx === virtualIndex;
                          const isLeft = idx < virtualIndex;
                          const isRight = idx > virtualIndex;

                          let cardStateClass = 'deck-card--side';
                          if (isCenter) cardStateClass = 'deck-card--center';
                          else if (isLeft) cardStateClass = 'deck-card--left';
                          else if (isRight) cardStateClass = 'deck-card--right';

                          return (
                            <div
                              key={`${deck.id}-${idx}`}
                              className={`deck-card ${cardStateClass}`}
                              onClick={() => {
                                if (isCenter) {
                                  handleSelectDeck(deck);
                                } else {
                                  setVirtualIndex(idx);
                                }
                              }}
                              title={isCenter ? "Ver flashcards deste deck" : "Focar este deck"}
                            >
                              <img src={bauImg} alt="Baú de Decks" className="deck-card__icon" />
                              <h3 className="deck-card__title pixel-text">{deck.nome}</h3>
                              <p className="deck-card__desc">{deck.descricao || 'Sem descrição'}</p>
                              <span className="deck-card__count pixel-text">
                                {deck.cardsCount} CARDS
                              </span>
                              {isCenter && (
                                <p style={{ fontSize: '9px', marginTop: '10px', opacity: 0.7, textTransform: 'uppercase' }}>
                                  Clique para visualizar os cards
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button className="carousel-arrow" onClick={handleNext}>
                      ▶
                    </button>
                  </div>
                );
              })()
            : (
              /* Grid layout */
              <div className="decks-grid">
                {decks.map((deck) => (
                  <div key={deck.id} className="deck-card" onClick={() => handleSelectDeck(deck)}>
                    <img src={bauImg} alt="Baú de Decks" className="deck-card__icon" />
                    <h3 className="deck-card__title pixel-text">{deck.nome}</h3>
                    <p className="deck-card__desc">{deck.descricao || 'Sem descrição'}</p>
                    <span className="deck-card__count pixel-text">{deck.cardsCount} CARDS</span>
                    <p style={{ fontSize: '9px', marginTop: '10px', opacity: 0.7, textTransform: 'uppercase' }}>
                      Clique para visualizar os cards
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: Flashcards List View of Selected Deck (image2.png) */
          <div>
            {/* Header controls for flashcards listing */}
            <div className="decks-subheader">
              <div className="decks-subheader__left">
                <button className="btn-back" onClick={() => setViewingDeck(null)} title="Voltar para Decks">
                  ◀
                </button>
                <h1 className="decks-title pixel-text">{viewingDeck.nome}</h1>
              </div>

              <div className="decks-subheader__right">
                <button className="btn-green" onClick={() => startDeckStudy(viewingDeck)}>
                  Estudar Agora
                </button>
                <button className="btn-green" onClick={handleOpenAddCardModal}>
                  Adicionar Card
                </button>
                <button
                  className="btn-green"
                  style={{ backgroundColor: '#742a2a' }}
                  onClick={() => handleDeleteDeckStart(viewingDeck)}
                >
                  Excluir Deck
                </button>
                <button
                  className="btn-green"
                  style={{ backgroundColor: '#2f5b4e' }}
                  onClick={handleOpenEditDeckModal}
                >
                  Editar Detalhes
                </button>
              </div>
            </div>

            {deckFlashcards.length === 0 ? (
              <div className="decks-empty">
                <div className="decks-empty__icon">📚</div>
                <p className="decks-empty__text">Nenhum card cadastrado neste deck ainda.</p>
                <button className="btn-green" onClick={handleOpenAddCardModal}>
                  Adicionar Primeiro Card
                </button>
              </div>
            ) : (
              /* Grid of Cards matching image2.png */
              <div className="cards-grid">
                {deckFlashcards.map((card) => (
                  <div key={card.id} className="flashcard-item-card">
                    <span className="flashcard-item-card__subject">
                      {getCardSubjectLabel(card)}
                    </span>
                    <h3 className="flashcard-item-card__title pixel-text">
                      {card.frente}
                    </h3>
                    <div className="flashcard-item-card__actions">
                      <button
                        className="flashcard-item-card__action-btn"
                        onClick={() => handleOpenEditCardModal(card)}
                        title="Editar Card"
                      >
                        ✏️
                      </button>
                      <button
                        className="flashcard-item-card__action-btn"
                        onClick={() => handleDeleteCardStart(card)}
                        title="Excluir Card"
                      >
                        🗑️
                      </button>
                      <button
                        className="flashcard-item-card__action-btn"
                        onClick={() => handleOpenPreviewCardModal(card)}
                        title="Visualizar Resposta"
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE DECK OVERLAY */}
      {showCreateDeckModal && (
        <div className="study-session-overlay">
          <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />

          <div className="study-session-body">
            <div className="study-session-header" style={{ position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateDeckModal(false);
                  resetCreateDeckForm();
                }}
                style={{
                  position: 'absolute',
                  left: '40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#0b3b2d',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                title="Voltar"
              >
                ←
              </button>
              <h1 className="study-session-title pixel-text" style={{ fontSize: '28px' }}>
                CADASTRO DE DECK
              </h1>
            </div>

            <div className="study-session-container" style={{ display: 'flex', justifyContent: 'center', padding: '0 40px 40px 40px' }}>
              <div className="deck-cadastro-box">
                <form onSubmit={handleCreateDeckSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '15px', minWidth: '280px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d' }}>Nome do deck</label>
                        <input
                          type="text"
                          className="form-input"
                          value={deckNome}
                          onChange={(e) => setDeckNome(e.target.value)}
                          placeholder="Digite o nome do deck"
                          required
                          style={{
                            backgroundColor: '#bad3be',
                            border: '1px solid #99c2a2',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '14px',
                            color: '#0b3b2d'
                          }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d' }}>Descrição do deck</label>
                        <input
                          type="text"
                          className="form-input"
                          value={deckDescricao}
                          onChange={(e) => setDeckDescricao(e.target.value)}
                          placeholder="Digite o nome do deck"
                          style={{
                            backgroundColor: '#bad3be',
                            border: '1px solid #99c2a2',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '14px',
                            color: '#0b3b2d'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-cadastrar-novo-card"
                      onClick={() => {
                        setCardFrente('');
                        setCardVerso('');
                        setCardDisciplina('');
                        setCardConteudo('');
                        setCardConteudosList([]);
                        setShowAddCardModal(true);
                      }}
                    >
                      Cadastrar novo card <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#ffffff',
                        color: '#103329',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>+</span>
                    </button>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label" style={{ fontWeight: 'bold', color: '#0b3b2d', fontSize: '16px' }}>
                      Cards vinculados:
                    </label>
                    
                    {newFlashcards.length === 0 ? (
                      <p style={{ color: '#7a7a7a', fontSize: '14px', margin: '20px 0', fontStyle: 'italic' }}>
                        Nenhum card foi cadastrado ainda...
                      </p>
                    ) : (
                      <div className="cadastro-cards-grid">
                        {newFlashcards.map((card, index) => {
                          const topicName = card.nomeConteudo || 'Tópico';
                          return (
                            <div key={index} className="cadastro-card-item">
                              <span className="cadastro-card-topic">
                                {topicName}
                              </span>
                              <p className="cadastro-card-front-text">
                                {card.frente}
                              </p>
                              <button
                                type="button"
                                className="btn-remove-cadastro-card"
                                onClick={() => {
                                  setNewFlashcards(prev => prev.filter((_, idx) => idx !== index));
                                }}
                                title="Remover Card"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="confirm-modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <button
                      type="button"
                      className="confirm-modal-btn confirm-modal-btn--no"
                      onClick={() => {
                        setShowCreateDeckModal(false);
                        resetCreateDeckForm();
                      }}
                      style={{
                        backgroundColor: '#bad3be',
                        color: '#0b3b2d',
                        border: '2px solid #0b3b2d',
                        borderRadius: '8px',
                        padding: '12px 30px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: 'auto'
                      }}
                    >
                      Cancelar
                    </button>
                    
                    <button
                      type="submit"
                      className="confirm-modal-btn confirm-modal-btn--yes"
                      style={{
                        backgroundColor: '#103329',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 40px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: 'auto'
                      }}
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DECK DETAILS MODAL */}
      {showEditDeckModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title pixel-text">Editar Detalhes do Deck</h2>
              <button className="btn-close-modal" onClick={() => setShowEditDeckModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateDeckSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Nome do Deck</label>
                <input
                  type="text"
                  className="form-input"
                  value={deckNome}
                  onChange={(e) => setDeckNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  value={deckDescricao}
                  onChange={(e) => setDeckDescricao(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowEditDeckModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-green">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CARD MODAL */}
      {showAddCardModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '30px' }}>
            <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: '0px', marginBottom: '15px' }}>
              <h2 className="modal-title pixel-text" style={{ fontSize: '24px', color: '#0b3b2d', textAlign: 'center', width: '100%' }}>
                NOVO FLASHCARD
              </h2>
            </div>
            <form onSubmit={handleAddCardSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Disciplina</label>
                <select
                  className="form-input"
                  value={cardDisciplina ? String(cardDisciplina) : ''}
                  onChange={(e) => handleCardDisciplineChangeSingle(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #103329',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: '#0b3b2d'
                  }}
                >
                  <option value="">Selecione...</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Conteúdo</label>
                <select
                  className="form-input"
                  value={cardConteudo ? String(cardConteudo) : ''}
                  onChange={(e) => setCardConteudo(e.target.value)}
                  disabled={!cardDisciplina}
                  required
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #103329',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: '#0b3b2d'
                  }}
                >
                  <option value="">Selecione...</option>
                  {cardConteudosList.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Frente</label>
                <textarea
                  className="form-textarea"
                  value={cardFrente}
                  onChange={(e) => setCardFrente(e.target.value)}
                  placeholder="Digite o texto que aparecerá na frente do card"
                  required
                  style={{
                    backgroundColor: '#bad3be',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#0b3b2d',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Verso</label>
                <textarea
                  className="form-textarea"
                  value={cardVerso}
                  onChange={(e) => setCardVerso(e.target.value)}
                  placeholder="Digite o texto que aparecerá no verso do card"
                  required
                  style={{
                    backgroundColor: '#bad3be',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#0b3b2d',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0px', marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button
                  type="button"
                  className="confirm-modal-btn confirm-modal-btn--no"
                  onClick={() => setShowAddCardModal(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#103329',
                    border: '2px solid #103329',
                    borderRadius: '8px',
                    padding: '12px 30px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: 'auto'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="confirm-modal-btn confirm-modal-btn--yes"
                  style={{
                    backgroundColor: '#103329',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 40px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: 'auto'
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CARD MODAL */}
      {showEditCardModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '30px' }}>
            <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: '0px', marginBottom: '15px' }}>
              <h2 className="modal-title pixel-text" style={{ fontSize: '24px', color: '#0b3b2d', textAlign: 'center', width: '100%' }}>
                EDITAR FLASHCARD
              </h2>
            </div>
            <form onSubmit={handleEditCardSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Disciplina</label>
                <select
                  className="form-input"
                  value={cardDisciplina ? String(cardDisciplina) : ''}
                  onChange={(e) => handleCardDisciplineChangeSingle(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #103329',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: '#0b3b2d'
                  }}
                >
                  <option value="">Selecione...</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Conteúdo</label>
                <select
                  className="form-input"
                  value={cardConteudo ? String(cardConteudo) : ''}
                  onChange={(e) => setCardConteudo(e.target.value)}
                  disabled={!cardDisciplina}
                  required
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #103329',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: '#0b3b2d'
                  }}
                >
                  <option value="">Selecione...</option>
                  {cardConteudosList.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Frente</label>
                <textarea
                  className="form-textarea"
                  value={cardFrente}
                  onChange={(e) => setCardFrente(e.target.value)}
                  placeholder="Digite o texto que aparecerá na frente do card"
                  required
                  style={{
                    backgroundColor: '#bad3be',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#0b3b2d',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#0b3b2d', textTransform: 'none', fontSize: '15px', marginBottom: '5px' }}>Verso</label>
                <textarea
                  className="form-textarea"
                  value={cardVerso}
                  onChange={(e) => setCardVerso(e.target.value)}
                  placeholder="Digite o texto que aparecerá no verso do card"
                  required
                  style={{
                    backgroundColor: '#bad3be',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#0b3b2d',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0px', marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button
                  type="button"
                  className="confirm-modal-btn confirm-modal-btn--no"
                  onClick={() => setShowEditCardModal(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#103329',
                    border: '2px solid #103329',
                    borderRadius: '8px',
                    padding: '12px 30px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: 'auto'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="confirm-modal-btn confirm-modal-btn--yes"
                  style={{
                    backgroundColor: '#103329',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 40px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: 'auto'
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW/PREVIEW CARD MODAL (Quick answer peek) */}
      {showPreviewCardModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '30px', position: 'relative' }}>
            <button 
              className="btn-close-modal" 
              style={{ position: 'absolute', top: '15px', right: '15px', color: '#0b3b2d', fontSize: '24px' }} 
              onClick={() => setShowPreviewCardModal(false)}
            >
              ×
            </button>
            <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: '0px', marginBottom: '15px' }}>
              <h2 className="modal-title pixel-text" style={{ fontSize: '22px', color: '#0b3b2d', textAlign: 'center', width: '100%' }}>
                VISUALIZAR CARD
              </h2>
            </div>
            
            <div
              className={`study-flashcard-box ${studyIsFlipped ? 'flipped' : ''}`}
              onClick={() => setStudyIsFlipped(!studyIsFlipped)}
              style={{ width: '100%', height: '220px' }}
            >
              <div className="study-flashcard-inner">
                <div className="study-flashcard-front">
                  <span className="study-card-side-label pixel-text">Frente</span>
                  <p className="study-card-text" style={{ fontSize: '18px' }}>{selectedCard?.frente}</p>
                </div>
                <div className="study-flashcard-back">
                  <span className="study-card-side-label pixel-text">Verso</span>
                  <p className="study-card-text" style={{ fontSize: '18px' }}>{selectedCard?.verso}</p>
                </div>
              </div>
            </div>
            
            <p className="study-instruction" style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#4a5d4e', fontStyle: 'italic' }}>
              Clique no card para alternar entre pergunta e resposta.
            </p>
            
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0px', marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="button"
                className="confirm-modal-btn confirm-modal-btn--yes" 
                style={{ 
                  backgroundColor: '#103329', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '12px 40px', 
                  fontSize: '15px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  width: 'auto' 
                }} 
                onClick={() => setShowPreviewCardModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCIPLINE STUDY MODAL */}
      {showDisciplineStudyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title pixel-text">Estudo por Disciplina</h2>
              <button className="btn-close-modal" onClick={() => setShowDisciplineStudyModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Selecione a Disciplina</label>
                <select
                  className="form-input"
                  value={selectedDisciplineId}
                  onChange={(e) => setSelectedDisciplineId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDisciplineStudyModal(false)}>
                Cancelar
              </button>
              <button className="btn-green" onClick={startDisciplineStudy}>
                Iniciar Estudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE STUDY SESSION OVERLAY */}
      {showStudyModal && (
        <div className="study-session-overlay">
          <Header currentUser={currentUser} logout={logout} perfilPontos={perfilPontos} />

          <div className="study-session-body">
            <div className="study-session-header">
              <h1 className="study-session-title pixel-text">{studyTitle}</h1>
              {!studyFinished ? (
                <button
                  type="button"
                  className="study-session-btn-close"
                  onClick={() => setShowConfirmCloseReviewModal(true)}
                >
                  Encerrar Revisão
                </button>
              ) : (
                <button
                  type="button"
                  className="study-session-btn-close"
                  onClick={closeStudySession}
                >
                  Voltar para o Início
                </button>
              )}
            </div>

            <div className="study-session-container">
              {!studyFinished ? (
                <>
                  <div className="study-card-viewport">
                    {/* The Card Box */}
                    <div
                      className={`study-flashcard-box ${studyIsFlipped ? 'flipped' : ''}`}
                      onClick={() => setStudyIsFlipped(!studyIsFlipped)}
                    >
                      <div className="study-flashcard-inner">
                        <div className="study-flashcard-front">
                          <span className="study-card-side-label pixel-text">FRONT</span>
                          <div className="study-card-text">
                            {studyCards[studyCurrentIndex]?.frente}
                          </div>
                          <button
                            type="button"
                            className="study-card-flip-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStudyIsFlipped(true);
                            }}
                          >
                            <span className="study-flip-icon">⟲</span>
                          </button>
                        </div>
                        <div className="study-flashcard-back">
                          <span className="study-card-side-label pixel-text">BACK</span>
                          <div className="study-card-text">
                            {studyCards[studyCurrentIndex]?.verso}
                          </div>
                          <button
                            type="button"
                            className="study-card-flip-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStudyIsFlipped(false);
                            }}
                          >
                            <span className="study-flip-icon">⟲</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Next Arrow on the Right */}
                    <button
                      type="button"
                      className="study-next-arrow-btn"
                      onClick={async () => {
                        const wasRated = ratedCardIndices.has(studyCurrentIndex);
                        let finalPoints = studyPointsWon;
                        if (!wasRated) {
                          finalPoints += 2;
                          setStudyPointsWon(prev => prev + 2);
                          setRatedCardIndices(prev => {
                            const next = new Set(prev);
                            next.add(studyCurrentIndex);
                            return next;
                          });
                        }

                        if (studyCurrentIndex < studyCards.length - 1) {
                          setStudyIsFlipped(false);
                          setTimeout(() => {
                            setStudyCurrentIndex(prev => prev + 1);
                          }, 300);
                        } else {
                          setStudyFinished(true);
                          loadDecks();
                          await saveSessionPoints(finalPoints);
                          await completeDeckReviewSession();
                        }
                      }}
                      title="Próximo Card"
                    >
                      ➔
                    </button>
                  </div>

                  {/* Rating Buttons Below */}
                  <div className="study-rating-footer">
                    <button
                      type="button"
                      className="study-rating-btn"
                      onClick={() => handleCardRating('easy')}
                    >
                      <span className="study-rating-icon">😊</span>
                      <span className="study-rating-label pixel-text">FÁCIL</span>
                    </button>
                    <button
                      type="button"
                      className="study-rating-btn"
                      onClick={() => handleCardRating('medium')}
                    >
                      <span className="study-rating-icon">🙂</span>
                      <span className="study-rating-label pixel-text">MÉDIO</span>
                    </button>
                    <button
                      type="button"
                      className="study-rating-btn"
                      onClick={() => handleCardRating('hard')}
                    >
                      <span className="study-rating-icon">😐</span>
                      <span className="study-rating-label pixel-text">DIFÍCIL</span>
                    </button>
                    <button
                      type="button"
                      className="study-rating-btn"
                      onClick={() => handleCardRating('impossible')}
                    >
                      <span className="study-rating-icon">🙁</span>
                      <span className="study-rating-label pixel-text">IMPOSSÍVEL</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="study-card-viewport">
                  {/* The Finished Card Box */}
                  <div className="study-flashcard-box study-flashcard-box--finished">
                    <img src={bauImg} alt="Review Completed" className="study-finished-chest" />
                    <h3 className="study-finished-title pixel-text">Revisão Concluída!</h3>
                    {studyPointsWon > 0 && (
                      <p className="study-finished-points pixel-text" style={{ fontSize: '12px', marginTop: '10px', color: '#0b3b2d' }}>
                        +{studyPointsWon} PONTOS GANHOS!
                      </p>
                    )}
                  </div>

                  {/* Restart Reload Button on the Right */}
                  <button
                    type="button"
                    className="study-next-arrow-btn"
                    onClick={async () => {
                      setStudyCurrentIndex(0);
                      setStudyIsFlipped(false);
                      setStudyPointsWon(0);
                      setStudyFinished(false);
                      setPointsSaved(false);
                      setRatedCardIndices(new Set());
                      if (viewingDeck?.id) {
                        try {
                          const reviewRes = await startDeckReview(viewingDeck.id, token);
                          if (reviewRes?.review?.id) {
                            setCurrentReviewId(reviewRes.review.id);
                          }
                        } catch (err) {
                          console.error('Erro ao reiniciar review no backend:', err);
                        }
                      }
                    }}
                    title="Reiniciar Revisão"
                  >
                    ⟲
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLOSE REVIEW MODAL */}
      {showConfirmCloseReviewModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="confirm-modal-content">
            <h2 className="confirm-modal-title" style={{ fontSize: '16px', color: '#0b3b2d', marginBottom: '20px' }}>
              TEM CERTEZA QUE DESEJA ENCERRAR A REVISÃO DO CARD:
            </h2>
            <div className="modal-bracket-box">
              <span className="corner-bl"></span>
              <span className="corner-br"></span>
              <span className="confirm-modal-target pixel-text">
                {studyTitle}
              </span>
            </div>
            <div className="confirm-modal-footer" style={{ marginTop: '24px' }}>
              <button 
                type="button" 
                className="confirm-modal-btn confirm-modal-btn--yes"
                onClick={async () => {
                  setShowConfirmCloseReviewModal(false);
                  const wasRated = ratedCardIndices.has(studyCurrentIndex);
                  let finalPoints = studyPointsWon;
                  if (!wasRated) {
                    finalPoints += 2;
                    setStudyPointsWon(prev => prev + 2);
                  }
                  await saveSessionPoints(finalPoints);
                  closeStudySession();
                }}
              >
                Sim
              </button>
              <button 
                type="button" 
                className="confirm-modal-btn confirm-modal-btn--no"
                onClick={() => setShowConfirmCloseReviewModal(false)}
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DECK CONFIRMATION MODAL */}
      {showDeleteDeckConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal-content">
            <h2 className="confirm-modal-title">
              Tem certeza que deseja excluir o deck:
            </h2>
            <div className="modal-bracket-box">
              <span className="corner-bl"></span>
              <span className="corner-br"></span>
              <span className="confirm-modal-target pixel-text">
                {deckToDelete?.nome}
              </span>
            </div>
            <div className="confirm-modal-footer">
              <button className="btn-confirm-yes" onClick={confirmDeleteDeck}>
                Sim
              </button>
              <button className="btn-confirm-no" onClick={() => setShowDeleteDeckConfirmModal(false)}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CARD CONFIRMATION MODAL */}
      {showDeleteCardConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal-content">
            <h2 className="confirm-modal-title">
              Tem certeza que deseja excluir o flashcard:
            </h2>
            <div className="modal-bracket-box">
              <span className="corner-bl"></span>
              <span className="corner-br"></span>
              <span className="confirm-modal-target pixel-text">
                {cardToDelete?.frente}
              </span>
            </div>
            <div className="confirm-modal-footer">
              <button className="btn-confirm-yes" onClick={confirmDeleteCard}>
                Sim
              </button>
              <button className="btn-confirm-no" onClick={() => setShowDeleteCardConfirmModal(false)}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
