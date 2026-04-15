# SP Tech Week — Site novo

Pacote do novo site da São Paulo Tech Week, desenhado para você editar conteúdo em linguagem natural via planilha (em vez de mexer em Webflow).

## Status (atualizado 15/04/2026)

**Agenda real do site antigo já está embutida.** Eu extraí os 15 eventos reais da edição 2026 (LAVCA Family Office Breakfast, ABVCAP Experience, VIP Founders Lunch, Canary Summit, Atlantico, Cloud9 AGM, Fintech Day, AI Track, Endeavor AGM, Beacon Tech Founders VIP Lunch, Founders Cocktail, Tech Founders VIP Breakfast, Norte Day, Norte Private Drinks, Founders Retreat) do site `techweeksaopaulo.com.br` e eles estão em:
- `data/eventos.csv` (backup)
- `data/eventos.tsv` (pronto pra colar na planilha)
- No DEMO do `index.html` (preview funciona já, sem precisar da planilha)

**Apoiadores com as 4 categorias completas.** Extraí as 51 logos agrupadas por categoria (Hosts 5 · Tech Partners 4 · VC Partners 29 · Supporters 13) e gravei em:
- `data/apoiadores.csv` (backup)
- `data/apoiadores.tsv` (pronto pra colar na planilha)
- No DEMO do `index.html` (preview mostra as 4 seções na ordem certa)

Os nomes que eu consegui identificar pelo arquivo de logo estão lá. Os que não deu pra identificar pela URL (são UUIDs sem pista visual) estão como `[confirmar VC 2]`, `[confirmar VC 5]` etc. — você vai precisar abrir o site antigo uma vez e renomear na planilha conforme reconhecer visualmente.

**Preview já funciona 100% sem integração.** Mesmo sem os CSVs publicados, o `index.html` tem um DEMO embutido com toda a agenda real e as 51 logos categorizadas. Abra o arquivo no browser e você vê o site completo. A integração com a planilha é pra quando você quiser editar conteúdo via Sheets sem tocar em código.

---

## Arquivos neste pacote

```
SP Tech Week Website/
├── index.html               ← Site (abra no browser pra preview)
├── apps-script.gs           ← Backend do form (colar no Apps Script da planilha)
├── README.md                ← Este arquivo
└── data/
    ├── eventos.csv          ← 15 eventos reais 2026 (backup)
    ├── eventos.tsv          ← Mesmo conteúdo, pronto pra colar em Sheets
    ├── apoiadores.csv       ← 51 apoiadores categorizados (backup)
    ├── apoiadores.tsv       ← Pronto pra colar
    └── configuracoes.csv    ← 18 chaves de config do site
```

Planilha: `SP Tech Week 2026 - Admin do Site` — https://docs.google.com/spreadsheets/d/14oNj1FQqZNyOi2t0Mn7NvSrGSe6PwGIBQhwhx57lR_0

Pasta no Drive: `SP Tech Week 2026/` — https://drive.google.com/drive/folders/1Ztk-E3azPpSRHQZKfMSa0hHz6yESJHfm

---

## Próximos passos pra colocar no ar

### 1. (30 seg) Atualizar a aba `Eventos` da planilha com a agenda real

Hoje a aba `Eventos` tem 15 placeholders inventados. Substitua por:

1. Abra `data/eventos.tsv` em qualquer editor (VS Code, Bloco de Notas).
2. Selecione tudo (Ctrl+A) e copie (Ctrl+C).
3. Na planilha, aba `Eventos`, clique na célula **A2** (primeira linha de dados, abaixo do header).
4. Ctrl+V. Pronto — os 15 placeholders viram os 15 eventos reais.

### 2. (30 seg) Atualizar a aba `Apoiadores` da mesma forma

1. Abra `data/apoiadores.tsv`.
2. Selecione TUDO incluindo a linha de header — `Ctrl+A, Ctrl+C`.
3. Na aba `Apoiadores`, clique em **A1** (canto superior esquerdo).
4. Ctrl+V. Isso substitui tudo, garantindo ordem correta (Hosts → Tech → VC → Supporters) e coluna `Categoria` batendo com o que o site espera.

> Alternativa: se preferir não mexer na ordem existente, pule este passo — o DEMO do `index.html` já cobre o preview, e você pode ir editando a planilha ao longo do tempo.

### 3. Publicar as abas da planilha como CSV

Só com isso o site consome os dados da planilha em tempo real.

Dentro da planilha:
- **Arquivo → Compartilhar → Publicar na web**.
- Na janela: publique cada aba (`Eventos`, `Apoiadores`, `Configurações`) como **CSV**.
- Clique em "Publicar" e confirme.
- O `index.html` já tem o ID da planilha e os GIDs corretos das abas, então não precisa copiar URLs.

> A aba `Submissões` NÃO deve ser publicada — fica privada.

### 4. Deploy do Apps Script (pra form "Host an Event" funcionar)

1. Na planilha: **Extensões → Apps Script**.
2. Cole o conteúdo de `apps-script.gs` no editor.
3. Deploy → **New deployment** → tipo **Web app** → Execute as "Me", Who has access "Anyone".
4. Autorize e copie a "Web app URL".
5. Abra `index.html`, procure `const WEBHOOK_URL = ''` e cole a URL lá.

### 5. Hospedar o site

**Vercel** ou **Cloudflare Pages** (gratuitos para este volume).

**Opção A: via GitHub (recomendada — permite edição via Cowork com histórico)**
1. Criar repo privado (ex: `beaconfounders/sptechweek-site`).
2. `git init && git add . && git commit -m "initial" && git push`.
3. Conectar Vercel ao repo → deploy automático a cada push.
4. Apontar `techweeksaopaulo.com.br` no Vercel (atualizar DNS no registrador do domínio).

**Opção B: upload direto**
Vercel → "Deploy from scratch" → drag-and-drop da pasta. Mais rápido, mas sem histórico.

### 6. Proteger colunas de publicação (IMPORTANTE antes de abrir a planilha pra mais gente)

Nas abas **Eventos** e **Apoiadores**:
- Selecione a coluna `Aprovado?` inteira → Dados → Proteger intervalos → definir permissões → você + emails X, Y.
- Mesma coisa com `Publicar?`.
- Sugestão: crie um grupo `curadoria-sptw@...` e proteja para esse grupo.

### 7. Logos reais (opcional, quando sobrar tempo)

Os 51 apoiadores já apontam pro CDN do Webflow antigo — funciona hoje. Quando for desligar o Webflow:
1. Crie subpasta `logos/` em `SP Tech Week 2026/` no Drive.
2. Baixe cada logo do site atual e suba como `{Nome do Apoiador}.png`.
3. Na coluna `Logo` da aba Apoiadores, troque a URL pelo nome do arquivo.
4. No deploy, exporte essa pasta pra `/logos/` na raiz do site.

O `index.html` já faz o fallback: URL → carrega URL; senão busca em `/logos/{nome}`.

---

## Fluxo diário de administração

- **Você edita a planilha normalmente** (via Sheets ou via Cowork).
- O site atualiza em cada visita (CSVs lidos em runtime).
- Publicar um evento: preencha linha → `Aprovado?=SIM` e `Publicar?=SIM`.
- Despublicar: `Publicar?=NÃO`. Continua na planilha, só some do site.
- Submissões caem em `Submissões` com `Status=Novo`. Mover pra `Eventos` é manual (copy/paste).

## Preview local

Abra `index.html` no browser. O DEMO embutido agora reflete a agenda real e as 51 logos categorizadas — não precisa nem publicar CSVs pra ver o site como vai ficar em produção.

Quando os CSVs estiverem publicados, o site passa a ler a planilha e o DEMO some sozinho.

## Dúvidas abertas

1. **43 dos 51 apoiadores sem nome legível**. As URLs são UUIDs. Você pode identificar visualmente no site antigo e renomear na planilha no seu tempo.
2. **Form "Be Notified"** — hoje só mostra mensagem de confirmação. Próxima iteração: plugar Mailchimp/ConvertKit ou criar aba "Newsletter" na planilha.
3. **Analytics** — sugestão: Plausible ou Umami (respeitam privacidade, sem cookie banner).
4. **Domínio `techweeksaopaulo.com.br`** — qual registrador? Pra apontar DNS pro Vercel.
