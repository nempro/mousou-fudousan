/* ブラウザ内だけで依頼書を組み立てる。保存・API通信は行わない。 */
(() => {
  'use strict';
  const fields = [
    ['world', '世界観'], ['building', '建物の種類'], ['floors', '階数'],
    ['basement', '地下室'], ['location', '立地・周辺環境'], ['size', '広さ'],
  ];
  const marker = '（Webサイトで入力・選択された希望条件をここに挿入）';
  const priority = '自由記入と選択条件に矛盾がある場合は、自由記入の具体的な希望を優先してください。';

  function buildRequest(values, template = globalThis.MOUSOU_PROMPT) {
    if (typeof template !== 'string' || !template.includes(marker)) {
      throw new Error('正式なプロンプト本文を読み込めませんでした。');
    }
    const conditions = [];
    // trimは入力の有無の判定だけに使用し、原文の空白・改行はそのまま保持する。
    if (values.dream?.trim()) conditions.push(`理想の家・こだわり（自由記入）：\n${values.dream}`);
    for (const [key, label] of fields) {
      if (values[key]) conditions.push(`${label}：${values[key]}`);
    }
    if (!conditions.length) return '';
    // 置換文字列中の $& なども利用者の入力のまま扱う。
    return template.replace(marker, () => `${conditions.join('\n\n')}\n\n${priority}`);
  }
  globalThis.Mousou = Object.freeze({ buildRequest });
  if (typeof document === 'undefined') return;

  const form = document.getElementById('request-form');
  const issue = document.getElementById('issue-button');
  const help = document.getElementById('issue-help');
  const result = document.getElementById('result');
  const copy = document.getElementById('copy-button');
  const status = document.getElementById('copy-status');
  const preview = document.getElementById('prompt-preview');
  const manualHelp = document.getElementById('manual-copy-help');
  let issued = '';
  let revision = 0;

  function readValues() {
    return Object.fromEntries(new FormData(form));
  }

  function refresh() {
    revision += 1;
    const hadIssued = Boolean(issued);
    issued = '';
    result.hidden = true;
    preview.value = '';
    status.textContent = '';
    manualHelp.hidden = true;
    document.getElementById('prompt-details').open = false;
    try {
      const ready = Boolean(buildRequest(readValues()));
      issue.disabled = !ready;
      help.textContent = ready
        ? (hadIssued ? '入力が変わりました。もう一度発行すると、新しい内容をコピーできます。' : 'この内容で、AIに渡す査定依頼書を作成します。')
        : 'こだわりを入力するか、条件を1つ選ぶと発行できます。';
    } catch (error) {
      issue.disabled = true;
      help.textContent = `${error.message} ページを再読み込みしてください。`;
    }
  }

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  window.addEventListener('pageshow', refresh);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      issued = buildRequest(readValues());
      if (!issued) { refresh(); return; }
      revision += 1;
      preview.value = issued;
      status.textContent = '';
      manualHelp.hidden = true;
      result.hidden = false;
      help.textContent = '入力を変えた場合は、もう一度発行してください。';
      document.getElementById('result-title').focus();
    } catch (error) {
      refresh();
    }
  });

  function fallbackCopy(text) {
    const temporary = document.createElement('textarea');
    temporary.value = text;
    temporary.setAttribute('readonly', '');
    temporary.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;';
    document.body.append(temporary);
    temporary.select();
    temporary.setSelectionRange(0, text.length);
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally { temporary.remove(); copy.focus({ preventScroll: true }); }
    if (!copied) throw new Error('Clipboard unavailable');
  }

  copy.addEventListener('click', async () => {
    const current = buildRequest(readValues());
    if (!issued || current !== issued) { refresh(); return; }
    const copyRevision = revision;
    const text = issued;
    copy.disabled = true;
    manualHelp.hidden = true;
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); }
        catch (error) {
          if (copyRevision !== revision) return;
          fallbackCopy(text);
        }
      } else {
        fallbackCopy(text);
      }
      if (copyRevision === revision) status.textContent = '指示文を全文コピーしました。好きなAIに貼り付けてください。';
    } catch (error) {
      if (copyRevision !== revision) return;
      document.getElementById('prompt-details').open = true;
      status.textContent = '自動コピーができませんでした。選択された指示文をコピーしてください（PC：Ctrl+C／Mac：⌘C、スマートフォン：長押ししてコピー）。';
      manualHelp.textContent = status.textContent;
      manualHelp.hidden = false;
      preview.focus();
      preview.select();
    } finally {
      copy.disabled = false;
    }
  });
  refresh();
})();
