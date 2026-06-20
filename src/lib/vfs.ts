import { store, type VfsNode } from './store';

export function initVFS() {
  const saved = localStorage.getItem('ag_vfs_state');
  if (saved) {
    try { store.setVfs(JSON.parse(saved)); } catch {}
  }
  
  if (store.vfs.length === 0) {
    const defaultVfs: VfsNode[] = [
      { id: 'f-html', name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app">Hello, world!</div>\n  <script src="main.js"><\\/script>\n</body>\n</html>\n', parentId: null },
      { id: 'f-css', name: 'style.css', type: 'file', content: 'body {\n  font-family: sans-serif;\n  background: #1e1e1e;\n  color: #fff;\n  margin: 0;\n  padding: 20px;\n}\n', parentId: null },
      { id: 'f-main', name: 'main.js', type: 'file', content: '// Write your JavaScript here\nconsole.log("Hello, world!");\n', parentId: null }
    ];
    store.setVfs(defaultVfs);
    saveVFS();
  }
  
  if (!store.activeFileId) {
    const firstFile = store.vfs.find((n: VfsNode) => n.type === 'file');
    if (firstFile) openFile(firstFile.id);
  }
}

export function saveVFS() {
  localStorage.setItem('ag_vfs_state', JSON.stringify(store.vfs));
}

export function getFileIcon(name: string, type: 'file' | 'folder') {
  if (type === 'folder') return `<svg width="14" height="14" viewBox="0 0 24 24" fill="#dcb67a"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
  if (name.endsWith('.js')) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="#f7df1e"><rect x="3" y="3" width="18" height="18" rx="2"/><text x="13.5" y="17" font-family="Arial" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">JS</text></svg>`;
  if (name.endsWith('.ts')) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="#3178c6"><rect x="3" y="3" width="18" height="18" rx="2"/><text x="13.5" y="17" font-family="Arial" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">TS</text></svg>`;
  if (name.endsWith('.jsx') || name.endsWith('.tsx')) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#61dafb" stroke-width="2"><circle cx="12" cy="12" r="2" fill="#61dafb"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(150 12 12)"/></svg>`;
  if (name.endsWith('.html')) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="#E34F26"><path d="m3 2 1.578 17.824L12 22l7.467-2.175L21 2H3Zm14.049 6.048H9.075l.172 2.016h7.697l-.626 6.565-4.246 1.381-4.281-1.455-.288-2.932h2.024l.16 1.411 2.4.815 2.346-.763.297-3.005H7.416l-.562-6.05h10.412l-.217 2.017Z"/></svg>`;
  if (name.endsWith('.css')) return `<svg width="14" height="14" viewBox="0 0 128 128"><path fill="#1572B6" d="M18.814 114.123L8.76 1.352h110.48l-10.064 112.754-45.243 12.543-45.119-12.526z"/><path fill="#33A9DC" d="M64.001 117.062l36.559-10.136 8.601-96.354h-45.16v106.49z"/><path fill="#fff" d="M64.001 51.429h18.302l1.264-14.163H64.001V23.435h34.682l-.332 3.711-3.4 38.114h-30.95V51.429z"/><path fill="#EBEBEB" d="M64.083 87.349l-.061.018-15.403-4.159-.985-11.031H33.752l1.937 21.717 28.331 7.863.063-.018v-14.39z"/><path fill="#fff" d="M81.127 64.675l-1.666 18.522-15.426 4.164v14.39l28.354-7.858.208-2.337 2.406-26.881H81.127z"/><path fill="#EBEBEB" d="M64.048 23.435v13.831H30.64l-.277-3.108-.63-7.012-.331-3.711h34.646zm-.047 27.996v13.831H48.792l-.277-3.108-.631-7.012-.33-3.711h16.447z"/></svg>`;
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cccccc" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
}

export function openFile(id: string | null) {
  if (!id) {
    store.setActiveFileId(null);
    if (store.editorInstance) store.editorInstance.setValue('');
    document.getElementById('editor-breadcrumb')?.classList.add('hidden');
    return;
  }

  const file = store.vfs.find((n: VfsNode) => n.id === id);
  if (!file || file.type !== 'file') return;
  store.setActiveFileId(id);
  
  if (!store.openTabIds.includes(id)) {
    store.setOpenTabIds([...store.openTabIds, id]);
  }
  
  document.getElementById('editor-breadcrumb')?.classList.remove('hidden');

  const label = document.getElementById('editor-title-label');
  if (label) label.textContent = file.name;
  
  const icon = document.getElementById('editor-title-icon');
  if (icon) icon.innerHTML = getFileIcon(file.name, 'file');
  
  const breadcrumb = document.getElementById('breadcrumb-label');
  if (breadcrumb) breadcrumb.textContent = file.name;
  
  if (store.editorInstance) {
    store.editorInstance.setValue(file.content || '');
    
    let lang = 'javascript';
    if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) lang = 'typescript';
    else if (file.name.endsWith('.html')) lang = 'html';
    else if (file.name.endsWith('.css')) lang = 'css';
    else if (file.name.endsWith('.json')) lang = 'json';
    
    const model = store.editorInstance.getModel();
    if (model) {
      // @ts-ignore
      if (window.monaco) window.monaco.editor.setModelLanguage(model, lang);
    }
  }
}

export function closeTab(id: string) {
  const idx = store.openTabIds.indexOf(id);
  if (idx === -1) return;
  
  const newTabs = [...store.openTabIds];
  newTabs.splice(idx, 1);
  store.setOpenTabIds(newTabs);
  
  if (store.activeFileId === id) {
    if (newTabs.length > 0) {
      const nextId = newTabs[Math.min(idx, newTabs.length - 1)];
      openFile(nextId);
    } else {
      openFile(null);
    }
  }
}

export function deleteNode(id: string) {
  const deleteRecursively = (targetId: string) => {
    const idx = store.openTabIds.indexOf(targetId);
    if (idx !== -1) {
      const newTabs = [...store.openTabIds];
      newTabs.splice(idx, 1);
      store.setOpenTabIds(newTabs);
    }
    
    const children = store.vfs.filter((n: VfsNode) => n.parentId === targetId);
    children.forEach(c => deleteRecursively(c.id));
    store.setVfs(store.vfs.filter((n: VfsNode) => n.id !== targetId));
  };
  
  deleteRecursively(id);
  
  if (store.activeFileId === id || !store.vfs.find((n: VfsNode) => n.id === store.activeFileId)) {
    if (store.openTabIds.length > 0) openFile(store.openTabIds[0]);
    else openFile(null);
  }
  
  if (store.activeFolderId === id) store.setActiveFolderId(null);
  
  saveVFS();
  showToast('✓ Deleted item');
}

export function showToast(message: string, isError: boolean = false) {
  const toast = document.createElement('div');
  const bgColor = isError ? 'bg-red-900/40 border-red-500/50 text-red-100' : 'bg-[#1e1e1e] border-[#333] text-white';
  const icon = isError 
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    
  toast.className = `fixed bottom-4 right-4 ${bgColor} border px-4 py-3 rounded shadow-xl text-[13px] z-[9999] flex items-center gap-3 transition-all duration-300 translate-y-4 opacity-0`;
  toast.innerHTML = `${icon} <span>${message}</span>`;
  document.body.appendChild(toast);
  
  toast.getBoundingClientRect();
  toast.classList.remove('translate-y-4', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function getTargetParentId() {
  if (store.activeFolderId) return store.activeFolderId;
  if (store.activeFileId) {
    const activeFile = store.vfs.find((n: VfsNode) => n.id === store.activeFileId);
    if (activeFile) return activeFile.parentId;
  }
  return null;
}
