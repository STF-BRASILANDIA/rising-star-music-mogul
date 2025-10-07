/**
 * Rising Star: Music Mogul - Data Manager
 * Sistema de persistência de dados usando IndexedDB com sincronização Firebase
 */

// TEMPORARIAMENTE DESABILITADO: import { FirebaseManager } from './firebase-manager.js';

export class DataManager {
    constructor() {
        console.log('🏗️ Construindo DataManager...');
        this.dbName = 'RisingStarDB';
        this.dbVersion = 1;
        this.db = null;
        this.useLocalStorageFallback = true; // Continuar usando localStorage
        this.firebaseManager = null; // Será ativado quando o usuário quiser sync
        console.log('💾 Usando localStorage + Firebase opcional');
        // Versão do esquema de save local
        this.schemaVersion = 2;
        // Throttle para autosave (em ms)
        this.autosaveThrottleMs = 10000;
        this._lastAutoSaveAt = 0;
        this._autoSaveTimer = null;
        this._latestAutoSaveData = null;
        this.stores = {
            gameData: 'gameData',
            playerData: 'playerData',
            statistics: 'statistics',
            achievements: 'achievements',
            settings: 'settings'
        };

        // Garantir binding de contexto para métodos usados fora do objeto
        this.loadGameData = this.loadGameData.bind(this);
        this.listGameSaves = this.listGameSaves.bind(this);
        this.loadGameDataFromSlot = this.loadGameDataFromSlot.bind(this);
        this.saveGameDataToSlot = this.saveGameDataToSlot.bind(this);
        this.saveGameDataUnified = this.saveGameDataUnified.bind(this);
        this.saveGameData = this.saveGameData.bind(this);
        this.savePlayerData = this.savePlayerData.bind(this);
        this.loadPlayerData = this.loadPlayerData.bind(this);
        this.getSkillState = this.getSkillState.bind(this);
        this.setSkillState = this.setSkillState.bind(this);
        this.trainSkill = this.trainSkill.bind(this);
        this.getEnergyState = this.getEnergyState.bind(this);
        this.setEnergyState = this.setEnergyState.bind(this);
        this.weeklyRollover = this.weeklyRollover.bind(this);
        this.getAllSkills = this.getAllSkills.bind(this);
        this.resetAllSkills = this.resetAllSkills.bind(this);
        this.migrateSaveData = this.migrateSaveData.bind(this);
        this.getProfileSaveId = this.getProfileSaveId.bind(this);
        this.computeChecksum = this.computeChecksum.bind(this);
    }

    /**
     * Inicialização do DataManager.
     * Mantemos o fallback em localStorage ativo por padrão para estabilidade.
     */
    async init() {
        try {
            console.log('🧰 DataManager.init(): usando localStorage (fallback =', this.useLocalStorageFallback, ')');
            // No momento, não abrimos IndexedDB para evitar divergência entre stores
            // Futuro: detectar suporte e abrir DB mantendo compatibilidade
            // Solicitar armazenamento persistente (quando suportado) para reduzir risco de eviction
            try {
                if (navigator.storage && navigator.storage.persist) {
                    const persisted = await navigator.storage.persisted?.();
                    if (!persisted) {
                        const ok = await navigator.storage.persist();
                        console.log('🔒 Storage persist pedido:', ok);
                    } else {
                        console.log('🔒 Storage já persistido');
                    }
                }
            } catch (e) {
                console.warn('Persistência de storage não disponível/negada:', e);
            }
            // Recuperar escritas incompletas (__staging) e limpar metadados órfãos
            try {
                this.recoverIncompleteWrites();
            } catch (recErr) {
                console.warn('⚠️ Recuperação de staging falhou:', recErr);
            }
            return true;
        } catch (error) {
            console.warn('⚠️ DataManager.init() encontrou um problema, mantendo fallback localStorage:', error);
            this.useLocalStorageFallback = true;
            return true;
        }
    }
    
    async saveGame(gameData) {
        try {
            const DEBUG_SAVE = (localStorage.getItem('DEBUG_SAVE') === '1');
            // 🚫 BLOQUEAR SAVE APENAS NO MENU INICIAL
            if (typeof window !== 'undefined' && window.game) {
                const gameState = window.game.gameState || window.game.state;
                // Verificar se estamos no menu principal usando estado e DOM corretos
                const menuEl = (typeof document !== 'undefined') ? document.getElementById('mainMenu') : null;
                const isInMainMenu = (gameState === 'main_menu') || (menuEl && menuEl.style.display !== 'none');
                if (isInMainMenu) {
                    if (DEBUG_SAVE) console.log('🚫 [DEBUG_SAVE] SAVE BLOQUEADO: menu principal (estado:', gameState, ')');
                    return false;
                }
            }
            
            // Determinar o ID do save baseado no perfil atual
            const profileId = this.getProfileSaveId(gameData);
            
            // 🚨 VERIFICAR SE O PERFIL FOI DELETADO PELO USUÁRIO
            const deletedProfilesKey = 'risingstar_deleted_profiles';
            try {
                const deletedProfiles = JSON.parse(localStorage.getItem(deletedProfilesKey) || '[]');
                if (deletedProfiles.includes(profileId)) {
                    console.log(`🚫 BLOQUEADO: Perfil ${profileId} foi deletado pelo usuário - auto-save cancelado`);
                    return false; // Não salvar perfis deletados
                }
            } catch (e) { /* ignore */ }
            
            const saveData = {
                id: profileId,
                profileId: profileId,
                ...gameData,
                timestamp: Date.now(),
                lastSaved: new Date().toISOString(),
                autoSave: true,
                schemaVersion: this.schemaVersion
            };
            
            // Throttle/coalescência de autosave
            const now = Date.now();
            const canSaveNow = (now - this._lastAutoSaveAt) >= this.autosaveThrottleMs;
            if (canSaveNow) {
                await this._commitSaveWithBackup(saveData, DEBUG_SAVE);
                this._lastAutoSaveAt = Date.now();
            } else {
                this._scheduleAutoSave(saveData, DEBUG_SAVE);
            }
            return true;
        } catch (error) {
            console.error('❌ Falha no auto-save:', error);
            throw error;
        }
    }

    _scheduleAutoSave(saveData, DEBUG_SAVE = false) {
        this._latestAutoSaveData = saveData;
        if (this._autoSaveTimer) {
            try { clearTimeout(this._autoSaveTimer); } catch(_) {}
        }
        const delay = Math.min(5000, this.autosaveThrottleMs);
        if (DEBUG_SAVE) console.log(`⏳ [DEBUG_SAVE] Autosave agendado para ${delay}ms`);
        this._autoSaveTimer = setTimeout(async () => {
            try {
                if (this._latestAutoSaveData) {
                    await this._commitSaveWithBackup(this._latestAutoSaveData, DEBUG_SAVE);
                    this._lastAutoSaveAt = Date.now();
                    this._latestAutoSaveData = null;
                }
            } catch (e) {
                console.warn('⚠️ Falha ao executar autosave agendado:', e);
            } finally {
                this._autoSaveTimer = null;
            }
        }, delay);
    }

    async _commitSaveWithBackup(saveData, DEBUG_SAVE = false) {
        const profileId = saveData.profileId || saveData.id;
        // Salvar no slot específico do perfil (sempre sobrescreve)
        if (this.useLocalStorageFallback) {
            await this.localStoragePutAtomic(this.stores.gameData, saveData);
        } else {
            if (DEBUG_SAVE) {
                try { console.log('💾 [DEBUG_SAVE] putData main', `${this.dbName}_${this.stores.gameData}_${saveData.id}`, 'bytes=', JSON.stringify(saveData).length); } catch(_) {}
            }
            await this.putData(this.stores.gameData, saveData);
        }
        
        // Criar backup automático (mantém histórico)
        const backupData = {
            id: `${profileId}_backup_${Date.now()}`,
            originalProfileId: profileId,
            ...saveData,
            timestamp: Date.now(),
            backupCreated: new Date().toISOString(),
            schemaVersion: this.schemaVersion
        };
        
        if (this.useLocalStorageFallback) {
            await this.localStoragePutAtomic(this.stores.gameData, backupData);
        } else {
            if (DEBUG_SAVE) {
                try { console.log('💾 [DEBUG_SAVE] putData backup', `${this.dbName}_${this.stores.gameData}_${backupData.id}`, 'bytes=', JSON.stringify(backupData).length); } catch(_) {}
            }
            await this.putData(this.stores.gameData, backupData);
        }
        
        // Manter apenas os últimos 3 backups por perfil
        await this.cleanupProfileBackups(profileId);
        if (DEBUG_SAVE) console.log(`💾 [DEBUG_SAVE] Auto-save COMMIT para perfil: ${profileId}`);
    }

    /**
     * Determina o ID único do save baseado no perfil do jogador
     */
    getProfileSaveId(gameData) {
        // Se já existe um profileId nos dados, usar ele
        if (gameData.profileId) {
            return gameData.profileId;
        }
        
        // Se existe dados do player, criar ID baseado no perfil
        if (gameData.player) {
            const player = gameData.player;
            const firstName = player.firstName || player.nome || 'Player';
            const lastName = player.lastName || player.sobrenome || '';
            const stageName = player.stageName || player.nomeArtistico || '';
            
            // Criar ID único baseado no nome do personagem
            const profileKey = `${firstName}_${lastName}_${stageName}`.toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            
            return `profile_${profileKey}`;
        }
        
        // Fallback: usar timestamp + random para perfil único
        const uniqueId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return uniqueId;
    }

    /**
     * Limpa backups antigos de um perfil específico (mantém apenas os 3 mais recentes)
     */
    async cleanupProfileBackups(profileId) {
        try {
            const allData = await this.getAllData(this.stores.gameData);
            const profileBackups = allData
                .filter(item => item.id.startsWith(`${profileId}_backup_`))
                .sort((a, b) => b.timestamp - a.timestamp);
            
            // Manter apenas os 3 backups mais recentes
            const backupsToDelete = profileBackups.slice(3);
            
            for (const backup of backupsToDelete) {
                await this.deleteData(this.stores.gameData, backup.id);
                console.log(`🗑️ Backup antigo removido: ${backup.id}`);
            }
        } catch (error) {
            console.error('❌ Erro ao limpar backups:', error);
        }
    }
    
    async loadGame(profileId = null) {
        try {
            let saveData;
            
            if (profileId) {
                // Carregar perfil específico
                saveData = await this.getData(this.stores.gameData, profileId);
            } else {
                // Tentar carregar o save mais recente
                saveData = await this.getLatestSave();
            }
            
            if (saveData) {
                console.log(`📁 Jogo carregado: ${saveData.profileId || 'perfil desconhecido'}`);
                return saveData;
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return null;
        }
    }

    /**
     * Retorna o save mais recente de qualquer perfil
     */
    async getLatestSave() {
        try {
            const allData = await this.getAllData(this.stores.gameData);
            
            // 🚫 FILTRAR PERFIS DELETADOS
            const deletedProfilesKey = 'risingstar_deleted_profiles';
            let deletedProfiles = [];
            try {
                deletedProfiles = JSON.parse(localStorage.getItem(deletedProfilesKey) || '[]');
            } catch (e) { /* ignore */ }
            
            const saves = allData
                .filter(item => {
                    // Filtrar backups
                    if (item.id.includes('_backup_')) return false;
                    
                    // Filtrar perfis que não começam com 'profile_'
                    if (!item.id.startsWith('profile_')) return false;
                    
                    // 🚫 FILTRAR PERFIS DELETADOS
                    if (deletedProfiles.includes(item.id) || deletedProfiles.includes(item.profileId)) {
                        console.log(`🚫 Ignorando save deletado: ${item.id}`);
                        return false;
                    }
                    
                    return true;
                })
                .sort((a, b) => b.timestamp - a.timestamp);
            
            const latestSave = saves.length > 0 ? saves[0] : null;
            
            if (latestSave) {
                console.log(`📁 Save mais recente encontrado: ${latestSave.id}`);
            } else {
                console.log(`📭 Nenhum save válido encontrado`);
            }
            
            return latestSave;
        } catch (error) {
            console.error('❌ Erro ao buscar save mais recente:', error);
            return null;
        }
    }

    /**
     * Lista todos os perfis salvos
     */
    async getAllProfiles() {
        try {
            const allData = await this.getAllData(this.stores.gameData);
            
            // 🚫 FILTRAR PERFIS DELETADOS
            const deletedProfilesKey = 'risingstar_deleted_profiles';
            let deletedProfiles = [];
            try {
                deletedProfiles = JSON.parse(localStorage.getItem(deletedProfilesKey) || '[]');
            } catch (e) { /* ignore */ }
            
            const profiles = allData
                .filter(item => {
                    // Filtrar backups
                    if (item.id.includes('_backup_')) return false;
                    
                    // Filtrar perfis que não começam com 'profile_'
                    if (!item.id.startsWith('profile_')) return false;
                    
                    // 🚫 FILTRAR PERFIS DELETADOS
                    if (deletedProfiles.includes(item.id) || deletedProfiles.includes(item.profileId)) {
                        console.log(`🚫 Ignorando perfil deletado: ${item.id}`);
                        return false;
                    }
                    
                    return true;
                })
                .map(save => ({
                    id: save.profileId || save.id,
                    playerName: this.getPlayerDisplayName(save),
                    lastPlayed: save.lastSaved || new Date(save.timestamp).toISOString(),
                    timestamp: save.timestamp
                }))
                .sort((a, b) => b.timestamp - a.timestamp);
            
            console.log(`📋 Perfis válidos encontrados: ${profiles.length}`);
            return profiles;
        } catch (error) {
            console.error('❌ Erro ao listar perfis:', error);
            return [];
        }
    }

    /**
     * Retorna nome de exibição do jogador
     */
    getPlayerDisplayName(saveData) {
        if (saveData.player) {
            const player = saveData.player;
            const firstName = player.firstName || player.nome || '';
            const lastName = player.lastName || player.sobrenome || '';
            const stageName = player.stageName || player.nomeArtistico || '';
            
            if (stageName) {
                return `${firstName} "${stageName}" ${lastName}`.trim();
            } else {
                return `${firstName} ${lastName}`.trim() || 'Jogador';
            }
        }
        return 'Jogador';
    }
    
    
    async saveStatistic(type, data) {
        try {
            const statData = {
                id: `stat_${type}_${Date.now()}`,
                type: type,
                data: data,
                date: new Date().toISOString(),
                timestamp: Date.now()
            };
            
            await this.putData(this.stores.statistics, statData);
            return true;
        } catch (error) {
            console.error('❌ Failed to save statistic:', error);
            throw error;
        }
    }
    
    async getStatistics(type, days = 30) {
        try {
            const stats = await this.getAllData(this.stores.statistics);
            const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
            
            return stats
                .filter(stat => stat.type === type && stat.timestamp >= cutoffDate)
                .sort((a, b) => a.timestamp - b.timestamp);
        } catch (error) {
            console.error('❌ Failed to get statistics:', error);
            return [];
        }
    }
    
    async unlockAchievement(achievementId, achievementData) {
        try {
            const data = {
                id: achievementId,
                ...achievementData,
                unlocked: true,
                dateUnlocked: new Date().toISOString(),
                timestamp: Date.now()
            };
            
            await this.putData(this.stores.achievements, data);
            console.log(`🏆 Achievement unlocked: ${achievementId}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to unlock achievement:', error);
            throw error;
        }
    }
    
    async getAchievements() {
        try {
            return await this.getAllData(this.stores.achievements);
        } catch (error) {
            console.error('❌ Failed to get achievements:', error);
            return [];
        }
    }
    
    async saveSetting(key, value) {
        try {
            const data = {
                id: key,
                value: value,
                lastUpdated: Date.now()
            };
            
            await this.putData(this.stores.settings, data);
            return true;
        } catch (error) {
            console.error('❌ Failed to save setting:', error);
            throw error;
        }
    }
    
    async getSetting(key, defaultValue = null) {
        try {
            const setting = await this.getData(this.stores.settings, key);
            return setting ? setting.value : defaultValue;
        } catch (error) {
            console.error('❌ Failed to get setting:', error);
            return defaultValue;
        }
    }
    
    async exportData() {
        try {
            const allData = {};
            
            for (const [storeName, storeKey] of Object.entries(this.stores)) {
                allData[storeName] = await this.getAllData(storeKey);
            }
            
            const exportData = {
                version: 1,
                exportDate: new Date().toISOString(),
                data: allData
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rising-star-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📤 Data exported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to export data:', error);
            throw error;
        }
    }
    
    async importData(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.version || !importData.data) {
                throw new Error('Invalid backup file format');
            }
            
            // Clear existing data
            await this.clearAllData();
            
            // Import all data
            for (const [storeName, storeData] of Object.entries(importData.data)) {
                if (this.stores[storeName]) {
                    for (const item of storeData) {
                        await this.putData(this.stores[storeName], item);
                    }
                }
            }
            
            console.log('📥 Data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to import data:', error);
            throw error;
        }
    }
    
    async clearAllData() {
        try {
            for (const storeKey of Object.values(this.stores)) {
                await this.clearStore(storeKey);
            }
            console.log('🗑️ All data cleared');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear data:', error);
            throw error;
        }
    }
    
    async loadStaticData(dataType) {
        try {
            // Retornar dados estáticos básicos sem depender de arquivos externos
            switch (dataType) {
                case 'artists':
                    return this.getDefaultArtists();
                case 'labels':
                    return this.getDefaultLabels();
                default:
                    console.warn(`⚠️ Tipo de dados desconhecido: ${dataType}`);
                    return {};
            }
        } catch (error) {
            console.error(`❌ Failed to load static data ${dataType}:`, error);
            return {};
        }
    }

    getDefaultArtists() {
        return {
            'taylor_swift': { id: 'taylor_swift', name: 'Taylor Swift', primary_genre: 'pop', fame_level: 0.9, fans: 50000000 },
            'drake': { id: 'drake', name: 'Drake', primary_genre: 'hip-hop', fame_level: 0.9, fans: 45000000 },
            'billie_eilish': { id: 'billie_eilish', name: 'Billie Eilish', primary_genre: 'alternative', fame_level: 0.8, fans: 30000000 },
            'the_weeknd': { id: 'the_weeknd', name: 'The Weeknd', primary_genre: 'rnb', fame_level: 0.8, fans: 25000000 },
            'bad_bunny': { id: 'bad_bunny', name: 'Bad Bunny', primary_genre: 'latin', fame_level: 0.9, fans: 40000000 }
        };
    }

    getDefaultLabels() {
        return {
            tier1: {
                'universal': { id: 'universal', name: 'Universal Music Group', tier: 1, prestige: 0.9 },
                'sony': { id: 'sony', name: 'Sony Music Entertainment', tier: 1, prestige: 0.9 },
                'warner': { id: 'warner', name: 'Warner Music Group', tier: 1, prestige: 0.9 }
            },
            tier2: {
                'republic': { id: 'republic', name: 'Republic Records', tier: 2, prestige: 0.8 },
                'interscope': { id: 'interscope', name: 'Interscope Records', tier: 2, prestige: 0.8 },
                'atlantic': { id: 'atlantic', name: 'Atlantic Records', tier: 2, prestige: 0.8 }
            },
            tier3: {
                'roc_nation': { id: 'roc_nation', name: 'Roc Nation', tier: 3, prestige: 0.7 },
                'motown': { id: 'motown', name: 'Motown Records', tier: 3, prestige: 0.7 }
            }
        };
    }
    
    // Low-level database operations
    putData(storeName, data) {
        if (this.useLocalStorageFallback) {
            return this.localStoragePut(storeName, data);
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    getData(storeName, id) {
        if (this.useLocalStorageFallback) {
            return this.localStorageGet(storeName, id);
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // LocalStorage fallback methods
    localStoragePut(storeName, data) {
        try {
            const key = `${this.dbName}_${storeName}_${data.id}`;
            const DEBUG_SAVE = (localStorage.getItem('DEBUG_SAVE') === '1');
            const str = JSON.stringify(data);
            if (DEBUG_SAVE) console.log('💾 [DEBUG_SAVE] localStorage.setItem', key, 'bytes=', str.length);
            // Escrita atômica crua com meta
            this.localStoragePutRawAtomic(key, str, { storeName, id: data.id, schemaVersion: data.schemaVersion || this.schemaVersion });
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Escrita atômica no localStorage para stores indexados
    async localStoragePutAtomic(storeName, data) {
        const key = `${this.dbName}_${storeName}_${data.id}`;
        const str = JSON.stringify(data);
        this.localStoragePutRawAtomic(key, str, { storeName, id: data.id, schemaVersion: data.schemaVersion || this.schemaVersion });
    }

    // Escrita atômica crua com checksum e metadados
    localStoragePutRawAtomic(key, str, extraMeta = {}) {
        const stagingKey = `${key}__staging`;
        const metaKey = `${key}__meta`;
        const DEBUG_SAVE = (localStorage.getItem('DEBUG_SAVE') === '1');
        const checksum = this.computeChecksum(str);
        const meta = {
            checksum,
            bytes: str.length,
            lastSaved: Date.now(),
            ...extraMeta
        };
        try {
            if (DEBUG_SAVE) console.log('💾 [DEBUG_SAVE] ATOMIC write start', key, 'bytes=', str.length, 'checksum=', checksum);
            this.addToJournal('write_start', { key, bytes: str.length });
            localStorage.setItem(stagingKey, str);
            localStorage.setItem(key, str);
            localStorage.setItem(metaKey, JSON.stringify(meta));
            localStorage.removeItem(stagingKey);
            this.addToJournal('write_commit', { key, bytes: str.length });
            if (DEBUG_SAVE) console.log('✅ [DEBUG_SAVE] ATOMIC write ok', key);
        } catch (e) {
            console.warn('⚠️ Falha na escrita atômica, tentando fallback direto:', e);
            try { localStorage.setItem(key, str); } catch(_) {}
            try { localStorage.setItem(metaKey, JSON.stringify(meta)); } catch(_) {}
            try { localStorage.removeItem(stagingKey); } catch(_) {}
            this.addToJournal('write_fallback', { key });
        }
    }

    localStorageGet(storeName, id) {
        try {
            const key = `${this.dbName}_${storeName}_${id}`;
            const metaKey = `${key}__meta`;
            const dataStr = localStorage.getItem(key);
            if (!dataStr) return Promise.resolve(null);
            // Validar checksum quando disponível
            try {
                const meta = JSON.parse(localStorage.getItem(metaKey) || 'null');
                if (meta && meta.checksum) {
                    const sum = this.computeChecksum(dataStr);
                    if (sum !== meta.checksum) {
                        console.warn('⚠️ Checksum inválido para', key, 'esperado=', meta.checksum, 'obtido=', sum);
                        this.addToJournal('checksum_mismatch', { key });
                    }
                }
            } catch (_) { /* ignore meta parse */ }
            const parsed = JSON.parse(dataStr);
            return Promise.resolve(this.migrateSaveData(parsed));
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Retorna todos os itens de um store (com fallback para localStorage)
    getAllData(storeName) {
        if (this.useLocalStorageFallback) {
            return this.localStorageGetAllData(storeName);
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Lista todos os registros de um store a partir do localStorage
    localStorageGetAllData(storeName) {
        try {
            const prefix = `${this.dbName}_${storeName}_`;
            const results = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    if (key.endsWith('__staging') || key.endsWith('__meta')) continue;
                    try {
                        const str = localStorage.getItem(key);
                        if (!str) continue;
                        // Validar checksum
                        try {
                            const meta = JSON.parse(localStorage.getItem(`${key}__meta`) || 'null');
                            if (meta && meta.checksum) {
                                const sum = this.computeChecksum(str);
                                if (sum !== meta.checksum) {
                                    console.warn('⚠️ Registro com checksum inválido ignorado:', key);
                                    this.addToJournal('checksum_mismatch_skip', { key });
                                    continue;
                                }
                            }
                        } catch (_) { /* ignore meta parse */ }
                        const parsed = JSON.parse(str);
                        if (parsed) results.push(this.migrateSaveData(parsed));
                    } catch (e) {
                        console.warn('⚠️ Registro corrompido ignorado:', key);
                    }
                }
            }
            return Promise.resolve(results);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    
    deleteData(storeName, id) {
        if (this.useLocalStorageFallback) {
            try {
                const key = `${this.dbName}_${storeName}_${id}`;
                localStorage.removeItem(key);
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    clearStore(storeName) {
        if (this.useLocalStorageFallback) {
            try {
                const prefix = `${this.dbName}_${storeName}_`;
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(prefix)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async cleanupBackups() {
        try {
            const allSaves = await this.getAllData(this.stores.gameData);
            const backups = allSaves
                .filter(save => save.id.startsWith('backup_'))
                .sort((a, b) => b.timestamp - a.timestamp);
            
            // Keep only the 5 most recent backups
            if (backups.length > 5) {
                const toDelete = backups.slice(5);
                for (const backup of toDelete) {
                    await this.deleteData(this.stores.gameData, backup.id);
                }
                console.log(`🗑️ Cleaned up ${toDelete.length} old backups`);
            }
        } catch (error) {
            console.error('❌ Failed to cleanup backups:', error);
        }
    }
    
    // Utility methods
    async getDatabaseSize() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return {
                    used: estimate.usage,
                    quota: estimate.quota,
                    percentage: (estimate.usage / estimate.quota) * 100
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to get database size:', error);
            return null;
        }
    }
    
    async getBackupList() {
        try {
            const allSaves = await this.getAllData(this.stores.gameData);
            return allSaves
                .filter(save => save.id.startsWith('backup_'))
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(backup => ({
                    id: backup.id,
                    timestamp: backup.timestamp,
                    date: new Date(backup.timestamp).toLocaleString(),
                    version: backup.version
                }));
        } catch (error) {
            console.error('❌ Failed to get backup list:', error);
            return [];
        }
    }
    
    async restoreFromBackup(backupId) {
        try {
            const backup = await this.getData(this.stores.gameData, backupId);
            if (!backup) {
                throw new Error('Backup not found');
            }
            
            // Save as current save
            const currentSave = {
                ...backup,
                id: 'current_save'
            };
            
            await this.putData(this.stores.gameData, currentSave);
            console.log(`📁 Restored from backup: ${backupId}`);
            return backup;
        } catch (error) {
            console.error('❌ Failed to restore from backup:', error);
            throw error;
        }
    }
    
    // Auto-save functionality
    setupAutoSave(gameInstance, intervalMinutes = 5) {
        this.autoSaveInterval = setInterval(async () => {
            try {
                if (gameInstance.isPlaying()) {
                    await gameInstance.saveGame();
                    console.log('💾 Auto-save completed');
                }
            } catch (error) {
                console.error('❌ Auto-save failed:', error);
            }
        }, intervalMinutes * 60 * 1000);
        
        console.log(`⏰ Auto-save enabled (every ${intervalMinutes} minutes)`);
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏰ Auto-save disabled');
        }
    }
    
    // Save Game Management
    async getSavedGames() {
        try {
            console.log('📁 Carregando saves...');
            let localSaves = [];

            if (this.useLocalStorageFallback) {
                console.log('📁 Usando localStorage...');
                // 1) Saves explícitos (saveGameWithMetadata) -> risingstar_save_*
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('risingstar_save_')) {
                        try {
                            const saveData = JSON.parse(localStorage.getItem(key));
                            localSaves.push({
                                id: key.replace('risingstar_save_', ''),
                                isLocal: true,
                                ...saveData.metadata
                            });
                        } catch (error) {
                            console.warn('Save corrompido encontrado:', key);
                        }
                    }
                }

                // 2) Perfis persistidos via saveGame (store gameData) -> RisingStarDB_gameData_*
                const prefix = `${this.dbName}_${this.stores.gameData}_`;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(prefix)) {
                        try {
                            const save = JSON.parse(localStorage.getItem(key));
                            if (!save) continue;
                            // Ignorar backups
                            if (String(save.id).includes('_backup_')) continue;
                            // Aceitar perfil válido
                            if (save.profileId || String(save.id).startsWith('profile_')) {
                                localSaves.push({
                                    id: save.profileId || save.id,
                                    isLocal: true,
                                    playerName: this.getPlayerDisplayName(save),
                                    level: save.player?.level || 1,
                                    money: save.player?.money || 0,
                                    lastPlayed: save.lastSaved || new Date(save.timestamp).toISOString()
                                });
                            }
                        } catch (error) {
                            console.warn('Registro gameData corrompido encontrado:', key);
                        }
                    }
                }
            } else {
                // IndexedDB: store 'saves'
                const transaction = this.db.transaction(['saves'], 'readonly');
                const store = transaction.objectStore('saves');
                const request = store.getAll();
                
                localSaves = await new Promise((resolve, reject) => {
                    request.onsuccess = () => {
                        const saves = request.result.map(save => ({
                            id: save.id,
                            isLocal: true,
                            ...save.metadata
                        }));
                        resolve(saves);
                    };
                    request.onerror = () => reject(request.error);
                });
            }

            // Ordenar por mais recentes
            localSaves = localSaves.sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
            return localSaves;

        } catch (error) {
            console.error('Erro ao carregar saves:', error);
            return [];
        }
    }
    
    async deleteSave(saveId) {
        try {
            console.log(`🗑️ Deletando save: ${saveId}`);
            
            if (this.useLocalStorageFallback) {
                // 🎯 LISTA COMPLETA DE KEYS PARA REMOVER
                const keysToRemove = [];
                
                // 1. Save explícito (risingstar_save_*)
                keysToRemove.push(`risingstar_save_${saveId}`);
                
                // 2. Perfil direto (RisingStarDB_gameData_saveId)
                keysToRemove.push(`${this.dbName}_${this.stores.gameData}_${saveId}`);
                
                // 3. Perfil com prefixo profile_ (RisingStarDB_gameData_profile_*)
                if (!saveId.startsWith('profile_')) {
                    keysToRemove.push(`${this.dbName}_${this.stores.gameData}_profile_${saveId}`);
                }
                
                // 4. Buscar TODOS os perfis relacionados (pode haver variações)
                const gameDataPrefix = `${this.dbName}_${this.stores.gameData}_`;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(gameDataPrefix)) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key));
                            // Verificar se o perfil corresponde ao saveId
                            if (data && (
                                data.id === saveId || 
                                data.profileId === saveId || 
                                data.id === `profile_${saveId}` ||
                                data.profileId === `profile_${saveId}` ||
                                key.includes(saveId)
                            )) {
                                keysToRemove.push(key);
                            }
                        } catch (_) { /* ignorar dados corrompidos */ }
                    }
                }
                
                // 5. Buscar TODOS os backups relacionados
                const backupPatterns = [
                    `${this.dbName}_${this.stores.gameData}_${saveId}_backup_`,
                    `${this.dbName}_${this.stores.gameData}_profile_${saveId}_backup_`
                ];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        for (const pattern of backupPatterns) {
                            if (key.startsWith(pattern)) {
                                keysToRemove.push(key);
                                break;
                            }
                        }
                    }
                }
                
                // 6. REMOVER TODAS AS KEYS ENCONTRADAS
                const uniqueKeys = [...new Set(keysToRemove)]; // remover duplicatas
                let removedCount = 0;
                
                uniqueKeys.forEach(key => {
                    if (localStorage.getItem(key) !== null) {
                        localStorage.removeItem(key);
                        console.log(`🗑️ Removido: ${key}`);
                        removedCount++;
                    }
                });

                // 🚨 CRÍTICO: MARCAR PERFIL COMO DELETADO PARA IMPEDIR AUTO-SAVE
                const deletedProfilesKey = 'risingstar_deleted_profiles';
                try {
                    const deletedProfiles = JSON.parse(localStorage.getItem(deletedProfilesKey) || '[]');
                    if (!deletedProfiles.includes(saveId)) {
                        deletedProfiles.push(saveId);
                        localStorage.setItem(deletedProfilesKey, JSON.stringify(deletedProfiles));
                        console.log(`🚫 Perfil ${saveId} marcado como DELETADO - auto-save será bloqueado`);
                    }
                } catch (e) {
                    localStorage.setItem(deletedProfilesKey, JSON.stringify([saveId]));
                }

                console.log(`✅ Save ${saveId} COMPLETAMENTE deletado: ${removedCount} keys removidas`);
                console.log(`🔍 Keys removidas:`, uniqueKeys);
                return true;
            } else {
                // IndexedDB - remover save principal
                const saveTransaction = this.db.transaction(['saves'], 'readwrite');
                const saveStore = saveTransaction.objectStore('saves');
                await new Promise((resolve, reject) => {
                    const request = saveStore.delete(saveId);
                    request.onsuccess = () => resolve(true);
                    request.onerror = () => reject(request.error);
                });

                // IndexedDB - remover do gameData store também
                try {
                    const gameDataTransaction = this.db.transaction(['gameData'], 'readwrite');
                    const gameDataStore = gameDataTransaction.objectStore('gameData');
                    
                    // Remover perfil principal
                    await new Promise((resolve, reject) => {
                        const request = gameDataStore.delete(saveId);
                        request.onsuccess = () => resolve();
                        request.onerror = () => resolve(); // Ignorar se não existir
                    });

                    // Buscar e remover todos os backups relacionados
                    const allData = await this.getAllData(this.stores.gameData);
                    const backupPromises = [];
                    
                    for (const item of allData) {
                        if (item.id && item.id.startsWith(`${saveId}_backup_`)) {
                            console.log(`🗑️ Removendo backup: ${item.id}`);
                            const deletePromise = new Promise((resolve) => {
                                const request = gameDataStore.delete(item.id);
                                request.onsuccess = () => resolve();
                                request.onerror = () => resolve(); // Ignorar erros de backup
                            });
                            backupPromises.push(deletePromise);
                        }
                    }

                    await Promise.all(backupPromises);
                    console.log(`✅ Save ${saveId} e ${backupPromises.length} backups deletados do IndexedDB`);
                } catch (e) {
                    console.warn('⚠️ Erro ao remover backups do IndexedDB:', e);
                }

                return true;
            }
        } catch (error) {
            console.error('Erro ao deletar save:', error);
            throw error;
        }
    }
    
    /**
     * 🧹 LIMPEZA COMPLETA - Remove TODOS os dados relacionados ao jogo
     */
    async clearAllGameData() {
        try {
            console.log('🧹 LIMPEZA COMPLETA iniciada...');
            
            const keysToRemove = [];
            const patterns = [
                'risingstar_',
                'RisingStarDB_',
                'playerAvatarImage',
                'gameState',
                'playerData'
            ];
            
            // Buscar TODAS as keys relacionadas ao jogo
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    for (const pattern of patterns) {
                        if (key.startsWith(pattern) || key.includes(pattern)) {
                            keysToRemove.push(key);
                            break;
                        }
                    }
                }
            }
            
            // Remover todas as keys encontradas
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Removido: ${key}`);
            });
            
            console.log(`✅ LIMPEZA COMPLETA concluída: ${keysToRemove.length} keys removidas`);
            return { removed: keysToRemove.length, keys: keysToRemove };
            
        } catch (error) {
            console.error('❌ Erro na limpeza completa:', error);
            throw error;
        }
    }
    
    /**
     * 🔍 DEBUG - Lista TODAS as keys do localStorage relacionadas ao jogo
     */
    debugListAllGameKeys() {
        const patterns = [
            'risingstar_',
            'RisingStarDB_',
            'playerAvatarImage',
            'gameState',
            'playerData'
        ];
        
        const foundKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                for (const pattern of patterns) {
                    if (key.startsWith(pattern) || key.includes(pattern)) {
                        foundKeys.push(key);
                        break;
                    }
                }
            }
        }
        
        console.log(`🔍 DEBUG: Encontradas ${foundKeys.length} keys do jogo:`);
        foundKeys.forEach(key => {
            console.log(`  - ${key}`);
        });
        
        return foundKeys;
    }
    
    /**
     * 🚫 Verifica se um perfil foi marcado como deletado
     */
    isProfileDeleted(profileId) {
        try {
            const deletedProfilesKey = 'risingstar_deleted_profiles';
            const deletedProfiles = JSON.parse(localStorage.getItem(deletedProfilesKey) || '[]');
            return deletedProfiles.includes(profileId);
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 🧹 Remove marca de deleção de um perfil (para quando recriar)
     */
    unmarkProfileAsDeleted(profileId) {
        try {
            const deletedProfilesKey = 'risingstar_deleted_profiles';
            const deletedProfiles = JSON.parse(localStorage.getItem(deletedProfilesKey) || '[]');
            const filtered = deletedProfiles.filter(id => id !== profileId);
            localStorage.setItem(deletedProfilesKey, JSON.stringify(filtered));
            console.log(`✅ Perfil ${profileId} removido da lista de deletados`);
        } catch (e) {
            console.warn('Erro ao remover marca de deleção:', e);
        }
    }
    
    async saveGameWithMetadata(gameData, metadata) {
        try {
            const saveData = {
                id: metadata.id || `save_${Date.now()}`,
                gameData: gameData,
                metadata: {
                    playerName: metadata.playerName || 'Artista Desconhecido',
                    level: metadata.level || 1,
                    genre: metadata.genre || 'Pop',
                    money: metadata.money || 0,
                    fans: metadata.fans || 0,
                    lastPlayed: new Date().toISOString(),
                    version: '1.0.0'
                }
            };
            
            // Save locally first
            if (this.useLocalStorageFallback) {
                localStorage.setItem(`risingstar_save_${saveData.id}`, JSON.stringify(saveData));
            } else {
                const transaction = this.db.transaction(['saves'], 'readwrite');
                const store = transaction.objectStore('saves');
                await new Promise((resolve, reject) => {
                    const request = store.put(saveData, saveData.id);
                    request.onsuccess = () => resolve(saveData.id);
                    request.onerror = () => reject(request.error);
                });
            }
            
            // Sync to cloud if available
            if (this.firebaseManager && this.firebaseManager.isAvailable()) {
                try {
                    await this.firebaseManager.saveGameToCloud(
                        saveData.id, 
                        saveData.gameData, 
                        saveData.metadata
                    );
                    console.log('☁️ Save sincronizado com Firebase');
                } catch (error) {
                    console.warn('⚠️ Falha na sincronização, dados salvos localmente:', error);
                }
            }
            
            return saveData.id;
            
        } catch (error) {
            console.error('Erro ao salvar jogo:', error);
            throw error;
        }
    }
    
    async loadSpecificSave(saveId) {
        try {
            if (this.useLocalStorageFallback) {
                const saveData = localStorage.getItem(`risingstar_save_${saveId}`);
                return saveData ? JSON.parse(saveData) : null;
            } else {
                const transaction = this.db.transaction(['saves'], 'readonly');
                const store = transaction.objectStore('saves');
                const request = store.get(saveId);
                
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result || null);
                    request.onerror = () => reject(request.error);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar save específico:', error);
            return null;
        }
    }
    
    // Firebase Sync Methods
    async syncAllData() {
        if (!this.firebaseManager || !this.firebaseManager.isAvailable()) {
            console.log('⚠️ Firebase não disponível para sincronização');
            return { success: false, message: 'Firebase offline' };
        }
        
        try {
            // Get all local saves
            const localSaves = await this.getAllLocalSaves();
            
            // Sync with Firebase
            const syncResult = await this.firebaseManager.syncAllSaves(localSaves);
            
            console.log(`☁️ Sincronização concluída: ${syncResult.synced} saves`);
            
            if (syncResult.conflicts.length > 0) {
                console.warn(`⚠️ ${syncResult.conflicts.length} conflitos encontrados`);
                return {
                    success: true,
                    synced: syncResult.synced,
                    conflicts: syncResult.conflicts
                };
            }
            
            return {
                success: true,
                synced: syncResult.synced,
                conflicts: []
            };
            
        } catch (error) {
            console.error('❌ Erro durante sincronização:', error);
            return { success: false, message: error.message };
        }
    }
    
    async getAllLocalSaves() {
        const saves = [];
        
        if (this.useLocalStorageFallback) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('risingstar_save_')) {
                    try {
                        const saveData = JSON.parse(localStorage.getItem(key));
                        saves.push(saveData);
                    } catch (error) {
                        console.warn('Save corrompido:', key);
                    }
                }
            }
        } else {
            const transaction = this.db.transaction(['saves'], 'readonly');
            const store = transaction.objectStore('saves');
            const request = store.getAll();
            
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve([]);
            });
        }
        
        return saves;
    }
    
    async downloadCloudSave(saveId) {
        try {
            if (!this.firebaseManager) {
                throw new Error('Firebase não disponível');
            }
            const cloudData = await this.firebaseManager.loadGameFromCloud(saveId);
            if (!cloudData) {
                throw new Error('Save não encontrado na nuvem');
            }
            
            // Save locally
            if (this.useLocalStorageFallback) {
                localStorage.setItem(`risingstar_save_${saveId}`, JSON.stringify(cloudData));
            } else {
                const transaction = this.db.transaction(['saves'], 'readwrite');
                const store = transaction.objectStore('saves');
                await new Promise((resolve, reject) => {
                    const request = store.put(cloudData, saveId);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
            
            console.log('📥 Save baixado da nuvem:', saveId);
            return cloudData;
            
        } catch (error) {
            console.error('❌ Erro ao baixar save da nuvem:', error);
            throw error;
        }
    }
    
    getFirebaseStatus() {
        return this.firebaseManager ? this.firebaseManager.getStatus() : { 
            connected: false, 
            authenticated: false, 
            error: 'Firebase desabilitado' 
        };
    }

    // Auto-save functionality
    startAutoSave(intervalMinutes = 5) {
        console.log(`🔄 Auto-save iniciado (${intervalMinutes} minutos)`);
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(async () => {
            try {
                console.log('💾 Auto-save executando...');
                // Auto-save será implementado quando tivermos o sistema de jogo rodando
            } catch (error) {
                console.warn('Erro no auto-save:', error);
            }
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('🛑 Auto-save parado');
        }
    }

    // ========================================
    // 💾 FUNÇÕES BÁSICAS DE SAVE/LOAD
    // ========================================

    /**
     * 🔄 UNIFIED SAVE LOADER: Carrega dados de TODAS as fontes e consolida
     */
    loadGameData() {
        try {
            // 🎯 PRIORIDADE 1: Dados monolíticos (mais recente)
            const monolithicData = localStorage.getItem('risingstar_gamedata');
            let gameData = monolithicData ? JSON.parse(monolithicData) : {};

            console.log('📖 Monolithic data carregado:', Object.keys(gameData));

            // 🎯 PRIORIDADE 2: Verificar se profile stores têm dados mais recentes
            const profileStores = this.listGameSaves();
            if (profileStores.length > 0) {
                // Encontrar o save mais recente dos profile stores
                const latestProfile = profileStores.reduce((latest, current) => {
                    return (current.lastModified > latest.lastModified) ? current : latest;
                });

                try {
                    const profileData = this.loadGameDataFromSlot(latestProfile.id);
                    const profileTime = new Date(latestProfile.lastModified).getTime();
                    const monolithicTime = gameData.lastSaved ? new Date(gameData.lastSaved).getTime() : 0;

                    if (profileTime > monolithicTime) {
                        console.log(`🔄 Profile store mais recente detectado: ${latestProfile.id} (${latestProfile.lastModified})`);
                        gameData = { ...profileData, lastSaved: latestProfile.lastModified };
                    }
                } catch (profileErr) {
                    console.warn('⚠️ Erro ao carregar profile store:', profileErr);
                }
            }

            // Se há algum dado carregado, consolidar com o estado do engine e retornar
            gameData = this.migrateSaveData(gameData || {});
            const hasAnyData = gameData && Object.keys(gameData).length > 0;
            if (hasAnyData) {
                console.log('📖 Dados carregados do localStorage:', Object.keys(gameData));
                // Injetar fallback do estado atual do jogo (se existir)
                try {
                    const enginePlayer = (typeof window !== 'undefined' && window.game && window.game.gameData && window.game.gameData.player) ? window.game.gameData.player : null;
                    if (enginePlayer) {
                        if (!gameData.player) gameData.player = {};
                        // Preservar dinheiro/energia do save, mas se faltarem, puxar do engine
                        if (typeof gameData.player.money !== 'number' && typeof enginePlayer.money === 'number') {
                            gameData.player.money = enginePlayer.money;
                        }
                        if (typeof gameData.player.energy !== 'number' && typeof enginePlayer.energy === 'number') {
                            gameData.player.energy = enginePlayer.energy;
                        }
                        // Skills: se não houver bloco skills no save, usa do engine
                        if (!gameData.skills && enginePlayer.skills) {
                            gameData.skills = { ...enginePlayer.skills };
                        }
                        // Energia: estruturar bloco energy se não existir
                        if (!gameData.energy && typeof enginePlayer.energy === 'number') {
                            gameData.energy = { current: enginePlayer.energy, max: DataManager.SkillBalance.energy.maxDefault };
                        }
                    }
                } catch (e) { /* noop */ }

                console.log('📖 Dados finais consolidados:', Object.keys(gameData));
                return gameData;
            }

            // Caso não haja nenhum dado salvo, criar base padrão
            console.log('📖 Nenhum dado salvo encontrado, retornando dados vazios');
            const base = {};
            try {
                const enginePlayer = (typeof window !== 'undefined' && window.game && window.game.gameData && window.game.gameData.player) ? window.game.gameData.player : null;
                if (enginePlayer) {
                    base.player = { ...enginePlayer };
                    base.skills = { ...(enginePlayer.skills || {}) };
                    // GARANTIR que energia sempre comece cheia para novos jogos
                    base.energy = {
                        current: DataManager.SkillBalance.energy.maxDefault,
                        max: DataManager.SkillBalance.energy.maxDefault
                    };
                } else {
                    // Fallback para quando não há engine player
                    base.energy = {
                        current: DataManager.SkillBalance.energy.maxDefault,
                        max: DataManager.SkillBalance.energy.maxDefault
                    };
                }
            } catch (_) {
                // Garantir energia padrão mesmo em caso de erro
                base.energy = {
                    current: DataManager.SkillBalance.energy.maxDefault,
                    max: DataManager.SkillBalance.energy.maxDefault
                };
            }
            return base;
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            return {};
        }
    }

    /**
     * Lista saves de perfil armazenados no store gameData (somente localStorage no momento)
     * Retorna [{ id, lastModified, timestamp }]
     */
    listGameSaves() {
        try {
            const prefix = `${this.dbName}_${this.stores.gameData}_`;
            const items = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key || !key.startsWith(prefix)) continue;
                if (key.endsWith('__meta') || key.endsWith('__staging')) continue;
                try {
                    const raw = localStorage.getItem(key);
                    if (!raw) continue;
                    const data = JSON.parse(raw);
                    if (!data || typeof data !== 'object') continue;
                    const id = data.profileId || data.id;
                    if (!id || typeof id !== 'string') continue;
                    if (id.includes('_backup_')) continue; // ignorar backups
                    if (!id.startsWith('profile_')) continue; // somente perfis
                    const lastModified = data.lastSaved || new Date(data.timestamp || 0).toISOString();
                    items.push({ id, lastModified, timestamp: data.timestamp || 0 });
                } catch (_) { /* ignore */ }
            }
            return items;
        } catch (_) {
            return [];
        }
    }

    /**
     * Carrega dados do jogo de um slot de perfil específico (sincrono via localStorage)
     */
    loadGameDataFromSlot(profileId) {
        try {
            const key = `${this.dbName}_${this.stores.gameData}_${profileId}`;
            const str = localStorage.getItem(key);
            if (!str) return {};
            const data = JSON.parse(str);
            return this.migrateSaveData(data || {});
        } catch (_) {
            return {};
        }
    }

    /**
     * Salva dados do jogo em um slot de perfil específico (sincrono via localStorage)
     */
    saveGameDataToSlot(profileId, gameData) {
        try {
            const payload = {
                id: profileId,
                profileId,
                ...gameData,
                timestamp: Date.now(),
                lastSaved: new Date().toISOString(),
                schemaVersion: this.schemaVersion
            };
            const key = `${this.dbName}_${this.stores.gameData}_${profileId}`;
            this.localStoragePutRawAtomic(key, JSON.stringify(payload), { storeName: this.stores.gameData, id: profileId, schemaVersion: this.schemaVersion });
            return true;
        } catch (e) {
            try { localStorage.setItem(`${this.dbName}_${this.stores.gameData}_${profileId}`, JSON.stringify(gameData)); } catch(_) {}
            return false;
        }
    }

    /**
     * 🔄 UNIFIED SAVE WRITER: Salva em AMBOS os sistemas (profile + monolithic) para compatibilidade
     */
    saveGameDataUnified(gameData) {
        try {
            // Adicionar timestamp
            gameData.lastSaved = new Date().toISOString();
            gameData.schemaVersion = this.schemaVersion;
            
            console.log('💾 UNIFIED SAVE: Salvando em ambos os sistemas...');
            
            // 1) Salvar no sistema monolítico (risingstar_gamedata)
            try {
                this.localStoragePutRawAtomic('risingstar_gamedata', JSON.stringify(gameData), { schemaVersion: this.schemaVersion });
            } catch (e) {
                localStorage.setItem('risingstar_gamedata', JSON.stringify(gameData));
            }
            
            // 2) Salvar no sistema de profile stores se houver perfil ativo
            if (gameData.player?.name) {
                const profileId = `profile_${gameData.player.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                this.saveGameDataToSlot(profileId, gameData);
                console.log(`💾 UNIFIED SAVE: Dados salvos em ambos os sistemas (monolithic + profile:${profileId})`);
            } else {
                console.log('💾 UNIFIED SAVE: Dados salvos apenas no sistema monolítico (sem nome de player)');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro no UNIFIED SAVE:', error);
            return false;
        }
    }

    /**
     * Salva os dados do jogo (usando localStorage como fallback)
     */
    saveGameData(gameData) {
        try {
            // 🚫 BLOQUEAR SAVE APENAS NO MENU INICIAL
            if (typeof window !== 'undefined' && window.game) {
                const gameState = window.game.gameState || window.game.state;
                const menuEl = (typeof document !== 'undefined') ? document.getElementById('mainMenu') : null;
                const isInMainMenu = (gameState === 'main_menu') || (menuEl && menuEl.style.display !== 'none');
                if (isInMainMenu) {
                    console.log('🚫 saveGameData BLOQUEADO: Estamos no menu principal (estado:', gameState, ')');
                    return false;
                }
            }
            
            // Garantir que a data atual do jogo esteja presente no save
            try {
                if (typeof window !== 'undefined' && window.game) {
                    const engineDate = (window.game.getCurrentDate && window.game.getCurrentDate()) || window.game.currentDate || null;
                    if (engineDate) {
                        gameData.currentDate = new Date(engineDate).toISOString();
                    }
                }
            } catch (_) { /* ignore */ }
            // Escrita atômica com meta/checksum
            try {
                const str = JSON.stringify({ ...gameData, schemaVersion: this.schemaVersion });
                this.localStoragePutRawAtomic('risingstar_gamedata', str, { schemaVersion: this.schemaVersion });
            } catch (e) {
                console.warn('⚠️ Falha na escrita atômica de risingstar_gamedata, fallback simples:', e);
                try { localStorage.setItem('risingstar_gamedata', JSON.stringify(gameData)); } catch(_) {}
                try { localStorage.removeItem('risingstar_gamedata__staging'); } catch(_) {}
            }
            console.log('💾 Dados salvos no localStorage:', Object.keys(gameData));
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            return false;
        }
    }

    /**
     * Salva os dados completos do player
     */
    savePlayerData(playerData) {
        try {
            // 🚫 BLOQUEAR SAVE APENAS NO MENU INICIAL
            if (typeof window !== 'undefined' && window.game) {
                const gameState = window.game.gameState || window.game.state;
                const menuEl = (typeof document !== 'undefined') ? document.getElementById('mainMenu') : null;
                const isInMainMenu = (gameState === 'main_menu') || (menuEl && menuEl.style.display !== 'none');
                if (isInMainMenu) {
                    console.log('🚫 savePlayerData BLOQUEADO: Estamos no menu principal (estado:', gameState, ')');
                    return false;
                }
            }
            
            const gameData = this.loadGameData();
            gameData.player = playerData;
            gameData.lastUpdated = Date.now();
            
            this.saveGameData(gameData);
            console.log('👤 Dados do player salvos:', playerData.firstName || playerData.artistName);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar dados do player:', error);
            return false;
        }
    }

    /**
     * Carrega os dados do player
     */
    loadPlayerData() {
        try {
            const gameData = this.loadGameData();
            if (gameData.player) {
                console.log('👤 Dados do player carregados:', gameData.player.firstName || gameData.player.artistName);
                return gameData.player;
            } else {
                console.log('👤 Nenhum dado de player encontrado');
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados do player:', error);
            return null;
        }
    }

    // ========================================
    // 🎵 SISTEMA DE SKILLS E PROGRESSÃO
    // ========================================

    // Configuração das Skills (0-100 com custos escaláveis)
    static SkillBalance = {
        // Configurações base
        maxLevel: 100,
        minLevel: 0,
        
        // Custos de treinamento (escalam com o nível)
        training: {
            baseCost: 500,         // Custo base em dinheiro
            costMultiplier: 1.2,   // Multiplicador por nível
            // Energia: sistema customizado (currentLevel + 1)
        },

        // Sistema de energia
        energy: {
            maxDefault: 100,
            regenerationRate: 0.7, // 70% da energia máxima por semana
            weeklyRollover: true    // Energia regenera semanalmente
        }
    };

    // Array das skills disponíveis (TODAS - artísticas + negócio)
    static SKILL_KEYS = [
        // HABILIDADES ARTÍSTICAS (aparecem na criação de personagem)
        'vocals',
        'songWriting', 
        'rhythm',
        'livePerformance',
        'production',
        'charisma',
        'virality',
        'videoDirecting',
        // HABILIDADES DE NEGÓCIO (só aparecem no jogo, começam em 0)
        'marketing',
        'business',
        'networking',
        'management'
    ];

    /**
     * Calcula o custo em dinheiro para treinar uma skill
     */
    trainingMoneyCost(currentLevel) {
        const { baseCost, costMultiplier } = DataManager.SkillBalance.training;
        return Math.floor(baseCost * Math.pow(costMultiplier, Math.floor(currentLevel / 10)));
    }

    /**
     * Calcula o custo em energia para treinar uma skill
     * Sistema simplificado: Base 2 energia + nível atual
     * Exemplo: nível 1 = 2, nível 10 = 11, nível 50 = 51
     */
    trainingEnergyCost(currentLevel) {
        return currentLevel + 1;
    }

    /**
     * Obtém o estado atual de uma skill
     */
    getSkillState(skillKey) {
        try {
            const gameData = this.loadGameData();
            if (!gameData.skills) {
                gameData.skills = {};
            }
            
            // Fallback: pegar do player no engine se existir
            let level = gameData.skills[skillKey];
            if (typeof level !== 'number') {
                try {
                    const enginePlayer = (typeof window !== 'undefined' && window.game && window.game.gameData && window.game.gameData.player) ? window.game.gameData.player : null;
                    if (enginePlayer && enginePlayer.skills && typeof enginePlayer.skills[skillKey] === 'number') {
                        level = enginePlayer.skills[skillKey];
                        gameData.skills[skillKey] = level;
                        this.saveGameData(gameData);
                    } else {
                        level = 0;
                    }
                } catch (_) {
                    level = 0;
                }
            }
            console.log(`📖 DataManager.getSkillState(${skillKey}) = ${level}`);
            
            return {
                level: level,
                maxLevel: DataManager.SkillBalance.maxLevel
            };
        } catch (error) {
            console.error('Erro ao obter estado da skill:', error);
            return { level: 0, maxLevel: 100 };
        }
    }

    /**
     * Define o estado de uma skill
     */
    setSkillState(skillKey, level) {
        try {
            console.log(`💾 DataManager.setSkillState(${skillKey}, ${level})`);
            const gameData = this.loadGameData();
            if (!gameData.skills) {
                gameData.skills = {};
                console.log('🔄 Inicializando gameData.skills = {}');
            }
            
            // Validar limites
            level = Math.max(0, Math.min(level, DataManager.SkillBalance.maxLevel));
            gameData.skills[skillKey] = level;
            console.log(`✅ Skill ${skillKey} definida para ${level}`);
            
            // ⚡ USAR SALVAMENTO DIRETO PARA SKILLS (SEM BLOQUEIOS)
            try {
                // Garantir que a data atual do jogo esteja presente no save
                if (typeof window !== 'undefined' && window.game) {
                    const engineDate = (window.game.getCurrentDate && window.game.getCurrentDate()) || window.game.currentDate || null;
                    if (engineDate) {
                        gameData.currentDate = new Date(engineDate).toISOString();
                    }
                }
            } catch (_) { /* ignore */ }
            try {
                this.localStoragePutRawAtomic('risingstar_gamedata', JSON.stringify({ ...gameData, schemaVersion: this.schemaVersion }), { schemaVersion: this.schemaVersion });
            } catch (_) {
                localStorage.setItem('risingstar_gamedata', JSON.stringify(gameData));
            }
            console.log(`💾 Game data salvo diretamente após definir skill ${skillKey}`);
            return true;
        } catch (error) {
            console.error('Erro ao definir estado da skill:', error);
            return false;
        }
    }

    /**
     * Treina uma skill (aumenta +1 nível)
     */
    trainSkill(skillKey) {
        try {
            console.log(`🎯 DEBUG trainSkill: Iniciando para skillKey=${skillKey}`);
            
            let gameData = this.loadGameData();
            const skillState = this.getSkillState(skillKey);
            const energyState = this.getEnergyState();
            
            console.log(`🎯 DEBUG trainSkill: skillState inicial =`, skillState);
            console.log(`🎯 DEBUG trainSkill: energyState =`, energyState);
            
            // 🔧 DEBUG EXTRA: Verificar estado de sincronização
            console.log('🔍 DEBUG SYNC CHECK:');
            console.log('  - window.game.gameData.player:', window.game?.gameData?.player);
            console.log('  - localStorage gameData:', JSON.parse(localStorage.getItem('risingstar_gamedata') || '{}'));
            
            // Verificar se já está no máximo
            if (skillState.level >= DataManager.SkillBalance.maxLevel) {
                return { 
                    success: false, 
                    reason: 'Skill já está no nível máximo!',
                    currentLevel: skillState.level 
                };
            }

            // Calcular custos
            const moneyCost = this.trainingMoneyCost(skillState.level);
            const energyCost = this.trainingEnergyCost(skillState.level);
            
            console.log(`🎯 DEBUG trainSkill: custos - dinheiro=${moneyCost}, energia=${energyCost}`);

            // 🎯 PRIORIDADE ABSOLUTA: Usar dados do engine (sempre mais atualizados)
            let currentMoney = 0;
            let currentEnergy = energyState.current;
            
            // Buscar recursos do engine se disponível
            if (window?.game?.gameData?.player) {
                const enginePlayer = window.game.gameData.player;
                currentMoney = enginePlayer.money || 0;
                // Para energia, preferir o energyState do DataManager que tem a lógica completa
                if (typeof enginePlayer.energy === 'number') {
                    currentEnergy = enginePlayer.energy;
                }
                console.log(`💰 Recursos do ENGINE: dinheiro=$${currentMoney}, energia=${currentEnergy}`);
            } else {
                // Fallback para dados salvos
                currentMoney = (gameData.player?.money) || (gameData.money) || 0;
                console.log(`💰 Recursos do SAVE: dinheiro=$${currentMoney}, energia=${currentEnergy}`);
            }
            
            console.log(`🎯 DEBUG trainSkill: FINAL - dinheiro=${currentMoney}, energia=${currentEnergy}`);
            console.log(`🎯 DEBUG trainSkill: NECESSÁRIO - dinheiro=${moneyCost}, energia=${energyCost}`);
            
            if (currentMoney < moneyCost) {
                return { 
                    success: false, 
                    reason: `Você precisa de $${moneyCost.toLocaleString()} para treinar esta skill! (Atual: $${currentMoney.toLocaleString()})`,
                    currentLevel: skillState.level,
                    cost: moneyCost,
                    currentMoney: currentMoney
                };
            }

            // Verificar se tem energia
            if (currentEnergy < energyCost) {
                return { 
                    success: false, 
                    reason: `Você precisa de ${energyCost} de energia para treinar esta skill! (Atual: ${currentEnergy})`,
                    currentLevel: skillState.level,
                    energyCost: energyCost,
                    currentEnergy: currentEnergy
                };
            }

            console.log(`🎯 DEBUG trainSkill: ANTES DO TREINAMENTO - skill ${skillKey} level=${skillState.level}`);
            
            // Realizar o treinamento
            currentMoney -= moneyCost;
            currentEnergy -= energyCost;
            skillState.level += 1;
            
            console.log(`🎯 DEBUG trainSkill: DEPOIS DO INCREMENTO - skill ${skillKey} level=${skillState.level}`);

            // 🎯 SINCRONIZAR IMEDIATAMENTE COM ENGINE SE DISPONÍVEL
            if (window?.game?.gameData?.player) {
                window.game.gameData.player.money = currentMoney;
                window.game.gameData.player.energy = currentEnergy;
                // Sincronizar skills também
                if (!window.game.gameData.player.skills) window.game.gameData.player.skills = {};
                window.game.gameData.player.skills[skillKey] = skillState.level;
                console.log(`✅ Dados sincronizados com engine: money=${currentMoney}, energy=${currentEnergy}, ${skillKey}=${skillState.level}`);
            }

            // Salvar mudanças de forma atômica
            // 1) Persistir skill e energia diretamente
            this.setSkillState(skillKey, skillState.level);
            this.setEnergyState(currentEnergy, energyState.max);

            // 2) Recarregar estado mais recente e atualizar dinheiro sem sobrescrever energia/skills
            const latest = this.loadGameData();
            if (!latest.player) latest.player = {};
            // Atualizar dinheiro (fonte de verdade aqui)
            latest.player.money = Math.max(0, currentMoney);
            // Mantêm energia já salva por setEnergyState, mas também espelha em player
            if (!latest.energy) latest.energy = { current: energyState.current, max: energyState.max };
            latest.player.energy = latest.energy.current;
            // Garantir skills tanto no bloco raiz (compat) quanto em player
            if (!latest.skills) latest.skills = {};
            latest.skills[skillKey] = skillState.level;
            if (!latest.player.skills) latest.player.skills = {};
            latest.player.skills[skillKey] = skillState.level;

            // 3) Sincronizar com window.game (runtime) - BIDIRECIONAL
            try {
                if (typeof window !== 'undefined' && window.game && window.game.gameData && window.game.gameData.player) {
                    // Atualizar engine com novos valores
                    window.game.gameData.player.money = latest.player.money;
                    window.game.gameData.player.energy = latest.player.energy;
                    if (!window.game.gameData.player.skills) window.game.gameData.player.skills = {};
                    window.game.gameData.player.skills[skillKey] = skillState.level;
                    
                    console.log(`💰 Dinheiro sincronizado no engine: $${latest.player.money}`);
                    console.log(`⚡ Energia sincronizada no engine: ${latest.player.energy}`);
                    console.log(`🎯 SKILL ${skillKey} sincronizada no engine: Nível ${skillState.level}`);
                    
                    // IMPORTANTE: Forçar atualização da UI imediatamente
                    setTimeout(() => {
                        try {
                            if (window.game?.updatePlayerUI) {
                                window.game.updatePlayerUI();
                                console.log('🎨 UI do player atualizada após treinamento');
                            }
                            if (window.gameHub?.updateMetrics) {
                                window.gameHub.updateMetrics();
                                console.log('📊 Métricas do hub atualizadas após treinamento');
                            }
                            if (window.gameHub?.updateResources) {
                                window.gameHub.updateResources();
                                console.log('⚡ Recursos do hub atualizados após treinamento');
                            }
                        } catch (uiErr) {
                            console.warn('⚠️ Erro ao atualizar UI:', uiErr);
                        }
                    }, 100); // Pequeno delay para garantir que as mudanças sejam propagadas
                }
            } catch (_) { /* ignore */ }

            // 4) Persistir estado mesclado (não sobrescreve energia/skills)
            const persisted = this.saveGameData(latest);
            if (!persisted) {
                // Se estivermos no menu e o save estiver bloqueado, persistir diretamente
                try {
                    localStorage.setItem('risingstar_gamedata', JSON.stringify(latest));
                    console.log('💾 Persistência direta aplicada (save bloqueado no menu)');
                } catch (e) {
                    console.warn('⚠️ Falha ao persistir diretamente o estado:', e);
                }
            }

            return { 
                success: true, 
                newLevel: skillState.level,
                moneyCost: moneyCost,
                energyCost: energyCost,
                remainingMoney: (latest.player && typeof latest.player.money === 'number') ? latest.player.money : latest.money,
                remainingEnergy: (latest.energy && typeof latest.energy.current === 'number') ? latest.energy.current : energyState.current
            };

        } catch (error) {
            console.error('Erro ao treinar skill:', error);
            return { success: false, reason: 'Erro interno no treinamento!' };
        }
    }

    /**
     * Obtém estado atual da energia
     */
    getEnergyState() {
        try {
            const gameData = this.loadGameData();
            if (!gameData.energy) {
                gameData.energy = {
                    current: DataManager.SkillBalance.energy.maxDefault,
                    max: DataManager.SkillBalance.energy.maxDefault
                };
                this.saveGameData(gameData);
            }
            
            // Usar nullish coalescing para preservar 0
            const current = (typeof gameData.energy.current === 'number') ? gameData.energy.current : DataManager.SkillBalance.energy.maxDefault;
            const max = (typeof gameData.energy.max === 'number') ? gameData.energy.max : DataManager.SkillBalance.energy.maxDefault;
            return { current, max };
        } catch (error) {
            console.error('Erro ao obter estado da energia:', error);
            return { 
                current: DataManager.SkillBalance.energy.maxDefault, 
                max: DataManager.SkillBalance.energy.maxDefault 
            };
        }
    }

    /**
     * Define o estado da energia
     */
    setEnergyState(current, max = null) {
        try {
            const gameData = this.loadGameData();
            if (!gameData.energy) {
                gameData.energy = {};
            }
            
            gameData.energy.current = Math.max(0, current);
            if (max !== null) {
                gameData.energy.max = Math.max(1, max);
            }
            
            console.log(`⚡ setEnergyState: definindo energia para ${gameData.energy.current}`);
            
            // Sincronizar com player no engine
            try {
                if (typeof window !== 'undefined' && window.game && window.game.gameData && window.game.gameData.player) {
                    window.game.gameData.player.energy = gameData.energy.current;
                    console.log(`⚡ Energia sincronizada com player: ${window.game.gameData.player.energy}`);
                }
            } catch (e) { 
                console.warn('⚠️ Erro ao sincronizar energia com player:', e);
            }

            // ⚡ USAR SALVAMENTO DIRETO PARA ENERGIA (SEM BLOQUEIOS)
            try {
                // Garantir que a data atual do jogo esteja presente no save
                if (typeof window !== 'undefined' && window.game) {
                    const engineDate = (window.game.getCurrentDate && window.game.getCurrentDate()) || window.game.currentDate || null;
                    if (engineDate) {
                        gameData.currentDate = new Date(engineDate).toISOString();
                    }
                }
            } catch (_) { /* ignore */ }
            try {
                this.localStoragePutRawAtomic('risingstar_gamedata', JSON.stringify({ ...gameData, schemaVersion: this.schemaVersion }), { schemaVersion: this.schemaVersion });
            } catch (_) {
                localStorage.setItem('risingstar_gamedata', JSON.stringify(gameData));
            }
            console.log(`⚡ Estado da energia salvo diretamente: current=${gameData.energy.current}, max=${gameData.energy.max}`);
            return true;
        } catch (error) {
            console.error('Erro ao definir estado da energia:', error);
            return false;
        }
    }

    /**
     * Regenera energia semanal: por padrão volta a 100% do máximo.
     * Caso algum modificador global reduza (shows, eventos, saúde), ele deve ser aplicado em outro ponto.
     */
    weeklyRollover() {
        try {
            const energyState = this.getEnergyState();
            const previous = { ...energyState };

            // Ajuste anual do máximo de energia (saúde/envelhecimento etc.)
            // Reduz 1 ponto do máximo quando o ano do jogo avança, uma vez por ano.
            try {
                const game = (typeof window !== 'undefined') ? window.game : null;
                const gameDate = (game?.getCurrentDate && game.getCurrentDate()) || game?.currentDate || null;
                if (gameDate) {
                    const year = gameDate.getFullYear();
                    const gameData = this.loadGameData();
                    const lastYear = gameData.energyLastYear || year; // default: não reduz no primeiro processamento
                    if (year > lastYear) {
                        const yearsPassed = Math.min(10, year - lastYear); // sane cap
                        const newMax = Math.max(1, (energyState.max || 100) - yearsPassed);
                        energyState.max = newMax;
                        // Atualizar store
                        this.setEnergyState(Math.min(energyState.current, newMax), newMax);
                        // Persistir último ano processado
                        const updated = this.loadGameData();
                        updated.energyLastYear = year;
                        this.saveGameData(updated);
                    } else if (!gameData.energyLastYear) {
                        // garantir persistência do ano atual para futuras comparações
                        gameData.energyLastYear = year;
                        this.saveGameData(gameData);
                    }
                }
            } catch (_) { /* ignore annual adjust errors */ }

            // Regeneração completa (100% do máximo)
            const newEnergy = energyState.max;

            // Persistir
            this.setEnergyState(newEnergy, energyState.max);

            // CRÍTICO: Sincronizar com window.game.gameData.player para manter consistência
            try {
                if (typeof window !== 'undefined' && window.game && window.game.gameData && window.game.gameData.player) {
                    window.game.gameData.player.energy = newEnergy;
                    console.log(`⚡ Energia sincronizada no engine: ${newEnergy}`);
                    
                    // Também sincronizar dinheiro atual se existir discrepância
                    const gameData = this.loadGameData();
                    if (gameData.player && typeof gameData.player.money === 'number') {
                        window.game.gameData.player.money = gameData.player.money;
                        console.log(`💰 Dinheiro sincronizado no engine: ${gameData.player.money}`);
                    }
                }
            } catch (syncErr) {
                console.warn('⚠️ Erro ao sincronizar com engine:', syncErr);
            }

            console.log(`🔄 Energia regenerada (total): ${previous.current} → ${newEnergy} (max ${energyState.max})`);

            return {
                oldEnergy: previous.current,
                newEnergy,
                regenerated: Math.max(0, newEnergy - previous.current)
            };
        } catch (error) {
            console.error('Erro no rollover semanal:', error);
            return null;
        }
    }

    /**
     * Obtém todas as skills do jogador
     */
    getAllSkills() {
        try {
            const skills = {};
            DataManager.SKILL_KEYS.forEach(skillKey => {
                skills[skillKey] = this.getSkillState(skillKey);
            });
            return skills;
        } catch (error) {
            console.error('Erro ao obter todas as skills:', error);
            return {};
        }
    }

    /**
     * Zera todas as skills (para debugging)
     */
    resetAllSkills() {
        try {
            DataManager.SKILL_KEYS.forEach(skillKey => {
                this.setSkillState(skillKey, 0);
            });
            console.log('🔄 Todas as skills foram zeradas');
            return true;
        } catch (error) {
            console.error('Erro ao zerar skills:', error);
            return false;
        }
    }
    
    // =============================
    // 🔧 UTILITÁRIOS E MIGRAÇÃO
    // =============================
    computeChecksum(str) {
        // FNV-1a 32-bit
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        // Coagir para unsigned 32-bit e retornar como hex
        return (h >>> 0).toString(16);
    }

    migrateSaveData(save) {
        try {
            if (!save || typeof save !== 'object') return save;
            const migrated = { ...save };
            const v = migrated.schemaVersion || 1;
            if (v < 2) {
                // Garantir estrutura de energia
                if (!migrated.energy) {
                    migrated.energy = { current: DataManager.SkillBalance.energy.maxDefault, max: DataManager.SkillBalance.energy.maxDefault };
                } else {
                    if (typeof migrated.energy.current !== 'number') migrated.energy.current = DataManager.SkillBalance.energy.maxDefault;
                    if (typeof migrated.energy.max !== 'number') migrated.energy.max = DataManager.SkillBalance.energy.maxDefault;
                }
                // Espelhar energia em player
                migrated.player = migrated.player || {};
                migrated.player.energy = migrated.energy.current;
                // Skills: garantir presença em raiz e player
                if (migrated.skills && typeof migrated.skills === 'object') {
                    migrated.player.skills = { ...(migrated.player.skills || {}), ...migrated.skills };
                }
                // Perfil
                if (!migrated.profileId && typeof migrated.id === 'string' && migrated.id.startsWith('profile_')) {
                    migrated.profileId = migrated.id;
                }
                // Timestamp
                migrated.lastSaved = migrated.lastSaved || new Date().toISOString();
                migrated.schemaVersion = 2;
            }
            return migrated;
        } catch (_) {
            return save;
        }
    }

    addToJournal(event, detail = {}) {
        try {
            const key = 'risingstar_journal';
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            list.push({ t: Date.now(), event, ...detail });
            // Rotacionar para 50 entradas
            while (list.length > 50) list.shift();
            localStorage.setItem(key, JSON.stringify(list));
        } catch (_) { /* noop */ }
    }

    recoverIncompleteWrites() {
        try {
            const suffix = '__staging';
            const keysToFix = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.endsWith(suffix)) keysToFix.push(k);
            }
            keysToFix.forEach(stagingKey => {
                const baseKey = stagingKey.substring(0, stagingKey.length - suffix.length);
                try {
                    const stagingVal = localStorage.getItem(stagingKey);
                    const baseVal = localStorage.getItem(baseKey);
                    if (stagingVal && !baseVal) {
                        // Promover staging para base com meta
                        this.localStoragePutRawAtomic(baseKey, stagingVal, {});
                        this.addToJournal('staging_promoted', { key: baseKey });
                    }
                } catch (_) { /* noop */ }
                try { localStorage.removeItem(stagingKey); } catch(_) {}
            });
        } catch (e) {
            console.warn('⚠️ Erro ao recuperar staging:', e);
        }
    }
}
