/**
 * Rising Star: Music Mogul - Data Manager
 * Sistema de persistência de dados usando IndexedDB com sincronização Firebase
 */

import { FirebaseManager } from './firebase-manager.js';

export class DataManager {
    constructor() {
        this.dbName = 'RisingStarDB';
        this.dbVersion = 1;
        this.db = null;
        this.useLocalStorageFallback = false;
        this.firebaseManager = new FirebaseManager();
        this.stores = {
            gameData: 'gameData',
            playerData: 'playerData',
            statistics: 'statistics',
            achievements: 'achievements',
            settings: 'settings',
            saves: 'saves'
        };
    }
    
    async init() {
        try {
            // Verificar se IndexedDB está disponível
            if (!window.indexedDB) {
                console.warn('⚠️ IndexedDB não disponível, usando localStorage como fallback');
                this.useLocalStorageFallback = true;
                return true;
            }
            
            this.db = await this.openDatabase();
            console.log('✅ Database initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            console.warn('⚠️ Usando localStorage como fallback');
            this.useLocalStorageFallback = true;
            return true; // Não falhar, usar fallback
        }
    }
    
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                Object.values(this.stores).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'id' });
                        
                        // Add indexes for specific stores
                        if (storeName === 'gameData') {
                            store.createIndex('timestamp', 'timestamp', { unique: false });
                            store.createIndex('version', 'version', { unique: false });
                        }
                        
                        if (storeName === 'statistics') {
                            store.createIndex('date', 'date', { unique: false });
                            store.createIndex('type', 'type', { unique: false });
                        }
                        
                        if (storeName === 'achievements') {
                            store.createIndex('unlocked', 'unlocked', { unique: false });
                            store.createIndex('date', 'dateUnlocked', { unique: false });
                        }
                        
                        if (storeName === 'saves') {
                            store.createIndex('lastPlayed', 'metadata.lastPlayed', { unique: false });
                            store.createIndex('playerName', 'metadata.playerName', { unique: false });
                        }
                    }
                });
                
                console.log('📦 Database structure created');
            };
        });
    }
    
    async saveGame(gameData) {
        try {
            const saveData = {
                id: 'current_save',
                ...gameData,
                timestamp: Date.now()
            };
            
            await this.putData(this.stores.gameData, saveData);
            
            // Also save backup
            const backupData = {
                id: `backup_${Date.now()}`,
                ...gameData,
                timestamp: Date.now()
            };
            
            await this.putData(this.stores.gameData, backupData);
            
            // Keep only last 5 backups
            await this.cleanupBackups();
            
            console.log('💾 Game saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            throw error;
        }
    }
    
    async loadGame() {
        try {
            const saveData = await this.getData(this.stores.gameData, 'current_save');
            if (saveData) {
                console.log('📁 Game loaded successfully');
                return saveData;
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return null;
        }
    }
    
    async savePlayerData(playerData) {
        try {
            const data = {
                id: 'player',
                ...playerData,
                lastUpdated: Date.now()
            };
            
            await this.putData(this.stores.playerData, data);
            return true;
        } catch (error) {
            console.error('❌ Failed to save player data:', error);
            throw error;
        }
    }
    
    async loadPlayerData() {
        try {
            return await this.getData(this.stores.playerData, 'player');
        } catch (error) {
            console.error('❌ Failed to load player data:', error);
            return null;
        }
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
            localStorage.setItem(key, JSON.stringify(data));
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    localStorageGet(storeName, id) {
        try {
            const key = `${this.dbName}_${storeName}_${id}`;
            const data = localStorage.getItem(key);
            return Promise.resolve(data ? JSON.parse(data) : null);
        } catch (error) {
            return Promise.reject(error);
        }
    }    getAllData(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    deleteData(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    clearStore(storeName) {
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
            let localSaves = [];
            
            if (this.useLocalStorageFallback) {
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
            } else {
                // IndexedDB implementation
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
            
            // Get cloud saves
            let cloudSaves = [];
            if (this.firebaseManager.isAvailable()) {
                try {
                    cloudSaves = await this.firebaseManager.getSavedGamesFromCloud();
                } catch (error) {
                    console.warn('Erro ao carregar saves da nuvem:', error);
                }
            }
            
            // Combine and deduplicate saves
            const allSaves = [...localSaves];
            
            // Add cloud saves that don't exist locally
            cloudSaves.forEach(cloudSave => {
                const existsLocally = localSaves.find(local => local.id === cloudSave.id);
                if (!existsLocally) {
                    allSaves.push({
                        ...cloudSave,
                        isLocal: false,
                        isCloudSave: true
                    });
                } else {
                    // Mark local save as also in cloud
                    const localSave = allSaves.find(save => save.id === cloudSave.id);
                    if (localSave) {
                        localSave.isCloudSave = true;
                    }
                }
            });
            
            return allSaves.sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
            
        } catch (error) {
            console.error('Erro ao carregar saves:', error);
            return [];
        }
    }
    
    async deleteSave(saveId) {
        try {
            if (this.useLocalStorageFallback) {
                localStorage.removeItem(`risingstar_save_${saveId}`);
                return true;
            } else {
                const transaction = this.db.transaction(['saves'], 'readwrite');
                const store = transaction.objectStore('saves');
                const request = store.delete(saveId);
                
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(true);
                    request.onerror = () => reject(request.error);
                });
            }
        } catch (error) {
            console.error('Erro ao deletar save:', error);
            throw error;
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
            if (this.firebaseManager.isAvailable()) {
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
        if (!this.firebaseManager.isAvailable()) {
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
        return this.firebaseManager.getStatus();
    }
}
