import { store, type VfsNode } from './store';
import { appendLog, updateExecutionStats, saveToHistory, handleSandboxMessage } from './console';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_BACKEND_URL) 
  ? import.meta.env.PUBLIC_BACKEND_URL 
  : 'http://localhost:3001';

export async function probeBackend() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
    store.setBackendAvailable(res.ok);
  } catch { 
    store.setBackendAvailable(false);
  }
}

export function requiresBrowserSandbox(code: string, fileName: string): boolean {
  if (fileName.match(/\.(jsx|tsx|html|css)$/)) return true;
  const apis = ['document.','window.','navigator.','localStorage','sessionStorage',
    'requestAnimationFrame','HTMLElement','getContext(','addEventListener(','fetch(',
    'alert(','confirm(','prompt(','history.','screen.', 'React.', 'ReactDOM.'];
  const stripped = code.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'');
  return apis.some(a => stripped.includes(a));
}

export function getFilePath(id: string): string {
  let path = '';
  let currentId: string | null = id;
  while (currentId) {
    const node = store.vfs.find((n: VfsNode) => n.id === currentId);
    if (!node) break;
    path = '/' + node.name + path;
    currentId = node.parentId;
  }
  return path;
}

export async function executeJS() {
  if (!store.editorInstance) return;
  const code = store.editorInstance.getValue();
  if (!code.trim()) return;
  
  store.executionCount++;
  
  const activeFile = store.vfs.find((n: VfsNode) => n.id === store.activeFileId);
  const fileName = activeFile ? activeFile.name : 'script.js';
  
  await probeBackend();
  const needsBrowser = requiresBrowserSandbox(code, fileName);

  const cssFiles = store.vfs.filter((n: VfsNode) => n.type === 'file' && n.name.endsWith('.css'));
  const combinedCss = cssFiles.map(f => f.id === store.activeFileId ? code : f.content).join('\n');

  if (store.backendAvailable && !needsBrowser) {
    appendLog('system', [`🐳 Initializing remote container build [Execution #${store.executionCount}]...`]);
    try {
      const res = await fetch(`${BACKEND_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = await res.json();
      const outputLines = (result.output || '').trim();
      if (outputLines) {
        appendLog(result.status === 'success' ? 'log' : 'error', [outputLines]);
      }
      updateExecutionStats(result.status === 'success', result.execTime ?? 0);
      saveToHistory(code);
    } catch {
      store.setBackendAvailable(false);
      appendLog('warn', ['⚠️ Remote container unavailable — falling back to local engine']);
      executeInIframe(code, combinedCss, fileName);
    }
  } else {
    const mode = needsBrowser ? 'React/DOM Build' : 'Local Engine';
    appendLog('system', [`Starting ${mode} [Execution #${store.executionCount}]...`]);
    executeInIframe(code, combinedCss, fileName);
  }
}

export function executeInIframe(code: string, css: string, fileName: string) {
  try {
    const previewTabBtn = document.querySelector('.output-tab-btn[data-output-tab="preview"]') as HTMLElement | null;
    if (previewTabBtn) previewTabBtn.click();

    window.removeEventListener('message', handleSandboxMessage);
    window.addEventListener('message', handleSandboxMessage);

    const modules: Record<string, string> = {};
    const files = store.vfs.filter((n: VfsNode) => n.type === 'file' && (n.name.endsWith('.js') || n.name.endsWith('.jsx') || n.name.endsWith('.ts') || n.name.endsWith('.tsx')));

    files.forEach(file => {
      const path = getFilePath(file.id);
      let fileCode = file.content || '';
      if (file.id === store.activeFileId) fileCode = code;

      const isReactFile = file.name.endsWith('.jsx') || file.name.endsWith('.tsx') || fileCode.includes('React') || /<[A-Za-z0-9_]+\s*[\/>]/.test(fileCode);
      const isTSFile = file.name.endsWith('.ts') || file.name.endsWith('.tsx');

      let processedCode = fileCode;
      if (file.id === store.activeFileId && isReactFile && !fileCode.includes('createRoot') && !fileCode.includes('ReactDOM.render')) {
        if (fileCode.includes('App')) {
          processedCode += `\n\n// Auto-injected by compiler\nif (typeof ReactDOM !== 'undefined' && document.getElementById('root')) {\n  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));\n}`;
        }
      }

      let transpiledCode = processedCode;
      try {
        const Babel = (window as any).Babel;
        if (Babel) {
          const presets: string[] = ['env'];
          if (isReactFile) presets.push('react');
          if (isTSFile) presets.push('typescript');
          
          const hoistGlobalsPlugin = function(babel: any) {
            const t = babel.types;
            return {
              visitor: {
                FunctionDeclaration(path: any) {
                  if (path.parent.type === 'Program' && path.node.id) {
                    const name = path.node.id.name;
                    const assign = t.expressionStatement(
                      t.assignmentExpression('=', t.memberExpression(t.identifier('window'), t.identifier(name)), t.identifier(name))
                    );
                    path.insertAfter(assign);
                  }
                },
                VariableDeclaration(path: any) {
                  if (path.parent.type === 'Program') {
                    const assignments: any[] = [];
                    path.node.declarations.forEach((decl: any) => {
                      if (t.isIdentifier(decl.id)) {
                        const name = decl.id.name;
                        assignments.push(
                          t.expressionStatement(
                            t.assignmentExpression('=', t.memberExpression(t.identifier('window'), t.identifier(name)), t.identifier(name))
                          )
                        );
                      }
                    });
                    if (assignments.length > 0) {
                      path.insertAfter(assignments);
                    }
                  }
                }
              }
            };
          };

          const result = Babel.transform(processedCode, {
            presets,
            plugins: [hoistGlobalsPlugin],
            filename: file.name,
          });
          transpiledCode = result.code || processedCode;
        }
      } catch (transpileErr: any) {
        appendLog('error', [`Transpile error in ${file.name}: ` + transpileErr.message]);
        transpiledCode = processedCode;
      }

      modules[path] = transpiledCode;
    });

    let htmlContent = '<div id="root"></div>';
    const indexHtmlFile = store.vfs.find((n: VfsNode) => n.type === 'file' && n.name === 'index.html');
    if (indexHtmlFile && indexHtmlFile.content) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(indexHtmlFile.content, 'text/html');
        const scripts = doc.querySelectorAll('script[src]');
        scripts.forEach(s => {
          const src = s.getAttribute('src');
          if (src && !src.startsWith('http') && !src.startsWith('//')) {
            s.remove();
          }
        });
        htmlContent = doc.body.innerHTML;
      } catch(e) {
        htmlContent = indexHtmlFile.content;
      }
    }

    let entryFile = store.activeFileId ? store.vfs.find((n: VfsNode) => n.id === store.activeFileId) : null;
    const isScript = (name: string) => name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts') || name.endsWith('.tsx');
    
    if (!entryFile || !isScript(entryFile.name)) {
      entryFile = store.vfs.find((n: VfsNode) => n.type === 'file' && (n.name === 'main.js' || n.name === 'index.js' || n.name === 'App.js' || n.name === 'main.tsx' || n.name === 'index.tsx'))
               || store.vfs.find((n: VfsNode) => n.type === 'file' && isScript(n.name));
    }
    
    const entryPath = entryFile ? getFilePath(entryFile.id) : '/script.js';
    const safeModules = JSON.stringify(modules);
    const safeEntry = JSON.stringify(entryPath);
    const safeCss = JSON.stringify(css);

    const bootstrapHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100%; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #cccccc; }
  </style>
  <style type="text/tailwindcss" id="user-css"></style>
  <script>
    function loadScript(urls, onDone) {
      var url = urls.shift();
      if (!url) return onDone && onDone(false);
      var s = document.createElement('script');
      s.src = url;
      s.onload = function() { onDone && onDone(true); };
      s.onerror = function() { loadScript(urls, onDone); };
      document.head.appendChild(s);
    }

    var scriptsLoaded = 0;
    function scriptReady() {
      scriptsLoaded++;
      if (scriptsLoaded >= 3) runUserCode();
    }

    loadScript(
      ['https://unpkg.com/@tailwindcss/browser@4', 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'],
      function(ok) { scriptsLoaded++; if (scriptsLoaded >= 3) runUserCode(); }
    );

    loadScript(
      ['https://unpkg.com/react@18/umd/react.production.min.js',
       'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js'],
      scriptReady
    );

    loadScript(
      ['https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
       'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js'],
      scriptReady
    );

    (function() {
      var _l=console.log,_i=console.info,_w=console.warn,_e=console.error;
      function send(t,a){try{window.parent.postMessage({channel:'stdout',type:t,args:Array.from(a).map(function(x){return typeof x==='object'?JSON.stringify(x,null,2):String(x);})},'*');}catch(e){}}
      console.log=function(){_l.apply(console,arguments);send('log',arguments);};
      console.info=function(){_i.apply(console,arguments);send('info',arguments);};
      console.warn=function(){
        _w.apply(console,arguments);
        if (arguments.length>0 && typeof arguments[0]==='string' && (arguments[0].includes('cdn.tailwindcss.com') || arguments[0].includes('@tailwindcss/browser'))) return;
        send('warn',arguments);
      };
      console.error=function(){_e.apply(console,arguments);send('error',arguments);};
      console.clear=function(){window.parent.postMessage({channel:'clear'},'*');};
      window.onerror=function(m,s,ln,col){send('error',[m+' (line '+ln+', col '+col+')']);return true;};
      window.addEventListener('unhandledrejection',function(e){send('error',['Unhandled: '+(e.reason&&e.reason.message||e.reason)]);});
    })();

    function runUserCode() {
      try {
        var modulesData = ${safeModules};
        var entryPath = ${safeEntry};
        var registry = {};

        function require(moduleName, currentDir) {
          if (moduleName === 'react') return window.React;
          if (moduleName === 'react-dom') return window.ReactDOM;

          var resolvedPath = moduleName;
          if (moduleName.startsWith('.')) {
             var parts = currentDir.split('/').filter(Boolean);
             var moduleParts = moduleName.split('/');
             for (var i = 0; i < moduleParts.length; i++) {
                if (moduleParts[i] === '.') continue;
                if (moduleParts[i] === '..') parts.pop();
                else parts.push(moduleParts[i]);
             }
             resolvedPath = '/' + parts.join('/');
          } else if (!moduleName.startsWith('/')) {
             resolvedPath = '/' + moduleName;
          }

          var possibleExts = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
          var finalPath = null;
          for (var i = 0; i < possibleExts.length; i++) {
            if (modulesData[resolvedPath + possibleExts[i]] !== undefined) {
               finalPath = resolvedPath + possibleExts[i];
               break;
            }
          }

          if (!finalPath) {
             var noSlash = resolvedPath.replace(/^\\//, '');
             for (var i = 0; i < possibleExts.length; i++) {
                if (modulesData['/' + noSlash + possibleExts[i]] !== undefined) {
                   finalPath = '/' + noSlash + possibleExts[i];
                   break;
                }
             }
          }

          if (!finalPath) throw new Error('Module not found: ' + moduleName);
          if (registry[finalPath]) return registry[finalPath].exports;

          var module = { exports: {} };
          registry[finalPath] = module;

          var fn = new Function('exports', 'require', 'module', 'React', 'ReactDOM', modulesData[finalPath]);
          var dir = finalPath.substring(0, finalPath.lastIndexOf('/')) || '/';
          
          fn(module.exports, function(req) { return require(req, dir); }, module, window.React, window.ReactDOM);

          return module.exports;
        }

        if (entryPath && entryPath !== '/script.js') {
           require(entryPath, '/');
        } else {
           var moduleKeys = Object.keys(modulesData);
           if (moduleKeys.length > 0) {
              require(moduleKeys[0], '/');
           }
        }
        window.parent.postMessage({channel:'compile_complete',status:'success'},'*');
      } catch(err) {
        console.error(err.message || String(err));
        window.parent.postMessage({channel:'compile_complete',status:'error'},'*');
      }
    }

    document.getElementById('user-css').textContent = ${safeCss};
  </script>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (previewIframe) previewIframe.srcdoc = bootstrapHtml;
    saveToHistory(code);
  } catch (e: any) {
    appendLog('error', ['Sandboxing error: ' + e.message]);
    updateExecutionStats(false, 0);
  }
}
