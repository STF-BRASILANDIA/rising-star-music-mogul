/**
 * Rising Star: Music Mogul - Music Creation System
 * Sistema de criação e produção musical
 */

export class MusicCreation {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentSong = null;
        this.availableGenres = [
            'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 
            'Country', 'Alternative', 'Indie', 'Jazz', 'Blues'
        ];
        
        this.songTemplates = {
            'Pop': { 
                baseQuality: 70, 
                marketAppeal: 85, 
                cost: 5000,
                duration: { min: 180, max: 240 } // 3-4 minutos
            },
            'Rock': { 
                baseQuality: 75, 
                marketAppeal: 70, 
                cost: 7000,
                duration: { min: 210, max: 300 }
            },
            'Hip-Hop': { 
                baseQuality: 65, 
                marketAppeal: 90, 
                cost: 4000,
                duration: { min: 150, max: 210 }
            },
            'R&B': { 
                baseQuality: 80, 
                marketAppeal: 75, 
                cost: 6000,
                duration: { min: 200, max: 280 }
            },
            'Electronic': { 
                baseQuality: 70, 
                marketAppeal: 80, 
                cost: 3000,
                duration: { min: 240, max: 360 }
            }
        };
        
        this.studioEquipment = {
            basic: { quality: 1.0, cost: 0 },
            professional: { quality: 1.3, cost: 15000 },
            premium: { quality: 1.6, cost: 50000 },
            worldClass: { quality: 2.0, cost: 150000 }
        };
        
        this.init();
    }
    
    init() {
        console.log('🎵 Music Creation System inicializado');
    }
    
    // Criar nova música
    createSong(songData) {
        const song = {
            id: this.generateSongId(),
            title: songData.title || 'Sem Título',
            genre: songData.genre || 'Pop',
            duration: this.calculateDuration(songData.genre),
            quality: this.calculateQuality(songData),
            marketAppeal: this.calculateMarketAppeal(songData),
            cost: this.calculateCost(songData),
            createdAt: new Date(),
            status: 'recording', // recording, mixing, mastering, finished
            progress: 0,
            collaborators: songData.collaborators || [],
            lyrics: songData.lyrics || '',
            mood: songData.mood || 'neutral',
            tempo: songData.tempo || 'medium'
        };
        
        this.currentSong = song;
        this.gameEngine.gameData.songs[song.id] = song;
        
        // Save automático após criar nova música
        this.gameEngine.saveOnEvent('song_created', { songId: song.id, songTitle: song.title });
        
        console.log('🎵 Nova música criada:', song.title);
        return song;
    }
    
    // Calcular duração baseada no gênero
    calculateDuration(genre) {
        const template = this.songTemplates[genre] || this.songTemplates['Pop'];
        const min = template.duration.min;
        const max = template.duration.max;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Calcular qualidade da música
    calculateQuality(songData) {
        const player = this.gameEngine.gameData.player;
        const template = this.songTemplates[songData.genre] || this.songTemplates['Pop'];
        
        let quality = template.baseQuality;
        
        // Habilidade do player
        quality += (player?.skills?.songwriting || 50) * 0.3;
        quality += (player?.skills?.production || 50) * 0.2;
        
        // Equipamento do estúdio
        const equipment = player?.studioEquipment || 'basic';
        quality *= this.studioEquipment[equipment].quality;
        
        // Fator aleatório
        quality += Math.random() * 20 - 10;
        
        return Math.max(0, Math.min(100, Math.round(quality)));
    }
    
    // Calcular apelo de mercado
    calculateMarketAppeal(songData) {
        const template = this.songTemplates[songData.genre] || this.songTemplates['Pop'];
        let appeal = template.marketAppeal;
        
        // Tendências atuais
        const trends = this.gameEngine.gameData.trends;
        if (trends && trends[songData.genre]) {
            appeal += trends[songData.genre] * 0.5;
        }
        
        // Colaborações aumentam apelo
        if (songData.collaborators && songData.collaborators.length > 0) {
            appeal += songData.collaborators.length * 5;
        }
        
        // Fator aleatório
        appeal += Math.random() * 15 - 7.5;
        
        return Math.max(0, Math.min(100, Math.round(appeal)));
    }
    
    // Calcular custo de produção
    calculateCost(songData) {
        const template = this.songTemplates[songData.genre] || this.songTemplates['Pop'];
        let cost = template.cost;
        
        // Colaboradores aumentam custo
        if (songData.collaborators) {
            cost += songData.collaborators.length * 2000;
        }
        
        // Equipamento premium custa mais para usar
        const player = this.gameEngine.gameData.player;
        const equipment = player?.studioEquipment || 'basic';
        if (equipment !== 'basic') {
            cost += this.studioEquipment[equipment].cost * 0.1; // 10% do valor do equipamento
        }
        
        return Math.round(cost);
    }
    
    // Progresso de gravação
    advanceRecording(songId, timeSpent) {
        const song = this.gameEngine.gameData.songs[songId];
        if (!song || song.status === 'finished') return false;
        
        // Calcular progresso baseado no tempo gasto e habilidades
        const player = this.gameEngine.gameData.player;
        const efficiency = (player?.skills?.production || 50) / 100;
        const progressGain = (timeSpent * efficiency * 10) / song.duration;
        
        song.progress = Math.min(100, song.progress + progressGain);
        
        // Mudança de fase baseada no progresso
        if (song.progress >= 100 && song.status === 'recording') {
            song.status = 'mixing';
            song.progress = 0;
            console.log('🎚️ Música passando para fase de mixagem:', song.title);
        } else if (song.progress >= 100 && song.status === 'mixing') {
            song.status = 'mastering';
            song.progress = 0;
            console.log('🎛️ Música passando para masterização:', song.title);
        } else if (song.progress >= 100 && song.status === 'mastering') {
            song.status = 'finished';
            song.progress = 100;
            this.completeSong(song);
            console.log('✅ Música finalizada:', song.title);
        }
        
        return true;
    }
    
    // Finalizar música
    completeSong(song) {
        // Cobrar custo de produção
        const player = this.gameEngine.gameData.player;
        if (player.money >= song.cost) {
            player.money -= song.cost;
        } else {
            console.warn('💸 Player não tem dinheiro suficiente para finalizar a música');
            return false;
        }
        
        // Adicionar à discografia
        if (!player.discography) {
            player.discography = [];
        }
        player.discography.push(song.id);
        
        // Ganhar experiência
        this.gainExperience(song);
        
        // Gerar evento de lançamento
        this.gameEngine.gameData.events.push({
            type: 'song_released',
            data: song,
            timestamp: new Date()
        });
        
        // Save automático após finalizar música
        this.gameEngine.saveOnEvent('song_completed', { songId: song.id, songTitle: song.title });
        
        return true;
    }
    
    // Ganhar experiência
    gainExperience(song) {
        const player = this.gameEngine.gameData.player;
        if (!player.skills) player.skills = {};
        
        const expGain = Math.round(song.quality * 0.1);
        player.skills.songwriting = (player.skills.songwriting || 50) + expGain;
        player.skills.production = (player.skills.production || 50) + expGain * 0.7;
        
        console.log('📈 Experiência ganha:', expGain);
    }
    
    // Lançar música
    releaseSong(songId) {
        const song = this.gameEngine.gameData.songs[songId];
        if (!song || song.status !== 'finished') {
            console.warn('Música não está pronta para lançamento');
            return false;
        }
        
        song.releaseDate = new Date();
        song.streams = 0;
        song.revenue = 0;
        
        // Simular recepção inicial
        this.simulateInitialReception(song);
        
        // Save automático após lançar música
        this.gameEngine.saveOnEvent('song_released', { songId: songId, songTitle: song.title });
        
        console.log('🚀 Música lançada:', song.title);
        return true;
    }
    
    // Simular recepção inicial
    simulateInitialReception(song) {
        const baseStreams = song.marketAppeal * song.quality * 10;
        song.streams = Math.round(baseStreams + Math.random() * baseStreams * 0.5);
        song.revenue = song.streams * 0.003; // $0.003 por stream
        
        console.log(`🎵 Recepção inicial: ${song.streams} streams, $${song.revenue.toFixed(2)}`);
    }
    
    // Gerar ID único para música
    generateSongId() {
        return 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Obter todas as músicas do player
    getPlayerSongs() {
        const player = this.gameEngine.gameData.player;
        if (!player || !player.discography) return [];
        
        return player.discography.map(songId => this.gameEngine.gameData.songs[songId])
                                 .filter(song => song);
    }
    
    // Obter música atual
    getCurrentSong() {
        return this.currentSong;
    }
    
    // Atualização do sistema
    update(deltaTime) {
        // Atualizar progresso de gravação se houver música em produção
        if (this.currentSong && this.currentSong.status !== 'finished') {
            // Auto-progresso lento (simulando trabalho contínuo)
            this.advanceRecording(this.currentSong.id, deltaTime / 1000);
        }
    }
    
    // Obter estado do sistema
    getState() {
        return {
            currentSong: this.currentSong,
            availableGenres: this.availableGenres,
            studioEquipment: this.studioEquipment
        };
    }
}
