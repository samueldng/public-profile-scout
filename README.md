# Public Profile Scout - OSINT Search Tool

## Descrição do Projeto

Public Profile Scout é uma ferramenta de pesquisa OSINT (Open Source Intelligence) que permite coletar informações públicas de perfis online de indivíduos. A aplicação busca dados em múltiplas plataformas e fontes públicas para criar um perfil abrangente de uma pessoa com base em seu nome e outros dados disponíveis.

## Tecnologias Utilizadas

Este projeto é construído com:

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage, Functions)
- **Animações**: Framer Motion
- **Notificações**: Notificações em tempo real com Supabase
- **Relatórios**: Geração de PDF com jsPDF
- **Busca OSINT**: Integração com APIs públicas e scraping ético

## Funcionalidades Implementadas

### ✅ Funcionalidades Principais

1. **Pesquisa OSINT Avançada**
   - Busca em múltiplas fontes públicas (LinkedIn, GitHub, Instagram, Twitter/X, Facebook, Lattes, JusBrasil, etc.)
   - Extração real de dados via API pública do GitHub
   - Busca reversa de imagens
   - Verificação de reputação de usernames

2. **Sistema de Planos**
   - Plano Básico (R$ 4,90): Pesquisa limitada
   - Plano Completo (R$ 14,90/mês): Pesquisa ilimitada e recursos avançados

3. **Interface Moderna**
   - Design responsivo com Tailwind CSS
   - Animações suaves com Framer Motion
   - Componentes UI elegantes com shadcn-ui
   - Notificações flutuantes em tempo real

4. **Relatórios Detalhados**
   - Geração de relatórios PDF
   - Visualização de perfis identificados
   - Links de referência verificáveis
   - Alertas de segurança e dados relevantes

5. **Notificações em Tempo Real**
   - Notificações flutuantes de atividade de usuários
   - Sistema de notificações persistentes
   - Feedback imediato de processamento

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── notifications/   # Sistema de notificações
│   ├── ui/             # Componentes shadcn-ui
│   └── Header.tsx      # Cabeçalho global
├── pages/              # Páginas da aplicação
├── services/           # Serviços e lógica de negócio
├── hooks/              # Hooks personalizados
├── integrations/       # Integrações com APIs externas
└── utils/              # Funções utilitárias

supabase/
├── functions/          # Funções serverless
├── migrations/         # Migrações do banco de dados
└── config.toml         # Configuração do Supabase
```

## Configuração e Instalação

### Pré-requisitos

- Node.js & npm instalados
- Conta no Supabase (para desenvolvimento local)

### Passos para Execução Local

```bash
# 1. Clonar o repositório
git clone <SEU_GIT_URL>

# 2. Navegar até o diretório do projeto
cd public-profile-scout

# 3. Instalar dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

## Arquitetura do Sistema

### Fluxo de Pesquisa

1. Usuário preenche formulário de busca com nome e dados opcionais
2. Sistema cria job de pesquisa no banco de dados Supabase
3. Serviço OSINT processa a busca em múltiplas fontes
4. Dados reais são extraídos via APIs públicas quando disponíveis
5. Resultados são compilados e apresentados ao usuário
6. Usuário pode exportar relatório em PDF

### Fontes de Dados OSINT

- **GitHub**: Extração real via API pública ✅
- **LinkedIn**: Links de busca (scraping bloqueado)
- **Instagram**: Links de busca
- **Twitter/X**: Links de busca
- **Facebook**: Links de busca
- **Lattes**: Links de busca (requer verificação manual)
- **JusBrasil**: Links de busca jurídica
- **Google Scholar**: Busca acadêmica
- **Stack Overflow**: Perfil de desenvolvedor

## Pendências e Melhorias Futuras

### 🚧 Pendências Atuais

1. **Integração com APIs Pagas**
   - SERP API para resultados de busca mais precisos
   - Integrações com APIs de verificação de identidade

2. **Melhorias na Extração de Dados**
   - Implementação de scraping ético para fontes permitidas
   - Integração com mais APIs públicas

3. **Sistema de Autenticação**
   - Implementação completa de login/registro
   - Controle de acesso baseado em planos

### ✅ Funcionalidades Concluídas

- [x] Extração real de dados do GitHub via API pública
- [x] Sistema de notificações flutuantes
- [x] Geração de relatórios PDF
- [x] Interface responsiva e moderna
- [x] Sistema de planos (básico e completo)
- [x] Busca em múltiplas fontes públicas
- [x] Tratamento de dados fictícios (remoção de dados inventados)

## Problemas Conhecidos e Soluções

### 🔧 Problemas Resolvidos Recentemente

1. **Extração de Dados do GitHub**
   - Problema: Mensagem "falta essa, ainda ta em branco" para dados do GitHub
   - Solução: Implementação correta da API do GitHub com feedback visual adequado

2. **Erros de Codificação**
   - Problema: Arquivo Results.tsx corrompido com caracteres especiais
   - Solução: Reposição do arquivo com codificação UTF-8 correta

3. **Conflitos de Merge**
   - Problema: Conflitos durante atualização do repositório
   - Solução: Resolução manual dos conflitos e atualização das dependências

## Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## Deploy e Publicação

Para publicar o projeto:

1. Acesse [Lovable](https://lovable.dev/projects/98c4095d-8822-425e-ad5e-b1e6fceaca1e)
2. Clique em Share -> Publish
3. Siga as instruções para configurar domínio personalizado se necessário

## Licença

Este projeto faz parte de um desenvolvimento criado com [Lovable](https://lovable.dev) e está sob a licença específica do Lovable para projetos criados na plataforma.

## Contato

Para suporte ou dúvidas, acesse o projeto no [Lovable](https://lovable.dev/projects/98c4095d-8822-425e-ad5e-b1e6fceaca1e).