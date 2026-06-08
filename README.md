# 💍 VouCasar - Lista de Casamento

Plataforma completa para gerenciar listas de casamento: cadastro de casais, presentes, contribuições via PIX e páginas públicas do casamento. Frontend em React/Vite e backend em FastAPI com MySQL.

## ✨ Destaques

- Autenticação por sessão com cookies e proteção CSRF
- Lista de presentes com fluxo público para convidados
- Templates públicos do casamento com slug amigável
- **Geração de PIX com suporte a múltiplos tipos de chave (CPF, Email, Telefone, Aleatória)**
- Docker Compose pronto para desenvolvimento/produção

## 📋 Alterações Recentes

### ✅ Seleção de Tipo de Chave PIX (Nova Funcionalidade - 8 de Junho de 2026)

O sistema agora permite que os casais selecionem o tipo de chave PIX que desejam utilizar:

**Tipos de Chave Suportados:**
- **Chave Aleatória**: UUID gerada aleatoriamente
- **CPF**: Chave com validação de 11 dígitos
- **Email**: Endereço de email como chave
- **Telefone**: Número de telefone com formatação E.164

**Mudanças Implementadas:**

1. **Banco de Dados**
   - Nova coluna `tipo_chave_pix` na tabela `Casal`
   - Valor padrão: `'aleatoria'`
   - Migration script em `scratch/add_tipo_chave_pix.py`

2. **Backend (util/pix.py)**
   - Função `normalizar_chave_pix()` agora valida o tipo de chave
   - Função `gerar_payload_pix()` agora aceita parâmetro `tipo_chave_pix`
   - Validação rigorosa por tipo com mensagens de erro descritivas

3. **API (backend/routers/casal.py)**
   - POST/PUT `/api/casal` agora aceita `tipo_chave_pix`
   - Validação de tipos válidos na criação/atualização

4. **Geração de PIX**
   - Transações em `backend/routers/transacao_presente.py` agora passam o tipo ao gerar PIX
   - Tratamento correto da chave baseado no tipo informado

5. **Frontend (DashboardPage.tsx)**
   - Novo dropdown para selecionar tipo de chave na criação do casamento
   - Modal de configuração de PIX com seletor de tipo
   - Placeholders contextuais conforme o tipo selecionado
   - Campo `tipo_chave_pix` adicionado à interface `Casal`

**Como Usar:**

1. Execute a migration (caso necessário):
   ```bash
   python scratch/add_tipo_chave_pix.py
   ```

2. No frontend, ao criar um casamento ou configurar PIX:
   - Selecione o tipo de chave desejado
   - Insira o valor de acordo com o tipo
   - O sistema validará e normalizará automaticamente

**Validações:**
- CPF: Deve ter exatamente 11 dígitos
- Email: Deve conter @ e ser válido
- Telefone: Aceita formatações variadas, normaliza para E.164
- Aleatória: UUID/string com no mínimo 5 caracteres

## 🧭 Visão Geral

- **Frontend**: React 18 + Vite + React Router + Tailwind
- **Backend**: FastAPI + MySQL (pool de conexões)
- **Proxy**: Nginx em produção (frontend) com `/api` encaminhado ao backend

## 📂 Estrutura do Projeto

```
voucasar/
├── backend/
│   ├── data/
│   │   ├── model/                # Modelos de dados
│   │   ├── repo/                 # Repositórios (CRUD)
│   │   └── sql/                  # Queries SQL
│   └── routers/                  # Rotas FastAPI
├── frontend/
│   ├── src/
│   │   ├── components/           # Header, ProtectedRoute
│   │   ├── contexts/             # AuthContext
│   │   ├── lib/                  # Axios + serviços
│   │   └── pages/                # Páginas da aplicação
│   ├── nginx.conf                # Proxy /api + SPA
│   └── vite.config.ts
├── util/                         # Autenticação, CSRF, segurança, PIX
├── conexao_db.py                 # Pool MySQL
├── init_db.py                    # Inicialização de tabelas
├── main.py                       # FastAPI
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

## ✅ Requisitos

- **Python 3.9+** (recomendado 3.12)
- **Node.js 18+**
- **MySQL 8+** (ou Docker)
- **Docker + Docker Compose** (opcional)

## 🔧 Configuração

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Exemplo de `.env`:

```env
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=voucasar

ENVIRONMENT=development
SECRET_KEY=voucasar-super-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
PORT=8000

LOG_LEVEL=INFO
```

## 🚀 Executar Localmente

### Backend (FastAPI)

```bash
pip install -r requirements.txt
python main.py
```

O backend sobe em `http://localhost:8000` com docs em:
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend em `http://localhost:5173`.

## 🐳 Executar com Docker Compose

```bash
docker compose up --build
```

Serviços:
- **MySQL** em `localhost:3306`
- **Backend** em `http://localhost:8000`
- **Frontend (Nginx)** em `http://localhost:5173`

## 📜 Scripts (raiz)

```bash
npm install
npm run dev             # backend + frontend (concurrently)
npm run backend:run
npm run frontend:dev
npm run build
```

## 🧩 Páginas do Frontend

- Casamento público: `CasamentoPage` e `MaisDetalhesPage`
- Presentes: `ListaPresentes`, `PresentsPage`
- Confirmação de presença: `ConfirmarPresencaPage`
- Contribuições: `ContribuicoesPage`
- Área privada: `DashboardPage`, `TemplateEditPage`
- Auth: `LoginPage`, `RegisterPage`
- Erros: `NotFoundPage`

## 🔐 Autenticação e Segurança

- **Sessão com cookie**: `voucasar_session`
- **CSRF**: cookie `csrf_token` + header `X-CSRF-Token` (Axios já configurado)
- **Tempo de sessão**: 30 minutos de inatividade
- Em produção, configure `SECRET_KEY` e use HTTPS

## 🔗 API (prefixo `/api`)

### Usuário
- `POST /api/usuario` - Criar usuário
- `GET /api/usuario/{id}` - Buscar usuário (somente o próprio)
- `PUT /api/usuario/{id}` - Atualizar usuário (somente o próprio)
- `POST /api/usuario/auth/login` - Login
- `POST /api/usuario/auth/logout` - Logout
- `GET /api/usuario/auth/me` - Dados da sessão

### Casal
- `POST /api/casal` - Criar casal
- `GET /api/casal` - Listar casais do usuário
- `GET /api/casal/{id}` - Buscar casal
- `PUT /api/casal/{id}` - Atualizar casal
- `DELETE /api/casal/{id}` - Deletar casal
- `DELETE /api/casal/{id}/parceiro` - Desvincular parceiro
- `POST /api/casal/{id}/aceitar-convite` - Aceitar convite
- `GET /api/casal/publico/{id}` - Dados públicos do casal
- `GET /api/casal/convites/pendentes` - Convites pendentes

### Presente
- `POST /api/presente` - Criar presente
- `GET /api/presente/{id}` - Buscar presente
- `PUT /api/presente/{id}` - Atualizar presente
- `DELETE /api/presente/{id}` - Deletar presente
- `GET /api/presente/casal/{casal_id}` - Listar presentes do casal
- `GET /api/presente/publico/casal/{casal_id}` - Lista pública

### Fonte de Compra
- `POST /api/fonte-compra` - Criar fonte
- `GET /api/fonte-compra/{id}` - Buscar fonte
- `PUT /api/fonte-compra/{id}` - Atualizar fonte
- `DELETE /api/fonte-compra/{id}` - Deletar fonte
- `GET /api/fonte-compra/presente/{presente_id}` - Listar por presente

### Transação de Presente
- `POST /api/transacao-presente` - Criar transação
- `GET /api/transacao-presente/{id}` - Buscar transação
- `PUT /api/transacao-presente/{id}` - Atualizar transação
- `DELETE /api/transacao-presente/{id}` - Deletar transação
- `GET /api/transacao-presente/casal/{casal_id}` - Listar por casal
- `GET /api/transacao-presente/convidado/{convidado_id}` - Listar por convidado
- `POST /api/transacao-presente/publico` - Criar transação pública (PIX)
- `POST /api/transacao-presente/publico/cota-livre` - PIX com valor customizado
- `POST /api/transacao-presente/publico/{transacao_id}/confirmar` - Confirmar pagamento

### Template
- `POST /api/template/{casal_id}` - Criar/atualizar template
- `GET /api/template/{casal_id}` - Buscar template (privado)
- `DELETE /api/template/{casal_id}` - Deletar template
- `GET /api/template/publico/{casal_id}` - Template público
- `GET /api/template/publico/slug/{slug}` - Template por slug

## 🛠️ Tecnologias

### Frontend
- React 18, React Router 6, TypeScript
- Vite, Tailwind CSS
- Axios, Lucide React

### Backend
- FastAPI, Uvicorn
- MySQL (mysql-connector)
- Pydantic, python-dotenv

## 🤝 Contribuindo

1. Crie uma branch (`git checkout -b feature/minha-feature`)
2. Commit (`git commit -m "Minha feature"`)
3. Push (`git push origin feature/minha-feature`)
4. Abra um Pull Request
