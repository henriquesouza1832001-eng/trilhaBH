# 🍺 Trilha BH

> **O tour gastronômico colaborativo de Belo Horizonte.**
> Descubra, visite e avalie os bares e botequins da cidade. Compete no ranking, forme grupos com amigos e colecione emblemas.

<p align="center">
  <img src="www/images/logo.png" alt="Trilha BH" width="120"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/versão-Pré%20Beta%201.0-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/plataforma-PWA%20%7C%20Android-brown?style=flat-square"/>
  <img src="https://img.shields.io/badge/backend-Firebase-yellow?style=flat-square"/>
  <img src="https://img.shields.io/badge/licença-UNLICENSED-red?style=flat-square"/>
</p>

---

## 📖 Sobre

O Trilha BH é um Progressive Web App (PWA) com versão Android nativa (Capacitor). Funciona como um guia gastronômico gamificado de BH: o usuário cria um perfil, registra visitas a bares e botequins, avalia com nota e comentário, compete em rankings por diferentes categorias e forma grupos com amigos.

O projeto é independente, sem fins lucrativos.

---

## ✨ Funcionalidades

**Descobrir** — tela principal. Lista todos os bares com filtros por região (SUL, CENTRO, LESTE, NORDESTE, NOROESTE, NORTE, OESTE), tipo (bar, cervejaria, sinuca), vibes (samba, rock, pet friendly, LGBTQ+, acessível e outros 20 filtros) e busca por texto. Barra de progresso mostra o percentual da trilha concluída.

**Mapa** — lista os bares ordenados por distância via geolocalização, com mapa Leaflet/OpenStreetMap. Marcadores verdes para visitados e laranja para não visitados. Mostra quais membros do grupo já foram em cada bar.

**Feed** — feed de atividades colaborativo. Exibe visitas, avaliações, fotos e emblemas conquistados por todos os usuários. Filtro entre feed global e feed do grupo. Suporta reações (emoji), comentários e denúncia de posts.

**Roteiros** — organiza uma rota de bares para o dia com o grupo. Mapa interativo com ordem dos bares, botão de abertura no Google Maps, barra de progresso coletivo e sistema de sugestões com aprovação pelo organizador.

**Ranking** — 8 categorias: mais visitados, nota média, km rodados, mais regiões, percentual da trilha, crítico mais exigente, maior gasto e dominadores de região. Vista global ou restrita ao grupo. Compartilhamento via WhatsApp. Pódio animado e ranking temporal (mês, ano, hall da fama) com sistema de XP.

**Perfil** — estatísticas pessoais (bares, nota média, km, gasto total, dias ativos), mapa de regiões de BH, emblemas conquistados (10 por quantidade de visitas, 8 por região), histórico de visitas, avatar editável (emoji ou foto), gerenciamento de grupo e função de sugerir bar desconhecido.

**Grupos** — o usuário cria ou entra em um grupo por código. O grupo tem ranking próprio, feed filtrado, progresso coletivo por região e sistema de desafios com prazo e placar entre membros.

**Trilhas temáticas** — agrupamentos curados de bares por tema (cervejaria, sinuca, Comida di Buteco etc.) com progresso individual e emblema ao completar.

**Sistema de emblemas** — 18 emblemas no total. 10 desbloqueados por quantidade de bares visitados (de 1 a 1000), 8 por completar todas as regiões. Notificação com confete e opção de compartilhar a conquista.

**Modo anônimo** — o app funciona sem cadastro. Dados ficam só no localStorage. Após 5 minutos aparece um modal incentivando o cadastro.

**Reporte de problemas** — botão em cada bar para reportar horário errado, endereço incorreto, bar fechado, duplicado ou outro problema. Vai para a coleção `reportes` no Firestore para revisão do admin.

**Admin** — painel administrativo restrito por UID na coleção `admins`. Gerencia estabelecimentos, aprova sugestões da comunidade, modera comentários e gerencia usuários.

---

## 🗂️ Estrutura do Projeto

```
trilhaBH/
├── www/
│   ├── css/
│   │   └── app.css
│   ├── images/
│   │   ├── logo.png
│   │   ├── fundo-claro.png
│   │   ├── fundo-escuro.png
│   │   └── header.png
│   └── js/
│       ├── config.js           # Constantes globais, TTLs, emblemas, rankings, VIBES, inicialização Firebase
│       ├── auth.js             # Login, cadastro, modo anônimo, reset de senha, onAuthStateChanged, tutorial, registro de acesso
│       ├── app.js              # Lógica central: salvar visitas, calcular stats, ranking, feed, grupos, desafios
│       ├── descobrir.js        # Tela Descobrir: listagem, filtros, busca, avaliação inline
│       ├── avaliacao.js        # Bottom sheet de avaliação, favoritos, marcar visita
│       ├── mapa.js             # Mapa Leaflet, geolocalização, lista por distância
│       ├── feed.js             # Feed de atividades, reações, comentários, fotos
│       ├── perfil.js           # Perfil do usuário, avatar, grupos, sugestão de bar
│       ├── roteiro.js          # Roteiros do grupo, mapa de rota, sugestões
│       ├── ranking_temporal.js # Ranking por mês/ano/hall com sistema de XP
│       ├── trilhas.js          # Trilhas temáticas, carrossel, progresso por trilha
│       ├── nav.js              # Navegação entre abas, animações, ripple, perfil público
│       ├── admin.js            # Painel admin
│       ├── eventos.js          # Eventos e desafios do grupo
│       ├── splash.js           # Animação de carregamento
│       ├── utils.js            # sanitizeHtml, filtrarTexto, cache, notif, emblemas, upload de foto
│       ├── verificacao.js      # Reporte de problemas em bares
│       ├── data.js             # Base estática de estabelecimentos (fallback offline)
│       ├── bares_grid.json     # Metadados de layout dos cards
│       └── dist/               # Arquivos minificados (gerados — não versionar)
├── android/                    # Projeto Android gerado pelo Capacitor
├── index.html                  # Entry point
├── manifest.json               # Manifesto PWA
├── sw.js                       # Service Worker (cache offline, auto-update)
├── firebase.json               # Configuração Firebase Hosting
├── capacitor.config.json       # Configuração Capacitor/Android
├── atualizar_tipos.js          # Script para atualizar o campo `tipo` no data.js em lote
└── package.json
```

---

## 🔥 Coleções Firestore

| Coleção                            | Descrição                                                        |
| ---------------------------------- | ---------------------------------------------------------------- |
| `users/{uid}`                      | Dados do perfil (nome, avatar, km, favoritos)                    |
| `users/{uid}/visits/{barId}`       | Visitas do usuário (nota, comentário, foto, ts)                  |
| `users/{uid}/extras`               | Visitas extras (re-visitas com nova nota)                        |
| `estabelecimentos`                 | Base de dados dos bares (fonte principal, se `aprovado == true`) |
| `ranking/{uid}`                    | Cache de stats do usuário para o ranking global                  |
| `ranking/feed`                     | Feed global de atividades (array de até 200 eventos)             |
| `comentarios/{barId}/posts`        | Comentários por bar                                              |
| `comentarios/resumo`               | Resumo dos últimos comentários por bar (cache)                   |
| `descricoes/{barId}`               | Descrição colaborativa de cada bar                               |
| `grupos/{grupoId}`                 | Dados do grupo (membros, nome, código)                           |
| `grupos/{grupoId}/desafios`        | Desafios ativos do grupo                                         |
| `xp/{uid}`                         | XP do usuário por período (mês, ano, total)                      |
| `admins/{uid}`                     | UIDs com acesso ao painel admin                                  |
| `reportes`                         | Reportes de problema enviados pelos usuários                     |
| `analytics/anonimos`               | Acessos anônimos (1 por hora por device)                         |
| `analytics/usuarios/acessos/{uid}` | Contagem de acessos de usuários logados                          |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js v18+
- Firebase CLI: `npm install -g firebase-tools`
- Conta no [Firebase](https://console.firebase.google.com/)

### 1. Clone o repositório

```bash
git clone https://github.com/henriquesouza1832001-eng/trilhaBH.git
cd trilhaBH
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Firebase

Copie o template e preencha com as credenciais do seu projeto:

```bash
cp www/js/config.example.js www/js/config.js
```

Edite `www/js/config.js` com os valores do seu `firebaseConfig` (Console Firebase → Configurações do Projeto → Seus Apps).

### 4. Rode localmente

```bash
# Firebase Hosting local (recomendado)
firebase serve

# Ou servidor estático simples
npx serve www
```

---

## 📦 Deploy

```bash
firebase login
firebase use --add   # selecione o projeto trilhabh
firebase deploy --only hosting
```

---

## 📱 Build Android

```bash
npx cap sync android
npx cap open android   # abre no Android Studio
```

---

## 🛠️ Scripts Utilitários

### Atualizar tipos dos bares em lote

```bash
node atualizar_tipos.js
```

Lê o mapeamento `id → tipo` definido no próprio arquivo e atualiza o campo `tipo` no `www/js/data.js`.

---

## 🔒 Segurança

### O que já está implementado no código

- `sanitizeHtml()` em `utils.js` — escapa HTML antes de qualquer saída no DOM, protege contra XSS.
- `filtrarTexto()` em `utils.js` — filtra palavras proibidas em comentários e descrições antes de salvar no Firestore.
- Verificação de `banido: true` no `users/{uid}` durante o `onAuthStateChanged`, antes de liberar o acesso.
- Admin verificado por documento na coleção `admins` separada (não por campo no próprio perfil do usuário).
- Moderador verificado pelo campo `role` no documento do usuário, com permissões separadas do admin.
- Fotos de visita validadas por tipo (`jpeg`, `png`, `webp`) e tamanho (máx. 10MB) antes do upload.
- URL de foto verificada contra o domínio `firebasestorage.googleapis.com` antes de exibir.

### Firestore Security Rules

O arquivo `firestore.rules` na raiz do projeto contém as rules completas. Resumo das decisões:

- Leitura global liberada para qualquer usuário autenticado.
- `users`, `visits`, `extras`, `historico` e `xp` — escrita restrita ao próprio UID.
- `ranking/{doc}` — escrita permitida apenas para o próprio UID, exceto o documento `feed` que aceita qualquer logado (feed colaborativo).
- `estabelecimentos` — escrita bloqueada para usuários comuns; apenas admin (verificado via `get()` na coleção `admins`) pode escrever.
- `grupos` — qualquer logado cria (documento novo); edição restrita a membros do grupo.
- `analytics/anonimos/registros` — somente `create`, sem `update` ou `delete`.
- `analytics/usuarios/acessos/{uid}` — escrita restrita ao próprio UID.
- Documentos raiz de `analytics` bloqueados para escrita pelo client.
- `admins` — escrita bloqueada pelo client; somente leitura do próprio UID.

Para aplicar as rules:

```bash
firebase deploy --only firestore:rules
```

### Firebase Storage Rules

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{uid}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.uid == uid
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /visitas/{uid}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.uid == uid
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Configurações no Console Firebase

**Restrição da API Key** — Console GCP → APIs & Services → Credentials → selecione a chave → Application restrictions → HTTP referrers → adicione `trilhabh.web.app` e `trilhabh.firebaseapp.com`. A API Key é pública por design do Firebase, mas restringir domínios evita uso indevido fora do seu app.

**Authorized Domains** — Console Firebase → Authentication → Settings → Authorized domains. Garanta que apenas seus domínios estão listados.

### Observação sobre o feed

O documento `ranking/feed` armazena até 200 eventos em um único array e aceita escrita de qualquer usuário logado. Isso é necessário para o funcionamento colaborativo, mas significa que um usuário pode sobrescrever eventos de outros no array. Para projetos com maior volume de usuários, o ideal é mover a escrita no feed para uma Cloud Function que valida o conteúdo antes de persistir.

---

## 🔒 Privacidade e LGPD

O app coleta nome, e-mail (só para login), avatar, bares visitados, notas e comentários. O e-mail nunca é exibido publicamente. Dados armazenados no Google Firebase (EUA). O usuário pode excluir conta e todos os dados pela aba Perfil.

Contato: **henriquesouza1832001@gmail.com**

---

## 👤 Autor

**Henrique Souza** — [henriquesouza1832001@gmail.com](mailto:henriquesouza1832001@gmail.com)

---

## 📄 Licença

Projeto proprietário — **UNLICENSED**.
© 2026 Trilha BH. Todos os direitos reservados. Proibida reprodução sem autorização.
