/**
 * Rising Star: Music Mogul - Mobile Character Creation System
 * Sistema de criação de personagem estilo mobile game
 * Baseado no design de jogos como Star Life Simulator
 * Updated: Skills system with 100 points distribution
 */

export class CharacterCreator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentStep = 1; // Start at step 1 (Profile)
        this.maxSteps = 3; // Profile, Background, Skills
        // Pontos iniciais para distribuir - 100 pontos totais, 6 usados (1 em cada talento artístico), 94 disponíveis
        this.availablePoints = 100;
        
        // Delegar notificações para interfaceManager se existir
        this._notify = (msg, type='info', duration=4000, extra={}) => {
            try {
                if (window.game?.systems?.interfaceManager?.showNotification) {
                    window.game.systems.interfaceManager.showNotification({
                        message: msg,
                        type,
                        duration,
                        ...extra
                    });
                } else {
                    // Fallback simples (único container)
                    let container = document.getElementById('notificationContainer');
                    if (!container) {
                        container = document.createElement('div');
                        container.id = 'notificationContainer';
                        container.className = 'notification-container';
                        document.body.appendChild(container);
                    }
                    const div = document.createElement('div');
                    div.className = `notification notification-${type} show`;
                    div.textContent = msg;
                    container.appendChild(div);
                    setTimeout(()=>div.remove(), duration);
                }
            } catch(e) { console.warn('⚠️ Falha ao mostrar notificação (delegação):', e); }
        };
        
        // Teste inicial controlado
        setTimeout(() => this._notify('Sistema de criação inicializado', 'info', 2500), 800);
        
        this.locations = ['Estados Unidos', 'Canadá', 'América Latina', 'Reino Unido', 'Europa', 'África', 'Coreia do Sul', 'Japão', 'Oceania'];
        this.roles = ['Cantor(a)', 'Rapper', 'Guitarrista', 'Baterista', 'Tecladista', 'DJ'];
    // Exposed indices to support delegation handlers
    this.locationIndex = 0;
    this.roleIndex = 0;
        
        // Histórias de fundo atualizadas
        this.backgroundStories = [
            {
                id: 'bestFriend',
                name: 'Best Friend',
                description: 'Você e seu melhor amigo decidiram tentar fazer sucesso na indústria musical. Vocês não têm certeza de como vai ser, mas já estão ouvindo coisas boas de amigos e família.',
                stats: { label: 'Unsigned', home: 'Loft', cash: '$15,000' },
                bonuses: { performance: 5, charisma: 5 }
            },
            {
                id: 'indieDarlings',
                name: 'Indie Darlings',
                description: 'Todo mundo parece pensar que seu grupo tem o fator "it" quando se trata de apelo indie. Você tem a aparência e se sente descolado, mas agora é hora de ver se você tem o talento musical para apoiar sua imagem legal.',
                stats: { label: 'Unsigned', home: 'Apartment', cash: '$10,000' },
                bonuses: { charisma: 10, performance: 3 }
            },
            {
                id: 'crossoverStar',
                name: 'Crossover Star',
                description: 'Você é um nome conhecido, já fez filmes, televisão e tudo mais. A música sempre foi sua verdadeira paixão, e você não pode esperar para compartilhar seus talentos musicais com o mundo.',
                stats: { label: 'Unsigned', home: 'Luxury Condo', cash: '$50,000' },
                bonuses: { charisma: 15, technical: 5 }
            },
            {
                id: 'upAndComingBand',
                name: 'Up and Coming Band',
                description: 'Vocês são uma banda em ascensão com um som único. Já tocaram em alguns shows locais e estão prontos para o próximo nível.',
                stats: { label: 'Unsigned', home: 'Band House', cash: '$20,000' },
                bonuses: { performance: 8, composition: 7 }
            },
            {
                id: 'solo',
                name: 'Solo',
                description: 'Você decidiu seguir carreira solo depois de sair de uma banda. Tem experiência, mas agora precisa provar que pode fazer sucesso sozinho.',
                stats: { label: 'Unsigned', home: 'Studio Apartment', cash: '$12,000' },
                bonuses: { vocal: 10, composition: 5 }
            },
            {
                id: 'localSceneHero',
                name: 'Local Scene Hero',
                description: 'Você é uma lenda na cena musical local da sua cidade. Tem uma base de fãs sólida e experiência de palco, mas ainda precisa conquistar reconhecimento nacional.',
                stats: { label: 'Unsigned', home: 'Condo', cash: '$35,000' },
                bonuses: { charisma: 8, performance: 7 }
            },
            {
                id: 'bandMember',
                name: 'Band Member',
                description: 'Você é membro de uma banda estabelecida, mas quer explorar sua criatividade individual mantendo os laços com o grupo.',
                stats: { label: 'Unsigned', home: 'Shared House', cash: '$18,000' },
                bonuses: { performance: 6, composition: 9 }
            },
            {
                id: 'indieLabel',
                name: 'Indie Label',
                description: 'Você estava em uma gravadora independente, mas decidiu sair para buscar sua própria oportunidade. Agora precisa conquistar uma nova label.',
                stats: { label: 'Unsigned', home: 'Loft', cash: '$25,000' },
                bonuses: { composition: 10, technical: 5 }
            },
            {
                id: 'recordingStudio',
                name: 'Recording Studio',
                description: 'Você trabalha em um estúdio de gravação e decidiu usar seu conhecimento técnico para lançar sua própria carreira musical.',
                stats: { label: 'Unsigned', home: 'Studio Space', cash: '$22,000' },
                bonuses: { technical: 12, composition: 3 }
            }
        ];
        
        this.init();
        // If DOM already ready, proactively setup components to bind delegation
        try {
            if (document.readyState !== 'loading') {
                console.log('ℹ️ DOM already ready in constructor - running setupComponents early');
                if (!this.initialized) {
                    this.setupComponents();
                    this.initialized = true;
                }
            } else {
                // Ensure setup runs once DOM is ready if show() isn't called immediately
                document.addEventListener('DOMContentLoaded', () => {
                    try {
                        if (!this.initialized) {
                            console.log('ℹ️ DOMContentLoaded - running setupComponents from constructor listener');
                            this.setupComponents();
                            this.initialized = true;
                        }
                    } catch (err) {
                        console.warn('⚠️ Error running setupComponents on DOMContentLoaded:', err);
                    }
                });
            }
        } catch (err) {
            console.warn('⚠️ Error during constructor proactive setup:', err);
        }
    }
    
    getDefaultCharacter() {
        return {
            // Profile Info
            firstName: '',
            lastName: '',
            artistName: '', // Nome artístico obrigatório
            location: 'Estados Unidos',
            age: 18,
            sex: 'male',
            genre: 'R&B',
            bandName: '',
            role: 'Cantor(a)',
            
            // Background
            background: null,
            backgroundStory: null,
            backgroundBonuses: {},
            
            // Skills - APENAS TALENTOS ARTÍSTICOS (Empresariais serão desbloqueados no jogo)
            skills: {
                // ARTIST TRAITS - Todos começam com 1 ponto
                vocals: 1,
                songWriting: 1,
                rhythm: 1,
                charisma: 1,
                virality: 1,
                videoDirecting: 1
            },
            
            // Calculated values
            startingMoney: 5000,
            chemistry: 100
        };
    }
    
    init() {
        // Initialize character object with default values
        this.character = this.getDefaultCharacter();
        console.log('📋 Character object initialized:', this.character);
        console.log('🎯 Available points set to:', this.availablePoints);
        // A inicialização será feita no show() quando os elementos existem
        console.log('📋 CharacterCreator initialized (deferred setup)');
    }
    
    show() {
        console.log('🎭 CharacterCreator.show() called');
        const element = document.getElementById('characterCreation');
        console.log('📋 CharacterCreation element:', element);
        
        if (element) {
            // FORCE DISPLAY WITH MAXIMUM PRIORITY
            element.style.display = 'flex';
            element.style.setProperty('display', 'flex', 'important');
            element.classList.add('show');
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.position = 'relative';
            element.style.zIndex = '1000';
            console.log('✅ CharacterCreation FORCED to be visible with !important');
            
            // Initialize if not done yet
            if (!this.initialized) {
                this.setupComponents();
                this.initialized = true;
            }
            
            this.showStep(this.currentStep);
        } else {
            console.error('❌ CharacterCreation element not found in DOM!');
        }
    }
    
    hide() {
        const element = document.getElementById('characterCreation');
        if (element) {
            element.style.display = 'none';
            element.classList.remove('show');
        }
    }
    
    setupComponents() {
        console.log('🔧 Setting up character creator components...');
        this.bindEvents();
        this.setupLocationSelector();
        this.setupRoleSelector();
        this.setupAgeSelector();
        this.setupSkillControls();
        this.updateSkillsDisplay();
        this.updatePointsDisplay();
        this.initializeBackgroundDescription();
        console.log('✅ Character creator components setup complete');
    }
    
    // Função para adicionar eventos compatíveis com mobile (touch + click)
    addMobileCompatibleEvent(element, callback) {
        if (!element) return;
        
        let touchHandled = false;
        
        // Evento de toque (mobile)
        element.addEventListener('touchstart', (e) => {
            touchHandled = true;
            e.preventDefault();
            callback();
        }, { passive: false });
        
        // Evento de clique (desktop + fallback)
        element.addEventListener('click', (e) => {
            if (!touchHandled) {
                e.preventDefault();
                callback();
            }
            touchHandled = false;
        });
        
        // Reset flag após um tempo
        element.addEventListener('touchend', () => {
            setTimeout(() => { touchHandled = false; }, 300);
        });
    }
    
    bindEvents() {
        console.log('📋 Setting up character creator events...');
        // Use event delegation on the stable container to avoid per-element handlers
        const container = document.getElementById('characterCreation');
        if (!container) {
            console.warn('⚠️ characterCreation container not found for event delegation');
            // Fallback to previous binding strategy for inputs and selects
            const backgroundSelect = document.getElementById('backgroundSelect');
            if (backgroundSelect) backgroundSelect.addEventListener('change', (e) => this.selectBackground(e.target.value));
            this.bindInputEvents();
            return;
        }

        console.log('� Setting up delegated event handlers on #characterCreation');

        // Touch->click suppression helper
        let lastTouchTime = 0;

        const delegatedHandler = (e) => {
            // Suppress synthetic click after touch
            if (e.type === 'click' && (Date.now() - lastTouchTime) < 500) return;
            const target = e.target;
            const btn = target.closest('.back-btn, .continue-btn, .sex-btn, .nav-arrow, .skill-plus, .skill-minus, .skill-btn, #startGameBtn');
            if (!btn) return;

            // Back
            if (btn.closest && btn.closest('.back-btn')) {
                e.preventDefault();
                this.previousStep();
                return;
            }

            // Continue / Start
            if (btn.classList && btn.classList.contains('continue-btn')) {
                e.preventDefault();
                if (this.currentStep === 3) {
                    this.startGame();
                } else {
                    this.nextStep();
                }
                return;
            }

            // Start game explicit button
            if (btn.id === 'startGameBtn') {
                e.preventDefault();
                this.startGame();
                return;
            }

            // Sex selection
            const sexBtn = target.closest('.sex-btn');
            if (sexBtn) {
                e.preventDefault();
                const sex = sexBtn.dataset && sexBtn.dataset.sex;
                if (sex) this.selectSex(sex);
                return;
            }

            // Navigation arrows (location/role/age)
            const arrow = target.closest('.nav-arrow');
            if (arrow) {
                e.preventDefault();
                // Determine which selector this arrow belongs to
                const locationParent = arrow.closest('.location-selector');
                const roleParent = arrow.closest('.role-selector');
                const ageParent = arrow.closest('.age-selector');

                const isLeft = (() => {
                    const list = (arrow.parentNode || {}).querySelectorAll ? arrow.parentNode.querySelectorAll('.nav-arrow') : null;
                    if (list && list.length >= 2) return list[0] === arrow;
                    // Fallback: check for class
                    return arrow.classList.contains('left');
                })();

                if (locationParent) {
                    this.locationIndex = this.locationIndex || 0;
                    if (isLeft) this.locationIndex = (this.locationIndex - 1 + this.locations.length) % this.locations.length;
                    else this.locationIndex = (this.locationIndex + 1) % this.locations.length;
                    const locationDisplay = locationParent.querySelector('.location-display');
                    const locationCounter = locationParent.querySelector('.counter');
                    if (locationDisplay) locationDisplay.textContent = this.locations[this.locationIndex];
                    if (locationCounter) locationCounter.textContent = `${this.locationIndex + 1}/${this.locations.length}`;
                    this.character.location = this.locations[this.locationIndex];
                } else if (roleParent) {
                    this.roleIndex = this.roleIndex || 0;
                    if (isLeft) this.roleIndex = (this.roleIndex - 1 + this.roles.length) % this.roles.length;
                    else this.roleIndex = (this.roleIndex + 1) % this.roles.length;
                    const roleDisplay = roleParent.querySelector('.role-display');
                    const roleCounter = roleParent.querySelector('.counter');
                    if (roleDisplay) roleDisplay.textContent = this.roles[this.roleIndex];
                    if (roleCounter) roleCounter.textContent = `${this.roleIndex + 1}/${this.roles.length}`;
                    this.character.role = this.roles[this.roleIndex];
                } else if (ageParent) {
                    if (isLeft) {
                        if (this.character.age > 14) this.character.age--;
                    } else {
                        if (this.character.age < 100) this.character.age++;
                    }
                    const ageDisplay = ageParent.querySelector('.age-display');
                    if (ageDisplay) ageDisplay.textContent = this.character.age + ' anos';
                }
                return;
            }

            // Skill plus/minus
            const plus = target.closest('.skill-plus, .skill-btn.plus');
            const minus = target.closest('.skill-minus, .skill-btn.minus');
            if (plus || minus) {
                e.preventDefault();
                const skillRow = (plus || minus).closest('[data-skill]');
                if (!skillRow) return;
                const skillName = skillRow.dataset.skill;
                if (!skillName) return;
                if (plus) this.increaseSkill(skillName);
                if (minus) this.decreaseSkill(skillName);
                return;
            }
        };

        container.addEventListener('click', delegatedHandler);
        container.addEventListener('touchstart', (e) => {
            lastTouchTime = Date.now();
            delegatedHandler(e);
        }, { passive: false });

        // Mark delegation bound so fallback bindings know not to attach
        try { container.__characterCreatorDelegationBound = true; } catch (e) { /* ignore */ }

        // Keep input bindings and background select
        const backgroundSelect = document.getElementById('backgroundSelect');
        if (backgroundSelect) backgroundSelect.addEventListener('change', (e) => this.selectBackground(e.target.value));
        this.bindInputEvents();

        console.log('✅ Delegated events bound on container');
    }
    
    bindInputEvents() {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const artistName = document.getElementById('artistName');
        const bandName = document.getElementById('bandName');
        
        if (firstName) {
            firstName.addEventListener('input', (e) => {
                this.character.firstName = e.target.value;
                console.log('📝 First name updated:', e.target.value);
            });
        }
        
        if (lastName) {
            lastName.addEventListener('input', (e) => {
                this.character.lastName = e.target.value;
                console.log('📝 Last name updated:', e.target.value);
            });
        }
        
        if (artistName) {
            artistName.addEventListener('input', (e) => {
                this.character.artistName = e.target.value;
                console.log('📝 Artist name updated:', e.target.value);
            });
        }
        
        if (bandName) {
            bandName.addEventListener('input', (e) => {
                this.character.bandName = e.target.value;
                console.log('📝 Band name updated:', e.target.value);
            });
        }
    }
    

    showStep(stepNumber) {
        console.log(`🎯 Showing step ${stepNumber}`);
        
        // CRITICAL: Ensure character creation container is ALWAYS visible
        const characterCreation = document.getElementById('characterCreation');
        if (characterCreation) {
            characterCreation.style.display = 'flex';
            characterCreation.style.visibility = 'visible';
            characterCreation.style.opacity = '1';
            
            // CONTROLA SCROLL APENAS PARA SKILLS (STEP 3)
            if (stepNumber === 3) {
                characterCreation.classList.add('skills-active');
                console.log(`🔧 ADDED skills-active class for scroll`);
            } else {
                characterCreation.classList.remove('skills-active');
                console.log(`🔧 REMOVED skills-active class - no scroll`);
            }
            
            console.log(`🔧 FORCED character creation container to be visible`);
        } else {
            console.error('❌ CHARACTER CREATION CONTAINER NOT FOUND!');
        }
        
        // Map step numbers to step IDs
        const stepIds = {
            1: 'profile-step',
            2: 'background-step', 
            3: 'skills-step'
        };
        
        // Hide all steps
        const allSteps = document.querySelectorAll('.creation-step');
        console.log(`📋 Found ${allSteps.length} creation steps`);
        allSteps.forEach(step => {
            step.style.display = 'none';
            console.log(`🔄 Hiding step:`, step.id);
        });
        
        // Show current step
        const stepId = stepIds[stepNumber];
        const currentStepElement = document.getElementById(stepId);
        console.log(`📋 Step ${stepNumber} (${stepId}) element:`, currentStepElement);
        if (currentStepElement) {
            currentStepElement.style.display = 'flex';
            currentStepElement.style.visibility = 'visible';
            currentStepElement.style.opacity = '1';
            console.log(`✅ Step ${stepNumber} display set to flex with full visibility`);
            
            // Force visibility check
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(currentStepElement);
                console.log(`🔍 Step ${stepNumber} computed display:`, computedStyle.display);
                console.log(`🔍 Step ${stepNumber} visibility:`, computedStyle.visibility);
                console.log(`🔍 Step ${stepNumber} opacity:`, computedStyle.opacity);
                
                // Check container as well
                const containerStyle = window.getComputedStyle(characterCreation);
                console.log(`🔍 Container computed display:`, containerStyle.display);
                console.log(`🔍 Container visibility:`, containerStyle.visibility);
                console.log(`🔍 Container opacity:`, containerStyle.opacity);
                
                // Check if any content is visible
                const skillsContent = currentStepElement.querySelector('.skills-content');
                if (skillsContent) {
                    console.log(`🔍 Skills content found:`, skillsContent);
                    console.log(`🔍 Skills content display:`, window.getComputedStyle(skillsContent).display);
                }

                // Ensure the step element is scrolled into view on small screens
                try {
                    const container = document.getElementById('characterCreation');
                    if (currentStepElement && currentStepElement.scrollIntoView) {
                        currentStepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        console.log('🔧 Scrolled current step into view');
                    }
                    // Also ensure internal scrollable areas show top
                    const scrollable = currentStepElement.querySelector('.profile-form, .profile-content, .skills-scroll-container');
                    if (scrollable && scrollable.scrollTop !== 0) scrollable.scrollTop = 0;
                } catch (err) {
                    console.warn('⚠️ Error while scrolling step into view:', err);
                }
            }, 100);
        } else {
            console.error(`❌ Step ${stepNumber} (${stepId}) element not found!`);
        }
        
        this.currentStep = stepNumber;
        this.updateNavigationButtons();
        
        // Update specific step content
        if (stepNumber === 3) {
            console.log('🛡️ STEP 3 PROTECTION ACTIVATED');
            console.log('🛡️ Stack trace for step 3 display:', new Error().stack);
            
            // CRITICAL: Block ALL validateCurrentStep calls for next 500ms
            const originalValidate = this.validateCurrentStep;
            this.validateCurrentStep = () => {
                console.log('🚫 validateCurrentStep() BLOCKED for step 3');
                console.log('🚫 Stack trace:', new Error().stack);
                return false; // Always false for step 3
            };
            
            // Update character info now that buttons are properly configured
            console.log('📊 Updating character info for step 3');
            this.updateCharacterInfo();
            console.log('📊 Character info updated - buttons should be configured for manual interaction');
            
            // Restore function after delay, but with step 3 protection
            setTimeout(() => {
                this.validateCurrentStep = originalValidate;
                console.log('🔄 validateCurrentStep restored with step 3 protection');
            }, 500);
        }
    }
    
    updateNavigationButtons() {
        console.log('🔧 updateNavigationButtons() called for step:', this.currentStep);
        
        // Update back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.style.display = this.currentStep === 1 ? 'none' : 'flex';
        });
        
        // Update continue buttons with CLEAR event handling
        document.querySelectorAll('.continue-btn').forEach((btn, index) => {
            console.log(`🔧 Configuring continue button ${index} for step ${this.currentStep}`);
            
            // COMPLETELY CLEAR all existing handlers
            btn.onclick = null;
            btn.removeEventListener('click', this.nextStep);
            btn.removeEventListener('click', this.startGame);
            
            if (this.currentStep === 3) {
                console.log('🛑 STEP 3 BUTTON PROTECTION: Setting up manual start game');
                btn.textContent = 'Começar Jogo';
                
                // Create a CLEAN click handler for step 3
                btn.onclick = (e) => {
                    console.log('🎯 Manual "Começar Jogo" button clicked - step 3');
                    console.log('🎯 Event details:', e);
                    console.log('🎯 Button element:', btn);
                    e.preventDefault();
                    e.stopPropagation();
                    this.startGame();
                };
                console.log('✅ Step 3 button configured for MANUAL interaction');
            } else {
                console.log(`🔧 Setting up continue button for step ${this.currentStep}`);
                btn.textContent = 'Continuar';
                
                // Create a CLEAN click handler for steps 1-2
                btn.onclick = (e) => {
                    console.log(`➡️ Continue button clicked for step ${this.currentStep}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.nextStep();
                };
                console.log(`✅ Step ${this.currentStep} button configured`);
            }
        });
    }
    
    setupLocationSelector() {
        const locationDisplay = document.querySelector('.location-display');
        const locationLeftArrow = document.querySelector('.location-selector .nav-arrow:first-child');
        const locationRightArrow = document.querySelector('.location-selector .nav-arrow:last-child');
        const locationCounter = document.querySelector('.location-selector .counter');
        
        // Use instance index and delegation; do not attach per-arrow handlers here.
        let currentLocationIndex = this.locationIndex || 0;

        if (locationDisplay && locationCounter) {
            const updateLocationDisplay = () => {
                locationDisplay.textContent = this.locations[currentLocationIndex];
                locationCounter.textContent = `${currentLocationIndex + 1}/${this.locations.length}`;
                this.character.location = this.locations[currentLocationIndex];
                this.locationIndex = currentLocationIndex;
            };

            // Initialize display from character or index
            if (this.character && this.character.location) {
                const idx = this.locations.indexOf(this.character.location);
                if (idx >= 0) currentLocationIndex = idx;
            }

            updateLocationDisplay();
        }
    }
    
    setupRoleSelector() {
        const roleDisplay = document.querySelector('.role-display');
        const roleLeftArrow = document.querySelector('.role-selector .nav-arrow:first-child');
        const roleRightArrow = document.querySelector('.role-selector .nav-arrow:last-child');
        const roleCounter = document.querySelector('.role-selector .counter');
        
        // Use instance index and delegation; do not attach per-arrow handlers here.
        let currentRoleIndex = this.roleIndex || 0;

        if (roleDisplay && roleCounter) {
            const updateRoleDisplay = () => {
                roleDisplay.textContent = this.roles[currentRoleIndex];
                roleCounter.textContent = `${currentRoleIndex + 1}/${this.roles.length}`;
                this.character.role = this.roles[currentRoleIndex];
                this.roleIndex = currentRoleIndex;
            };

            // Initialize from character if present
            if (this.character && this.character.role) {
                const idx = this.roles.indexOf(this.character.role);
                if (idx >= 0) currentRoleIndex = idx;
            }

            updateRoleDisplay();
        }
    }
    
    setupAgeSelector() {
        const ageDisplay = document.querySelector('.age-display');
        const ageLeftArrow = document.querySelector('.age-selector .nav-arrow:first-child');
        const ageRightArrow = document.querySelector('.age-selector .nav-arrow:last-child');
        
        if (ageDisplay) {
            const updateAgeDisplay = () => {
                ageDisplay.textContent = this.character.age + ' anos';
            };

            // Initialize display
            if (!this.character.age) this.character.age = 18;
            updateAgeDisplay();
        }
    }
    
    selectSex(sex) {
        this.character.sex = sex;
        
        // Update button states
        document.querySelectorAll('.sex-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.sex === sex) {
                btn.classList.add('active');
            }
        });
    }

    initializeBackgroundDescription() {
        const description = document.querySelector('.background-description p');
        if (description && !description.textContent.trim()) {
            description.textContent = 'Selecione uma história de fundo para ver a descrição e os bônus de atributos.';
        }
    }

    selectBackground(backgroundId) {
        console.log('🎯 Selecting background:', backgroundId);
        
        // Se valor vazio, limpar seleção
        if (!backgroundId || backgroundId === '') {
            console.log('❌ No background selected - clearing');
            this.character.backgroundStory = null;
            this.character.backgroundBonuses = {};
            
            const description = document.querySelector('.background-description p');
            if (description) {
                description.textContent = 'Selecione uma história de fundo para ver a descrição e os bônus de atributos.';
            }
            this.updateBackgroundStats();
            return;
        }
        
        const backgroundIndex = parseInt(backgroundId);
        const background = this.backgroundStories[backgroundIndex];
        
        if (background) {
            console.log('✅ Background found:', background.name);
            this.character.backgroundStory = background;
            this.character.backgroundBonuses = background.stats;
            
            // Update description display
            const description = document.querySelector('.background-description p');
            if (description) {
                description.textContent = background.description;
                console.log('📝 Description updated');
            }
            
            // Show success notification
            this.showNotification(`História "${background.name}" selecionada!`, 'success', 2000);
            
            this.updateBackgroundStats();
        } else {
            console.log('❌ Background not found for index:', backgroundIndex);
        }
    }
    
    updateBackgroundStats() {
        const statsContainer = document.querySelector('.background-stats');
        if (statsContainer && this.character.backgroundStory) {
            statsContainer.innerHTML = '';
            
            Object.entries(this.character.backgroundStory.stats).forEach(([key, value]) => {
                const statRow = document.createElement('div');
                statRow.className = 'stat-row';
                
                const label = document.createElement('span');
                label.className = 'stat-label';
                label.textContent = this.getStatDisplayName(key);
                
                const statValue = document.createElement('span');
                statValue.className = 'stat-value';
                statValue.textContent = `+${value}`;
                
                statRow.appendChild(label);
                statRow.appendChild(statValue);
                statsContainer.appendChild(statRow);
            });
        }
    }
    
    getStatDisplayName(key) {
        const statNames = {
            vocal: 'Vocal',
            composition: 'Composição',
            performance: 'Performance',
            charisma: 'Carisma',
            technical: 'Técnica',
            marketing: 'Marketing',
            money: 'Dinheiro',
            fanbase: 'Fãs',
            connections: 'Conexões',
            equipment: 'Equipamento',
            knowledge: 'Conhecimento',
            social: 'Social',
            potential: 'Potencial'
        };
        return statNames[key] || key;
    }
    
    setupSkillControls() {
        // Suporte para a estrutura antiga e nova
        const skillElements = document.querySelectorAll('.skill-row, .skill-item');
        
        skillElements.forEach(element => {
            const skillName = element.dataset.skill;
            
            // Suporte para botões antigos (.skill-btn) e novos (.skill-minus, .skill-plus)
            const minusBtn = element.querySelector('.skill-btn.minus, .skill-minus');
            const plusBtn = element.querySelector('.skill-btn.plus, .skill-plus');
            
            if (minusBtn && plusBtn && skillName) {
                // Rely on event delegation (bound to container) instead of replacing nodes.
                // Keep minimal direct handlers as fallback for environments where delegation isn't attached yet.
                try {
                    // Only add direct listeners if delegation not present
                    const container = document.getElementById('characterCreation');
                    const hasDelegation = container && container.__characterCreatorDelegationBound;
                    if (!hasDelegation) {
                        // Fallback binding
                        minusBtn.addEventListener('click', () => this.decreaseSkill(skillName));
                        plusBtn.addEventListener('click', () => this.increaseSkill(skillName));
                    }
                } catch (err) {
                    console.warn('⚠️ Error binding skill fallback handlers:', err);
                }

                console.log(`🎮 Skills controls setup for: ${skillName}`);
            }
        });
    }
    
    increaseSkill(skillName) {
        if (this.availablePoints > 0 && this.character.skills[skillName] < 100) {
            this.character.skills[skillName] += 1;
            this.availablePoints -= 1;
            this.updateSkillsDisplay();
            this.updatePointsDisplay();
        }
    }
    
    decreaseSkill(skillName) {
        if (this.character.skills[skillName] > 1) {
            this.character.skills[skillName] -= 1;
            this.availablePoints += 1;
            this.updateSkillsDisplay();
            this.updatePointsDisplay();
        }
    }
    
    updateSkillsDisplay() {
        Object.entries(this.character.skills).forEach(([skillName, value]) => {
            const skillElement = document.querySelector(`[data-skill="${skillName}"]`);
            if (skillElement) {
                const valueDisplay = skillElement.querySelector('.skill-value');
                
                // Suporte para botões antigos e novos
                const minusBtn = skillElement.querySelector('.skill-btn.minus, .skill-minus');
                const plusBtn = skillElement.querySelector('.skill-btn.plus, .skill-plus');
                
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
                
                if (minusBtn) {
                    minusBtn.disabled = value <= 1;
                    minusBtn.style.opacity = value <= 1 ? '0.5' : '1';
                }
                
                if (plusBtn) {
                    plusBtn.disabled = this.availablePoints <= 0 || value >= 100;
                    plusBtn.style.opacity = (this.availablePoints <= 0 || value >= 100) ? '0.5' : '1';
                }
            }
        });
    }
    
    updatePointsDisplay() {
        const pointsValue = document.querySelector('.points-value');
        const availablePointsElement = document.getElementById('availablePoints');
        
        if (pointsValue) {
            pointsValue.textContent = this.availablePoints;
        }
        
        if (availablePointsElement) {
            availablePointsElement.textContent = this.availablePoints;
        }
        
        // Mudança de cor baseada nos pontos restantes
        const pointsElements = [pointsValue, availablePointsElement].filter(el => el);
        pointsElements.forEach(element => {
            if (this.availablePoints === 0) {
                element.style.color = '#22c55e'; // Verde quando todos os pontos foram usados
            } else if (this.availablePoints < 10) {
                element.style.color = '#f59e0b'; // Amarelo quando poucos pontos restam
            } else {
                element.style.color = 'var(--primary-color)'; // Azul padrão
            }
        });
    }
    
    updateCharacterInfo() {
        console.log('� updateCharacterInfo() called for step 3');
        
        // Update character info in skills step
        const skillsCharacterName = document.getElementById('skillsCharacterName');
        const skillsCharacterDetails = document.getElementById('skillsCharacterDetails');
        const skillsCharacterBackground = document.getElementById('skillsCharacterBackground');
        
        if (skillsCharacterName) {
            skillsCharacterName.textContent = `${this.character.firstName} ${this.character.lastName}`.trim() || 'Novo Artista';
        }
        
        if (skillsCharacterDetails) {
            skillsCharacterDetails.textContent = `${this.character.role} • ${this.character.genre}`;
        }
        
        if (skillsCharacterBackground) {
            if (this.character.backgroundStory) {
                skillsCharacterBackground.textContent = `História: ${this.character.backgroundStory.name}`;
            } else {
                skillsCharacterBackground.textContent = 'História não selecionada';
            }
        }
        
        console.log('✅ Character info updated for skills step');
    }
    
    nextStep() {
        console.log(`🚀 nextStep called - current step: ${this.currentStep}`);
        
        // ABSOLUTE BLOCK: NEVER allow progression FROM step 3
        if (this.currentStep === 3) {
            console.log('🛑 STEP 3 DETECTED - COMPLETELY BLOCKED');
            console.log('⛔ nextStep() is DISABLED for skills step');
            console.log('🎯 User MUST click "Começar Jogo" button manually');
            return; // TOTAL BLOCK - no progression possible
        }
        
        // SPECIAL HANDLING: When moving TO step 3 (skills), don't auto-validate
        if (this.currentStep === 2) {
            // Validate current step (2) first
            const isValid = this.validateCurrentStep();
            console.log(`📝 Step 2 validation result: ${isValid}`);
            
            if (isValid) {
                this.currentStep = 3;
                console.log(`✅ Moving to skills step ${this.currentStep} WITHOUT auto-validation`);
                this.showStep(this.currentStep);
                console.log('🎯 REACHED STEP 3 - All auto-progression now DISABLED');
                // DO NOT call validateCurrentStep for step 3 - user must manually start game
                return;
            } else {
                console.log(`❌ Step 2 validation failed, staying on step ${this.currentStep}`);
                return;
            }
        }
        
        // For steps 1 -> 2, normal validation
        if (this.currentStep === 1) {
            const isValid = this.validateCurrentStep();
            console.log(`📝 Step 1 validation result: ${isValid}`);
            
            if (isValid) {
                this.currentStep = 2;
                console.log(`✅ Moving to step ${this.currentStep}`);
                this.showStep(this.currentStep);
            } else {
                console.log(`❌ Validation failed, staying on step ${this.currentStep}`);
            }
            return;
        }
        
        // Should not reach here for step 3
        console.log(`⚠️ Unexpected nextStep call for step ${this.currentStep}`);
    }
    
    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    validateCurrentStep() {
        console.log(`🔍 Validating step ${this.currentStep}`);
        
        // GLOBAL PROTECTION: ABSOLUTELY NEVER auto-validate step 3
        if (this.currentStep === 3) {
            console.log('🛑 GLOBAL PROTECTION: BLOCKING step 3 auto-validation');
            console.log('🛑 Stack trace for blocked validation:', new Error().stack);
            console.log('⛔ Step 3 validation is COMPLETELY DISABLED');
            console.log('🎯 User must manually click "Começar Jogo" button');
            return false; // ALWAYS false for step 3
        }
        
        switch (this.currentStep) {
            case 1: // Profile
                console.log('📝 Checking profile fields...');
                
                // BUGFIX: Get current values from DOM in case events didn't fire
                const firstNameInput = document.getElementById('firstName');
                const lastNameInput = document.getElementById('lastName');
                const artistNameInput = document.getElementById('artistName');
                
                if (firstNameInput) {
                    this.character.firstName = firstNameInput.value;
                    console.log('🔧 Updated firstName from DOM:', this.character.firstName);
                }
                if (lastNameInput) {
                    this.character.lastName = lastNameInput.value;
                    console.log('🔧 Updated lastName from DOM:', this.character.lastName);
                }
                if (artistNameInput) {
                    this.character.artistName = artistNameInput.value;
                    console.log('🔧 Updated artistName from DOM:', this.character.artistName);
                }
                
                console.log('firstName:', this.character.firstName);
                console.log('lastName:', this.character.lastName);
                console.log('artistName:', this.character.artistName);
                
                if (!this.character.firstName.trim()) {
                    console.log('❌ First name validation failed');
                    this.showNotification('Por favor, insira seu primeiro nome.', 'warning');
                    return false;
                }
                if (!this.character.lastName.trim()) {
                    console.log('❌ Last name validation failed');
                    this.showNotification('Por favor, insira seu sobrenome.', 'warning');
                    return false;
                }
                if (!this.character.artistName.trim()) {
                    console.log('❌ Artist name validation failed');
                    this.showNotification('Por favor, insira seu nome artístico.', 'warning');
                    return false;
                }
                console.log('✅ Profile validation passed');
                return true;
                
            case 2: // Background
                console.log('🎭 Checking background...');
                console.log('backgroundStory:', this.character.backgroundStory);
                
                if (!this.character.backgroundStory) {
                    console.log('❌ Background validation failed');
                    this.showNotification('Por favor, selecione uma história de fundo.', 'warning');
                    return false;
                }
                console.log('✅ Background validation passed');
                return true;
                
            default:
                console.log('✅ Default validation passed');
                return true;
        }
    }
    
    startGame() {
        console.log('🚨 startGame() called');
        console.log('🚨 Current step:', this.currentStep);
        console.log('� Stack trace:', new Error().stack);
        
        // Fallback: if this instance não tem o gameEngine referenciado, tentar vincular ao global window.game
        if (!this.gameEngine && typeof window !== 'undefined' && window.game) {
            console.log('🔗 startGame fallback: vinculando this.gameEngine ao window.game');
            this.gameEngine = window.game;
        }

        // ONLY allow game start from step 3
        if (this.currentStep !== 3) {
            console.log('🛑 BLOCKING startGame() - not on step 3');
            return;
        }
        
        console.log('✅ startGame() approved - step 3 confirmed');
        
        // Mostrar notificação se ainda há pontos não utilizados
        if (this.availablePoints > 0) {
            this.showNotification(`Você ainda tem ${this.availablePoints} pontos disponíveis. Tem certeza que quer começar?`, 'info', 3000);
        }
        
        // Apply background bonuses to skills
        if (this.character.backgroundBonuses) {
            Object.entries(this.character.backgroundBonuses).forEach(([key, value]) => {
                if (this.character.skills[key] !== undefined) {
                    this.character.skills[key] += value;
                }
            });
        }
        
        // Create character in game engine
        const characterData = {
            ...this.character,
            artistName: `${this.character.firstName} ${this.character.lastName}`.trim(),
            stats: this.character.skills
        };
        
        console.log('🎮 Starting game with character:', characterData);
        console.log('📊 Final skills:', this.character.skills);
        console.log('🎯 Pontos não utilizados:', this.availablePoints);
        
        // Hide character creation and start game
        this.hide();
        
        // If game engine available, start immediately
        if (this.gameEngine) {
            this.gameEngine.startGame(characterData);
            return;
        }

        // Otherwise, poll for a global game object for a short period and then start
        if (typeof window !== 'undefined') {
            let attempts = 0;
            const maxAttempts = 30; // ~3s
            const pollInterval = 100; // ms
            const poll = setInterval(() => {
                attempts++;
                if (window.game) {
                    clearInterval(poll);
                    console.log('🔗 startGame: window.game detected during poll, invoking startGame on engine');
                    this.gameEngine = window.game;
                    try {
                        this.gameEngine.startGame(characterData);
                    } catch (err) {
                        console.error('❌ Erro ao iniciar o jogo via window.game:', err);
                        this.showNotification('Erro ao iniciar o jogo. Recarregue a página.', 'warning', 5000);
                    }
                    return;
                }

                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    console.error('❌ startGame: window.game não disponível após timeout');
                    this.showNotification('Não foi possível iniciar o jogo: motor não inicializado. Recarregue a página.', 'warning', 6000);
                    // Fallback visual: mostrar menu principal se existir
                    if (window.mainMenu && typeof window.mainMenu.show === 'function') {
                        try { window.mainMenu.show(); } catch (e) { /* ignore */ }
                    } else {
                        // Tentar exibir interface de jogo como último recurso
                        const gi = document.getElementById('gameInterface');
                        if (gi) gi.style.display = 'block';
                    }
                } else {
                    attempts++;
                }
            }, pollInterval);
        }
        
        // Após completar o startGame, exibir o GameHub
        try {
            setTimeout(() => {
                console.log('🎮 Tentando exibir GameHub após criar personagem...');
                
                // Inicializar GameHub se não existir
                if (typeof window.initGameHub === 'function' && !window.gameHub) {
                    window.initGameHub();
                }
                
                // Mostrar o dashboard
                if (window.gameHub && typeof window.gameHub.show === 'function') {
                    window.gameHub.show();
                    console.log('✅ GameHub exibido com sucesso');
                } else {
                    console.warn('⚠️ GameHub não disponível, exibindo interface padrão');
                    const gi = document.getElementById('gameInterface');
                    if (gi) gi.style.display = 'block';
                }
            }, 1500); // Delay para garantir que o engine já processou
        } catch (err) {
            console.error('❌ Erro ao exibir GameHub:', err);
        }
    }
    
    // Backwards compatibility wrapper
    showNotification(message, type='info', duration=4000) {
        this._notify(message, type, duration);
    }
}

// For backwards compatibility, make the class available globally (no auto-instantiation)
if (typeof window !== 'undefined') {
    window.CharacterCreator = CharacterCreator;
}
