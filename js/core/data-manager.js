/**
 * Rising Star: Music Mogul - Data Manager
 * Sistema de persistência de dados usando IndexedDB
 */

export class DataManager {
    constructor() {
        this.dbName = 'RisingStarDB';
        this.dbVersion = 1;
        this.db = null;
        this.useLocalStorageFallback = false;
        this.stores = {
            gameData: 'gameData',
            playerData: 'playerData',
            statistics: 'statistics',
            achievements: 'achievements',
            settings: 'settings'
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
}
