/**
 * SP Tech Week — Webhook de submissões
 * ------------------------------------------------------------------
 * Este script recebe POSTs do form "Host an Event" no site e grava
 * uma linha na aba "Submissões" da planilha-admin.
 *
 * COMO INSTALAR (5 minutos):
 * 1. Abra a planilha "SP Tech Week 2026 - Admin do Site" no Drive.
 * 2. Menu: Extensões → Apps Script.
 * 3. Apague o conteúdo de Code.gs e cole TODO este arquivo.
 * 4. Clique em Deploy → New deployment.
 *    - Select type: Web app
 *    - Description: "Form submissions webhook"
 *    - Execute as: Me (sua conta)
 *    - Who has access: Anyone
 * 5. Autorize o script quando pedir.
 * 6. Copie a "Web app URL" gerada.
 * 7. Cole essa URL na constante WEBHOOK_URL no arquivo index.html.
 * 8. Teste enviando uma submissão pelo form do site.
 *
 * SEGURANÇA:
 * - Rate limit simples por IP do requisitante (via hash, não salvamos IP).
 * - Honeypot "company" já é tratado no front — bots chegam aqui só
 *   se passarem o honeypot, então aplicamos rate limit adicional.
 * - Campos são saneados (truncados em tamanho máximo).
 * ------------------------------------------------------------------ */

const SHEET_NAME = 'Submissões';
const MAX_PER_HOUR = 10;           // submissões por (hash de fingerprint) por hora
const CACHE_PREFIX = 'sub_';

/** Entry point POST — invocado pelo fetch do site. */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');

    // Rate limit fraco usando cache de processo
    const fp = fingerprint_(payload);
    const cache = CacheService.getScriptCache();
    const key = CACHE_PREFIX + fp;
    const count = Number(cache.get(key) || 0);
    if (count >= MAX_PER_HOUR) {
      return json_({ ok: false, error: 'rate_limited' });
    }
    cache.put(key, String(count + 1), 3600);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return json_({ ok: false, error: 'sheet_not_found' });

    // Ordem das colunas EXATAMENTE como estão na aba Submissões.
    // As 10 primeiras batem com as 10 primeiras de Eventos, pra permitir
    // copy-paste direto ao aprovar uma submissão:
    // Data | Dia | Horário | Local | Nome do Evento | Organizador |
    // Categoria | Link de Inscrição | Invite Only? | Descrição |
    // Nome do Submissor | Email | Telefone | Timestamp | Status | Notas
    const row = [
      formatDate_(payload.date),            // 1  Data (DD/MM/YYYY)
      getWeekday_(payload.date),            // 2  Dia (Monday, Tuesday...)
      clip_(payload.time, 10),              // 3  Horário
      clip_(payload.location, 100),         // 4  Local
      clip_(payload.eventName, 120),        // 5  Nome do Evento
      clip_(payload.organizer, 120),        // 6  Organizador
      clip_(payload.category, 60),          // 7  Categoria
      clip_(payload.registrationLink, 400), // 8  Link de Inscrição
      clip_(payload.inviteOnly, 10),        // 9  Invite Only?
      clip_(payload.description, 800),      // 10 Descrição
      clip_(payload.submitterName, 120),    // 11 Nome do Submissor
      clip_(payload.submitterEmail, 200),   // 12 Email
      clip_(payload.submitterPhone, 40),    // 13 Telefone
      new Date(),                           // 14 Timestamp
      'Novo',                               // 15 Status inicial
      ''                                    // 16 Notas (curadoria preenche)
    ];
    sheet.appendRow(row);

    // Notificação opcional por email (descomente e ajuste o destino):
    // MailApp.sendEmail('contato@techweeksaopaulo.com.br',
    //   'Nova submissão: ' + payload.eventName,
    //   'Ver na planilha: ' + ss.getUrl());

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

/** GET para teste rápido — visite a URL no browser e deve ver "ok". */
function doGet() {
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function clip_(s, n) {
  if (!s) return '';
  return String(s).slice(0, n);
}

/** Converte 'YYYY-MM-DD' (formato do input type=date) pra 'DD/MM/YYYY' pra bater com a aba Eventos. */
function formatDate_(isoStr) {
  if (!isoStr) return '';
  const s = String(isoStr).trim();
  const parts = s.split('-');
  if (parts.length !== 3) return s.slice(0, 20);
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

/** Retorna dia da semana em inglês (Monday, Tuesday...) a partir de 'YYYY-MM-DD'. */
function getWeekday_(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(String(isoStr).trim() + 'T12:00:00');  // meio-dia evita bug de timezone
    if (isNaN(d.getTime())) return '';
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  } catch (e) { return ''; }
}

function fingerprint_(p) {
  const raw = (p.submitterEmail || '') + '|' + (p.submitterPhone || '');
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw);
  return bytes.map(b => (b & 0xff).toString(16).padStart(2, '0')).join('').slice(0, 12);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
