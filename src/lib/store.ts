export type VfsNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  parentId: string | null;
};

// Simple event emitter for reactive state
class Store {
  private listeners: Record<string, Function[]> = {};

  // State
  public vfs: VfsNode[] = [];
  public activeFileId: string | null = null;
  public activeFolderId: string | null = null;
  public creatingItem: { type: 'file' | 'folder', parentId: string | null } | null = null;
  public renamingItemId: string | null = null;
  public openTabIds: string[] = [];
  public backendAvailable: boolean = false;
  
  // A place to hold references that aren't reactive data but needed globally
  public editorInstance: any = null;
  public executionCount: number = 0;
  public consoleLogsData: { element: HTMLElement }[] = [];

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }

  setVfs(vfs: VfsNode[]) {
    this.vfs = vfs;
    this.emit('vfs-changed', this.vfs);
  }

  setActiveFileId(id: string | null) {
    this.activeFileId = id;
    this.emit('active-file-changed', id);
  }

  setActiveFolderId(id: string | null) {
    this.activeFolderId = id;
    this.emit('vfs-changed', this.vfs);
  }

  setCreatingItem(item: { type: 'file' | 'folder', parentId: string | null } | null) {
    this.creatingItem = item;
    this.emit('vfs-changed', this.vfs);
  }

  setRenamingItemId(id: string | null) {
    this.renamingItemId = id;
    this.emit('vfs-changed', this.vfs);
  }

  setOpenTabIds(ids: string[]) {
    this.openTabIds = ids;
    this.emit('tabs-changed', this.openTabIds);
  }

  setBackendAvailable(available: boolean) {
    this.backendAvailable = available;
    this.emit('backend-status-changed', available);
  }
}

export const store = new Store();
