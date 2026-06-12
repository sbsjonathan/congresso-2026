const APP_VERSION = 'v6';
const CACHE_APP = 'sentinela-app-' + APP_VERSION;
const CACHE_BIBLE = 'sentinela-bible-v1';
const CACHE_RUNTIME = 'sentinela-runtime-' + APP_VERSION;
const KEEP_CACHES = [CACHE_APP, CACHE_BIBLE, CACHE_RUNTIME];

const RUNTIME_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cms-imgp.jw-cdn.org',
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net'
];

const NETWORK_ONLY_HOSTS = ['supabase.co', 'workers.dev'];

const APP_FILES = [
    '',
    'index.html',
    'main.js',
    'manifest.json',
    'assets/icons/app-icon.svg',
    'navbar/navbar-unified.css',
    'navbar/navbar-unified.js',
    'navbar/network-sensor.js',
    'save/auth-supabase.html',
    'save/config.js',
    'save/supabase.js',
    'save/unified-load.js',
    'save/auto-save.js',
    'save/sentinela-sync.js',
    'save/asmb-sync.js',
    'save/offline-manager.js',
    'richtext/container.html',
    'richtext/editor.css',
    'richtext/barra.css',
    'richtext/perf-low.css',
    'richtext/editor.js',
    'richtext/barra.js',
    'richtext/perf-profile.js',
    'richtext/cache-r.js',
    'richtext/liquid-glass.js',
    'richtext/plugin/negrita.css',
    'richtext/plugin/bullet.css',
    'richtext/plugin/cores.css',
    'richtext/plugin/font.css',
    'richtext/plugin/leitor.css',
    'richtext/plugin/undo.js',
    'richtext/plugin/negrita.js',
    'richtext/plugin/bullet.js',
    'richtext/plugin/cores.js',
    'richtext/plugin/font.js',
    'richtext/plugin/leitor.js',
    'richtext/biblia/stylebbl.css',
    'richtext/biblia/abrev.js',
    'richtext/biblia/scriptbbl-container.js',
    'sentinela/style.css',
    'sentinela/imagem.js',
    'sentinela/mark.js',
    'sentinela/clickable/clickable.css',
    'sentinela/clickable/clickable.js',
    'sentinela/clickable/cache.js',
    'sentinela/clickable/agente_perguntas.js',
    'sentinela/clickable/agente_recap.js',
    'sentinela/clickable/agente-obj.js',
    'sentinela/clickable/agente-sub.js',
    'sentinela/clickable/agente-modal/agente-modal.css',
    'sentinela/clickable/agente-modal/agente-modal.js',
    'sentinela/menu/menu.css',
    'sentinela/menu/menu.js',
    'sentinela/menu/style.css',
    'sentinela/menu/imagem.js',
    'sentinela/imagem/swiper-zoom.css',
    'sentinela/imagem/swiper-zoom.js',
    'sentinela/biblia/abrev.js',
    'sentinela/biblia/scriptbbl.js',
    'sentinela/biblia/stylebbl.css',
    'biblia/biblia.html',
    'biblia/capitulo.html',
    'biblia/livro/style-bbl.css',
    'stylep.css',
    'programacao/programacao.css',
    'programacao/programacao-bbl.js',
    'programacao/dia.js',
    'programacao/sex.html',
    'programacao/sab.html',
    'programacao/dom.html',
    'programacao/imagens/sex.jpeg',
    'programacao/imagens/sab.jpeg',
    'programacao/imagens/dom.jpeg',
    'assembleia/anotacoes/agente-ia.js',
    'assembleia/anotacoes/clickable/click-asmb.css',
    'assembleia/anotacoes/clickable/click-asmb.js',
    'assembleia/anotacoes/clickable/fullsc.css',
    'assembleia/anotacoes/clickable/fullsc.html',
    'assembleia/anotacoes/clickable/fullsc.js',
    'assembleia/export/export.css',
    'assembleia/export/export.js',
    'assembleia/hora/styleh.css',
    'assembleia/hora/scripth.js',
    'assembleia/menu/menu.css',
    'assembleia/menu/menu.js',
    'assembleia/menu/menu-ram.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css'
];

const OPTIONAL_FILES = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'assets/icons/apple-touch-icon.png',
    'assets/icons/favicon-32.png',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/maskable-icon-512.png',
    'worker/worker.html'
];

const BIBLE_BOOKS = [
    { folder: '01-genesis', file: 'genesis' }, { folder: '02-exodo', file: 'exodo' },
    { folder: '03-levitico', file: 'levitico' }, { folder: '04-numeros', file: 'numeros' },
    { folder: '05-deuteronomio', file: 'deuteronomio' }, { folder: '06-josue', file: 'josue' },
    { folder: '07-juizes', file: 'juizes' }, { folder: '08-rute', file: 'rute' },
    { folder: '09-1samuel', file: '1samuel' }, { folder: '10-2samuel', file: '2samuel' },
    { folder: '11-1reis', file: '1reis' }, { folder: '12-2reis', file: '2reis' },
    { folder: '13-1cronicas', file: '1cronicas' }, { folder: '14-2cronicas', file: '2cronicas' },
    { folder: '15-esdras', file: 'esdras' }, { folder: '16-neemias', file: 'neemias' },
    { folder: '17-ester', file: 'ester' }, { folder: '18-jo', file: 'jo' },
    { folder: '19-salmos', file: 'salmos' }, { folder: '20-proverbios', file: 'proverbios' },
    { folder: '21-eclesiastes', file: 'eclesiastes' }, { folder: '22-canticos', file: 'canticos' },
    { folder: '23-isaias', file: 'isaias' }, { folder: '24-jeremias', file: 'jeremias' },
    { folder: '25-lamentacoes', file: 'lamentacoes' }, { folder: '26-ezequiel', file: 'ezequiel' },
    { folder: '27-daniel', file: 'daniel' }, { folder: '28-oseias', file: 'oseias' },
    { folder: '29-joel', file: 'joel' }, { folder: '30-amos', file: 'amos' },
    { folder: '31-obadias', file: 'obadias' }, { folder: '32-jonas', file: 'jonas' },
    { folder: '33-miqueias', file: 'miqueias' }, { folder: '34-naum', file: 'naum' },
    { folder: '35-habacuque', file: 'habacuque' }, { folder: '36-sofonias', file: 'sofonias' },
    { folder: '37-ageu', file: 'ageu' }, { folder: '38-zacarias', file: 'zacarias' },
    { folder: '39-malaquias', file: 'malaquias' }, { folder: '40-mateus', file: 'mateus' },
    { folder: '41-marcos', file: 'marcos' }, { folder: '42-lucas', file: 'lucas' },
    { folder: '43-joao', file: 'joao' }, { folder: '44-atos', file: 'atos' },
    { folder: '45-romanos', file: 'romanos' }, { folder: '46-1corintios', file: '1corintios' },
    { folder: '47-2corintios', file: '2corintios' }, { folder: '48-galatas', file: 'galatas' },
    { folder: '49-efesios', file: 'efesios' }, { folder: '50-filipenses', file: 'filipenses' },
    { folder: '51-colossenses', file: 'colossenses' }, { folder: '52-1tessalonicenses', file: '1tessalonicenses' },
    { folder: '53-2tessalonicenses', file: '2tessalonicenses' }, { folder: '54-1timoteo', file: '1timoteo' },
    { folder: '55-2timoteo', file: '2timoteo' }, { folder: '56-tito', file: 'tito' },
    { folder: '57-filemon', file: 'filemon' }, { folder: '58-hebreus', file: 'hebreus' },
    { folder: '59-tiago', file: 'tiago' }, { folder: '60-1pedro', file: '1pedro' },
    { folder: '61-2pedro', file: '2pedro' }, { folder: '62-1joao', file: '1joao' },
    { folder: '63-2joao', file: '2joao' }, { folder: '64-3joao', file: '3joao' },
    { folder: '65-judas', file: 'judas' }, { folder: '66-apocalipse', file: 'apocalipse' }
];

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.map((name) => (KEEP_CACHES.indexOf(name) === -1 ? caches.delete(name) : Promise.resolve()))
        )).then(() => self.clients.claim())
    );
});

function scope() {
    return self.registration.scope;
}

function hostMatches(url, hosts) {
    for (let i = 0; i < hosts.length; i++) {
        if (url.hostname.indexOf(hosts[i]) !== -1) return true;
    }
    return false;
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    let url;
    try { url = new URL(req.url); } catch (e) { return; }
    if (!url.protocol.startsWith('http')) return;
    if (hostMatches(url, NETWORK_ONLY_HOSTS)) return;

    const sameOrigin = url.origin === self.location.origin;
    const cacheable = sameOrigin || hostMatches(url, RUNTIME_HOSTS);
    if (!cacheable) return;

    event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;

    try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_RUNTIME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
    } catch (e) {
        const fallback = await caches.match(req, { ignoreSearch: true });
        if (fallback) return fallback;
        const accept = req.headers.get('accept') || '';
        if (req.mode === 'navigate' || accept.indexOf('text/html') !== -1) {
            return new Response(offlinePage(), {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
        return Response.error();
    }
}

function offlinePage() {
    return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
        + '<title>Sem conexão</title><style>body{margin:0;min-height:100dvh;display:flex;'
        + 'align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;'
        + 'background:#000;color:#f2f2f7;text-align:center;padding:24px}div{max-width:320px}'
        + 'h1{font-size:20px;margin:0 0 8px}p{font-size:15px;color:#8e8e93;line-height:1.5}</style></head>'
        + '<body><div><h1>Página não baixada</h1><p>Esta parte ainda não está disponível offline. '
        + 'Conecte-se à internet e baixe o conteúdo para uso offline.</p></div></body></html>';
}

self.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.action) return;

    if (data.action === 'START_DOWNLOAD') {
        event.waitUntil(startDownload(event.source));
    } else if (data.action === 'CLEAR_CACHE') {
        event.waitUntil(clearOfflineCaches().then(() => reply(event, { type: 'CACHE_CLEARED' })));
    } else if (data.action === 'CACHE_STATUS') {
        event.waitUntil(getCacheStatus().then((status) => reply(event, status)));
    }
});

function reply(event, payload) {
    if (event.ports && event.ports[0]) {
        event.ports[0].postMessage(payload);
    } else if (event.source) {
        event.source.postMessage(payload);
    }
    return Promise.resolve();
}

function buildRequiredManifest() {
    const base = scope();
    const app = APP_FILES.map((p) => (p.indexOf('http') === 0 ? p : base + p));
    const bible = [];
    for (let i = 0; i < BIBLE_BOOKS.length; i++) {
        const b = BIBLE_BOOKS[i];
        bible.push(base + 'biblia/livro/' + b.folder + '/' + b.file + '.html');
        bible.push(base + 'sentinela/biblia/data/' + b.file + '.json');
    }
    return { app: app, bible: bible };
}

function getSemanaAtual() {
    const hoje = new Date();
    const dia = hoje.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diff);
    const dd = String(segunda.getDate()).padStart(2, '0');
    const mm = String(segunda.getMonth() + 1).padStart(2, '0');
    return dd + '-' + mm;
}

async function cacheUrl(cache, url) {
    try {
        const res = await fetch(url, { cache: 'reload', credentials: 'omit' });
        if (res && (res.ok || res.type === 'opaque')) {
            await cache.put(url, res.clone());
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

async function startDownload(source) {
    try {
        const req = buildRequiredManifest();
        const appCache = await caches.open(CACHE_APP);
        const bibleCache = await caches.open(CACHE_BIBLE);

        const tasks = [];
        for (let i = 0; i < req.app.length; i++) tasks.push({ url: req.app[i], cache: appCache });
        for (let i = 0; i < req.bible.length; i++) tasks.push({ url: req.bible[i], cache: bibleCache });

        const total = tasks.length;
        let loaded = 0;
        let failed = [];

        for (let i = 0; i < tasks.length; i++) {
            const ok = await cacheUrl(tasks[i].cache, tasks[i].url);
            if (!ok) failed.push(tasks[i]);
            loaded++;
            if (source) source.postMessage({ type: 'DOWNLOAD_PROGRESS', loaded: loaded, total: total });
        }

        for (let pass = 0; pass < 2 && failed.length; pass++) {
            const still = [];
            for (let i = 0; i < failed.length; i++) {
                const ok = await cacheUrl(failed[i].cache, failed[i].url);
                if (!ok) still.push(failed[i]);
            }
            failed = still;
        }

        await downloadOptional(appCache);

        const missing = failed.length;
        if (source) source.postMessage({
            type: 'DOWNLOAD_COMPLETE',
            ok: missing === 0,
            loaded: total - missing,
            total: total,
            missing: missing,
            missingUrls: failed.map(function (t) { return t.url; })
        });
    } catch (e) {
        if (source) source.postMessage({ type: 'DOWNLOAD_ERROR' });
    }
}

async function downloadOptional(appCache) {
    const base = scope();
    const opt = OPTIONAL_FILES.map((p) => (p.indexOf('http') === 0 ? p : base + p));
    const semana = getSemanaAtual();
    opt.push(base + 'sentinela/artigos/' + semana + '.html');

    for (let i = 0; i < opt.length; i++) {
        await cacheUrl(appCache, opt[i]);
    }

    try {
        const res = await fetch(base + 'sentinela/artigos/' + semana + '.html', { cache: 'reload' });
        if (!res.ok) return;
        const html = await res.text();
        const re = /class=["']imagem(\d+)["']/g;
        const ids = [];
        let m;
        while ((m = re.exec(html))) ids.push(m[1]);
        for (let i = 0; i < ids.length; i++) {
            await cacheUrl(appCache, base + 'sentinela/imagem/semanas/' + semana + '/img' + ids[i] + '.png');
            await cacheUrl(appCache, base + 'sentinela/imagem/semanas/' + semana + '/leg' + ids[i] + '.txt');
        }
    } catch (e) {}
}

async function clearOfflineCaches() {
    const names = await caches.keys();
    await Promise.all(names.map((n) => {
        if (n.indexOf('sentinela') !== -1 || n.indexOf('reuniao') !== -1) return caches.delete(n);
        return Promise.resolve();
    }));
}

async function countPresent(urls) {
    let present = 0;
    for (let i = 0; i < urls.length; i++) {
        const hit = await caches.match(urls[i], { ignoreSearch: true });
        if (hit) present++;
    }
    return present;
}

async function getCacheStatus() {
    if (!('caches' in self)) {
        return { type: 'CACHE_STATUS', hasCache: false, complete: false, present: 0, total: 0 };
    }

    const req = buildRequiredManifest();
    const appPresent = await countPresent(req.app);
    const biblePresent = await countPresent(req.bible);

    const appTotal = req.app.length;
    const bibleTotal = req.bible.length;
    const present = appPresent + biblePresent;
    const total = appTotal + bibleTotal;

    const semana = getSemanaAtual();
    const articleUrl = scope() + 'sentinela/artigos/' + semana + '.html';
    const articlePresent = !!(await caches.match(articleUrl, { ignoreSearch: true }));

    return {
        type: 'CACHE_STATUS',
        hasCache: present > 0,
        complete: total > 0 && present === total,
        present: present,
        total: total,
        appPresent: appPresent,
        appTotal: appTotal,
        biblePresent: biblePresent,
        bibleTotal: bibleTotal,
        articlePresent: articlePresent,
        semana: semana
    };
}