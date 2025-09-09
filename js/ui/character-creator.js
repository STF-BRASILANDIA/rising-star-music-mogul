/**
 * Rising Star: Music Mogul - Mobile Character Creation System
 * Sistema de criação de personagem estilo mobile game
 * Baseado no design de jogos como Star Life Simulator
 * Updated: Skills system with 100 points distribution
 */

export class CharacterCreator {
    constructor(gameEngine) {
        console.log('🎯 CharacterCreator constructor called!', {
            gameEngine: gameEngine,
            timestamp: new Date().toISOString()
        });
        
        this.gameEngine = gameEngine;
        this.currentStep = 1; // Start at step 1 (Profile)
        this.maxSteps = 3; // Profile, Background, Skills
        // 100 pontos totais para distribuir
        this.availablePoints = 100;
        
        // Initialize notification system
        this.initNotificationSystem();
        
        this.locations = ['Estados Unidos', 'Canadá', 'América Latina', 'Reino Unido', 'Europa', 'África', 'Coreia do Sul', 'Japão', 'Oceania'];
        this.roles = ['Cantor(a)', 'Rapper', 'Guitarrista', 'Baterista', 'Tecladista', 'DJ'];
        
        // Background stories
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
        console.log('🔥 CharacterCreator.show() called!', {
            currentStep: this.currentStep,
            initialized: this.initialized,
            timestamp: new Date().toISOString()
        });
        
        const element = document.getElementById('characterCreation');
        console.log('📋 CharacterCreation element found:', {
            element: element,
            display: element ? element.style.display : 'NOT FOUND',
            classes: element ? element.className : 'NOT FOUND'
        });
        
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
    
    // SIMPLIFIED mobile compatible event system
    addMobileCompatibleEvent(element, callback) {
        if (!element) {
            console.log('⚠️ addMobileCompatibleEvent: element is null');
            return;
        }
        
        console.log('🔧 Adding SIMPLIFIED mobile event to:', element.className || element.tagName);
        
        // SINGLE unified event handler
        const handleEvent = (e) => {
            console.log('� Event triggered:', e.type, 'on:', element.className || element.tagName);
            e.preventDefault();
            e.stopPropagation();
            callback();
        };
        
        // Add both events with same handler
        element.addEventListener('click', handleEvent);
        element.addEventListener('touchstart', handleEvent, { passive: false });
        
        console.log('✅ SIMPLIFIED mobile events added');
    }
    
    bindEvents() {
        console.log('📋 Setting up character creator events...');
        
        // TEST: Check if DOM elements exist
        const continueButtons = document.querySelectorAll('.continue-btn');
        console.log(`🔍 Found ${continueButtons.length} continue buttons:`, continueButtons);
        
        // Back buttons - DIRECT binding
        document.querySelectorAll('.back-btn').forEach((btn, index) => {
            btn.onclick = (e) => {
                try {
                    console.log('🔥 BACK BUTTON clicked!', {
                        buttonIndex: index,
                        currentStep: this.currentStep,
                        event: e,
                        target: e.target
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    this.previousStep();
                    console.log('✅ Back button processed successfully');
                } catch (error) {
                    console.error('❌ ERROR in back button:', error);
                }
            };
        });
        
        // Continue buttons - DIRECT binding
        continueButtons.forEach((btn, index) => {
            btn.onclick = (e) => {
                try {
                    console.log('🔥 CONTINUE BUTTON clicked!', {
                        buttonIndex: index,
                        currentStep: this.currentStep,
                        event: e,
                        target: e.target
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    this.nextStep();
                    console.log('✅ Continue button processed successfully');
                } catch (error) {
                    console.error('❌ ERROR in continue button:', error);
                }
            };
        });
        console.log(`✅ Setup complete for ${continueButtons.length} continue buttons`);
        
        // Start game button (skills step)
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            console.log('🔗 Binding start game button:', startGameBtn);
            this.addMobileCompatibleEvent(startGameBtn, () => {
                console.log('🎯 Start game button clicked via addEventListener');
                this.startGame();
            });
        }
        
        // Sex buttons
        console.log('🚻 Setting up sex buttons...');
        const sexButtons = document.querySelectorAll('.sex-btn');
        console.log('🚻 Found', sexButtons.length, 'sex buttons');
        
        if (sexButtons.length === 0) {
            console.error('❌ No sex buttons found! Check HTML structure.');
        }
        
        sexButtons.forEach((btn, index) => {
            const sexValue = btn.dataset.sex;
            console.log(`🚻 Setting up sex button ${index}: "${sexValue}" (${btn.textContent.trim()})`);
            
            if (!sexValue) {
                console.error(`❌ Sex button ${index} missing data-sex attribute!`);
                return;
            }
            
            // DIRECT event binding
            btn.onclick = (e) => {
                try {
                    console.log('🔥 SEX BUTTON clicked!', {
                        sexValue: sexValue,
                        buttonIndex: index,
                        buttonText: btn.textContent.trim(),
                        event: e,
                        target: e.target
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectSex(sexValue);
                    console.log('✅ Sex button processed successfully');
                } catch (error) {
                    console.error('❌ ERROR in sex button:', error);
                }
            };
            
            console.log(`✅ Sex button ${index} setup complete`);
        });
        
        console.log('✅ Sex buttons setup completed');
        
        // Genre select
        const genreSelect = document.getElementById('genreSelect');
        if (genreSelect) {
            genreSelect.addEventListener('change', (e) => {
                this.character.genre = e.target.value;
            });
        }
        
        // Background dropdown
        const backgroundSelect = document.getElementById('backgroundSelect');
        if (backgroundSelect) {
            backgroundSelect.addEventListener('change', (e) => {
                this.selectBackground(e.target.value);
            });
        }
        
        // Input fields
        this.bindInputEvents();
        
        console.log('✅ Events bound successfully');
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
        
        // FORCE character creation container to be visible
        const characterCreation = document.getElementById('characterCreation');
        if (characterCreation) {
            characterCreation.style.display = 'flex';
            characterCreation.style.visibility = 'visible';
            characterCreation.style.opacity = '1';
            console.log(`🔧 Character creation container forced visible`);
        }
        
        // Map step numbers to step IDs
        const stepIds = {
            1: 'profile-step',
            2: 'background-step', 
            3: 'skills-step'
        };
        
        // Hide all steps
        document.querySelectorAll('.creation-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show current step
        const stepId = stepIds[stepNumber];
        const currentStepElement = document.getElementById(stepId);
        if (currentStepElement) {
            currentStepElement.style.display = 'flex';
            currentStepElement.style.visibility = 'visible';
            currentStepElement.style.opacity = '1';
            console.log(`✅ Step ${stepNumber} displayed`);
        } else {
            console.error(`❌ Step ${stepNumber} (${stepId}) element not found!`);
        }
        
        this.currentStep = stepNumber;
        this.updateNavigationButtons();
        
        // Update character info for step 3
        if (stepNumber === 3) {
            this.updateCharacterInfo();
        }
    }
    
    updateNavigationButtons() {
        console.log('🔧 updateNavigationButtons() called for step:', this.currentStep);
        
        // Update back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.style.display = this.currentStep === 1 ? 'none' : 'flex';
        });
        
        // Update continue buttons with SIMPLIFIED event handling
        document.querySelectorAll('.continue-btn').forEach((btn, index) => {
            console.log(`🔧 Configuring continue button ${index} for step ${this.currentStep}`);
            
            // REMOVE all existing event listeners completely
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            if (this.currentStep === 3) {
                console.log('🛑 STEP 3: Setting up start game button');
                newBtn.textContent = 'Começar Jogo';
                
                // SINGLE event handler for step 3
                newBtn.addEventListener('click', (e) => {
                    console.log('🎯 Start Game button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    this.startGame();
                });
                console.log('✅ Step 3 button configured');
            } else {
                console.log(`🔧 Setting up continue button for step ${this.currentStep}`);
                newBtn.textContent = 'Continuar';
                
                // SINGLE event handler for steps 1-2
                newBtn.addEventListener('click', (e) => {
                    console.log(`➡️ Continue button clicked for step ${this.currentStep}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.nextStep();
                });
                console.log(`✅ Step ${this.currentStep} button configured`);
            }
        });
    }
    
    setupLocationSelector() {
        console.log('🗺️ Setting up location selector...');
        
        const locationDisplay = document.querySelector('.location-display');
        const locationLeftArrow = document.getElementById('locationPrev');
        const locationRightArrow = document.getElementById('locationNext');
        const locationCounter = document.querySelector('.location-selector .counter');
        
        if (!this.locations || this.locations.length === 0) {
            console.error('❌ No locations available!');
            return;
        }
        
        // FORCE initialize current index
        if (!this.currentLocationIndex) {
            this.currentLocationIndex = 0;
        }
        
        if (locationDisplay && locationLeftArrow && locationRightArrow && locationCounter) {
            const updateLocationDisplay = () => {
                const newLocation = this.locations[this.currentLocationIndex];
                locationDisplay.textContent = newLocation;
                locationCounter.textContent = `${this.currentLocationIndex + 1}/${this.locations.length}`;
                this.character.location = newLocation;
                console.log('📍 Location updated to:', newLocation);
            };
            
            // DIRECT event binding - no mobile wrapper
            locationLeftArrow.onclick = (e) => {
                try {
                    console.log('🔥 Location LEFT ARROW clicked!', {
                        currentIndex: this.currentLocationIndex,
                        locationsLength: this.locations.length,
                        event: e,
                        target: e.target
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    this.currentLocationIndex = (this.currentLocationIndex - 1 + this.locations.length) % this.locations.length;
                    updateLocationDisplay();
                    console.log('✅ Location LEFT arrow processed successfully');
                } catch (error) {
                    console.error('❌ ERROR in location LEFT arrow:', error);
                }
            };
            
            locationRightArrow.onclick = (e) => {
                try {
                    console.log('🔥 Location RIGHT ARROW clicked!', {
                        currentIndex: this.currentLocationIndex,
                        locationsLength: this.locations.length,
                        event: e,
                        target: e.target
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    this.currentLocationIndex = (this.currentLocationIndex + 1) % this.locations.length;
                    updateLocationDisplay();
                    console.log('✅ Location RIGHT arrow processed successfully');
                } catch (error) {
                    console.error('❌ ERROR in location RIGHT arrow:', error);
                }
            };
            
            // Initialize display
            updateLocationDisplay();
            console.log('✅ Location selector setup complete');
        } else {
            console.error('❌ Location selector elements missing');
        }
    }
    
    setupRoleSelector() {
        console.log('🎭 Setting up role selector...');
        
        const roleDisplay = document.querySelector('.role-display');
        const roleLeftArrow = document.getElementById('rolePrev');
        const roleRightArrow = document.getElementById('roleNext');
        const roleCounter = document.querySelector('.role-selector .counter');
        
        if (!this.roles || this.roles.length === 0) {
            console.error('❌ No roles available!');
            return;
        }
        
        // FORCE initialize current index
        if (!this.currentRoleIndex) {
            this.currentRoleIndex = 0;
        }
        
        if (roleDisplay && roleLeftArrow && roleRightArrow && roleCounter) {
            const updateRoleDisplay = () => {
                const newRole = this.roles[this.currentRoleIndex];
                roleDisplay.textContent = newRole;
                roleCounter.textContent = `${this.currentRoleIndex + 1}/${this.roles.length}`;
                this.character.role = newRole;
                console.log('🎭 Role updated to:', newRole);
            };
            
            // DIRECT event binding
            roleLeftArrow.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('⬅️ Role PREV clicked');
                this.currentRoleIndex = (this.currentRoleIndex - 1 + this.roles.length) % this.roles.length;
                updateRoleDisplay();
            };
            
            roleRightArrow.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Role NEXT clicked');
                this.currentRoleIndex = (this.currentRoleIndex + 1) % this.roles.length;
                updateRoleDisplay();
            };
            
            // Initialize display
            updateRoleDisplay();
            console.log('✅ Role selector setup complete');
        } else {
            console.error('❌ Role selector elements missing');
        }
    }
    
    setupAgeSelector() {
        console.log('🎂 Setting up age selector...');
        
        const ageDisplay = document.querySelector('.age-display');
        const ageLeftArrow = document.getElementById('agePrev');
        const ageRightArrow = document.getElementById('ageNext');
        
        if (ageDisplay && ageLeftArrow && ageRightArrow) {
            const updateAgeDisplay = () => {
                ageDisplay.textContent = this.character.age + ' anos';
                console.log('📅 Age updated to:', this.character.age);
            };
            
            // DIRECT event binding
            ageLeftArrow.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('⬅️ Age PREV clicked');
                if (this.character.age > 14) {
                    this.character.age--;
                    updateAgeDisplay();
                }
            };
            
            ageRightArrow.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Age NEXT clicked');
                if (this.character.age < 100) {
                    this.character.age++;
                    updateAgeDisplay();
                }
            };
            
            // Initialize display
            updateAgeDisplay();
            console.log('✅ Age selector setup complete');
        } else {
            console.error('❌ Age selector elements missing');
        }
    }
    
    selectSex(sex) {
        console.log('🚻 selectSex called with:', sex);
        console.log('🚻 Previous sex value:', this.character.sex);
        
        this.character.sex = sex;
        console.log('🚻 Sex updated to:', this.character.sex);
        
        // Update button states with improved logging
        const sexButtons = document.querySelectorAll('.sex-btn');
        console.log('🔍 Found', sexButtons.length, 'sex buttons');
        
        sexButtons.forEach((btn, index) => {
            const btnSex = btn.dataset.sex;
            console.log(`🔧 Processing button ${index}: dataset.sex="${btnSex}", target="${sex}"`);
            
            btn.classList.remove('active');
            if (btnSex === sex) {
                btn.classList.add('active');
                console.log(`✅ Button ${index} activated for sex: ${sex}`);
            } else {
                console.log(`➖ Button ${index} deactivated (${btnSex} !== ${sex})`);
            }
        });
        
        console.log('✅ Sex selection completed:', this.character.sex);
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
                // DIRECT event binding
                minusBtn.onclick = (e) => {
                    try {
                        console.log('🔥 SKILL MINUS clicked!', {
                            skillName: skillName,
                            currentValue: this.character.skills[skillName],
                            availablePoints: this.availablePoints,
                            event: e,
                            target: e.target
                        });
                        e.preventDefault();
                        e.stopPropagation();
                        this.decreaseSkill(skillName);
                        console.log('✅ Skill minus processed successfully');
                    } catch (error) {
                        console.error('❌ ERROR in skill minus:', error);
                    }
                };
                
                plusBtn.onclick = (e) => {
                    try {
                        console.log('🔥 SKILL PLUS clicked!', {
                            skillName: skillName,
                            currentValue: this.character.skills[skillName],
                            availablePoints: this.availablePoints,
                            event: e,
                            target: e.target
                        });
                        e.preventDefault();
                        e.stopPropagation();
                        this.increaseSkill(skillName);
                        console.log('✅ Skill plus processed successfully');
                    } catch (error) {
                        console.error('❌ ERROR in skill plus:', error);
                    }
                };
                
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
        
        // SIMPLIFIED: Block step 3 progression completely
        if (this.currentStep === 3) {
            console.log('🛑 Step 3 - Use "Começar Jogo" button');
            this.showNotification('Use o botão "Começar Jogo" para iniciar!', 'info');
            return;
        }
        
        // SIMPLIFIED: Normal progression for steps 1 & 2
        const isValid = this.validateCurrentStep();
        if (isValid && this.currentStep < this.maxSteps) {
            this.currentStep++;
            console.log(`✅ Moving to step ${this.currentStep}`);
            this.showStep(this.currentStep);
        } else if (!isValid) {
            console.log(`❌ Step ${this.currentStep} validation failed`);
        }
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
            console.log('⛔ Step 3 validation is COMPLETELY DISABLED');
            console.log('🎯 User must manually click "Começar Jogo" button');
            return false; // ALWAYS false for step 3
        }
        
        // FORCE DOM synchronization before validation
        this.syncCharacterWithDOM();
        
        switch (this.currentStep) {
            case 1: // Profile
                console.log('📝 Checking profile fields...');
                console.log('firstName:', this.character.firstName);
                console.log('lastName:', this.character.lastName);
                console.log('artistName:', this.character.artistName);
                console.log('genre:', this.character.genre);
                
                if (!this.character.firstName?.trim()) {
                    console.log('❌ First name validation failed');
                    this.showNotification('Por favor, insira seu primeiro nome.', 'warning');
                    return false;
                }
                if (!this.character.lastName?.trim()) {
                    console.log('❌ Last name validation failed');
                    this.showNotification('Por favor, insira seu sobrenome.', 'warning');
                    return false;
                }
                if (!this.character.artistName?.trim()) {
                    console.log('❌ Artist name validation failed');
                    this.showNotification('Por favor, insira seu nome artístico.', 'warning');
                    return false;
                }
                if (!this.character.genre) {
                    console.log('❌ Genre validation failed');
                    this.showNotification('Por favor, selecione um gênero musical.', 'warning');
                    return false;
                }
                console.log('✅ Profile validation passed');
                return true;
                
            case 2: // Background
                console.log('🎭 Checking background...');
                console.log('backgroundStory:', this.character.backgroundStory);
                console.log('location:', this.character.location);
                console.log('role:', this.character.role);
                console.log('age:', this.character.age);
                
                if (!this.character.backgroundStory) {
                    console.log('❌ Background validation failed');
                    this.showNotification('Por favor, selecione uma história de fundo.', 'warning');
                    return false;
                }
                if (!this.character.location) {
                    console.log('❌ Location validation failed');
                    this.showNotification('Por favor, selecione uma localização.', 'warning');
                    return false;
                }
                if (!this.character.role) {
                    console.log('❌ Role validation failed');
                    this.showNotification('Por favor, selecione um papel na banda.', 'warning');
                    return false;
                }
                if (!this.character.age) {
                    console.log('❌ Age validation failed');
                    this.showNotification('Por favor, selecione uma idade.', 'warning');
                    return false;
                }
                console.log('✅ Background validation passed');
                return true;
                
            default:
                console.log('✅ Default validation passed');
                return true;
        }
    }
    
    // NEW METHOD: Force DOM synchronization
    syncCharacterWithDOM() {
        console.log('🔄 Syncing character with DOM...');
        
        // Profile fields
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const artistNameInput = document.getElementById('artistName');
        const genreSelectInput = document.getElementById('genreSelect');
        const bandNameInput = document.getElementById('bandName');
        
        if (firstNameInput?.value) {
            this.character.firstName = firstNameInput.value;
        }
        if (lastNameInput?.value) {
            this.character.lastName = lastNameInput.value;
        }
        if (artistNameInput?.value) {
            this.character.artistName = artistNameInput.value;
        }
        if (genreSelectInput?.value) {
            this.character.genre = genreSelectInput.value;
        }
        if (bandNameInput?.value) {
            this.character.bandName = bandNameInput.value;
        }
        
        // Background fields
        const backgroundSelectInput = document.getElementById('backgroundSelect');
        if (backgroundSelectInput?.value) {
            const backgroundIndex = parseInt(backgroundSelectInput.value);
            const background = this.backgroundStories[backgroundIndex];
            if (background) {
                this.character.backgroundStory = background;
                this.character.backgroundBonuses = background.stats;
            }
        }
        
        // Display values (location, role, age)
        const locationDisplay = document.querySelector('.location-display');
        const roleDisplay = document.querySelector('.role-display');
        const ageDisplay = document.querySelector('.age-display');
        
        if (locationDisplay?.textContent && !locationDisplay.textContent.includes('Selecione')) {
            this.character.location = locationDisplay.textContent;
        }
        if (roleDisplay?.textContent && !roleDisplay.textContent.includes('Selecione')) {
            this.character.role = roleDisplay.textContent;
        }
        if (ageDisplay?.textContent) {
            const ageMatch = ageDisplay.textContent.match(/(\d+)/);
            if (ageMatch) {
                this.character.age = parseInt(ageMatch[1]);
            }
        }
        
        console.log('✅ DOM sync completed');
    }
    
    startGame() {
        console.log('🚨 startGame() called');
        console.log('🚨 Current step:', this.currentStep);
        console.log('� Stack trace:', new Error().stack);
        
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
        
        if (this.gameEngine) {
            this.gameEngine.startGame(characterData);
        }
    }
    
    // ===== NOTIFICATION SYSTEM ===== (Updated)
    initNotificationSystem() {
        console.log('🔔 Initializing notification system');
        // Ensure notification container exists
        let container = document.getElementById('notificationContainer');
        if (!container) {
            console.log('📦 Creating notification container');
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        console.log('✅ Notification container ready:', container);
    }
    
    showNotification(message, type = 'error', duration = 4000) {
        console.log(`🔔 Showing notification: "${message}" (type: ${type})`);
        const container = document.getElementById('notificationContainer');
        if (!container) {
            console.error('❌ Notification container not found!');
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`; // Add show class immediately
        notification.textContent = message;
        
        // Check if mobile
        const isMobile = window.innerWidth <= 768;
        
        // Force initial styles for visibility
        let baseStyles = `
            position: relative !important;
            background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%) !important;
            color: white !important;
            padding: 16px 20px !important;
            border-radius: 12px !important;
            margin-bottom: 12px !important;
            opacity: 1 !important;
            display: block !important;
            z-index: 999999 !important;
            box-sizing: border-box !important;
        `;
        
        if (isMobile) {
            baseStyles += `
                transform: translateY(0) !important;
                width: 100% !important;
                max-width: none !important;
            `;
        } else {
            baseStyles += `
                transform: translateX(0) !important;
                max-width: 350px !important;
            `;
        }
        
        notification.style.cssText = baseStyles;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #2ed573 0%, #1e90ff 100%) !important';
        } else if (type === 'warning') {
            notification.style.background = 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%) !important';
        } else if (type === 'info') {
            notification.style.background = 'linear-gradient(135deg, #5352ed 0%, #3742fa 100%) !important';
        }
        
        console.log('📦 Created notification element:', notification);
        console.log('📱 Mobile detected:', isMobile);
        
        // Add to container
        container.appendChild(notification);
        console.log('📌 Added notification to container');
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
                console.log('🗑️ Notification removed');
            }
        }, duration);
        
        // Click to close
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
                console.log('👆 Notification closed by click');
            }
        });
    }
}

// For backwards compatibility, also make it available globally
if (typeof window !== 'undefined') {
    window.CharacterCreator = CharacterCreator;
}

// Global initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎭 CharacterCreator DOM ready - initializing...');
    
    // Wait for game engine to be available
    const initCharacterCreator = () => {
        console.log('🎭 Creating CharacterCreator instance...');
        window.characterCreator = new CharacterCreator();
        console.log('✅ CharacterCreator initialized globally as window.characterCreator');
    };
    
    // Check if game engine exists, if not wait a bit
    if (window.game && window.game.systems) {
        initCharacterCreator();
    } else {
        console.log('⏳ Waiting for game engine...');
        setTimeout(() => {
            initCharacterCreator();
        }, 500);
    }
});
