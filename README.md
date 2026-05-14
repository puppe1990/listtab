# ListTab

Extensão Chrome para salvar todas as abas abertas como uma sessão, fechar essas abas e restaurá-las depois de forma individual, por sessão ou em lote.

## O que a extensão faz

- Salva as abas da janela atual em uma sessão.
- Ignora abas fixadas e URLs internas do navegador, como `chrome://`.
- Fecha as abas salvas após a captura da sessão.
- Lista sessões salvas em um popup compacto.
- Abre um dashboard completo para gerenciar sessões.
- Restaura uma aba, uma sessão inteira ou todas as sessões.
- Remove abas individuais de uma sessão.
- Renomeia sessões e marca sessões favoritas.
- Exporta e importa sessões em JSON.
- Persiste os dados com `chrome.storage.local`.

## Stack

- `TypeScript`
- `React 18`
- `Vite`
- `@crxjs/vite-plugin`
- `Tailwind CSS v4`
- `Vitest`

## Estrutura

```text
src/
  background/   service worker e orquestração do Chrome API
  popup/        popup da extensão
  dashboard/    interface completa de gerenciamento
  shared/       tipos, constantes e persistência
public/icons/   ícones da extensão
manifest.json   manifesto Chrome Extension (MV3)
```

## Requisitos

- `Node.js` 18+
- `npm`
- Google Chrome ou outro navegador compatível com extensões Chromium

## Instalação

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:run
npm run format
npm run format:check
```

## Como rodar em desenvolvimento

1. Rode o build da extensão:

```bash
npm run build
```

2. Abra `chrome://extensions`.
3. Ative `Developer mode`.
4. Clique em `Load unpacked`.
5. Selecione a pasta `dist/`.

Sempre que fizer mudanças, gere um novo build antes de recarregar a extensão no Chrome.

## Como usar

1. Clique no ícone da extensão.
2. Use `Save All Tabs` para salvar as abas da janela atual.
3. Abra `Open Full Dashboard` para gerenciar sessões.
4. No dashboard, você pode:
   - buscar sessões e abas
   - restaurar abas individuais
   - restaurar sessões completas
   - excluir sessões ou abas
   - favoritar e renomear sessões
   - exportar e importar backups em JSON

## Persistência

- Sessões são salvas em `chrome.storage.local` na chave `listtab_sessions`.
- As configurações usam a chave `listtab_settings`.
- O limite padrão de sessões é `50`.

## Testes

O projeto usa `Vitest` com testes para popup, dashboard, hooks, armazenamento e camada de background.

Para rodar a suíte completa:

```bash
npm run test:run
```

## Manifesto e permissões

Permissões atuais no `manifest.json`:

- `tabs`
- `storage`

O projeto usa `Manifest V3` com `service_worker` em `src/background/index.ts`.
