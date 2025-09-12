/**
 * 🧪 DADOS DE TESTE PARA MODAIS DE NOTIFICAÇÕES
 * Exemplos realistas baseados no sistema de notificações do jogo
 */

class NotificationTestData {
    constructor() {
        this.sampleNews = this.generateSampleNews();
        this.sampleMessages = this.generateSampleMessages();
        this.sampleEvents = this.generateSampleEvents();
        this.sampleAchievements = this.generateSampleAchievements();
    }

    /**
     * 📰 Dados de exemplo para notícias
     */
    generateSampleNews() {
        return [
            {
                id: 'news-001',
                source: 'Billboard News',
                title: 'Streaming alcança números recordes em 2025',
                summary: 'O streaming musical atingiu 2.1 trilhões de reproduções globalmente no primeiro semestre, representando um crescimento de 15% em relação ao ano anterior.',
                timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 horas atrás
                featured: true,
                fullArticle: `
                    <p>O mercado de streaming musical continua sua trajetória ascendente, com dados divulgados hoje mostrando que as plataformas digitais registraram 2.1 trilhões de reproduções no primeiro semestre de 2025.</p>
                    
                    <p>Este crescimento de 15% em relação ao mesmo período do ano anterior demonstra a consolidação do streaming como principal meio de consumo musical, superando inclusive as projeções mais otimistas da indústria.</p>
                    
                    <h4>Principais Destaques:</h4>
                    <ul>
                        <li>Hip-hop lidera com 35% das reproduções totais</li>
                        <li>Pop mantém 28% do market share</li>
                        <li>Música latina cresce 40% comparado a 2024</li>
                        <li>Podcasts musicais aumentaram 65%</li>
                    </ul>
                    
                    <p>Para artistas independentes, estes números representam oportunidades sem precedentes de alcançar audiências globais sem depender de grandes gravadoras.</p>
                `,
                impact: {
                    fama: +5,
                    oportunidades: ['streaming_boost', 'label_interest']
                }
            },
            {
                id: 'news-002',
                source: 'Pitchfork Reviews',
                title: 'Novo álbum de The Midnight redefine synthwave',
                summary: 'A dupla eletrônica lança "Neon Dreams" com uma abordagem inovadora que combina nostalgia 80s com produção contemporânea, recebendo nota 8.5/10.',
                timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 horas atrás
                featured: false,
                fullArticle: `
                    <p>The Midnight retorna com "Neon Dreams", um trabalho que consolida a dupla como pioneira na evolução do synthwave moderno.</p>
                    
                    <p>O álbum apresenta 12 faixas que navegam entre a melancolia nostálgica característica do duo e experimentações que empurram o gênero para territórios inexplorados.</p>
                    
                    <blockquote>"É synthwave para uma nova geração, que cresce com a nostalgia dos seus pais mas vive no presente digital." - Crítico Pitchfork</blockquote>
                `,
                impact: {
                    inspiracao: +3,
                    genero_interesse: 'synthwave'
                }
            },
            {
                id: 'news-003',
                source: 'Forbes Music Mogul',
                title: 'Artistas independentes faturam $4.2 bilhões em 2025',
                summary: 'Relatório exclusivo mostra como músicos sem contratos com major labels estão dominando o mercado digital e construindo impérios financeiros próprios.',
                timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 dia atrás
                featured: true,
                fullArticle: `
                    <p>O mercado de música independente atingiu a marca histórica de $4.2 bilhões em receitas durante o primeiro semestre de 2025, segundo dados exclusivos compilados pela Forbes.</p>
                    
                    <p>Este crescimento exponencial é alimentado por artistas que optaram por manter controle total sobre sua música, utilizando plataformas de distribuição digital e estratégias de marketing direto ao consumidor.</p>
                    
                    <h4>Top 5 Estratégias de Sucesso:</h4>
                    <ol>
                        <li>Engajamento direto nas redes sociais</li>
                        <li>Parcerias com marcas alinhadas ao público</li>
                        <li>Merchandising exclusivo e limitado</li>
                        <li>Experiências virtuais personalizadas</li>
                        <li>Diversificação em múltiplas plataformas</li>
                    </ol>
                `,
                impact: {
                    motivacao: +10,
                    business_insights: true
                }
            }
        ];
    }

    /**
     * 💼 Dados de exemplo para mensagens
     */
    generateSampleMessages() {
        return [
            {
                id: 'msg-001',
                sender: 'Atlantic Records',
                senderType: 'Gravadora',
                subject: 'Proposta de Contrato - Oportunidade Exclusiva',
                message: 'Ficamos impressionados com seu trabalho recente e gostaríamos de discutir uma parceria estratégica. Nossa proposta inclui suporte completo para produção, marketing e distribuição mundial.',
                timestamp: Date.now() - (30 * 60 * 1000), // 30 minutos atrás
                urgent: true,
                offer: {
                    royalties: 15,
                    advance: 250000,
                    duration: '3 anos + 2 opcionais'
                },
                actions: [
                    { action: 'accept', label: 'Aceitar Proposta', type: 'success', icon: 'check' },
                    { action: 'counter', label: 'Contra-Proposta', type: 'primary', icon: 'handshake' },
                    { action: 'decline', label: 'Recusar', type: 'danger', icon: 'times' },
                    { action: 'schedule', label: 'Agendar Reunião', type: 'secondary', icon: 'calendar' }
                ]
            },
            {
                id: 'msg-002',
                sender: 'Sarah Mitchell - Artist Manager',
                senderType: 'Agente/Manager',
                subject: 'Feedback sobre Demo "Neon Lights"',
                message: 'Ouvi sua nova demo e acredito que tem potencial comercial incrível. Sugiro algumas mudanças na produção e podemos começar a preparar um plano de lançamento estratégico para Q4.',
                timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 horas atrás
                urgent: false,
                actions: [
                    { action: 'reply', label: 'Responder', type: 'primary', icon: 'reply' },
                    { action: 'schedule_call', label: 'Agendar Ligação', type: 'secondary', icon: 'phone' },
                    { action: 'request_details', label: 'Solicitar Detalhes', type: 'secondary', icon: 'info-circle' }
                ]
            },
            {
                id: 'msg-003',
                sender: 'MegaBrand Entertainment',
                senderType: 'Parceiro de Negócios',
                subject: 'Oportunidade de Parceria - Campanha Global',
                message: 'Estamos lançando uma campanha mundial e seu perfil artístico se alinha perfeitamente com nossa visão. A parceria incluiria uso da música em comerciais, eventos exclusivos e royalties significativos.',
                timestamp: Date.now() - (4 * 60 * 60 * 1000), // 4 horas atrás
                urgent: false,
                offer: {
                    payment: 150000,
                    royalties: 8,
                    duration: '18 meses'
                },
                actions: [
                    { action: 'accept', label: 'Aceitar', type: 'success', icon: 'check' },
                    { action: 'negotiate', label: 'Negociar', type: 'primary', icon: 'handshake' },
                    { action: 'decline', label: 'Recusar', type: 'danger', icon: 'times' },
                    { action: 'more_info', label: 'Mais Informações', type: 'secondary', icon: 'info' }
                ]
            }
        ];
    }

    /**
     * 🎭 Dados de exemplo para eventos
     */
    generateSampleEvents() {
        return [
            {
                id: 'event-001',
                eventName: 'Rock in Rio Festival 2025',
                organizer: 'Rock in Rio Productions',
                description: 'Convite para se apresentar no maior festival de música da América Latina. Show de 45 minutos no Palco Mundo para uma audiência estimada de 100,000 pessoas.',
                date: '15 de Setembro, 2025',
                location: 'Rio de Janeiro, Brasil',
                type: 'Festival Internacional',
                payment: 180000,
                timestamp: Date.now() - (1 * 60 * 60 * 1000), // 1 hora atrás
                requirements: [
                    'Apresentação de 45 minutos',
                    'Som próprio (será fornecido)',
                    'Disponibilidade para ensaio técnico no dia anterior',
                    'Presença em coletiva de imprensa'
                ]
            },
            {
                id: 'event-002',
                eventName: 'Grammy Awards 2025 - Indicação',
                organizer: 'Recording Academy',
                description: 'Parabéns! Você foi indicado na categoria "Best New Artist" do Grammy Awards 2025. A cerimônia acontecerá em Los Angeles com transmissão mundial.',
                date: '31 de Janeiro, 2025',
                location: 'Los Angeles, CA - Crypto.com Arena',
                type: 'Indicação/Premiação',
                payment: null,
                timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 horas atrás
                requirements: [
                    'Confirmação de presença até 15/01',
                    'Performance de 3 minutos (opcional)',
                    'Disponibilidade para red carpet',
                    'Entrevistas pré e pós evento'
                ]
            },
            {
                id: 'event-003',
                eventName: 'Colaboração com DJ Snake',
                organizer: 'Premiere Classe Records',
                description: 'DJ Snake está procurando vocalists para seu próximo álbum. Sua voz foi especificamente solicitada para a faixa principal. Sessão de gravação agendada para próxima semana.',
                date: '20-22 de Setembro, 2025',
                location: 'Abbey Road Studios, London',
                type: 'Colaboração Musical',
                payment: 75000,
                timestamp: Date.now() - (3 * 60 * 60 * 1000), // 3 horas atrás
                requirements: [
                    'Disponibilidade por 3 dias consecutivos',
                    'Vocal range: A2 - E5',
                    'Experiência em música eletrônica (desejável)',
                    'Flexibilidade criativa para experimentação'
                ]
            }
        ];
    }

    /**
     * 🏆 Dados de exemplo para conquistas
     */
    generateSampleAchievements() {
        return [
            {
                id: 'achievement-001',
                title: 'Seu Single Atingiu #1 na Billboard Hot 100!',
                description: 'Parabéns! "Midnight Vibes" acaba de alcançar o primeiro lugar na Billboard Hot 100, uma conquista histórica que marca sua entrada definitiva no mainstream musical.',
                timestamp: Date.now() - (15 * 60 * 1000), // 15 minutos atrás
                stats: {
                    'Streams': '50M+',
                    'Downloads': '2.1M',
                    'Radio Plays': '15.8K',
                    'Chart Position': '#1'
                },
                rewards: [
                    'Desbloqueado: Status "Chart Topper"',
                    'Bonus de Fama: +1000 pontos',
                    'Nova oportunidade: Tour Mundial disponível',
                    'Aumento de royalties: +5% em futuros contratos'
                ]
            },
            {
                id: 'achievement-002',
                title: 'Certificação Platina Alcançada!',
                description: 'Seu álbum "Digital Dreams" foi oficialmente certificado Platina pela RIAA, com mais de 1 milhão de unidades vendidas nos Estados Unidos.',
                timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 horas atrás
                stats: {
                    'Vendas US': '1.2M',
                    'Vendas Global': '3.8M',
                    'Tempo no Chart': '28 sem',
                    'Peak Position': '#3'
                },
                rewards: [
                    'Placa Platina desbloqueada',
                    'Bonus financeiro: $500,000',
                    'Credibilidade da indústria: +50 pontos',
                    'Acesso a estúdios premium desbloqueado'
                ]
            },
            {
                id: 'achievement-003',
                title: '1 Milhão de Seguidores no Spotify!',
                description: 'Você acaba de cruzar a marca histórica de 1 milhão de seguidores mensais no Spotify, consolidando sua base de fãs global.',
                timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 horas atrás
                stats: {
                    'Seguidores': '1.02M',
                    'Crescimento': '+45%',
                    'Top Country': 'Brasil',
                    'Playlist Adds': '850K'
                },
                rewards: [
                    'Badge "Spotify Million" desbloqueado',
                    'Acesso ao Spotify for Artists Premium',
                    'Oportunidade de playlist oficial',
                    'Analytics detalhados desbloqueados'
                ]
            }
        ];
    }

    /**
     * Métodos para teste dos modais
     */
    testNewsModal() {
        const news = this.sampleNews[0];
        window.notificationModals.openNewsModal(news);
    }

    testMessageModal() {
        const message = this.sampleMessages[0];
        window.notificationModals.openMessageModal(message);
    }

    testEventModal() {
        const event = this.sampleEvents[0];
        window.notificationModals.openEventModal(event);
    }

    testAchievementModal() {
        const achievement = this.sampleAchievements[0];
        window.notificationModals.openAchievementModal(achievement);
    }

    /**
     * 🧪 Funções de teste para botões
     */
    testNewsModal() {
        console.log('🧪 Testando Modal de Notícias...');
        if (window.notificationModals) {
            window.notificationModals.openNewsModal(this.sampleNews[0]);
        } else {
            console.error('❌ notificationModals não encontrado');
        }
    }

    testMessageModal() {
        console.log('🧪 Testando Modal de Mensagens...');
        if (window.notificationModals) {
            window.notificationModals.openMessageModal(this.sampleMessages[0]);
        } else {
            console.error('❌ notificationModals não encontrado');
        }
    }

    testEventModal() {
        console.log('🧪 Testando Modal de Eventos...');
        if (window.notificationModals) {
            window.notificationModals.openEventModal(this.sampleEvents[0]);
        } else {
            console.error('❌ notificationModals não encontrado');
        }
    }

    testAchievementModal() {
        console.log('🧪 Testando Modal de Conquistas...');
        if (window.notificationModals) {
            window.notificationModals.openAchievementModal(this.sampleAchievements[0]);
        } else {
            console.error('❌ notificationModals não encontrado');
        }
    }

    testAllModals() {
        // Demonstra todos os tipos de modal
        setTimeout(() => this.testNewsModal(), 500);
        setTimeout(() => this.testMessageModal(), 1500);
        setTimeout(() => this.testEventModal(), 2500);
        setTimeout(() => this.testAchievementModal(), 3500);
    }
}

// Instância global para testes - inicializada após outros sistemas
function initNotificationTestData() {
    window.notificationTestData = new NotificationTestData();
    console.log('🧪 Notification Test Data carregado');
}

// Inicializar após DOM ready
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(initNotificationTestData, 100);
});

// Fallback para inicialização imediata
if (document.readyState !== 'loading') {
    setTimeout(initNotificationTestData, 100);
}

// Para compatibilidade
window.NotificationTestData = NotificationTestData;