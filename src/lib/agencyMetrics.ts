import type { CategoryId } from './data';

export interface LifecycleStep {
  step: string;
  duration: { en: string; ru: string };
  title: { en: string; ru: string };
  desc: { en: string; ru: string };
}

export interface RoiMetricRow {
  metric: { en: string; ru: string };
  legacy: { en: string; ru: string };
  aiStack: { en: string; ru: string };
  delta: { en: string; ru: string };
}

export interface CategoryMetrics {
  lifecycleTitle: { en: string; ru: string };
  lifecycleSubtitle: { en: string; ru: string };
  steps: LifecycleStep[];
  roiTitle: { en: string; ru: string };
  roiSubtitle: { en: string; ru: string };
  metrics: RoiMetricRow[];
}

export const CATEGORY_METRICS: Record<CategoryId, CategoryMetrics> = {
  sales: {
    lifecycleTitle: {
      en: '4-Stage AI SDR & CRM Integration Lifecycle',
      ru: '4 этапа интеграции ИИ-агентов продаж и CRM',
    },
    lifecycleSubtitle: {
      en: 'SDR Scripting, CRM Webhooks & Conversion Optimization',
      ru: 'Сценарии AI SDR, интеграция с CRM и максимизация конверсии',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Sales Pipeline & Data Audit', ru: 'Аудит воронки продаж и регламентов' },
        desc: {
          en: 'Audit of inbound lead flows, CRM pipeline stages, objection playbooks, and qualification scoring rules.',
          ru: 'Анализ входящих лидов, стадий воронки CRM, скриптов отработки возражений и критериев квалификации.',
        },
      },
      {
        step: '02',
        duration: { en: '2–3 wks', ru: '2–3 нед.' },
        title: { en: 'AI SDR Architecture & RAG Playbooks', ru: 'Скрипты AI SDR и база знаний RAG' },
        desc: {
          en: 'Prompt engineering with dynamic guardrails, grounding on product catalog, pricing matrices, and CRM history.',
          ru: 'Разработка промпт-графов, подключение RAG-базы продуктов, прайс-листов и истории успешных сделок.',
        },
      },
      {
        step: '03',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Bi-directional CRM & Omnichannel Setup', ru: 'Двусторонняя интеграция с CRM и каналами' },
        desc: {
          en: 'Seamless webhook handoff to AmoCRM, Bitrix24, HubSpot, or Salesforce with auto-logging and calendar booking.',
          ru: 'Подключение вебхуков AmoCRM, Bitrix24, HubSpot или Salesforce с автофиксацией полей и слотов в календаре.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'AI Quality Assurance & Conversion Tuning', ru: 'Автоматический AI-РОП и тюнинг конверсии' },
        desc: {
          en: 'Automated 100% call transcript evaluation, manager alert dispatch, and continuous prompt fine-tuning.',
          ru: 'Тотальный аудит 100% звонков и переписок, алерты руководителям продаж и дообучение на живых сделках.',
        },
      },
    ],
    roiTitle: {
      en: 'Sales Automation Benchmark: Manual SDR vs. Deployed AI Agents',
      ru: 'Бенчмарк отдела продаж: ручные менеджеры vs ИИ-агенты',
    },
    roiSubtitle: {
      en: 'Operational economics verified across production B2B implementations',
      ru: 'Экономический эффект на основе реальных коммерческих внедрений',
    },
    metrics: [
      {
        metric: { en: 'Lead Qualification Latency', ru: 'Скорость квалификации нового лида' },
        legacy: { en: '15–45 mins', ru: '15–45 минут' },
        aiStack: { en: '< 30 seconds', ru: '< 30 секунд' },
        delta: { en: '-98% wait time', ru: '-98% времени ожидания' },
      },
      {
        metric: { en: 'CRM Data Hygiene & Auto-Logging', ru: 'Полнота заполнения полей в CRM' },
        legacy: { en: '50–65% (manual gaps)', ru: '50–65% (человеческие пропуски)' },
        aiStack: { en: '100% structured data', ru: '100% автологирование' },
        delta: { en: 'Zero data leakage', ru: '0 потерянных данных' },
      },
      {
        metric: { en: 'Cost per Qualified Opportunity', ru: 'Себестоимость квалифицированного лида' },
        legacy: { en: '$18 — $45 / lead', ru: '1 200 — 3 500 ₽ / лид' },
        aiStack: { en: '$1.80 — $4.50 / lead', ru: '120 — 350 ₽ / лид' },
        delta: { en: '-90% acquisition cost', ru: '-90% затрат на квалификацию' },
      },
      {
        metric: { en: 'Simultaneous Inbound Capacity', ru: 'Пропускная способность в пиковые часы' },
        legacy: { en: '3–5 dialogues / rep', ru: '3–5 диалогов на менеджера' },
        aiStack: { en: '10,000+ concurrent', ru: '10 000+ одновременных лидов' },
        delta: { en: '0 dropped inquiries', ru: '0 потерянных заявок' },
      },
    ],
  },

  video: {
    lifecycleTitle: {
      en: '4-Stage Generative Video & Film Production Workflow',
      ru: '4 этапа генеративного видеопроизводства и пост-продакшна',
    },
    lifecycleSubtitle: {
      en: 'Concept, Consistency Pipelines, Neural Lipsync & 4K Mastering',
      ru: 'Концепт, консистентность персонажей, нейролипсинк и 4K-мастеринг',
    },
    steps: [
      {
        step: '01',
        duration: { en: '3–5 days', ru: '3–5 дней' },
        title: { en: 'Storyboarding & Prompt Archetyping', ru: 'Творческий концепт и стилистика' },
        desc: {
          en: 'Creative brief analysis, storyboard generation, camera motion design, and character keyframe styling.',
          ru: 'Анализ креативного брифа, генерация раскадровок, режиссура динамики камеры и визуальные референсы.',
        },
      },
      {
        step: '02',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Generative VFX & Character Consistency', ru: 'Генерация шотов и консистентность персонажей' },
        desc: {
          en: 'Frame-by-frame asset generation with Runway Gen-3, Kling, Sora, ComfyUI custom LoRA nodes, and camera tracking.',
          ru: 'Генерация сцен с фиксацией лиц и персонажей через ComfyUI LoRA, Runway Gen-3, Kling и трекинг движения.',
        },
      },
      {
        step: '03',
        duration: { en: '3–5 days', ru: '3–5 дней' },
        title: { en: 'Neural Voiceover & Multilingual Lipsync', ru: 'Озвучка и мультиязычный липсинк' },
        desc: {
          en: 'ElevenLabs voice cloning, emotion control, and sub-frame accurate neural lipsync for global campaign delivery.',
          ru: 'Эмоциональный синтез речи в ElevenLabs, клонирование голосов и покадровый липсинк на целевые языки.',
        },
      },
      {
        step: '04',
        duration: { en: '2–3 days', ru: '2–3 дня' },
        title: { en: '4K Mastering & Multi-Format Delivery', ru: 'Мастеринг в 4K и адаптация форматов' },
        desc: {
          en: 'AI upscaling, temporal stabilization, color matching, and omni-channel export (9:16, 16:9, 1:1, DOOH).',
          ru: 'Апскейлинг нейросетями, темпоральная стабилизация, цветокоррекция и экспорт под все рекламные форматы.',
        },
      },
    ],
    roiTitle: {
      en: 'Production Economics: Traditional Film Crew vs. Generative AI Studio',
      ru: 'Экономика продакшна: традиционные съёмки vs ИИ-видеостудия',
    },
    roiSubtitle: {
      en: 'Commercial turnaround, localization agility, and cost reduction',
      ru: 'Сравнение сроков, затрат на минуту контента и гибкости локализации',
    },
    metrics: [
      {
        metric: { en: 'Commercial Turnaround Time', ru: 'Срок производства рекламного ролика' },
        legacy: { en: '20–45 business days', ru: '20–45 рабочих дней' },
        aiStack: { en: '3–6 business days', ru: '3–6 рабочих дней' },
        delta: { en: '-85% production cycle', ru: '-85% времени производства' },
      },
      {
        metric: { en: 'Cost per Finished Minute', ru: 'Себестоимость готовой минуты видео' },
        legacy: { en: '$4,000 — $15,000 / min', ru: '400 000 — 1 500 000 ₽ / мин' },
        aiStack: { en: '$350 — $1,200 / min', ru: '35 000 — 120 000 ₽ / мин' },
        delta: { en: '-88% budget savings', ru: '-88% бюджета съёмок' },
      },
      {
        metric: { en: 'Global Multilingual Localization', ru: 'Локализация на 20+ языков мира' },
        legacy: { en: '3–4 weeks studio dubbing', ru: '3–4 недели студийного дубляжа' },
        aiStack: { en: '24–48 hours neural lipsync', ru: '24–48 часов нейролипсинка' },
        delta: { en: '-95% turnaround', ru: '-95% времени выхода на мир' },
      },
      {
        metric: { en: 'Revision & Variation Cycle', ru: 'Скорость внесения правок и A/B версий' },
        legacy: { en: '5–7 days reshoot/edit', ru: '5–7 дней на пересъёмку' },
        aiStack: { en: '< 4 hours per variation', ru: '< 4 часов на регенерацию' },
        delta: { en: 'Infinite rapid iterations', ru: 'Мгновенное тестирование гипотез' },
      },
    ],
  },

  voice: {
    lifecycleTitle: {
      en: '4-Stage Voicebot & Call Center Modernization',
      ru: '4 этапа внедрения голосовых роботов и телефонии нового поколения',
    },
    lifecycleSubtitle: {
      en: 'Low-latency Synthesis, CRM Interceptors & Human-Parity Dialogs',
      ru: 'Синтез речи <500мс, перехват звонков и интеграция с телефонией',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1 wk', ru: '1 нед.' },
        title: { en: 'Telephony & Call Route Architecture', ru: 'Аудит телефонии SIP и маршрутизации звонков' },
        desc: {
          en: 'Audit of SIP trunks, PBX / Mango / Sipuni / Twilio setups, call recording archives, and caller intent patterns.',
          ru: 'Анализ SIP-транков, АТС, маршрутизации очередей, архивов звонков и типовых сценариев диалогов.',
        },
      },
      {
        step: '02',
        duration: { en: '2 wks', ru: '2 нед.' },
        title: { en: 'Ultra-low Latency Voicebot Build (<500ms)', ru: 'Сборка голосового ядра с задержкой <500мс' },
        desc: {
          en: 'Integration with Vapi, Retell, Bland AI, or proprietary Whisper/Cartesia pipelines with natural barge-in capability.',
          ru: 'Настройка Vapi, Retell, Bland AI или собственного пайплайна с естественным перебиванием и интонациями.',
        },
      },
      {
        step: '03',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Real-Time CRM & Database Interceptor', ru: 'Интеграция с CRM, складскими остатками и ERP' },
        desc: {
          en: 'Connecting live inventory checks, calendar slot reservations, client balance verification, and instant operator escalation.',
          ru: 'Подключение проверки остатков на складе, бронирования слотов, балансов и мгновенного трансфера на оператора.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'Speech Analytics & Latency Observability', ru: 'Речевая аналитика и дообучение интонаций' },
        desc: {
          en: 'Sub-second latency tracking, acoustic sentiment analysis, and continuous vocabulary optimization.',
          ru: 'Мониторинг задержек ответа, анализ тональности абонента и постоянное пополнение словаря узких терминов.',
        },
      },
    ],
    roiTitle: {
      en: 'Call Center Unit Economics: Human Telephony vs. AI Voice Agents',
      ru: 'Юнит-экономика колл-центра: живые операторы vs голосовые ИИ-агенты',
    },
    roiSubtitle: {
      en: 'Real latency benchmarks, concurrency limits, and minute cost savings',
      ru: 'Реальные метрики задержки ответа, емкости линий и стоимости минуты',
    },
    metrics: [
      {
        metric: { en: 'Voicebot Response Latency', ru: 'Задержка ответа робота на реплику' },
        legacy: { en: '3–8 sec (legacy IVR / bots)', ru: '3–8 секунд (устаревшие IVR)' },
        aiStack: { en: '420–550 ms (human parity)', ru: '420–550 мс (неотличимо от человека)' },
        delta: { en: '-90% response lag', ru: 'Живой естественный диалог' },
      },
      {
        metric: { en: 'Cost per Call Minute', ru: 'Себестоимость минуты разговора' },
        legacy: { en: '$0.80 — $1.50 / min', ru: '35 — 65 ₽ / мин' },
        aiStack: { en: '$0.08 — $0.15 / min', ru: '4 — 8 ₽ / мин' },
        delta: { en: '-85% minute cost', ru: '-85% прямых затрат' },
      },
      {
        metric: { en: 'Peak Concurrent Call Capacity', ru: 'Пиковая ёмкость одновременных линий' },
        legacy: { en: '10–30 lines per shift', ru: '10–30 операторов на смене' },
        aiStack: { en: '5,000+ simultaneous calls', ru: '5 000+ одновременных линий' },
        delta: { en: '0% busy tone rate', ru: '0% потерянных звонков' },
      },
      {
        metric: { en: 'Service Line Availability', ru: 'График работы линии поддержки' },
        legacy: { en: '5/2 or 8x5 shift hours', ru: '5/2 (09:00 — 18:00)' },
        aiStack: { en: '24/7/365 uninterrupted', ru: '24/7/365 без отпусков и очередей' },
        delta: { en: '+280% coverage', ru: '100% приём ночных обращений' },
      },
    ],
  },

  realestate: {
    lifecycleTitle: {
      en: '4-Stage Real Estate AI & PropTech Deployment',
      ru: '4 этапа внедрения ИИ для агентств недвижимости и девелоперов',
    },
    lifecycleSubtitle: {
      en: 'Inventory Feeds, Virtual Staging & Instant WhatsApp Qualification',
      ru: 'Синхронизация шахматки, виртуальный стейджинг и квалификация в WhatsApp',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1 wk', ru: '1 нед.' },
        title: { en: 'Inventory Mapping & Developer CRM Sync', ru: 'Интеграция шахматки и каталога объектов' },
        desc: {
          en: 'Connecting housing inventory feeds, floor plans, mortgage criteria, and CRM integration (MacroCRM, Profitbase, AmoCRM).',
          ru: 'Подключение шахматок жилых комплексов, планировок, цен, ипотечных программ и интеграция с CRM.',
        },
      },
      {
        step: '02',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'WhatsApp/Telegram AI Broker Assistant', ru: 'ИИ-брокер для мессенджеров и SMS' },
        desc: {
          en: 'Autonomous lead qualifier that collects budget, target district, move-in horizon, and delivers tailored property decks.',
          ru: 'Автономный помощник для мгновенного сбора бюджета, локации, отправки персонализированных подборок квартир.',
        },
      },
      {
        step: '03',
        duration: { en: '1 wk', ru: '1 нед.' },
        title: { en: 'Automated Virtual Staging Pipeline', ru: 'Пайплайн виртуального стейджинга и рендеров' },
        desc: {
          en: 'Automated furnishing of empty property photos into luxury photorealistic furnished interiors in under 3 minutes.',
          ru: 'Автоматическая меблировка пустых помещений и черновой отделки в фотореалистичные дизайн-интерьеры за 3 минуты.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'Viewing Booking & Mortgage Warm-up', ru: 'Сквозной букинг показов и ипотечный прогрев' },
        desc: {
          en: 'Automated reminder sequences, broker calendar sync, and document checklist collection for mortgage pre-approval.',
          ru: 'Напоминания о просмотре объекта, синхронизация с календарями брокеров и сбор документов на ипотеку.',
        },
      },
    ],
    roiTitle: {
      en: 'Real Estate Sales Acceleration: Manual Broker vs. AI PropTech Stack',
      ru: 'Ускорение продаж недвижимости: брокеры vs ИИ-стек PropTech',
    },
    roiSubtitle: {
      en: 'Inquiry response speed, virtual staging costs, and viewing completion',
      ru: 'Скорость обработки заявок с классифайдов и доходимость до показов',
    },
    metrics: [
      {
        metric: { en: 'First Response to Portal Inquiries', ru: 'Скорость первого ответа на заявку' },
        legacy: { en: '45–120 mins average', ru: '45–120 минут (длинный перезвон)' },
        aiStack: { en: '< 20 seconds in WhatsApp', ru: '< 20 секунд в WhatsApp / SMS' },
        delta: { en: '-98% delay', ru: 'Мгновенный захват горячего покупателя' },
      },
      {
        metric: { en: 'Virtual Staging Cost per Listing', ru: 'Стоимость виртуального стейджинга фото' },
        legacy: { en: '$150 — $350 per room', ru: '15 000 — 35 000 ₽ / комната' },
        aiStack: { en: '$3 — $8 per generation', ru: '300 — 800 ₽ / генерация' },
        delta: { en: '-97% staging expenses', ru: '-97% затрат на визуализацию' },
      },
      {
        metric: { en: 'Custom Presentation Assembly', ru: 'Время сборки персональной презентации' },
        legacy: { en: '30–60 mins manual deck', ru: '30–60 минут ручной сборки' },
        aiStack: { en: 'Instant PDF / interactive link', ru: 'Мгновенная ссылка под критерии' },
        delta: { en: '-99% manual effort', ru: 'Мгновенная отправка в диалог' },
      },
      {
        metric: { en: 'On-site Viewing Show-up Rate', ru: 'Доходимость клиента до показа объекта' },
        legacy: { en: '35–45% show-up', ru: '35–45% (частые неявки)' },
        aiStack: { en: '68–78% confirmed viewings', ru: '68–78% подтверждённых показов' },
        delta: { en: '+60% viewing efficiency', ru: '+60% проведённых встреч' },
      },
    ],
  },

  healthcare: {
    lifecycleTitle: {
      en: '4-Stage Clinic & MedSpa AI Front-Desk Implementation',
      ru: '4 этапа внедрения ИИ-администратора для клиник и стоматологий',
    },
    lifecycleSubtitle: {
      en: 'Missed-Call Recovery, EHR Integration & Strict Medical Privacy',
      ru: 'Перехват пропущенных звонков, интеграция с МИС и конфиденциальность 152-ФЗ',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Clinical Schedule & EHR Protocol Audit', ru: 'Аудит расписания врачей и протоколов МИС' },
        desc: {
          en: 'Integration analysis with Medesk, Infoclinica, 1C:Medicine, Dentis, or Epic/athenahealth.',
          ru: 'Анализ интеграции с МИС (Medesk, Инфоклиника, 1С:Медицина, Dentis) и нормативов длительности приёма.',
        },
      },
      {
        step: '02',
        duration: { en: '2 wks', ru: '2 нед.' },
        title: { en: 'Triage & Patient Booking Agent Setup', ru: 'Настройка триажа и ИИ-администратора' },
        desc: {
          en: 'Configuring symptom pre-triage guardrails, doctor specialty routing, and preparation instruction delivery.',
          ru: 'Настройка безопасного первичного триажа жалоб, маршрутизации к нужным врачам и памяток перед приёмом.',
        },
      },
      {
        step: '03',
        duration: { en: '1 wk', ru: '1 нед.' },
        title: { en: 'WhatsApp Reminders & Missed-Call Interceptor', ru: 'Подтверждение записей в WhatsApp и автовозврат' },
        desc: {
          en: 'Automated 1-click confirmation / rescheduling flows and missed-call text-back within 15 seconds.',
          ru: 'Подтверждение записи в 1 клик через WhatsApp/SMS и автовозврат потерянных пациентов за 15 секунд.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'HIPAA & 152-FZ Privacy Compliance', ru: 'Контроль персональных данных и врачебной тайны' },
        desc: {
          en: 'Encryption of patient records, token obfuscation, and strict compliance with medical confidentiality standards.',
          ru: 'Шифрование персональных данных, обезличивание диагнозов и строгое соблюдение требований 152-ФЗ и HIPAA.',
        },
      },
    ],
    roiTitle: {
      en: 'Clinic Front-Desk Economics: Manual Reception vs. AI Patient Concierge',
      ru: 'Экономика регистратуры клиники: ручные администраторы vs ИИ-консьерж',
    },
    roiSubtitle: {
      en: 'Missed-call recovery, no-show reduction, and administrative time savings',
      ru: 'Возврат потерянных пациентов и снижение неявок на приём',
    },
    metrics: [
      {
        metric: { en: 'Missed Call Recovery Rate', ru: 'Конверсия пропущенных звонков в запись' },
        legacy: { en: '10–15% call-back recovery', ru: '10–15% (администраторы не успевают)' },
        aiStack: { en: '72% booked via instant text-back', ru: '72% бронирований через автовозврат' },
        delta: { en: '+380% revenue saved', ru: '+380% спасённой выручки клиники' },
      },
      {
        metric: { en: 'Patient No-Show Rate', ru: 'Доля неявок пациентов на приём' },
        legacy: { en: '22–30% missed appointments', ru: '22–30% пустых окон в расписании' },
        aiStack: { en: '7–9% with interactive reminders', ru: '7–9% с интерактивным подтверждением' },
        delta: { en: '-65% idle doctor hours', ru: '-65% простоев кабинетов' },
      },
      {
        metric: { en: 'Appointment Booking Duration', ru: 'Время оформления записи пациента' },
        legacy: { en: '4–7 mins phone call', ru: '4–7 минут разговора с регистратурой' },
        aiStack: { en: '< 45 seconds in messenger/voice', ru: '< 45 секунд в чате или с роботом' },
        delta: { en: '-80% patient effort', ru: 'Быстрая запись без ожидания на линии' },
      },
      {
        metric: { en: 'Post-Op Follow-up Coverage', ru: 'Охват контролем самочувствия после процедур' },
        legacy: { en: '15–20% selective calls', ru: '15–20% выборочных звонков' },
        aiStack: { en: '100% automated check-ins', ru: '100% опрос о самочувствии на 2-й день' },
        delta: { en: 'Full patient care cycle', ru: 'Рост повторных обращений и LTV' },
      },
    ],
  },

  workflow: {
    lifecycleTitle: {
      en: '4-Stage Enterprise Workflow Orchestration (n8n & Make)',
      ru: '4 этапа сквозной автоматизации процессов на n8n и Make',
    },
    lifecycleSubtitle: {
      en: 'Multi-Agent State Machines, Webhook Security & Zero-Error Execution',
      ru: 'Мультиагентные графы, отказоустойчивые вебхуки и автозапуск сценариев',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Process Mining & Bottleneck Discovery', ru: 'Process Mining и карта рутинных операций' },
        desc: {
          en: 'Audit of manual employee tasks, API availability, CSV/Excel routines, and human handoff bottlenecks.',
          ru: 'Анализ ручных задач сотрудников, доступности API, Excel-таблиц и узких мест между отделами.',
        },
      },
      {
        step: '02',
        duration: { en: '2–3 wks', ru: '2–3 нед.' },
        title: { en: 'Multi-Agent LangGraph & n8n Build', ru: 'Сборка multi-agent графов в n8n / Make' },
        desc: {
          en: 'Building deterministic state machines, retry queues, validation checkpoints, and fallback handlers.',
          ru: 'Проектирование графов состояний, очередей повторов, валидаторов данных и обработчиков сбоев.',
        },
      },
      {
        step: '03',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Enterprise SSO, Webhooks & On-Premise Host', ru: 'Настройка шифрования, вебхуков и Self-Hosted контура' },
        desc: {
          en: 'Docker / Kubernetes cluster setup, secrets encryption, rate limit protection, and internal ERP connectivity.',
          ru: 'Развёртывание n8n в защищённом контуре, шифрование токенов, защита от лимитов и интеграция с ERP.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'LLMOps, Token Monitoring & SLA Maintenance', ru: 'Мониторинг токенов, логирование и поддержка SLA' },
        desc: {
          en: 'End-to-end trace observability via Langfuse / OpenTelemetry, cost optimization, and 99.9% uptime SLA.',
          ru: 'Трейсинг выполнения сценариев, контроль затрат токенов, мониторинг сбоев и SLA 99.9%.',
        },
      },
    ],
    roiTitle: {
      en: 'Business Process Velocity: Manual Workflow vs. Autonomous Orchestration',
      ru: 'Скорость бизнес-процессов: ручная работа vs автономные сценарии n8n/Make',
    },
    roiSubtitle: {
      en: 'Cycle time compression, human error elimination, and cost per run',
      ru: 'Сокращение времени операций, исключение ошибок и юнит-экономика запуска',
    },
    metrics: [
      {
        metric: { en: 'End-to-End Process Cycle Time', ru: 'Время выполнения сквозного процесса' },
        legacy: { en: '3–8 business days', ru: '3–8 рабочих дней' },
        aiStack: { en: '40–90 seconds automated', ru: '40–90 секунд' },
        delta: { en: '-99% process latency', ru: '-99% времени цикла' },
      },
      {
        metric: { en: 'Manual Data Entry Error Rate', ru: 'Человеческий фактор и ошибки в данных' },
        legacy: { en: '4–9% human keystroke errors', ru: '4–9% опечаток и пропусков' },
        aiStack: { en: '0.02% with schema validation', ru: '0.02% со строгой валидацией' },
        delta: { en: 'Near-zero error margin', ru: 'Исключение брака в учете' },
      },
      {
        metric: { en: 'Operational Cost per Execution', ru: 'Себестоимость одного цикла операции' },
        legacy: { en: '$4.00 — $12.00 manual labor', ru: '250 — 600 ₽ рабочего времени' },
        aiStack: { en: '$0.01 — $0.04 server compute', ru: '0.80 — 2.50 ₽ за API-запуск' },
        delta: { en: '-99% marginal cost', ru: '-99% прямых издержек' },
      },
      {
        metric: { en: 'Workflow Modification Agility', ru: 'Скорость внедрения изменений в процесс' },
        legacy: { en: '2–3 weeks developer backlog', ru: '2–3 недели спринта разработки' },
        aiStack: { en: '2–4 hours visual configuration', ru: '2–4 часа в visual-оркестраторе' },
        delta: { en: '-90% time-to-market', ru: 'Мгновенная адаптация бизнеса' },
      },
    ],
  },

  ecommerce: {
    lifecycleTitle: {
      en: '4-Stage E-Commerce & Marketplace AI Transformation',
      ru: '4 этапа роботизации E-Commerce и продаж на маркетплейсах',
    },
    lifecycleSubtitle: {
      en: 'Catalog Auto-Generation, Customer Concierge & Dynamic Margins',
      ru: 'Автогенерация SKU-карточек, ИИ-стилист и динамический репрайсинг',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1 wk', ru: '1 нед.' },
        title: { en: 'PIM, ERP & Marketplace Feed Integration', ru: 'Интеграция 1С/ERP, МойСклад и маркетплейсов' },
        desc: {
          en: 'Connecting Wildberries, Ozon, Amazon, Shopify, or 1C data structures, stock feeds, and attribute taxonomies.',
          ru: 'Синхронизация остатков Wildberries, Ozon, Яндекс Маркет, Shopify и структуры атрибутов номенклатуры.',
        },
      },
      {
        step: '02',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Autonomous SKU Rich-Content Generator', ru: 'Генератор богатого контента карточек SKU' },
        desc: {
          en: 'Automated SEO titles, bullet points, localized descriptions, size guides, and neural infographic rendering.',
          ru: 'Генерация SEO-заголовков, продающих описаний, размерных сеток и предметной инфографики нейросетями.',
        },
      },
      {
        step: '03',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'AI Shopping Stylist & Support Concierge', ru: 'ИИ-консультант по подбору товаров и размеров' },
        desc: {
          en: 'Chat-based personalized recommendation agent resolving size queries, order tracking, and cross-selling.',
          ru: 'Умный онлайн-ассистент в карточке товара, подбирающий размер, аксессуары и снимающий сомнения перед покупкой.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'Dynamic Repricing & Review Sentiment Engine', ru: 'Динамический репрайсинг и автоответы на отзывы' },
        desc: {
          en: '24/7 competitor price tracking, inventory velocity adjustments, and automated personalized review responses.',
          ru: 'Мониторинг цен конкурентов, управление маржинальностью и умные ответы на 100% отзывов и вопросов покупателей.',
        },
      },
    ],
    roiTitle: {
      en: 'Retail Scale Metrics: Manual Cataloging vs. AI E-Com Engine',
      ru: 'Масштабирование ритейла: ручной контент-отдел vs ИИ-движок E-Com',
    },
    roiSubtitle: {
      en: 'Catalog velocity, review response time, and cart recovery rate',
      ru: 'Скорость запуска новинок, работа с отзывами и возврат брошенных корзин',
    },
    metrics: [
      {
        metric: { en: '1,000 SKU Onboarding Velocity', ru: 'Срок создания 1 000 новых карточек SKU' },
        legacy: { en: '3–4 weeks copywriter team', ru: '3–4 недели работы контент-отдела' },
        aiStack: { en: '4–6 hours batch generation', ru: '4–6 часов пакетной генерации' },
        delta: { en: '-98% catalog lead time', ru: '-98% времени вывода новинок' },
      },
      {
        metric: { en: 'Customer Review Response Time', ru: 'Скорость ответа на отзывы покупателей' },
        legacy: { en: '24–72 hours manual review', ru: '24–72 часа ручной модерации' },
        aiStack: { en: '< 60 seconds (100% coverage)', ru: '< 60 секунд (100% охват)' },
        delta: { en: 'Zero unanswered reviews', ru: 'Рейтинг карточки всегда под защитой' },
      },
      {
        metric: { en: 'Abandoned Cart Recovery Rate', ru: 'Конверсия возврата брошенных корзин' },
        legacy: { en: '3–6% generic email blast', ru: '3–6% стандартных email-рассылок' },
        aiStack: { en: '14–19% personalized AI chat', ru: '14–19% через персональный диалог' },
        delta: { en: '+250% recovered revenue', ru: '+250% спасённых заказов' },
      },
      {
        metric: { en: 'Cross-Border Localization Cost', ru: 'Стоимость перевода описаний на другие языки' },
        legacy: { en: '$12 — $25 per listing', ru: '1 200 — 2 500 ₽ за карточку' },
        aiStack: { en: '$0.15 per neural translation', ru: '15 — 30 ₽ за адаптацию' },
        delta: { en: '-98% localization budget', ru: '-98% затрат на трансграничные продажи' },
      },
    ],
  },

  enterprise: {
    lifecycleTitle: {
      en: '4-Stage Enterprise RAG & Sovereign LLM Deployment',
      ru: '4 этапа внедрения корпоративного RAG и закрытых языковых моделей',
    },
    lifecycleSubtitle: {
      en: 'Data Security Boundaries, Hybrid Retrieval & Zero-Hallucination Guardrails',
      ru: 'Контур безопасности, гибридный поиск и строгая защита от галлюцинаций',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Security Boundary & Document Indexing Audit', ru: 'Аудит контура безопасности и индексация базы документов' },
        desc: {
          en: 'Audit of corporate repositories (Confluence, SharePoint, PDF archives, CRM), access permissions, and air-gapped VPC specs.',
          ru: 'Анализ корпоративных хранилищ (Confluence, SharePoint, архивы договоров), матриц прав доступа и изолированного контура.',
        },
      },
      {
        step: '02',
        duration: { en: '2–3 wks', ru: '2–3 нед.' },
        title: { en: 'Hybrid RAG & Exact Citation Guardrails', ru: 'Гибридный RAG-поиск и верификация первоисточников' },
        desc: {
          en: 'BM25 + dense vector hybrid search, reranker models, and strict citation links to exact page/paragraph sources.',
          ru: 'Комбинация векторного и полнотекстового поиска, реранкеры и строгое подтверждение цитатами из оригиналов.',
        },
      },
      {
        step: '03',
        duration: { en: '2 wks', ru: '2 нед.' },
        title: { en: 'On-Premise / Sovereign VPC Serving', ru: 'Развёртывание моделей в закрытом контуре заказчика' },
        desc: {
          en: 'vLLM / TensorRT-LLM serving on private GPU clusters with zero external API calls or telemetry leakage.',
          ru: 'Запуск квантованных моделей на собственных серверах заказчика без передачи данных во внешние сервисы.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'Continuous Benchmark Tuning & Compliance SLA', ru: 'Тюнинг точности, аудит соответствия и SLA 99.9%' },
        desc: {
          en: 'RAG triad evaluation (faithfulness, answer relevance, context recall) with automated regression test suites.',
          ru: 'Регулярная оценка качества ответов по метрикам Ragas/TruLens, защита от инъекций и соблюдение корпоративных регламентов.',
        },
      },
    ],
    roiTitle: {
      en: 'Enterprise Knowledge Economics: Manual Search vs. Sovereign RAG',
      ru: 'Экономика работы со знаниями: ручной поиск документов vs корпоративный RAG',
    },
    roiSubtitle: {
      en: 'Contract review velocity, source citation precision, and data isolation',
      ru: 'Скорость проверки договоров, точность цитирования и защита коммерческой тайны',
    },
    metrics: [
      {
        metric: { en: '100-Page Contract Review Latency', ru: 'Время проверки 100-страничного договора' },
        legacy: { en: '3–6 hours senior legal counsel', ru: '3–6 часов работы юриста' },
        aiStack: { en: '35–50 seconds risk extraction', ru: '35–50 секунд с подсветкой рисков' },
        delta: { en: '-98% legal review time', ru: '-98% времени юридической экспертизы' },
      },
      {
        metric: { en: 'Enterprise Knowledge Retrieval Precision', ru: 'Точность поиска по внутренним регламентам' },
        legacy: { en: '60–75% (unstructured keywords)', ru: '60–75% (ручной поиск по папкам)' },
        aiStack: { en: '98.4% grounded in citations', ru: '98.4% с точной ссылкой на пункт' },
        delta: { en: '+35% retrieval accuracy', ru: 'Точный ответ со ссылкой на документ' },
      },
      {
        metric: { en: 'Hallucination & Fabrication Rate', ru: 'Уровень недостоверных сведений в ответах' },
        legacy: { en: '15–25% (unbounded baseline LLM)', ru: '15–25% (у базовых необученных LLM)' },
        aiStack: { en: '0% (deterministic citation gate)', ru: '0% (строгая проверка по контексту)' },
        delta: { en: 'Zero factual distortion', ru: 'Исключение ложных ответов' },
      },
      {
        metric: { en: 'Confidential Data Sovereign Guarantee', ru: 'Гарантия изоляции корпоративной тайны' },
        legacy: { en: 'Risk of public cloud exposure', ru: 'Риск утечки в публичные облака' },
        aiStack: { en: '100% On-Premise / Private VPC', ru: '100% закрытый периметр компании' },
        delta: { en: 'Zero external telemetry', ru: 'Полный суверенитет над данными' },
      },
    ],
  },

  geo: {
    lifecycleTitle: {
      en: '4-Stage Generative Engine Optimization (GEO) & AI Search Blueprint',
      ru: '4 этапа Generative Engine Optimization (GEO) и продвижения в поиске ИИ',
    },
    lifecycleSubtitle: {
      en: 'Entity Graphs, Schema.org Microdata & Direct Citation Engineering',
      ru: 'Графы сущностей, семантическая микроразметка и цитирование в ChatGPT/Perplexity',
    },
    steps: [
      {
        step: '01',
        duration: { en: '1 wk', ru: '1 нед.' },
        title: { en: 'Synthetic Search & AI Visibility Audit', ru: 'Аудит видимости бренда в ответах ChatGPT, Perplexity, Gemini' },
        desc: {
          en: 'Benchmarking brand appearance across 100+ prompt variations in ChatGPT, Perplexity, Claude, and Google AI Overviews.',
          ru: 'Тестирование видимости бренда по 100+ целевым промптам в ChatGPT, Perplexity, Claude и Yandex Neuro.',
        },
      },
      {
        step: '02',
        duration: { en: '1–2 wks', ru: '1–2 нед.' },
        title: { en: 'Schema.org & /llms.txt Architecture', ru: 'Внедрение семантической микроразметки и /llms.txt' },
        desc: {
          en: 'Engineering deep JSON-LD entity graphs, verifiable offer catalogs, and machine-readable markdown context roots.',
          ru: 'Разметка сайта графами сущностей Schema.org, прайсами, каталогом услуг и файлом /llms.txt для краулеров ИИ.',
        },
      },
      {
        step: '03',
        duration: { en: '2 wks', ru: '2 нед.' },
        title: { en: 'Authoritative Entity Seeding & Cross-Referencing', ru: 'Посев сущностей в доверенные базы данных' },
        desc: {
          en: 'Establishing validated company nodes across Wikidata, industry directories, benchmark indexes, and technical publications.',
          ru: 'Связка карточек в Wikidata, профильных рейтингах, B2B-каталогах и авторитетных отраслевых публикациях.',
        },
      },
      {
        step: '04',
        duration: { en: 'Continuous', ru: 'Постоянно' },
        title: { en: 'Generative Engine Rank & Citation Tracking', ru: 'Еженедельный трекинг частоты упоминаний в ответах ИИ' },
        desc: {
          en: 'Continuous monitoring of AI recommendation frequency, source link placement, and factual consistency.',
          ru: 'Автоматический мониторинг доли включения бренда в синтезированные ответы и проверка достоверности фактов.',
        },
      },
    ],
    roiTitle: {
      en: 'AI Search Visibility: Traditional SEO vs. Generative Engine Optimization (GEO)',
      ru: 'Видимость в поиске: традиционное SEO vs Generative Engine Optimization (GEO)',
    },
    roiSubtitle: {
      en: 'Citation frequency in synthesized answers, ingestion speed, and CAC impact',
      ru: 'Частота цитирования в ответах нейросетей и стоимость привлечения B2B-лида',
    },
    metrics: [
      {
        metric: { en: 'AI Engine Citation Frequency', ru: 'Частота включения бренда в ответы ИИ' },
        legacy: { en: '0–5% (invisible to answer engines)', ru: '0–5% (бренд невидим для нейросетей)' },
        aiStack: { en: '65–85% in target industry prompts', ru: '65–85% в профильных запросах' },
        delta: { en: '+1400% citation presence', ru: 'Стабильные рекомендации нейросетей' },
      },
      {
        metric: { en: 'AI Crawler Ingestion & Refresh Speed', ru: 'Скорость индексации изменений краулерами ИИ' },
        legacy: { en: '2–6 weeks web scraping lag', ru: '2–6 недель задержки краулеров' },
        aiStack: { en: '< 48 hours via /llms.txt', ru: '< 48 часов через /llms.txt' },
        delta: { en: '-90% ingestion delay', ru: 'Актуальные цены и данные всегда в топе' },
      },
      {
        metric: { en: 'Brand Attribution & Link Accuracy', ru: 'Точность фактов и прямых ссылок на сайт' },
        legacy: { en: 'Distorted facts & dead links', ru: 'Искажённые факты и вымышленные телефоны' },
        aiStack: { en: '100% verified URLs & pricing', ru: '100% прямые ссылки на реальные кейсы' },
        delta: { en: 'Clean authoritative presence', ru: 'Прямой целевой переход клиента' },
      },
      {
        metric: { en: 'CAC from AI-Powered Search', ru: 'Стоимость привлечения квалифицированного B2B-лида' },
        legacy: { en: '$85 — $220 via paid PPC', ru: '6 000 — 16 000 ₽ в контекстной рекламе' },
        aiStack: { en: '$12 — $35 via organic GEO citations', ru: '800 — 2 500 ₽ из органических ответов ИИ' },
        delta: { en: '-75% customer acquisition cost', ru: '-75% стоимости целевой заявки' },
      },
    ],
  },
};
