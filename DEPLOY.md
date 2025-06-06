# Instruções para Deploy no Vercel

Este documento contém as instruções para implantar o Sistema de Gerenciamento para Vidraçaria no Vercel.

## Pré-requisitos

1. Conta no Vercel (https://vercel.com/signup)
2. Git instalado em sua máquina
3. Node.js e npm/pnpm instalados

## Passos para Deploy

### 1. Preparar o repositório Git

Primeiro, crie um repositório Git para o projeto:

```bash
cd vidracaria-sistema
git init
git add .
git commit -m "Versão inicial do sistema de gerenciamento para vidraçaria"
```

### 2. Conectar com GitHub/GitLab/Bitbucket (Recomendado)

Crie um repositório em uma dessas plataformas e envie seu código:

```bash
# Exemplo para GitHub
git remote add origin https://github.com/seu-usuario/vidracaria-sistema.git
git push -u origin main
```

### 3. Deploy via Vercel CLI

Instale a CLI do Vercel:

```bash
npm install -g vercel
```

Faça login na sua conta Vercel:

```bash
vercel login
```

Execute o deploy:

```bash
vercel
```

Siga as instruções interativas. Quando perguntado:
- Configurar projeto? Responda "y"
- Diretório de saída? Digite "dist"
- Substituir configurações? Responda "n"

Para deploy de produção:

```bash
vercel --prod
```

### 4. Deploy via Dashboard do Vercel

Alternativa ao CLI:

1. Acesse https://vercel.com/new
2. Importe seu repositório Git
3. Configure as opções de build:
   - Framework: Vite
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
4. Configure as variáveis de ambiente:
   - VITE_SUPABASE_URL: URL do seu projeto Supabase
   - VITE_SUPABASE_ANON_KEY: Chave anônima do seu projeto Supabase
5. Clique em "Deploy"

## Configuração do Supabase (Opcional)

Se desejar conectar a um banco de dados real:

1. Crie uma conta no Supabase (https://supabase.com)
2. Crie um novo projeto
3. Configure as tabelas conforme documentado no README.md
4. Obtenha as credenciais de API (URL e chave anônima)
5. Configure essas credenciais como variáveis de ambiente no Vercel

## Domínio Personalizado (Opcional)

Para configurar um domínio personalizado:

1. Acesse as configurações do seu projeto no Vercel
2. Vá para a seção "Domains"
3. Adicione seu domínio e siga as instruções para configurar os registros DNS

## Atualizações Futuras

Para atualizar o site após alterações:

```bash
# Se estiver usando CLI
vercel --prod

# Se estiver usando GitHub/GitLab/Bitbucket
# Basta fazer push das alterações
git add .
git commit -m "Descrição das alterações"
git push
```

O Vercel detectará automaticamente as alterações e fará o deploy da nova versão.

