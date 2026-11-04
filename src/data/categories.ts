export type Lang = 'en' | 'ru';
export type Localized<T = string> = Record<Lang, T>;

export type CategoryId =
  | 'sales'
  | 'video'
  | 'voice'
  | 'realestate'
  | 'healthcare'
  | 'workflow'
  | 'ecommerce'
  | 'enterprise'
  | 'geo';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Category {
  id: CategoryId;
  slug: Localized;
  title: Localized;
  short: Localized;
  focus: Localized;
  intro: Localized;
  accent: 'cyan' | 'violet' | 'emerald';
  /** Calculator inputs: base setup cost range for an SMB (11–50 seats). */
  cost: { usd: [number, number]; rub: [number, number] };
  /** Typical hours saved per affected employee per month. */
  hoursPerSeat: number;
  /** Keywords that populate `knowsAbout` on the category JSON-LD. */
  keywords: string[];
  faq: (year: number) => Localized<FaqItem[]>;
}

export const categories: Category[] = [
  {
    id: 'sales',
    slug: { en: 'ai-sales-crm-agents', ru: 'ii-agenty-dlya-prodazh-i-crm' },
    title: { en: 'AI Sales Agents & CRM Automation', ru: 'ИИ-агенты для отделов продаж и CRM' },
    short: {
      en: 'AI SDRs, call QA, lead scoring and HubSpot / Salesforce / AmoCRM / Bitrix24 automation.',
      ru: 'ИИ-SDR, ИИ-РОП (контроль звонков), скоринг лидов и автоматизация AmoCRM, Bitrix24, HubSpot.',
    },
    focus: {
      en: 'AI SDRs, AI sales-manager call QA, AmoCRM, Bitrix24, HubSpot, Salesforce automation.',
      ru: 'ИИ-SDR, ИИ-РОП (контроль звонков), AmoCRM, Bitrix24, HubSpot, Salesforce.',
    },
    intro: {
      en: 'Verified teams that deploy autonomous AI sales development reps, conversation-intelligence agents and CRM copilots. Ranked by public case studies, stack depth and verified web presence.',
      ru: 'Проверенные команды, которые внедряют автономных ИИ-SDR, ИИ-РОП для контроля звонков и ИИ-копилотов в CRM. Рейтинг строится по публичным кейсам, глубине стека и проверенному присутствию в сети.',
    },
    accent: 'cyan',
    cost: { usd: [4000, 25000], rub: [250000, 1500000] },
    hoursPerSeat: 22,
    keywords: ['AI SDR', 'CRM automation', 'HubSpot', 'Salesforce', 'AmoCRM', 'Bitrix24', 'Lead qualification', 'Call QA'],
    faq: (y) => ({
      en: [
        { q: `How much does it cost to implement an AI sales agent in ${y}?`, a: `In ${y} a production AI SDR or CRM agent typically costs $4,000–$25,000 for setup plus $300–$3,000/month for LLM, telephony and CRM API usage. Enterprise Salesforce rollouts with custom guardrails start around $40,000.` },
        { q: 'Which CRMs do AI sales agents integrate with?', a: 'The verified agencies in this index integrate with HubSpot, Salesforce, Pipedrive, AmoCRM and Bitrix24 via native APIs, n8n or Make, writing call summaries, deal stages and next actions back into the CRM automatically.' },
        { q: 'How fast does an AI SDR pay back?', a: 'Most teams report payback within 1–3 months: AI SDRs work 24/7, respond to inbound leads in seconds and remove 15–25 hours of manual CRM data entry per rep each month.' },
        { q: 'How are AI sales agencies ranked on AITopIndex?', a: 'Each listing is scored on verified website and HQ, public case studies, depth of the deployed tech stack, number of supported AI agent types and editorial review. No listing is paid placement.' },
      ],
      ru: [
        { q: `Сколько стоит внедрение ИИ-агента для продаж в ${y} году?`, a: `В ${y} году запуск ИИ-SDR или ИИ-РОП обходится в среднем от 250 000 до 1 500 000 ₽ за внедрение плюс 20 000–200 000 ₽ в месяц на LLM, телефонию и API CRM. Крупные проекты с собственными моделями — от 3 млн ₽.` },
        { q: 'С какими CRM работают ИИ-агенты для продаж?', a: 'Агентства из рейтинга интегрируются с AmoCRM, Bitrix24, RetailCRM, HubSpot и Salesforce через API, n8n, Make или Albato: саммари звонков, этапы сделок и задачи записываются в CRM автоматически.' },
        { q: 'Что такое ИИ-РОП и как он контролирует звонки?', a: 'ИИ-РОП транскрибирует 100% звонков, оценивает их по чек-листу скрипта, находит упущенные сделки и отправляет руководителю отчёт — вместо выборочного прослушивания 3–5% разговоров.' },
        { q: 'Как формируется рейтинг агентств на AITopIndex?', a: 'Оценка учитывает проверенный сайт и город, публичные кейсы, глубину технологического стека, количество типов внедряемых ИИ-агентов и редакционную проверку. Платных мест в рейтинге нет.' },
      ],
    }),
  },
  {
    id: 'video',
    slug: { en: 'ai-video-film-production', ru: 'ii-video-reklama-i-kino' },
    title: { en: 'AI Video, Commercials & Film Studios', ru: 'ИИ-видеопродакшн, реклама и кино' },
    short: {
      en: 'AI commercials, trailers, digital avatars and generative VFX with Runway, Sora, Kling, HeyGen.',
      ru: 'ИИ-реклама, трейлеры, цифровые аватары и генеративная графика: Runway, Sora, Kling, HeyGen.',
    },
    focus: {
      en: 'Commercials, AI trailers, digital avatars, Runway, Sora, Kling, HeyGen, ElevenLabs.',
      ru: 'Реклама, ИИ-трейлеры, цифровые аватары, Runway, Sora, Kling, HeyGen, ElevenLabs.',
    },
    intro: {
      en: 'Generative-AI film studios, avatar platforms and VFX teams producing broadcast-grade commercials, music videos, trailers and multilingual avatar content.',
      ru: 'Студии генеративного кино, платформы цифровых аватаров и VFX-команды, которые производят рекламу, клипы, трейлеры и мультиязычный контент с ИИ-аватарами.',
    },
    accent: 'violet',
    cost: { usd: [3000, 60000], rub: [150000, 4000000] },
    hoursPerSeat: 30,
    keywords: ['AI video production', 'Generative VFX', 'Runway', 'Sora', 'Kling', 'HeyGen', 'Digital avatars', 'AI commercials'],
    faq: (y) => ({
      en: [
        { q: `How much does an AI commercial cost in ${y}?`, a: `In ${y} a 30–60 second AI-generated commercial typically costs $3,000–$60,000 depending on creative direction, number of shots, character consistency and licensed voice/music. That is often 50–80% cheaper than a comparable live-action shoot.` },
        { q: 'Which tools do AI film studios use?', a: 'Leading studios combine Runway, Sora, Kling, Luma and Veo for video generation, Midjourney or Flux for keyframes, ElevenLabs for voice, and traditional compositing in Nuke, After Effects or DaVinci Resolve.' },
        { q: 'Can AI video be used in broadcast and paid ads?', a: 'Yes. Studios in this index deliver broadcast-ready masters, but you should confirm model licensing terms, likeness rights for avatars and disclosure rules for each ad platform and market.' },
        { q: 'How long does AI video production take?', a: 'A short commercial usually takes 1–4 weeks from script to final master; avatar-based training or localization videos can be produced in days.' },
      ],
      ru: [
        { q: `Сколько стоит ИИ-рекламный ролик в ${y} году?`, a: `В ${y} году ролик 30–60 секунд, созданный с ИИ, стоит в среднем от 150 000 до 4 000 000 ₽ в зависимости от сценария, числа сцен, консистентности персонажей и лицензий на голос и музыку — на 50–80% дешевле классической съёмки.` },
        { q: 'Какие нейросети используют ИИ-продакшн студии?', a: 'Runway, Sora, Kling, Luma и Veo для генерации видео, Midjourney/Flux/Kandinsky для ключевых кадров, ElevenLabs для голоса и классический композитинг в Nuke, After Effects или DaVinci Resolve.' },
        { q: 'Можно ли использовать ИИ-видео в ТВ-рекламе?', a: 'Да, студии из рейтинга сдают мастер-копии вещательного качества. Важно проверить лицензии моделей, права на внешность аватаров и требования маркировки рекламы.' },
        { q: 'Сколько длится производство ИИ-ролика?', a: 'Короткий рекламный ролик — 1–4 недели от сценария до мастер-копии; обучающие и локализованные видео с аватарами — несколько дней.' },
      ],
    }),
  },
  {
    id: 'voice',
    slug: { en: 'ai-voice-call-agents', ru: 'golosovye-ii-roboty-i-koll-centry' },
    title: { en: 'AI Voice Agents & Call Center Automation', ru: 'Голосовые ИИ-роботы и телефония' },
    short: {
      en: 'Inbound/outbound voice bots on Vapi, Bland, Retell with <500ms latency and CRM handoff.',
      ru: 'Входящие и исходящие голосовые роботы, интеграция с Sipuni, Mango и CRM, задержка <500 мс.',
    },
    focus: {
      en: 'Inbound/outbound voice bots, Vapi, Bland AI, Retell, Twilio, sub-500ms latency agents.',
      ru: 'Входящие/исходящие роботы, Vapi, Bland AI, Retell, Sipuni, Mango Office, задержка <500 мс.',
    },
    intro: {
      en: 'Voice-AI platforms and integrators that build human-sounding phone agents for reception, qualification, collections and support — with real-time CRM and calendar actions.',
      ru: 'Платформы и интеграторы голосового ИИ: роботы для ресепшена, квалификации, напоминаний, взыскания и поддержки с записью результатов в CRM и календарь в реальном времени.',
    },
    accent: 'emerald',
    cost: { usd: [3000, 30000], rub: [200000, 2000000] },
    hoursPerSeat: 60,
    keywords: ['Voice AI', 'Vapi', 'Bland AI', 'Retell AI', 'Call center automation', 'IVR replacement', 'Outbound calling', 'Twilio'],
    faq: (y) => ({
      en: [
        { q: `How much does an AI voice agent cost in ${y}?`, a: `In ${y} a custom AI voice agent costs $3,000–$30,000 to build and integrate, plus usage of roughly $0.05–$0.20 per minute for telephony, speech-to-text, LLM and text-to-speech.` },
        { q: 'What latency is acceptable for a voice AI agent?', a: 'Natural conversation requires end-to-end response latency under ~500–800ms. Platforms such as Vapi, Retell and Bland AI are optimized for sub-second turn-taking with interruption handling.' },
        { q: 'Can AI voice agents replace a call center?', a: 'They typically automate 40–80% of repetitive inbound and outbound calls (booking, FAQs, qualification, reminders) and escalate complex cases to humans with a full transcript.' },
        { q: 'Are AI voice calls legal?', a: 'Rules vary by market (e.g. TCPA in the USA, GDPR in the EU, 152-FZ in Russia). Use consented contact lists, disclose AI where required and store recordings securely.' },
      ],
      ru: [
        { q: `Сколько стоит голосовой ИИ-робот в ${y} году?`, a: `В ${y} году разработка и интеграция голосового ИИ-робота стоит от 200 000 до 2 000 000 ₽ плюс 4–15 ₽ за минуту разговора (телефония, распознавание, LLM и синтез речи).` },
        { q: 'Какая задержка ответа нужна голосовому роботу?', a: 'Для естественного диалога задержка ответа должна быть до 500–800 мс. Современные платформы поддерживают перебивание и паузы как у живого оператора.' },
        { q: 'Может ли ИИ заменить колл-центр?', a: 'ИИ-роботы автоматизируют 40–80% типовых звонков: запись, ответы на вопросы, квалификация, напоминания, — а сложные случаи передают оператору с полной расшифровкой.' },
        { q: 'Законны ли звонки голосовых роботов в России?', a: 'Да, при соблюдении 152-ФЗ о персональных данных, закона о рекламе и наличии согласия абонента на коммуникацию. Интеграторы из рейтинга помогают настроить корректные сценарии.' },
      ],
    }),
  },
  {
    id: 'realestate',
    slug: { en: 'ai-for-real-estate', ru: 'vnedrenie-ii-v-nedvizhimost' },
    title: { en: 'AI Agents for Real Estate & Developers', ru: 'Внедрение ИИ для агентств недвижимости' },
    short: {
      en: '24/7 lead qualification in WhatsApp & SMS, property matching and virtual staging pipelines.',
      ru: 'Квалификация лидов 24/7 в WhatsApp и Telegram, подбор объектов и виртуальный стейджинг.',
    },
    focus: {
      en: '24/7 lead qualification in WhatsApp/SMS, automated property matching, virtual staging.',
      ru: 'Квалификация лидов 24/7 в WhatsApp/Telegram, автоподбор объектов, виртуальный стейджинг.',
    },
    intro: {
      en: 'PropTech AI vendors and integrators for brokerages, property managers and developers: instant lead response, leasing assistants, listing generation and AI staging.',
      ru: 'PropTech-решения и интеграторы ИИ для агентств, управляющих компаний и девелоперов: мгновенный ответ лидам, ИИ-ассистенты продаж, генерация объявлений и стейджинг.',
    },
    accent: 'cyan',
    cost: { usd: [2000, 20000], rub: [150000, 1200000] },
    hoursPerSeat: 25,
    keywords: ['Real estate AI', 'PropTech', 'Lead qualification', 'Leasing assistant', 'Virtual staging', 'WhatsApp bots', 'Property matching'],
    faq: (y) => ({
      en: [
        { q: `How much does it cost to implement AI in a real estate agency in ${y}?`, a: `In ${y} brokerages usually spend $2,000–$20,000 on setup for AI lead qualification and CRM integration, or $300–$2,000/month for SaaS AI assistants. Developer-scale deployments with custom matching start higher.` },
        { q: 'What can an AI agent do for realtors?', a: 'Respond to portal and ad leads in under a minute 24/7, qualify budget and timeline, match listings, book viewings into calendars and nurture cold leads over months via SMS, email and WhatsApp.' },
        { q: 'Is virtual staging with AI accurate?', a: 'AI staging produces furnished renders in seconds for a fraction of traditional staging cost. Most markets require labeling virtually staged photos in listings.' },
        { q: 'Which CRMs are supported?', a: 'Common integrations include Follow Up Boss, kvCORE/BoldTrail, Lofty, Salesforce and HubSpot internationally, and Profitbase, MacroCRM, AmoCRM and Bitrix24 in Russia and the CIS.' },
      ],
      ru: [
        { q: `Сколько стоит внедрение ИИ в агентство недвижимости в ${y} году?`, a: `В ${y} году настройка ИИ-квалификации лидов и интеграции с CRM стоит от 150 000 до 1 200 000 ₽; SaaS-ассистенты — от 20 000 ₽ в месяц. Для девелоперов с собственным подбором объектов бюджет выше.` },
        { q: 'Что умеет ИИ-агент для риелтора?', a: 'Отвечает на заявки с ЦИАН, Авито и рекламы за секунды 24/7, выясняет бюджет и сроки, подбирает объекты, записывает на просмотр и прогревает холодные лиды в WhatsApp и Telegram.' },
        { q: 'Какие CRM для застройщиков поддерживаются?', a: 'Profitbase, MacroCRM, AmoCRM и Bitrix24 в России и СНГ; Salesforce, HubSpot и Follow Up Boss — на зарубежных рынках, включая Дубай.' },
        { q: 'Работает ли ИИ для недвижимости в Дубае?', a: 'Да. Многие агентства в ОАЭ используют ИИ-ассистентов в WhatsApp на английском, русском и арабском языках для круглосуточной обработки международных лидов.' },
      ],
    }),
  },
  {
    id: 'healthcare',
    slug: { en: 'ai-for-healthcare-clinics', ru: 'ii-dlya-mediciny-i-klinik' },
    title: { en: 'AI Automation for Clinics, Dental & MedSpas', ru: 'ИИ-администраторы для клиник и стоматологий' },
    short: {
      en: 'Patient booking bots, missed-call text-back, EHR integration and WhatsApp reminders.',
      ru: 'Боты записи пациентов, перезвон на пропущенные, интеграция с МИС и напоминания в WhatsApp.',
    },
    focus: {
      en: 'Patient booking bots, missed-call text back, EHR integration, reminders, ambient scribing.',
      ru: 'Запись пациентов, перезвон на пропущенные, интеграция с МИС, напоминания, ИИ-диагностика.',
    },
    intro: {
      en: 'Healthcare AI vendors for clinics, dental groups and medspas: AI receptionists, patient engagement, clinical documentation and decision support — built for HIPAA/GDPR workflows.',
      ru: 'ИИ-решения для клиник, стоматологий и медцентров: ИИ-администраторы, коммуникация с пациентами, медицинская документация и поддержка решений врача с учётом 152-ФЗ.',
    },
    accent: 'emerald',
    cost: { usd: [2500, 40000], rub: [150000, 2500000] },
    hoursPerSeat: 28,
    keywords: ['Healthcare AI', 'AI receptionist', 'Patient booking', 'EHR integration', 'Dental AI', 'MedSpa automation', 'HIPAA'],
    faq: (y) => ({
      en: [
        { q: `How much does an AI receptionist for a clinic cost in ${y}?`, a: `In ${y} AI receptionists and booking agents for clinics cost roughly $2,500–$40,000 to implement depending on EHR integration depth, or $300–$1,500/month per location as SaaS.` },
        { q: 'Is healthcare AI HIPAA compliant?', a: 'Vendors in this category offer HIPAA-aligned deployments with BAAs in the USA and GDPR controls in the EU. Always request a signed BAA/DPA before connecting patient data.' },
        { q: 'What is missed-call text back?', a: 'When a call goes unanswered, the AI instantly texts the patient, answers questions and books the appointment — recovering revenue that would otherwise go to a competitor.' },
        { q: 'Which systems do clinic AI agents integrate with?', a: 'Common integrations include Epic, athenahealth, Dentrix, Open Dental, Zenoti and Google Calendar internationally, and МИС such as Medesk, Инфоклиника and IDENT in Russia.' },
      ],
      ru: [
        { q: `Сколько стоит ИИ-администратор для клиники в ${y} году?`, a: `В ${y} году внедрение ИИ-администратора для записи пациентов стоит от 150 000 до 2 500 000 ₽ в зависимости от глубины интеграции с МИС, либо от 15 000 ₽ в месяц за филиал в формате SaaS.` },
        { q: 'С какими МИС интегрируется ИИ?', a: 'Medesk, Инфоклиника, IDENT, МЕДИАЛОГ, 1С:Медицина и другие через API, а также календари врачей, WhatsApp и Telegram.' },
        { q: 'Соответствует ли ИИ в медицине 152-ФЗ?', a: 'Да, при размещении данных в РФ, подписании поручения на обработку ПДн и разграничении доступа. Решения ИИ-диагностики должны иметь регистрацию медицинского изделия.' },
        { q: 'Сколько пациентов возвращает ИИ-перезвон?', a: 'Клиники обычно теряют 15–30% звонков. ИИ мгновенно пишет пациенту в мессенджер после пропущенного вызова и записывает его, возвращая значительную часть этих обращений.' },
      ],
    }),
  },
  {
    id: 'workflow',
    slug: { en: 'n8n-make-workflow-agencies', ru: 'avtomatizaciya-n8n-make-integraciya' },
    title: { en: 'n8n, Make & Autonomous Workflow Agencies', ru: 'Интеграторы n8n, Make и бизнес-процессов' },
    short: {
      en: 'Multi-agent orchestration with LangGraph & CrewAI, self-hosted n8n and Make pipelines.',
      ru: 'Мультиагентные системы на LangGraph и CrewAI, self-hosted n8n, Make и Albato.',
    },
    focus: {
      en: 'Multi-agent orchestration, LangGraph, CrewAI, n8n self-hosted enterprise setups, Make.',
      ru: 'Мультиагентная оркестрация, LangGraph, CrewAI, корпоративный self-hosted n8n, Make, Albato.',
    },
    intro: {
      en: 'Automation agencies and orchestration platforms that connect LLM agents to your whole stack — from no-code Make scenarios to self-hosted n8n and code-first LangGraph systems.',
      ru: 'Интеграторы и платформы оркестрации, которые подключают LLM-агентов ко всему стеку компании — от сценариев Make и Albato до self-hosted n8n и кодовых систем на LangGraph.',
    },
    accent: 'violet',
    cost: { usd: [2500, 50000], rub: [100000, 3000000] },
    hoursPerSeat: 20,
    keywords: ['n8n', 'Make', 'LangGraph', 'CrewAI', 'Workflow automation', 'Multi-agent systems', 'API integration'],
    faq: (y) => ({
      en: [
        { q: `How much does n8n or Make automation cost in ${y}?`, a: `In ${y} freelance-to-agency n8n/Make projects range from $2,500 for a few workflows to $50,000+ for self-hosted, multi-agent enterprise orchestration with monitoring and SSO.` },
        { q: 'n8n vs Make vs Zapier — which is best for AI agents?', a: 'n8n is preferred for self-hosting, data control and complex AI agent nodes; Make excels at visual scenarios and pricing per operation; Zapier is simplest for light use. Agencies here can advise based on volume and compliance.' },
        { q: 'What is multi-agent orchestration?', a: 'Several specialized LLM agents (researcher, writer, QA, executor) coordinated by a framework like LangGraph or CrewAI, with tool access, memory and human approval steps.' },
        { q: 'Can n8n be self-hosted for compliance?', a: 'Yes. n8n can run on your own servers or private cloud, which helps with GDPR, SOC 2 and 152-FZ data-residency requirements.' },
      ],
      ru: [
        { q: `Сколько стоит автоматизация на n8n или Make в ${y} году?`, a: `В ${y} году проекты на n8n/Make стоят от 100 000 ₽ за несколько сценариев до 3 000 000 ₽ и выше за корпоративную self-hosted мультиагентную систему с мониторингом.` },
        { q: 'n8n, Make или Albato — что выбрать?', a: 'n8n — для self-hosted и сложных ИИ-агентов с контролем данных; Make — для визуальных сценариев; Albato — российская платформа с готовыми интеграциями AmoCRM, Bitrix24 и маркетплейсов.' },
        { q: 'Можно ли развернуть n8n на серверах в России?', a: 'Да, n8n разворачивается на собственных серверах или в российском облаке, что упрощает соответствие 152-ФЗ.' },
        { q: 'Что такое мультиагентная система?', a: 'Несколько специализированных LLM-агентов (аналитик, исполнитель, контролёр), которыми управляет оркестратор вроде LangGraph или CrewAI, с доступом к инструментам, памятью и согласованием человеком.' },
      ],
    }),
  },
  {
    id: 'ecommerce',
    slug: { en: 'ai-for-ecommerce-retail', ru: 'ii-dlya-marketpleysov-i-riteyla' },
    title: { en: 'AI Agents for E-Commerce & Marketplaces', ru: 'ИИ для E-commerce, Wildberries и Ozon' },
    short: {
      en: 'AI shopping assistants, auto-generated SKU cards, review responders and dynamic pricing.',
      ru: 'ИИ-консультанты, генерация карточек товаров, ответы на отзывы и динамическое ценообразование.',
    },
    focus: {
      en: 'AI shopping assistants, automated SKU cards, review responders, dynamic pricing bots.',
      ru: 'ИИ-консультанты, генерация карточек, ответы на отзывы WB/Ozon, динамические цены.',
    },
    intro: {
      en: 'AI commerce platforms and integrators for D2C brands, retailers and marketplace sellers: conversational shopping, support automation, search, personalization and pricing.',
      ru: 'ИИ-платформы и интеграторы для брендов, ритейла и селлеров Wildberries и Ozon: консультанты, автоматизация поддержки, аналитика, персонализация и ценообразование.',
    },
    accent: 'cyan',
    cost: { usd: [1500, 35000], rub: [80000, 2000000] },
    hoursPerSeat: 24,
    keywords: ['E-commerce AI', 'Shopify', 'Wildberries', 'Ozon', 'AI shopping assistant', 'Dynamic pricing', 'Review automation'],
    faq: (y) => ({
      en: [
        { q: `How much does AI for an e-commerce store cost in ${y}?`, a: `In ${y} SaaS AI shopping assistants start around $50–$500/month for Shopify stores; custom AI agents for catalog, support and pricing cost $1,500–$35,000 to implement.` },
        { q: 'What ROI do AI shopping assistants deliver?', a: 'Vendors commonly report higher conversion on assisted sessions and 40–70% of support tickets resolved automatically. Measure with A/B tests on your own traffic.' },
        { q: 'Can AI write product descriptions at scale?', a: 'Yes — AI agents generate SEO-optimized titles, descriptions and attributes for thousands of SKUs, ideally with human QA for brand voice and compliance.' },
        { q: 'Does AI help with dynamic pricing?', a: 'AI pricing engines monitor competitors, demand and stock to adjust prices within your margin rules — widely used by large retailers and marketplace sellers.' },
      ],
      ru: [
        { q: `Сколько стоит ИИ для интернет-магазина или селлера в ${y} году?`, a: `В ${y} году сервисы ИИ для селлеров WB и Ozon стоят от 3 000 ₽ в месяц; кастомные ИИ-агенты для карточек, поддержки и цен — от 80 000 до 2 000 000 ₽ за внедрение.` },
        { q: 'Может ли ИИ отвечать на отзывы Wildberries и Ozon?', a: 'Да, ИИ-агенты через API маркетплейсов отвечают на отзывы и вопросы в фирменном стиле, эскалируя негатив менеджеру.' },
        { q: 'Как ИИ генерирует карточки товаров?', a: 'ИИ создаёт SEO-названия, описания, характеристики и инфографику для тысяч SKU с учётом требований площадки; финальная проверка остаётся за человеком.' },
        { q: 'Что такое динамическое ценообразование с ИИ?', a: 'Алгоритм отслеживает цены конкурентов, спрос и остатки и меняет цену в рамках заданной маржи — инструмент крупного ритейла и топ-селлеров.' },
      ],
    }),
  },
  {
    id: 'enterprise',
    slug: { en: 'enterprise-rag-custom-llms', ru: 'korporativnye-llm-i-ii-dlya-yuristov' },
    title: { en: 'Enterprise RAG, Private LLMs & Legal AI', ru: 'Корпоративные базы знаний (RAG) и ИИ для юристов' },
    short: {
      en: 'On-premise LLMs, contract analysis, internal knowledge bases with SOC 2 / GDPR compliance.',
      ru: 'LLM в контуре компании, анализ договоров, базы знаний с соответствием 152-ФЗ.',
    },
    focus: {
      en: 'On-premise LLMs, contract analysis bots, internal knowledge bases, SOC 2 compliance.',
      ru: 'On-premise LLM, анализ договоров, корпоративные базы знаний, соответствие 152-ФЗ.',
    },
    intro: {
      en: 'Enterprise AI vendors and labs for retrieval-augmented generation, private model deployment, legal and financial document intelligence with strict security controls.',
      ru: 'Корпоративные ИИ-вендоры и лаборатории: RAG-поиск по документам, развёртывание приватных LLM, юридический и финансовый анализ документов со строгими требованиями безопасности.',
    },
    accent: 'violet',
    cost: { usd: [15000, 250000], rub: [1000000, 15000000] },
    hoursPerSeat: 18,
    keywords: ['RAG', 'Private LLM', 'On-premise AI', 'Legal AI', 'Contract analysis', 'Knowledge base', 'SOC 2', 'GDPR'],
    faq: (y) => ({
      en: [
        { q: `How much does an enterprise RAG system cost in ${y}?`, a: `In ${y} a production RAG knowledge assistant typically costs $15,000–$250,000 to implement depending on data sources, access control, evaluation and hosting (cloud vs on-premise GPUs).` },
        { q: 'What is RAG?', a: 'Retrieval-augmented generation grounds an LLM in your own documents: it searches a vector or hybrid index and cites sources, dramatically reducing hallucinations.' },
        { q: 'Can LLMs run fully on-premise?', a: 'Yes. Open-weight models (Llama, Qwen, Mistral and others) can run on your own GPUs or private cloud so no data leaves your perimeter.' },
        { q: 'Is legal AI reliable for contract review?', a: 'Legal AI tools accelerate first-pass review, clause extraction and redlining, but final judgement stays with qualified lawyers; choose vendors with citation and audit trails.' },
      ],
      ru: [
        { q: `Сколько стоит корпоративная RAG-система в ${y} году?`, a: `В ${y} году внедрение корпоративной базы знаний на RAG стоит от 1 000 000 до 15 000 000 ₽ в зависимости от источников данных, разграничения доступа и инфраструктуры (облако или собственные GPU).` },
        { q: 'Можно ли развернуть LLM внутри контура компании?', a: 'Да. Open-source модели (Qwen, Llama, Mistral) и российские модели (GigaChat, YandexGPT on-premise) разворачиваются на собственных серверах без передачи данных наружу.' },
        { q: 'Что такое RAG простыми словами?', a: 'ИИ сначала находит нужные фрагменты в ваших документах, а затем отвечает со ссылками на источники — это резко снижает количество «галлюцинаций».' },
        { q: 'Подходит ли ИИ для проверки договоров?', a: 'ИИ ускоряет первичную проверку, поиск рисковых условий и сравнение редакций, но финальное решение остаётся за юристом.' },
      ],
    }),
  },
  {
    id: 'geo',
    slug: { en: 'geo-ai-search-agencies', ru: 'geo-prodvizhenie-v-ii-i-razrabotka' },
    title: { en: 'GEO (AI Search Optimization) & AI Web Studios', ru: 'GEO-продвижение в ИИ (ChatGPT/Perplexity) и умные сайты' },
    short: {
      en: 'Get cited in ChatGPT, Perplexity, Gemini and Claude with JSON-LD and llms.txt engineering.',
      ru: 'Упоминания бренда в ChatGPT, Perplexity, Gemini и Алисе: JSON-LD, llms.txt и контент.',
    },
    focus: {
      en: 'Brand citations in ChatGPT, Perplexity, Gemini, Claude; JSON-LD & /llms.txt engineering.',
      ru: 'Цитирование брендов в ChatGPT, Perplexity, Gemini, Алисе; JSON-LD и /llms.txt.',
    },
    intro: {
      en: 'Generative Engine Optimization agencies and AI-visibility platforms that make brands discoverable and cited inside AI answers, plus programmatic SEO web builds.',
      ru: 'Агентства GEO-продвижения и платформы мониторинга видимости в ИИ: бренд начинают цитировать в ответах нейросетей, плюс программатик-SEO сайты.',
    },
    accent: 'emerald',
    cost: { usd: [3000, 30000], rub: [150000, 1500000] },
    hoursPerSeat: 15,
    keywords: ['GEO', 'Generative Engine Optimization', 'AI search', 'ChatGPT visibility', 'Perplexity', 'JSON-LD', 'llms.txt', 'Programmatic SEO'],
    faq: (y) => ({
      en: [
        { q: `How much does GEO (AI search optimization) cost in ${y}?`, a: `In ${y} GEO retainers typically range from $3,000 to $30,000 per month depending on markets, content volume and digital PR; AI-visibility monitoring tools start around $100–$500/month.` },
        { q: 'What is Generative Engine Optimization?', a: 'GEO is the practice of making a brand retrievable and citable by AI assistants such as ChatGPT, Perplexity, Gemini and Claude — through authoritative content, structured data, entity consistency and third-party mentions.' },
        { q: 'Does llms.txt help AI visibility?', a: 'llms.txt is an emerging convention that gives LLM crawlers a clean Markdown map of your site. Combined with JSON-LD and crawlable HTML, it lowers the cost of ingesting your content.' },
        { q: 'How is GEO different from SEO?', a: 'SEO targets rankings in link lists; GEO targets being quoted inside synthesized answers. Both rely on technical health and authority, but GEO emphasizes facts, citations and entity clarity.' },
      ],
      ru: [
        { q: `Сколько стоит GEO-продвижение в нейросетях в ${y} году?`, a: `В ${y} году GEO-продвижение стоит от 150 000 до 1 500 000 ₽ в месяц в зависимости от рынка, объёма контента и PR; сервисы мониторинга упоминаний в ИИ — от 10 000 ₽ в месяц.` },
        { q: 'Что такое GEO-продвижение?', a: 'GEO (Generative Engine Optimization) — оптимизация, при которой бренд находят и цитируют ИИ-ассистенты: ChatGPT, Perplexity, Gemini, Алиса и Нейро — за счёт экспертного контента, микроразметки и внешних упоминаний.' },
        { q: 'Зачем сайту файл llms.txt?', a: 'llms.txt — это Markdown-карта сайта для LLM-краулеров. Вместе с JSON-LD и чистым HTML она упрощает нейросетям понимание и цитирование вашего контента.' },
        { q: 'Чем GEO отличается от SEO?', a: 'SEO борется за позиции в списке ссылок, GEO — за цитирование внутри ответа нейросети. Обе дисциплины опираются на техническое качество и авторитет, но GEO делает упор на факты и сущности.' },
      ],
    }),
  },
];

export const categoryById = (id: CategoryId): Category => {
  const c = categories.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown category: ${id}`);
  return c;
};

export const categoryBySlug = (lang: Lang, slug: string): Category | undefined =>
  categories.find((c) => c.slug[lang] === slug);
