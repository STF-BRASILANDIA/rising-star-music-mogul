/**
 * StorageService — Camada unificada para acesso ao localStorage
 * - JSON seguro (parse/stringify com try/catch)
 * - Escrita atômica opcional (chave __staging)
 * - Namespacing simples por prefixo
 * - Eventos opcionais (dispatch Event 'storage:changed')
 */
(function(global){
  class StorageService {
    constructor(prefix = '') {
      this.prefix = prefix || '';
    }

    _key(k){ return this.prefix ? `${this.prefix}_${k}` : k; }

    getString(key, def = null){
      try { return localStorage.getItem(this._key(key)); } catch(_) { return def; }
    }

    setString(key, val){
      try { localStorage.setItem(this._key(key), String(val)); this._emitChanged(key, val); return true; } catch(e){ return false; }
    }

    remove(key){
      try { localStorage.removeItem(this._key(key)); this._emitChanged(key, null); return true; } catch(e){ return false; }
    }

    getJSON(key, def = null){
      try {
        const raw = localStorage.getItem(this._key(key));
        if (raw == null) return def;
        try { return JSON.parse(raw); } catch(_) { return def; }
      } catch(_) { return def; }
    }

    setJSON(key, obj){
      try {
        const str = JSON.stringify(obj);
        localStorage.setItem(this._key(key), str);
        this._emitChanged(key, obj);
        return true;
      } catch(e){ return false; }
    }

    atomicSetJSON(key, obj){
      const k = this._key(key);
      const staging = `${k}__staging`;
      try {
        const str = JSON.stringify(obj);
        localStorage.setItem(staging, str);
        localStorage.setItem(k, str);
        localStorage.removeItem(staging);
        this._emitChanged(key, obj);
        return true;
      } catch(e){
        try { localStorage.setItem(k, JSON.stringify(obj)); } catch(_){}
        try { localStorage.removeItem(staging); } catch(_){}
        return false;
      }
    }

    keys(){
      try { return Object.keys(localStorage).filter(k => !this.prefix || k.startsWith(this.prefix + '_')); } catch(_) { return []; }
    }

    sizeBytes(key){
      try {
        const k = this._key(key);
        const v = localStorage.getItem(k);
        return v ? v.length : 0;
      } catch(_) { return 0; }
    }

    _emitChanged(key, value){
      try {
        const ev = new CustomEvent('storage:changed', { detail: { key: this._key(key), rawKey: key, value } });
        document.dispatchEvent(ev);
      } catch(_){}
    }
  }

  // Expor global
  if (!global.storageService) {
    global.storageService = new StorageService('risingstar');
    global.StorageService = StorageService;
  }
})(typeof window !== 'undefined' ? window : this);
