# Guia de Manutenção e Atualização

Este documento contém instruções para manutenção e atualização do Sistema de Gerenciamento para Vidraçaria.

## Estrutura do Projeto

O sistema está organizado da seguinte forma:

```
vidracaria-sistema/
├── public/              # Arquivos estáticos
│   ├── glass-icon.svg   # Ícone da aplicação
│   └── _redirects       # Configuração de redirecionamento para hospedagem
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── layout/      # Componentes de layout (sidebar, header)
│   │   └── ui/          # Componentes de interface
│   ├── contexts/        # Contextos React (autenticação)
│   ├── lib/             # Bibliotecas e utilitários
│   │   ├── supabase.js  # Configuração e funções do Supabase
│   │   └── utils.js     # Funções utilitárias
│   ├── pages/           # Páginas da aplicação
│   │   ├── auth/        # Páginas de autenticação
│   │   └── dashboard/   # Páginas do dashboard
│   ├── App.jsx          # Componente principal e rotas
│   └── main.jsx         # Ponto de entrada da aplicação
├── .env                 # Variáveis de ambiente de desenvolvimento
├── .env.production      # Variáveis de ambiente de produção
├── vercel.json          # Configuração do Vercel
└── package.json         # Dependências e scripts
```

## Variáveis de Ambiente

O sistema utiliza as seguintes variáveis de ambiente:

- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do projeto Supabase

Estas variáveis devem ser configuradas no ambiente de hospedagem (Vercel) para produção.

## Modo de Demonstração

O sistema possui um modo de demonstração que é ativado automaticamente quando as variáveis de ambiente do Supabase não estão configuradas. Este modo utiliza dados simulados para demonstrar as funcionalidades do sistema.

### Credenciais de Demonstração

- **Email**: admin@vidracaria.com
- **Senha**: senha123

## Atualização do Sistema

### Atualizações de Código

1. Faça as alterações necessárias no código
2. Teste localmente usando `pnpm run dev`
3. Faça o build com `pnpm run build`
4. Verifique se o build foi gerado corretamente na pasta `dist`
5. Faça o deploy usando o Vercel CLI ou através do GitHub

### Atualização de Dependências

Para atualizar as dependências do projeto:

```bash
# Verificar atualizações disponíveis
pnpm outdated

# Atualizar todas as dependências
pnpm update

# Atualizar uma dependência específica
pnpm update nome-da-dependencia
```

## Banco de Dados

### Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas no Supabase:

1. `usuarios`: Armazena informações dos usuários
2. `orcamentos`: Registra orçamentos
3. `ordens_servico`: Controla ordens de serviço
4. `estoque`: Gerencia produtos em estoque
5. `estoque_movimentacoes`: Registra movimentações de estoque
6. `caixa`: Controla abertura e fechamento de caixa
7. `caixa_movimentacoes`: Registra movimentações de caixa
8. `caixa_fechamentos`: Armazena histórico de fechamentos
9. `financas`: Registra lançamentos financeiros

### Backup do Banco de Dados

O Supabase oferece funcionalidades de backup automático. Recomenda-se:

1. Configurar backups diários no Supabase
2. Exportar dados periodicamente usando a interface do Supabase ou API
3. Armazenar backups em local seguro

## Solução de Problemas

### Problemas de Autenticação

- Verifique se as variáveis de ambiente do Supabase estão configuradas corretamente
- Verifique se o usuário existe no Supabase
- Limpe o localStorage do navegador e tente novamente

### Problemas de Carregamento de Dados

- Verifique o console do navegador para erros
- Verifique se as tabelas no Supabase estão configuradas corretamente
- Verifique se as políticas de segurança do Supabase permitem acesso aos dados

### Problemas de Deploy

- Verifique os logs de build no Vercel
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Verifique se o arquivo `vercel.json` está configurado corretamente

## Contato e Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato:

- Email: suporte@vidracaria.com
- Telefone: (XX) XXXX-XXXX

