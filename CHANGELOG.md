# Changelog

Todas as mudanças relevantes do mile_bag_prototipo ficam registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[Versionamento Semântico](https://semver.org/lang/pt-BR/), como pede o item 2.3 do `CONVENTIONS.md`
(repositório `mile_bag_audite`).

## [Não lançado]

### Alterado

- Código reorganizado conforme o `CONVENTIONS.md` §1.2, espelhando o `mile_bag_app`, sem mudança de
  comportamento: telas em `features/motorista`, `features/back-office` e `features/auth`, cada feature com
  `components/` e um `index.ts`; `shared/` organizado em `components/`, `hooks/`, `services/`, `types/` e `utils/`.

## [0.1.0] - 2026-10-05

Primeira versão registrada neste arquivo. As telas anteriores (HU01 a HU21) estão no histórico do Git.

### Adicionado

- Mesma linguagem visual do mile_bag_app: cantos, sombras e movimento curto, respeitando
  `prefers-reduced-motion`.
- Tela **Conta** do motorista (`/motorista/conta`), com registros do aparelho, preferências de leitura
  e Sair.
- Menu único para a administração da empresa e da plataforma (`layouts/AdminShell.tsx`), com ícones.
- Visão geral da empresa com indicadores e atalhos.
- Tema escuro em todas as áreas, com escolha "Automático", "Claro" ou "Escuro" em "Leitura".
- Formatação de valores no padrão brasileiro (`src/data/formatar.ts`).

### Alterado

- Aplicação do motorista: textos maiores, alvos de toque de 48px, barra superior compacta e navegação
  inferior com "Capturar" em destaque. Sair saiu da barra inferior e foi para a tela Conta.
- Painel e detalhe da entrega mostram primeiro o destino e as ações principais.
- Textos em português claro, sem travessão e sem termos em inglês nas telas ("empresa" no lugar de
  "tenant", "Conectado" no lugar de "Online").

### Corrigido

- Valores em reais e quilômetros apareciam com ponto ("R$ 15.00", "12.4 km").
- Trajeto consolidado sem quilometragem aparecia como "0,0 km"; agora mostra "Não informado".
- Contorno de foco aparecia em volta do conteúdo ao trocar de tela.

[0.1.0]: https://github.com/MarilliaBraz/mile_bag_prototipo/releases/tag/v0.1.0
