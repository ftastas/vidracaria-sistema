# Sistema de Gerenciamento para Vidraçaria

Um sistema completo para gerenciamento de vidraçarias, incluindo controle de orçamentos, finanças, ordens de serviço, estoque e caixa.

## Tecnologias Utilizadas

- **Frontend**: React, Tailwind CSS, ShadCN/UI
- **Backend**: Supabase (Banco de dados PostgreSQL + Autenticação)
- **Gerenciamento de Estado**: React Context API, React Query
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router

## Funcionalidades

O sistema possui as seguintes abas principais:

### Dashboard

- Visão geral do negócio
- Indicadores de desempenho
- Gráficos de vendas e faturamento
- Alertas de estoque e ordens pendentes

### Orçamentos

- Cadastro de orçamentos
- Listagem com filtros
- Conversão para ordem de serviço
- Impressão de orçamentos

### Finanças

- Controle de receitas e despesas
- Gráficos de desempenho financeiro
- Relatórios por período
- Categorização de lançamentos

### Ordem de Serviços

- Visualização em formato Kanban
- Acompanhamento de status
- Detalhamento de serviços
- Histórico de alterações

### Estoque

- Cadastro de produtos
- Controle de entrada e saída
- Alertas de estoque baixo
- Histórico de movimentações

### Caixa

- Abertura e fechamento de caixa
- Registro de movimentações
- Controle de diferenças
- Relatórios de fechamento

## Estrutura do Projeto

```
vidracaria-sistema/
├── public/
│   └── ...
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   └── ui/
│   │       └── ...
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── utils.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   └── dashboard/
│   │       ├── Dashboard.jsx
│   │       ├── Orcamentos.jsx
│   │       ├── Financas.jsx
│   │       ├── OrdensServico.jsx
│   │       ├── Estoque.jsx
│   │       └── Caixa.jsx
│   ├── App.jsx
│   ├── index.jsx
│   └── ...
├── package.json
└── ...
```

## Acesso ao Sistema

### Versão de Demonstração

Uma versão de demonstração do sistema está disponível online em:

**URL**: [https://vidracaria-sistema.vercel.app](https://vidracaria-sistema.vercel.app)

**Credenciais de acesso**:
- **Email**: admin@vidracaria.com
- **Senha**: senha123

Esta versão de demonstração utiliza dados simulados e não requer conexão com banco de dados real.

## Configuração do Banco de Dados

O sistema utiliza o Supabase como backend. As seguintes tabelas são necessárias:

- `usuarios`: Armazena informações dos usuários
- `orcamentos`: Registra orçamentos
- `ordens_servico`: Controla ordens de serviço
- `estoque`: Gerencia produtos em estoque
- `estoque_movimentacoes`: Registra movimentações de estoque
- `caixa`: Controla abertura e fechamento de caixa
- `caixa_movimentacoes`: Registra movimentações de caixa
- `caixa_fechamentos`: Armazena histórico de fechamentos
- `financas`: Registra lançamentos financeiros

## Autenticação

O sistema utiliza autenticação via email/senha através do Supabase Auth. As rotas do dashboard são protegidas e só podem ser acessadas por usuários autenticados.

## Responsividade

O sistema é totalmente responsivo, adaptando-se a diferentes tamanhos de tela, desde dispositivos móveis até desktops.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.



## Deploy do Sistema

O sistema está configurado para ser facilmente implantado no Vercel. Para fazer o deploy:

1. Crie uma conta no [Vercel](https://vercel.com)
2. Conecte seu repositório GitHub/GitLab/Bitbucket
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique em "Deploy"

Alternativamente, você pode usar a CLI do Vercel:

```bash
# Instalar a CLI do Vercel
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel
```

Para mais detalhes sobre o processo de deploy, consulte o arquivo [DEPLOY.md](./DEPLOY.md).

Para informações sobre manutenção e atualização do sistema, consulte o arquivo [MANUTENCAO.md](./MANUTENCAO.md).

## Desenvolvimento Local

Para executar o projeto localmente:

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/vidracaria-sistema.git
cd vidracaria-sistema
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto:
```bash
pnpm run dev
```

5. Acesse o sistema em `http://localhost:5173`

Se não configurar as variáveis de ambiente, o sistema funcionará em modo de demonstração com dados simulados.

