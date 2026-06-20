export function escapeHtml(str: string) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export function parseStructuredContent(text: string): { html: string; blocks: string } {
  let html = text;
  const planLines: string[] = [];
  const planRegex = /^-\s+\[([ x])\]\s+(.+)$/gm;
  let match;
  while ((match = planRegex.exec(html)) !== null) {
    const status = match[1] === 'x' ? 'done' : 'pending';
    const label = match[2];
    planLines.push(JSON.stringify({ status, label }));
  }
  if (planLines.length > 0) {
    html = html.replace(/^-\s+\[[ x]\]\s+.+$/gm, '');
    const steps = planLines.map((s, i) => ({ id: `p${i}`, ...JSON.parse(s) }));
    const planCard = buildPlanCard(steps);
    return { html: html.trim(), blocks: planCard };
  }
  return { html, blocks: '' };
}

export function buildPlanCard(steps: any[]): string {
  let html = `<div class="ai-plan-card">
    <div class="ai-plan-header" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.ai-plan-chevron').classList.toggle('rotate-90')">
      <span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#c0caf5;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        Plan
        <span style="color:#4b5066;">(${steps.filter(s=>s.status==='done').length}/${steps.length})</span>
      </span>
      <span class="ai-plan-chevron transition-transform" style="color:#4b5066;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </span>
    </div>
    <div class="ai-plan-steps">`;
  steps.forEach(step => {
    const statusClass = step.status === 'done' ? 'status-done' : step.status === 'active' ? 'status-active' : 'status-pending';
    const icon = step.status === 'done' ? '✓' : step.status === 'active' ? '◌' : '○';
    const labelClass = step.status === 'pending' ? 'label-pending' : '';
    html += `<div class="ai-plan-step">
      <span class="${statusClass}">${icon}</span>
      <span class="${labelClass}">${step.label}</span>
    </div>`;
  });
  html += `</div></div>`;
  return html;
}

export function markdownToHtml(text: string): string {
  const planResult = parseStructuredContent(text);
  let html = planResult.html;

  const codeBlocks: string[] = [];
  html = html.replace(/```([\w+#.-]*)\r?\n?([\s\S]*?)```/g, (_m, rawLang, code) => {
    const lang = rawLang.trim() || 'code';
    const trimmed = code.trim();

    if (lang === 'diff') {
      const cardId = `diff-${codeBlocks.length}`;
      const lines = trimmed.split('\n');
      let fileName = 'file.diff';
      const fileMatch = trimmed.match(/^[+-]{3}\s+(.+)$/m);
      if (fileMatch) fileName = fileMatch[1].replace(/^[ab]\//, '');
      const bodyLines = lines
        .filter(l => !/^[+-]{3}\s/.test(l) && !/^@@/.test(l))
        .map(l => {
          if (l.startsWith('+')) return `<div class="ai-diff-row ai-diff-add"><span class="ai-diff-pfx">+</span>${escapeHtml(l.slice(1))}</div>`;
          if (l.startsWith('-')) return `<div class="ai-diff-row ai-diff-remove"><span class="ai-diff-pfx">-</span>${escapeHtml(l.slice(1))}</div>`;
          return `<div class="ai-diff-row ai-diff-ctx"><span class="ai-diff-pfx"> </span>${escapeHtml(l.startsWith(' ') ? l.slice(1) : l)}</div>`;
        }).join('');
      codeBlocks.push(
        `<div class="ai-diff-card" id="${cardId}">
          <div class="ai-diff-card-header" onclick="(function(btn){var body=btn.parentElement.nextElementSibling;var ch=btn.querySelector('.ai-diff-chevron');body.classList.toggle('hidden');ch.classList.toggle('open');})(this)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9d7cf2" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span style="font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#c0caf5;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(fileName)}</span>
            <svg class="ai-diff-chevron open" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4b5066" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
          </div>
          <div class="ai-diff-card-body">${bodyLines}</div>
        </div>`
      );
      return `\x00CODE${codeBlocks.length - 1}\x00`;
    }

    if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh') {
      const lines = trimmed.split('\n');
      const commandLine = lines[0] || '';
      const output = lines.slice(1).join('\n');
      codeBlocks.push(
        `<div class="ai-terminal-card">
          <div class="ai-terminal-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7dcfff" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <span style="font-size:11.5px;color:#6b7394;">Terminal</span>
          </div>
          <div class="ai-terminal-body">
            <div class="command">$ ${escapeHtml(commandLine)}</div>${output ? `<div class="output">${escapeHtml(output)}</div>` : ''}
          </div>
        </div>`
      );
      return `\x00CODE${codeBlocks.length - 1}\x00`;
    }

    const escaped = escapeHtml(trimmed);
    const coloured = syntaxColour(escaped, lang);
    const id = `cb-${codeBlocks.length}`;
    codeBlocks.push(
      `<div class="ai-code-block" id="${id}">
        <div class="ai-code-header">
          <span class="ai-code-lang-badge">${lang}</span>
          <button class="ai-copy-btn" data-target="${id}" onclick="aiCopyCode(this)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
        </div>
        <pre><code>${coloured}</code></pre>
      </div>`
    );
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  const lines = html.split('\n');
  const out: string[] = [];
  let inUl = false, inOl = false;

  const flushLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  for (const raw of lines) {
    const line = raw;

    if (/^\x00CODE(\d+)\x00$/.test(line.trim())) {
      flushLists();
      const idx = parseInt(line.trim().match(/\d+/)![0]);
      out.push(codeBlocks[idx]);
      continue;
    }

    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) { flushLists(); out.push(`<h1>${inlineFormat(h1[1])}</h1>`); continue; }
    if (h2) { flushLists(); out.push(`<h2>${inlineFormat(h2[1])}</h2>`); continue; }
    if (h3) { flushLists(); out.push(`<h3>${inlineFormat(h3[1])}</h3>`); continue; }

    const bq = line.match(/^>\s?(.*)/);
    if (bq) { flushLists(); out.push(`<blockquote>${inlineFormat(bq[1])}</blockquote>`); continue; }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { flushLists(); out.push('<hr>'); continue; }

    const ul = line.match(/^[\*\-]\s+(.+)/);
    if (ul) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inlineFormat(ul[1])}</li>`);
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.+)/);
    if (ol) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inlineFormat(ol[1])}</li>`);
      continue;
    }

    flushLists();

    if (line.trim() === '') { out.push('<br>'); continue; }

    if (/\x00CODE\d+\x00/.test(line)) {
      out.push(line);
      continue;
    }

    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  flushLists();

  let finalHtml = out.join('');
  finalHtml = finalHtml.replace(/\x00CODE(\d+)\x00/g, (_m, idx) => codeBlocks[parseInt(idx)] ?? '');

  if (planResult.blocks) {
    finalHtml = planResult.blocks + finalHtml;
  }
  return finalHtml;
}

export function inlineFormat(s: string): string {
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}

export function syntaxColour(html: string, lang: string): string {
  const jsLangs = ['js','javascript','ts','typescript','jsx','tsx','json','node'];
  if (!jsLangs.includes(lang.toLowerCase())) {
    const lines = html.split('\n');
    let result = '';
    for (const line of lines) {
      result += `<span class="line">${line}</span>`;
    }
    return result;
  }

  const lines = html.split('\n');
  let result = '';
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/(&#39;[^&#]*&#39;|&quot;[^&]*&quot;|`[^`]*`)/g, '<span class="tok-str">$1</span>');
    line = line.replace(/(&#47;&#47;[^\n]*)/g, '<span class="tok-cmt">$1</span>');
    const kws = 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|from|new|this|typeof|instanceof|async|await|try|catch|finally|throw|void|null|undefined|true|false|of|in|static|get|set|super|yield|delete|module|require|exports|interface|type|enum|implements|abstract|readonly|private|protected|public';
    line = line.replace(new RegExp(`(?<![\\w$])(?:${kws})(?![\\w$])`, 'g'), '<span class="tok-kw">$&</span>');
    line = line.replace(/(?<![\w$])(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?)(?![\w$])/g, '<span class="tok-num">$1</span>');
    line = line.replace(/([a-zA-Z_$][\w$]*)(?=\s*\()/g, '<span class="tok-fn">$1</span>');
    line = line.replace(/(?<=[:]\s*)([A-Z][\w$]+)/g, '<span class="tok-type">$1</span>');
    line = line.replace(/(?<=\bclass\s+)([A-Z][\w$]+)/g, '<span class="tok-cls">$1</span>');
    line = line.replace(/(?<=\bnew\s+)([A-Z][\w$]+)/g, '<span class="tok-cls">$1</span>');

    result += `<span class="line">${line}</span>`;
  }
  return result;
}
