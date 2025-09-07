/**
 * Rising Star: Music Mogul - AI Simulation Engine
 * Motor de IA que simula a dinâmica da indústria musical
 */

export class AISimulation {
    constructor(game) {
        this.game = game;
        this.config = {
            trendCycleDays: 30,
            eventGenerationChance: 0.3,
            collaborationChance: 0.15,
            controversyChance: 0.05,
            maxSimultaneousEvents: 5
        };
        
        this.state = {
            currentTrends: {},
            marketMood: 0.5,
            industryBuzz: {},
            activeEvents: [],
            trendHistory: []
        };
        
        this.eventTemplates = {};
        this.trendTemplates = {};
        this.behaviorPatterns = {};
        
        this.init();
    }
    
    init() {
        this.setupEventTemplates();
        this.setupTrendTemplates();
        this.setupBehaviorPatterns();
        this.initializeTrends();
    }
    
    setupEventTemplates() {
        this.eventTemplates = {
            collaboration: {
                triggers: ['high_popularity', 'genre_match', 'label_connection'],
                outcomes: ['song_creation', 'fan_boost', 'media_attention'],
                templates: [
                    "{artist1} e {artist2} anunciam colaboração surpresa",
                    "Fãs especulam sobre possível parceria entre {artist1} e {artist2}",
                    "{artist1} confirma trabalho em estúdio com {artist2}"
                ]
            },
            
            controversy: {
                triggers: ['high_profile', 'social_media_activity', 'random'],
                outcomes: ['reputation_change', 'fan_reaction', 'media_coverage'],
                templates: [
                    "{artist} gera polêmica nas redes sociais",
                    "Declarações de {artist} dividem opinião dos fãs",
                    "{artist} se pronuncia sobre recente controvérsia"
                ]
            },
            
            industry_news: {
                triggers: ['market_changes', 'new_releases', 'chart_movements'],
                outcomes: ['genre_boost', 'label_activity', 'trend_shift'],
                templates: [
                    "Especialistas apontam crescimento do {genre}",
                    "Gravadora {label} anuncia nova estratégia para {year}",
                    "Streaming de {genre} aumenta {percentage}% este mês"
                ]
            }
        };
    }
    
    setupTrendTemplates() {
        this.trendTemplates = {
            genre_cycles: {
                'pop': { duration: 45, intensity: 0.8, seasonality: 'summer' },
                'hip-hop': { duration: 60, intensity: 0.9, seasonality: 'all' },
                'rock': { duration: 90, intensity: 0.6, seasonality: 'winter' },
                'electronic': { duration: 30, intensity: 0.7, seasonality: 'summer' },
                'rnb': { duration: 75, intensity: 0.7, seasonality: 'fall' },
                'country': { duration: 120, intensity: 0.5, seasonality: 'spring' },
                'alternative': { duration: 40, intensity: 0.6, seasonality: 'fall' },
                'latin': { duration: 50, intensity: 0.8, seasonality: 'summer' }
            },
            
            lyrical_themes: {
                'love': { duration: 365, intensity: 0.8, volatility: 0.2 },
                'breakup': { duration: 60, intensity: 0.9, volatility: 0.4 },
                'party': { duration: 90, intensity: 0.7, volatility: 0.3 },
                'social': { duration: 180, intensity: 0.6, volatility: 0.5 },
                'personal': { duration: 120, intensity: 0.5, volatility: 0.3 },
                'motivational': { duration: 30, intensity: 0.8, volatility: 0.2 }
            }
        };
    }
    
    setupBehaviorPatterns() {
        this.behaviorPatterns = {
            release_patterns: {
                'frequent': { min_days: 30, max_days: 60, quality_modifier: -0.1 },
                'strategic': { min_days: 90, max_days: 180, quality_modifier: 0.2 },
                'perfectionist': { min_days: 180, max_days: 365, quality_modifier: 0.3 },
                'sporadic': { min_days: 45, max_days: 300, quality_modifier: 0.0 }
            },
            
            social_activity: {
                'very_active': { posts_per_week: 7, engagement_boost: 0.3, controversy_risk: 0.2 },
                'active': { posts_per_week: 4, engagement_boost: 0.2, controversy_risk: 0.1 },
                'moderate': { posts_per_week: 2, engagement_boost: 0.1, controversy_risk: 0.05 },
                'minimal': { posts_per_week: 0.5, engagement_boost: 0.0, controversy_risk: 0.02 }
            }
        };
    }
    
    initializeTrends() {
        Object.keys(this.trendTemplates.genre_cycles).forEach(genre => {
            this.state.currentTrends[genre] = {
                strength: Math.random() * 0.5 + 0.25,
                direction: Math.random() > 0.5 ? 1 : -1,
                daysRemaining: Math.floor(Math.random() * 30) + 15
            };
        });
        
        this.state.marketMood = 0.5 + (Math.random() - 0.5) * 0.3;
    }
    
    update(deltaTime) {
        if (this.shouldRunDailyUpdate()) {
            this.runDailySimulation();
        }
        
        this.processActiveEvents(deltaTime);
        
        if (Math.random() < this.config.eventGenerationChance / 100) {
            this.generateRandomEvent();
        }
    }
    
    shouldRunDailyUpdate() {
        const now = Date.now();
        if (!this.lastDailyUpdate) {
            this.lastDailyUpdate = now;
            return true;
        }
        
        const daysSinceUpdate = (now - this.lastDailyUpdate) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate >= 1) {
            this.lastDailyUpdate = now;
            return true;
        }
        
        return false;
    }
    
    runDailySimulation() {
        this.updateTrends();
        this.simulateArtistActivity();
        this.updateMarketMood();
        this.generateIndustryBuzz();
    }
    
    updateTrends() {
        Object.keys(this.state.currentTrends).forEach(genre => {
            const trend = this.state.currentTrends[genre];
            
            trend.daysRemaining--;
            
            const changeRate = 0.05 * trend.direction;
            trend.strength = Math.max(0, Math.min(1, trend.strength + changeRate));
            
            if (trend.daysRemaining <= 0 || trend.strength >= 0.9 || trend.strength <= 0.1) {
                this.resetTrend(genre);
            }
        });
    }
    
    resetTrend(genre) {
        const template = this.trendTemplates.genre_cycles[genre];
        const trend = this.state.currentTrends[genre];
        
        trend.direction = Math.random() > 0.5 ? 1 : -1;
        trend.daysRemaining = template.duration + (Math.random() - 0.5) * 20;
        
        this.state.trendHistory.push({
            genre,
            strength: trend.strength,
            date: this.game.getCurrentDate(),
            direction: trend.direction
        });
        
        if (this.state.trendHistory.length > 90) {
            this.state.trendHistory.shift();
        }
    }
    
    simulateArtistActivity() {
        const artists = this.game.getArtists();
        
        Object.values(artists).forEach(artist => {
            if (artist.id === this.game.getPlayer()?.id) return;
            
            this.simulateArtistBehavior(artist);
        });
    }
    
    simulateArtistBehavior(artist) {
        const releaseChance = this.calculateReleaseChance(artist);
        if (Math.random() < releaseChance) {
            this.simulateArtistRelease(artist);
        }
        
        const socialChance = this.calculateSocialActivityChance(artist);
        if (Math.random() < socialChance) {
            this.simulateSocialActivity(artist);
        }
    }
    
    calculateReleaseChance(artist) {
        const baseLikelihood = artist.activity_level || 0.3;
        const trendBonus = this.state.currentTrends[artist.primary_genre]?.strength || 0.5;
        const timeBonus = this.calculateTimeSinceLastRelease(artist);
        
        return (baseLikelihood * 0.01) + (trendBonus * 0.005) + timeBonus;
    }
    
    calculateTimeSinceLastRelease(artist) {
        const daysSinceRelease = artist.days_since_release || Math.floor(Math.random() * 180);
        return Math.min(daysSinceRelease / 365, 0.5);
    }
    
    simulateArtistRelease(artist) {
        const song = this.generateArtistSong(artist);
        
        this.game.gameData.songs[song.id] = song;
        
        this.game.addGameEvent('ai_artist_release', {
            artist: artist,
            song: song,
            timestamp: Date.now()
        });
        
        artist.days_since_release = 0;
        artist.total_releases = (artist.total_releases || 0) + 1;
        
        console.log(`🎵 ${artist.name} lançou "${song.title}"`);
    }
    
    generateArtistSong(artist) {
        const themes = Object.keys(this.trendTemplates.lyrical_themes);
        const currentTrend = this.state.currentTrends[artist.primary_genre] || { strength: 0.5 };
        
        return {
            id: this.game.generateId(),
            title: this.generateSongTitle(),
            artist_id: artist.id,
            artist_name: artist.name,
            genre: artist.primary_genre,
            theme: themes[Math.floor(Math.random() * themes.length)],
            quality: this.calculateSongQuality(artist, currentTrend),
            release_date: this.game.getCurrentDate(),
            streams: 0,
            likes: 0,
            chart_position: null,
            production_cost: this.calculateProductionCost(artist),
            marketing_budget: this.calculateMarketingBudget(artist)
        };
    }
    
    generateSongTitle() {
        const titleTemplates = [
            ["Dreaming", "Running", "Dancing", "Flying", "Falling", "Rising"],
            ["Tonight", "Forever", "Again", "Away", "Home", "Wild"],
            ["Love", "Heart", "Soul", "Mind", "Life", "Time"],
            ["Fire", "Light", "Shadow", "Wind", "Storm", "Rain"]
        ];
        
        const template = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
        const word = template[Math.floor(Math.random() * template.length)];
        
        const variations = [
            word,
            `${word} Tonight`,
            `My ${word}`,
            `${word} (Remix)`,
            `When ${word} Calls`
        ];
        
        return variations[Math.floor(Math.random() * variations.length)];
    }
    
    calculateSongQuality(artist, trend) {
        const baseQuality = artist.skill_level || 0.5;
        const trendBonus = trend.strength * 0.2;
        const randomFactor = (Math.random() - 0.5) * 0.3;
        
        return Math.max(0.1, Math.min(1.0, baseQuality + trendBonus + randomFactor));
    }
    
    calculateProductionCost(artist) {
        const baseCost = 10000;
        const artistMultiplier = (artist.fame_level || 0.3) * 2;
        return Math.floor(baseCost * (1 + artistMultiplier));
    }
    
    calculateMarketingBudget(artist) {
        const baseMarketing = 25000;
        const artistMultiplier = (artist.fame_level || 0.3) * 3;
        return Math.floor(baseMarketing * (1 + artistMultiplier));
    }
    
    calculateSocialActivityChance(artist) {
        const baseActivity = artist.social_activity || 0.3;
        return baseActivity * 0.1;
    }
    
    simulateSocialActivity(artist) {
        const postTypes = ['announcement', 'behind_scenes', 'personal', 'promotional'];
        const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
        
        const post = {
            id: this.game.generateId(),
            artist_id: artist.id,
            artist_name: artist.name,
            type: postType,
            content: this.generateSocialPost(postType),
            timestamp: Date.now(),
            likes: Math.floor(Math.random() * (artist.fans || 1000)),
            comments: Math.floor(Math.random() * (artist.fans || 1000) * 0.1),
            shares: Math.floor(Math.random() * (artist.fans || 1000) * 0.05)
        };
        
        if (this.game.systems.socialSystem) {
            this.game.systems.socialSystem.addPost(post);
        }
    }
    
    generateSocialPost(type) {
        const templates = {
            announcement: [
                "Grandes novidades chegando! 🎵",
                "Mal posso esperar para mostrar o que estou preparando...",
                "Algo especial está vindo por aí! ✨"
            ],
            behind_scenes: [
                "Nos estúdios hoje criando magia 🎧",
                "3 AM e ainda trabalhando na nova música... vale a pena! 💪",
                "O processo criativo nunca para 🔥"
            ],
            personal: [
                "Gratidão por todos vocês que me apoiam! ❤️",
                "Refletindo sobre essa jornada incrível...",
                "Família é tudo! 👨‍👩‍👧‍👦"
            ],
            promotional: [
                "Não esqueçam de ouvir minha última música! 🎶",
                "Link na bio para o novo single! 📱",
                "Já adicionaram na playlist? 🔥"
            ]
        };
        
        const typeTemplates = templates[type] || templates.announcement;
        return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    }
    
    updateMarketMood() {
        const trendStrengths = Object.values(this.state.currentTrends).map(t => t.strength);
        const avgTrendStrength = trendStrengths.reduce((a, b) => a + b, 0) / trendStrengths.length;
        
        const randomFactor = (Math.random() - 0.5) * 0.1;
        const trendInfluence = (avgTrendStrength - 0.5) * 0.2;
        
        this.state.marketMood = Math.max(0.2, Math.min(0.8, 
            this.state.marketMood + randomFactor + trendInfluence
        ));
    }
    
    generateIndustryBuzz() {
        const buzzTopics = ['streaming_growth', 'genre_emergence', 'technology_impact', 'market_shift'];
        const topic = buzzTopics[Math.floor(Math.random() * buzzTopics.length)];
        
        this.state.industryBuzz[topic] = {
            intensity: Math.random(),
            duration: Math.floor(Math.random() * 14) + 7,
            created: this.game.getCurrentDate()
        };
    }
    
    generateRandomEvent() {
        const eventTypes = Object.keys(this.eventTemplates);
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const template = this.eventTemplates[eventType];
        const outcome = template.outcomes[Math.floor(Math.random() * template.outcomes.length)];
        
        const event = {
            id: this.game.generateId(),
            type: eventType,
            outcome: outcome,
            description: this.generateEventDescription(eventType, template),
            timestamp: Date.now(),
            duration: Math.floor(Math.random() * 7) + 1
        };
        
        this.state.activeEvents.push(event);
        this.game.addGameEvent('industry_event', event);
    }
    
    generateEventDescription(eventType, template) {
        const templates = template.templates;
        const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
        return this.replacePlaceholders(selectedTemplate);
    }
    
    replacePlaceholders(template) {
        const artists = Object.values(this.game.getArtists() || {});
        const labels = this.game.getLabels() || {};
        
        return template
            .replace('{artist}', this.getRandomArtist(artists).name)
            .replace('{artist1}', this.getRandomArtist(artists).name)
            .replace('{artist2}', this.getRandomArtist(artists).name)
            .replace('{label}', this.getRandomLabel(labels).name)
            .replace('{genre}', this.getRandomGenre())
            .replace('{percentage}', Math.floor(Math.random() * 50) + 10)
            .replace('{year}', this.game.getCurrentDate().getFullYear())
            .replace('{count}', Math.floor(Math.random() * 5) + 1);
    }
    
    getRandomArtist(artists) {
        if (artists.length === 0) return { name: 'Unknown Artist' };
        return artists[Math.floor(Math.random() * artists.length)];
    }
    
    getRandomLabel(labels) {
        const labelList = Object.values(labels.tier1 || {})
            .concat(Object.values(labels.tier2 || {}))
            .concat(Object.values(labels.tier3 || {}));
        if (labelList.length === 0) return { name: 'Indie Label' };
        return labelList[Math.floor(Math.random() * labelList.length)];
    }
    
    getRandomGenre() {
        const genres = Object.keys(this.trendTemplates.genre_cycles);
        return genres[Math.floor(Math.random() * genres.length)];
    }
    
    processActiveEvents(deltaTime) {
        this.state.activeEvents = this.state.activeEvents.filter(event => {
            event.duration -= deltaTime / (1000 * 60 * 60 * 24);
            return event.duration > 0;
        });
    }
    
    // Métodos públicos
    getTrendStrength(genre) {
        return this.state.currentTrends[genre]?.strength || 0.5;
    }
    
    getMarketMood() {
        return this.state.marketMood;
    }
    
    getIndustryBuzz() {
        return this.state.industryBuzz;
    }
    
    initializePlayer(playerData) {
        this.playerMetrics = {
            recognition: 0.1,
            reputation: 0.5,
            industry_connections: 0.1,
            media_attention: 0.1
        };
    }
    
    generateInitialEvents() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.generateRandomEvent();
            }, i * 5000);
        }
    }
    
    generateMonthlyTrends() {
        Object.keys(this.state.currentTrends).forEach(genre => {
            if (Math.random() < 0.3) {
                this.resetTrend(genre);
            }
        });
        
        console.log('📈 Tendências mensais atualizadas');
    }
    
    getState() {
        return {
            state: this.state,
            playerMetrics: this.playerMetrics,
            lastDailyUpdate: this.lastDailyUpdate
        };
    }
    
    setState(savedState) {
        this.state = savedState.state || this.state;
        this.playerMetrics = savedState.playerMetrics || this.playerMetrics;
        this.lastDailyUpdate = savedState.lastDailyUpdate;
    }
}
