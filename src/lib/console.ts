import { store } from './store';
import { executeJS } from './engine';

export function appendLog(level: string, args: any[]) {
  const consoleLogs = document.getElementById('console-logs');
  const consoleCount = document.getElementById('console-count');
  if (!consoleLogs || !consoleCount) return;

  const placeholder = document.getElementById('console-placeholder');
  if (placeholder) placeholder.remove();

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:flex-start;gap:8px;padding:2px 12px;border-bottom:1px solid rgba(255,255,255,0.03);';

  const colors: Record<string, string> = {
    info: '#75beff', warn: '#cca700', error: '#f48771', success: '#4ec9b0',
    system: '#858585', log: 'inherit'
  };
  row.style.color = colors[level] || 'inherit';
  if (level === 'warn') row.style.background = 'rgba(204,167,0,0.05)';
  if (level === 'error') row.style.background = 'rgba(244,135,113,0.05)';

  const timeEl = document.createElement('span');
  timeEl.style.cssText = 'color:#555;font-size:11px;white-space:nowrap;min-width:70px;padding-top:1px;';
  timeEl.textContent = new Date().toLocaleTimeString([], { hour12: false });
  row.appendChild(timeEl);

  const icons: Record<string, string> = { warn: '⚠', error: '✖', info: 'ℹ', success: '✔', system: '›' };
  if (icons[level]) {
    const icon = document.createElement('span');
    icon.textContent = icons[level];
    icon.style.cssText = 'font-size:11px;padding-top:1px;opacity:0.7;';
    row.appendChild(icon);
  }

  const content = document.createElement('div');
  content.style.cssText = 'flex:1;white-space:pre-wrap;word-break:break-all;';
  
  const rawErrorText = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  args.forEach(arg => content.appendChild(createVisualElement(serializeValue(arg))));
  
  if (level === 'error') {
    const explainBtn = document.createElement('button');
    explainBtn.innerHTML = '✨ Explain Error';
    explainBtn.style.cssText = 'margin-top:4px;display:block;background:rgba(255,255,255,0.1);border:none;color:#ccc;border-radius:4px;padding:2px 8px;font-size:10px;cursor:pointer;transition:background 0.2s;';
    explainBtn.onmouseenter = () => explainBtn.style.background = 'rgba(255,255,255,0.2)';
    explainBtn.onmouseleave = () => explainBtn.style.background = 'rgba(255,255,255,0.1)';
    
    const explainContainer = document.createElement('div');
    explainContainer.style.cssText = 'margin-top:6px;padding:8px;background:rgba(0,0,0,0.2);border-radius:4px;border:1px solid rgba(255,255,255,0.05);display:none;color:#ddd;font-family:system-ui,sans-serif;line-height:1.4;';
    
        explainBtn.onclick = async () => {
      explainBtn.style.display = 'none';
      explainContainer.style.display = 'block';
      
      try {
        const OPENROUTER_API_KEY = import.meta.env.PUBLIC_OPENROUTER_API_KEY; // Read from .env
        
        if (!OPENROUTER_API_KEY) {
          explainContainer.innerHTML = `<span style="color:#f48771;">OpenRouter API Key not configured! Add PUBLIC_OPENROUTER_API_KEY to your .env file.</span>`;
          return;
        }
        explainContainer.innerHTML = '<span style="opacity:0.6;">Thinking...</span>';
        
        const codeContext = store.editorInstance ? store.editorInstance.getValue() : '';
        const prompt = `Error: ${rawErrorText}\n\nUser Code:\n${codeContext}\n\nExplain the error and suggest a fix in 2 short sentences.`;
        
        // Using OpenRouter's free model endpoint
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "google/gemma-4-31b-it:free",
            "reasoning": { "enabled": true },
            "messages": [
              {
                "role": "system",
                "content": "You are a helpful coding assistant. Explain the following JavaScript error concisely for a beginner."
              },
              {
                "role": "user",
                "content": prompt
              }
            ]
          })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        explainContainer.textContent = data.choices[0].message.content;
      } catch (e: any) {
        explainContainer.innerHTML = `<span style="color:#f48771;">AI failed: ${e.message}</span>`;
        explainBtn.style.display = 'block';
        explainBtn.textContent = 'Retry Explain Error';
      }
    };

    content.appendChild(explainBtn);
    content.appendChild(explainContainer);
  }

  row.appendChild(content);

  const scrolledToBottom = consoleLogs.scrollTop + 32 >= consoleLogs.scrollHeight - consoleLogs.clientHeight;
  consoleLogs.appendChild(row);
  store.consoleLogsData.push({ element: row });
  consoleCount.textContent = String(store.consoleLogsData.length);
  if (scrolledToBottom) consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

export function serializeValue(val: any, seen = new Set()): any {
  if (val === null) return { type: 'null', value: 'null' };
  if (val === undefined) return { type: 'undefined', value: 'undefined' };
  const t = typeof val;
  if (t === 'string') return { type: 'string', value: val };
  if (t === 'number') return { type: 'number', value: String(val) };
  if (t === 'boolean') return { type: 'boolean', value: String(val) };
  if (t === 'function') return { type: 'function', value: '[Function: ' + (val.name || 'anonymous') + ']' };
  if (t === 'bigint') return { type: 'bigint', value: String(val) + 'n' };
  if (seen.has(val)) return { type: 'circular', value: '[Circular]' };
  seen.add(val);
  if (Array.isArray(val)) return { type: 'array', value: val.map(v => serializeValue(v, new Set(seen))) };
  const keys = Object.keys(val);
  const props: Record<string, any> = {};
  keys.forEach(k => { try { props[k] = serializeValue(val[k], new Set(seen)); } catch { props[k] = { type: 'error', value: '??' }; } });
  return { type: 'object', value: props, constructor: val?.constructor?.name || 'Object' };
}

export function createVisualElement(item: any): HTMLElement {
  const el = document.createElement('span');
  el.style.marginRight = '8px';
  if (item.type === 'string') { el.style.color = '#ce9178'; el.textContent = `"${item.value}"`; return el; }
  if (item.type === 'number') { el.style.color = '#b5cea8'; el.textContent = item.value; return el; }
  if (item.type === 'boolean' || item.type === 'bigint') { el.style.color = '#569cd6'; el.textContent = item.value; return el; }
  if (item.type === 'null' || item.type === 'undefined') { el.style.color = '#569cd6'; el.style.fontStyle = 'italic'; el.textContent = item.value; return el; }
  if (item.type === 'function' || item.type === 'circular') { el.style.color = '#4ec9b0'; el.textContent = item.value; return el; }

  if (item.type === 'array' || item.type === 'object') {
    const tree = document.createElement('span');
    const toggle = document.createElement('span');
    toggle.className = 'obj-toggle';
    toggle.style.cssText = 'cursor:pointer;color:#4db6ac;font-weight:600;user-select:none;';
    toggle.textContent = item.type === 'array' ? `Array(${item.value.length})` : `${item.constructor} {…}`;
    const children = document.createElement('div');
    children.style.cssText = 'margin-left:16px;padding-left:8px;border-left:1px solid #3c3c3c;display:none;';
    const entries = item.type === 'array' ? item.value.map((v: any, i: number) => [String(i), v]) : Object.entries(item.value);
    entries.forEach(([k, v]: any) => {
      const row = document.createElement('div');
      const key = document.createElement('span');
      key.style.color = '#9cdcfe'; key.textContent = k + ': ';
      row.appendChild(key); row.appendChild(createVisualElement(v)); children.appendChild(row);
    });
    toggle.addEventListener('click', e => {
      e.stopPropagation(); toggle.classList.toggle('expanded');
      children.style.display = children.style.display === 'none' ? 'block' : 'none';
    });
    tree.appendChild(toggle); tree.appendChild(children); return tree;
  }
  el.textContent = String(item.value); return el;
}

export function clearLogs() {
  const consoleLogs = document.getElementById('console-logs');
  const consoleCount = document.getElementById('console-count');
  if (!consoleLogs || !consoleCount) return;

  consoleLogs.innerHTML = '';
  store.consoleLogsData = [];
  consoleCount.textContent = '0';
  const ph = document.createElement('div');
  ph.id = 'console-placeholder';
  ph.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;opacity:0.4;';
  ph.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg><span style="font-size:12px">Console cleared</span>`;
  consoleLogs.appendChild(ph);
}

export function updateExecutionStats(success: boolean, ms: number) {
  const statusIndicator = document.getElementById('compiler-status-indicator');
  const timeValSpan = document.getElementById('compiler-time-val');
  if (!statusIndicator) return;

  statusIndicator.textContent = success ? '✓ Success' : '✖ Error';
  statusIndicator.style.color = success ? '#4ec9b0' : '#f48771';
  if (ms && timeValSpan) timeValSpan.textContent = ` ${ms.toFixed(0)}ms`;
}

export function handleSandboxMessage(event: MessageEvent) {
  if (!event.data || typeof event.data !== 'object') return;
  const msg = event.data;
  if (msg.channel === 'stdout') appendLog(msg.type, msg.args);
  else if (msg.channel === 'clear') clearLogs();
  else if (msg.channel === 'compile_complete') updateExecutionStats(msg.status === 'success', 0);
}

export function saveToHistory(code: string) {
  let history: any[] = JSON.parse(localStorage.getItem('ag_compiler_history') || '[]');
  history = history.filter((i: any) => i.code !== code);
  history.unshift({ code, timestamp: new Date().toISOString() });
  if (history.length > 10) history.pop();
  localStorage.setItem('ag_compiler_history', JSON.stringify(history));
  renderHistory();
}

export function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-list-empty');
  if (!list || !empty) return;
  const history: any[] = JSON.parse(localStorage.getItem('ag_compiler_history') || '[]');
  if (!history.length) { empty.style.display = 'flex'; list.style.display = 'none'; return; }
  empty.style.display = 'none'; list.style.display = 'block'; list.innerHTML = '';
  history.forEach((item, idx) => {
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 12px;cursor:pointer;font-size:12px;transition:background 0.1s;';
    el.innerHTML = `<span style="color:#cccccc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:6px;opacity:0.5"><polyline points="4 17 10 11 4 5"/></svg>Revision #${idx + 1}</span><span style="color:#555">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
    el.addEventListener('mouseenter', () => el.style.background = 'rgba(255,255,255,0.05)');
    el.addEventListener('mouseleave', () => el.style.background = '');
    el.addEventListener('click', async () => {
      if (store.editorInstance) {
        store.editorInstance.setValue(item.code); 
        const { showToast } = await import('./vfs');
        showToast(`✓ Revision #${idx + 1} restored`); 
        executeJS();
      }
    });
    list.appendChild(el);
  });
}
