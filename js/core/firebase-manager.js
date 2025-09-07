/**
 * Rising Star: Music Mogul - Firebase Integration
 * Sistema de sincronização de dados com Firebase
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    collection, 
    query, 
    where, 
    orderBy, 
    deleteDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

export class FirebaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.user = null;
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        
        // Firebase config - SUBSTITUA com suas credenciais reais
        this.firebaseConfig = {
            apiKey: "AIzaSyDemo_ReplaceWithRealKey",
            authDomain: "rising-star-demo.firebaseapp.com",
            projectId: "rising-star-demo",
            storageBucket: "rising-star-demo.appspot.com",
            messagingSenderId: "123456789012",
            appId: "1:123456789012:web:demo123"
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Firebase
            this.app = initializeApp(this.firebaseConfig);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            
            // Setup auth state listener
            onAuthStateChanged(this.auth, (user) => {
                this.user = user;
                if (user) {
                    console.log('✅ Firebase: Usuário autenticado:', user.uid);
                    this.isInitialized = true;
                } else {
                    console.log('❌ Firebase: Usuário não autenticado');
                }
            });
            
            // Anonymous sign in
            await signInAnonymously(this.auth);
            
            // Setup online/offline listeners
            window.addEventListener('online', () => {
                this.isOnline = true;
                console.log('🌐 Conectado à internet - sincronização ativada');
            });
            
            window.addEventListener('offline', () => {
                this.isOnline = false;
                console.log('📱 Offline - usando cache local');
            });
            
            console.log('✅ Firebase inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            console.warn('⚠️ Continuando sem sincronização Firebase - modo offline');
            // Don't throw error, continue without Firebase
        }
    }
    
    // Save Management
    async saveGameToCloud(saveId, gameData, metadata) {
        if (!this.isInitialized || !this.isOnline || !this.user) {
            throw new Error('Firebase não disponível');
        }
        
        try {
            const saveData = {
                id: saveId,
                userId: this.user.uid,
                gameData: gameData,
                metadata: {
                    ...metadata,
                    lastSynced: serverTimestamp(),
                    version: '1.0.0'
                }
            };
            
            await setDoc(doc(this.db, 'saves', saveId), saveData);
            console.log('☁️ Save sincronizado com Firebase:', saveId);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao salvar no Firebase:', error);
            throw error;
        }
    }
    
    async loadGameFromCloud(saveId) {
        if (!this.isInitialized || !this.isOnline || !this.user) {
            throw new Error('Firebase não disponível');
        }
        
        try {
            const docRef = doc(this.db, 'saves', saveId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.userId === this.user.uid) {
                    console.log('☁️ Save carregado do Firebase:', saveId);
                    return data;
                } else {
                    throw new Error('Save não pertence ao usuário atual');
                }
            } else {
                return null;
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar do Firebase:', error);
            throw error;
        }
    }
    
    async getSavedGamesFromCloud() {
        if (!this.isInitialized || !this.isOnline || !this.user) {
            return [];
        }
        
        try {
            const q = query(
                collection(this.db, 'saves'),
                where('userId', '==', this.user.uid),
                orderBy('metadata.lastSynced', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const saves = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                saves.push({
                    id: data.id,
                    ...data.metadata,
                    isCloudSave: true
                });
            });
            
            console.log('☁️ Saves carregados do Firebase:', saves.length);
            return saves;
            
        } catch (error) {
            console.error('❌ Erro ao carregar saves do Firebase:', error);
            return [];
        }
    }
    
    async deleteGameFromCloud(saveId) {
        if (!this.isInitialized || !this.isOnline || !this.user) {
            throw new Error('Firebase não disponível');
        }
        
        try {
            await deleteDoc(doc(this.db, 'saves', saveId));
            console.log('☁️ Save deletado do Firebase:', saveId);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao deletar do Firebase:', error);
            throw error;
        }
    }
    
    // Sync Management
    async syncAllSaves(localSaves) {
        if (!this.isInitialized || !this.isOnline) {
            console.log('⚠️ Sync não disponível - offline ou Firebase não inicializado');
            return { synced: 0, conflicts: [] };
        }
        
        try {
            const cloudSaves = await this.getSavedGamesFromCloud();
            const conflicts = [];
            let synced = 0;
            
            // Upload local saves that don't exist in cloud
            for (const localSave of localSaves) {
                const cloudSave = cloudSaves.find(cs => cs.id === localSave.id);
                
                if (!cloudSave) {
                    // Upload new save
                    await this.saveGameToCloud(
                        localSave.id, 
                        localSave.gameData, 
                        localSave.metadata
                    );
                    synced++;
                } else {
                    // Check for conflicts
                    const localTime = new Date(localSave.metadata.lastPlayed);
                    const cloudTime = new Date(cloudSave.lastSynced?.toDate?.() || cloudSave.lastPlayed);
                    
                    if (localTime > cloudTime) {
                        // Local is newer - upload
                        await this.saveGameToCloud(
                            localSave.id, 
                            localSave.gameData, 
                            localSave.metadata
                        );
                        synced++;
                    } else if (cloudTime > localTime) {
                        // Cloud is newer - mark as conflict for user decision
                        conflicts.push({
                            id: localSave.id,
                            local: localSave,
                            cloud: cloudSave
                        });
                    }
                }
            }
            
            console.log(`☁️ Sync concluído: ${synced} saves sincronizados, ${conflicts.length} conflitos`);
            return { synced, conflicts };
            
        } catch (error) {
            console.error('❌ Erro durante sincronização:', error);
            return { synced: 0, conflicts: [], error: error.message };
        }
    }
    
    // Settings sync
    async saveSettingsToCloud(settings) {
        if (!this.isInitialized || !this.isOnline || !this.user) {
            return false;
        }
        
        try {
            const settingsData = {
                userId: this.user.uid,
                settings: settings,
                lastUpdated: serverTimestamp()
            };
            
            await setDoc(doc(this.db, 'userSettings', this.user.uid), settingsData);
            console.log('☁️ Configurações sincronizadas');
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao sincronizar configurações:', error);
            return false;
        }
    }
    
    async loadSettingsFromCloud() {
        if (!this.isInitialized || !this.isOnline || !this.user) {
            return null;
        }
        
        try {
            const docRef = doc(this.db, 'userSettings', this.user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('☁️ Configurações carregadas da nuvem');
                return data.settings;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Erro ao carregar configurações da nuvem:', error);
            return null;
        }
    }
    
    // Status checks
    isAvailable() {
        return this.isInitialized && this.isOnline && this.user;
    }
    
    getStatus() {
        return {
            initialized: this.isInitialized,
            online: this.isOnline,
            authenticated: !!this.user,
            userId: this.user?.uid
        };
    }
}
