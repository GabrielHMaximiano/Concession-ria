# Backend - Concessionária (Supabase)

## Requisitos
- Node.js 18+
- Projeto Supabase ativo

## Configuração

1. Instale dependências:
```bash
npm install
```

2. Crie `.env` com base em `.env.template`:
```env
SUPABASE_URL=https://ihusziqbhvuhxyzjfdbp.supabase.co
SUPABASE_SECRET_KEY=...
SUPABASE_PUBLISHABLE_KEY=...
PORT=3001
```

3. No SQL Editor do Supabase, execute `sql/schema.sql`.

4. Inicie o servidor:
```bash
npm run start
```

## Endpoints

- `GET /health`
- `GET /carros`
- `POST /carros`
- `PUT /carros/:id`
- `DELETE /carros/:id`
- `POST /avaliacoes`
- `GET /avaliacoes/:carroId`
