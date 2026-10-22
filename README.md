# mile_bag_prototipo

Protótipo navegável do **Milebag**, sistema de gestão da última milha de bagagens, cobrindo as 21 histórias de usuário (HU01 a HU21) documentadas em [`mile_bag_documentacao/specs/`](https://github.com/MarilliaBraz/mile_bag_documentacao/tree/main/specs).

Este NÃO é o front-end de produção (esse é o [`mile_bag_app`](https://github.com/MarilliaBraz/mile_bag_app)). É um protótipo clicável, com dados fictícios guardados só no navegador (`localStorage`), sem back-end, câmera, GPS ou serviço de mapas reais (tudo é simulado), usado para validar os fluxos das telas antes da implementação real.

## Stack

- React 19 + TypeScript + Vite
- React Router (`HashRouter`, navegação por URL entre todas as telas)
- Tailwind CSS v4

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

```
src/
├── types.ts            # Tipos do domínio (versão simplificada do data-model.md de cada HU)
├── data/
│   ├── seed.ts          # Dados iniciais fictícios (1 tenant, motoristas, entregas em vários estágios)
│   ├── store.tsx        # "Back-end" simulado: Context + localStorage, uma ação por HU
│   └── statusLabels.ts  # Rótulos e cores dos status de Entrega e de Convite
├── components/          # Componentes pequenos reutilizados entre telas (ex.: Badge)
├── layouts/              # Casca de cada área do sistema (motorista, tenant, plataforma)
└── pages/
    ├── motorista/        # HU01 a HU08 e HU17 a HU21: aplicação do motorista (PWA)
    ├── tenant/            # HU09 a HU13: administração da empresa
    └── plataforma/        # HU14 a HU16: administração da plataforma
```

## Áreas navegáveis

| Área | Rota inicial | HUs cobertas |
|---|---|---|
| Aplicação do motorista | `/motorista` | HU01 a HU08, HU17 a HU21 |
| Administração da empresa | `/tenant` | HU09 a HU13 |
| Administração da plataforma | `/plataforma` | HU14 a HU16 |

A tela `/ativar-convite/:conviteId` fica fora dos layouts autenticados: simula o link de e-mail que o primeiro administrador de uma empresa recebe (HU15). Como não há envio de e-mail real, o link aparece na própria tela após cadastrar uma empresa ou reenviar um convite.

Na aplicação do motorista, a tela **Conta** (`/motorista/conta`) reúne os registros do aparelho, as preferências de leitura e o botão Sair.

## Tema e acessibilidade

Em "Leitura" (na tela Conta do motorista e no rodapé do menu da administração) é possível ajustar o tamanho do texto, ligar o alto contraste e escolher o tema **Automático** (segue o sistema), **Claro** ou **Escuro**. As escolhas ficam salvas no navegador.

## Versionamento

O projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/). Cada versão é registrada no [`CHANGELOG.md`](CHANGELOG.md) e marcada com uma tag `vX.Y.Z` depois do merge na `main`.

## Rastreabilidade

Cada tela referencia, em comentário ou na própria interface, a HU e os requisitos (RF/RN/RD/RI) de origem em `mile_bag_documentacao/`. Em caso de dúvida sobre um comportamento, a fonte da verdade é o `spec.md` da HU correspondente em `mile_bag_documentacao/specs/HU*/`, não este protótipo.

## Repositórios relacionados

- [`mile_bag_documentacao`](https://github.com/MarilliaBraz/mile_bag_documentacao): documentação do projeto (TAP, requisitos, HUs, specs)
- [`mile_bag_api`](https://github.com/MarilliaBraz/mile_bag_api): back-end real (Java/Spring Boot)
- [`mile_bag_app`](https://github.com/MarilliaBraz/mile_bag_app): front-end real e aplicação do motorista (React)
- [`mile_bag_infra`](https://github.com/MarilliaBraz/mile_bag_infra): infraestrutura e implantação
- [`mile_bag_audite`](https://github.com/MarilliaBraz/mile_bag_audite): constituição e convenções técnicas do projeto
