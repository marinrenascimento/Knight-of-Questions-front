# Knight of Questions — Telas de Relatório

> Branch: `feature/telas-relatorios`

Este documento descreve tudo que foi desenvolvido e integrado nesta branch, para que os colegas possam entender o que foi feito e como integrar as novas features com as telas de relatório.

---

## 🗂️ O que foi construído

### 1. Componentes reutilizáveis (`src/components/`)

| Componente | O que faz |
|---|---|
| `Header` | Cabeçalho com navegação, pontos reais, nível, rank e nome do usuário logado |
| `SummaryCard` | Cartões de resumo (ícone + valor + label) |
| `BarChart` | Gráfico de barras — aceita `direction="vertical"` ou `direction="horizontal"` |
| `ProgressBar` | Barra de progresso preenchível |
| `LoginForm` | Formulário de login com validação |
| `RegisterForm` | Formulário de cadastro |

### 2. Páginas (`src/pages/`)

| Rota | Tela |
|---|---|
| `/` | **Relatório Mensal** — consolidado do mês, gráfico comparativo este mês vs. mês passado |
| `/semanal` | **Relatório Semanal** — pontos por dia da semana (Seg → Dom) |

### 3. Serviços (`src/services/`)

| Arquivo | O que faz |
|---|---|
| `api.js` | Funções de requisição HTTP para todos os endpoints usados |
| `relatorioService.js` | Busca e agrega os dados do backend para montar os relatórios |

---

## 🔗 Integração com o Backend

### CORS — Configuração necessária no servidor

Para o frontend (`localhost:3000`) conseguir chamar o backend, o `cors` precisa estar habilitado no `index.js` da API:

```js
// Knight-of-Questions-api/index.js
import cors from 'cors';

app.use(cors()); // Permite requisições de qualquer origem (desenvolvimento)
```

> ⚠️ **Atenção para os colegas:** se o CORS não estiver configurado, o navegador vai bloquear todas as chamadas do frontend e nada vai funcionar. Já está feito no backend — **não remover essa linha**.

---

### Endpoints que as telas de relatório consomem

Todos os endpoints abaixo já existem no backend e **não precisam ser criados**. Eles são chamados automaticamente ao abrir as telas de relatório:

| Endpoint | Dados retornados | Arquivo da rota |
|---|---|---|
| `GET /pontos` | Pontos, nível e rank do usuário | `pontosRoutes.js` |
| `GET /pontos/historico` | Histórico de ações com data (`questoes`, `cards`, `jogos`) | `pontosRoutes.js` |
| `GET /ofensiva` | Sequência de dias (streak 🔥) | `ofensivaRoutes.js` |
| `GET /sessao/tempo/:user_id` | Tempo total de uso em minutos | `sessaoRoutes.js` |

---

## 📣 O que os outros times precisam fazer para alimentar os relatórios

**Os dados só aparecem nas telas de relatório se as outras features gravarem no banco corretamente.**

Quando o usuário realizar uma ação, a tela responsável deve chamar:

### Pontos (alimenta os gráficos e cards)

```js
POST /pontos/add
Authorization: Bearer <token>

// Corpo da requisição:
{ "acao": "questoes", "quantidade": 1 }  // usuário respondeu uma questão
{ "acao": "cards",    "quantidade": 1 }  // usuário revisou um flashcard
{ "acao": "jogos",    "quantidade": 1 }  // usuário jogou um jogo
```

### Ofensiva / Streak (alimenta o card 🔥)

```js
POST /ofensiva/update
Authorization: Bearer <token>
// Sem corpo — apenas chamar quando o usuário completar uma atividade no dia
```

### Sessão / Tempo de uso (alimenta o card ⏱️)

```js
// Ao fazer login:
POST /sessao/start
{ "user_id": <id do usuário> }
// Guardar o id da sessão retornado

// Ao fazer logout:
PUT /sessao/end/:id
```

---

## 🔐 Autenticação

O login está integrado com o backend. O token JWT é salvo no `localStorage` com a chave `aulafront_auth`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "email": "usuario@email.com", "name": "..." }
}
```

Todas as requisições autenticadas usam o header:
```
Authorization: Bearer <token>
```

---

## 💻 Como rodar

### Frontend
```bash
cd knight-of-questions
npm install
npm start
# Disponível em http://localhost:3000
```

### Backend
```bash
cd Knight-of-Questions-api
npm install
npm start
# API disponível em http://localhost:3000
# Docs Swagger: http://localhost:3000/docs
```

> ⚠️ Frontend e backend rodam em portas diferentes. Ajuste se necessário no `src/services/api.js` (`API_BASE_URL`).

---

## 📁 Estrutura de arquivos desta branch

```
src/
├── components/
│   ├── Header/
│   ├── SummaryCard/
│   ├── BarChart/
│   ├── ProgressBar/
│   ├── LoginForm/
│   └── RegisterForm/
├── pages/
│   ├── RelatorioMensal/
│   └── RelatorioSemanal/
├── services/
│   ├── api.js            ← requisições HTTP
│   └── relatorioService.js ← lógica de agregação dos dados
└── App.jsx               ← controle de autenticação e rotas
```
