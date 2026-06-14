const APP_VERSION = 'v11';
const CACHE_APP = 'sentinela-app-' + APP_VERSION;
const CACHE_BIBLE = 'sentinela-bible-v1';
const CACHE_RUNTIME = 'sentinela-runtime-v1';
const CACHE_FLAG = 'sentinela-flag';
const FLAG_URL = 'https://flag.local/download-feito';
const KEEP_CACHES = [CACHE_APP, CACHE_BIBLE, CACHE_RUNTIME, CACHE_FLAG];

const RUNTIME_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cms-imgp.jw-cdn.org',
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net'
];

const NETWORK_ONLY_HOSTS = ['supabase.co', 'workers.dev'];

const RUNTIME_KEEP = [
    'swiper-bundle.min.js',
    'swiper-bundle.min.css',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];

const MAX_RUNTIME_ITEMS = 80;

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

function isProtectedRuntime(request) {
    const u = request.url;
    for (let i = 0; i < RUNTIME_KEEP.length; i++) {
        if (u.indexOf(RUNTIME_KEEP[i]) !== -1) return true;
    }
    return false;
}

async function pruneCache(cacheName, maxItems) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const removable = keys.filter((k) => !isProtectedRuntime(k));
        const excess = keys.length - maxItems;
        for (let i = 0; i < excess && i < removable.length; i++) {
            await cache.delete(removable[i]);
        }
    } catch (e) {}
}

async function setFlag() {
    try {
        const cache = await caches.open(CACHE_FLAG);
        await cache.put(FLAG_URL, new Response('1'));
    } catch (e) {}
}

async function clearFlag() {
    try {
        await caches.delete(CACHE_FLAG);
    } catch (e) {}
}

async function hasFlag() {
    try {
        const cache = await caches.open(CACHE_FLAG);
        return !!(await cache.match(FLAG_URL));
    } catch (e) {
        return false;
    }
}

async function staleWhileRevalidate(req, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedRes = await cache.match(req, { ignoreSearch: true });

    const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.ok) {
            cache.put(req, networkRes.clone()).catch(() => {});
        }
        return networkRes;
    }).catch(() => null);

    if (cachedRes) return cachedRes;
    const net = await fetchPromise;
    if (net) return net;
    return new Response(offlinePage(), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

async function cacheFirst(req, cacheName) {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;

    try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) {
            const cache = await caches.open(cacheName);
            await cache.put(req, res.clone());
            if (cacheName === CACHE_RUNTIME) pruneCache(CACHE_RUNTIME, MAX_RUNTIME_ITEMS);
        }
        return res;
    } catch (e) {
        return Response.error();
    }
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    let url;
    try { url = new URL(req.url); } catch (e) { return; }
    if (!url.protocol.startsWith('http')) return;
    if (hostMatches(url, NETWORK_ONLY_HOSTS)) return;

    const sameOrigin = url.origin === self.location.origin;

    if (sameOrigin && (url.pathname.indexOf('/biblia/') !== -1 || url.pathname.indexOf('/imagem/semanas/') !== -1)) {
        event.respondWith(cacheFirst(req, CACHE_BIBLE));
        return;
    }

    if (sameOrigin) {
        event.respondWith(staleWhileRevalidate(req, CACHE_APP));
        return;
    }

    if (hostMatches(url, RUNTIME_HOSTS)) {
        event.respondWith(cacheFirst(req, CACHE_RUNTIME));
        return;
    }
});

function offlinePage() {
    return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
        + '<title>Sem conexão</title><style>body{margin:0;min-height:100dvh;display:flex;'
        + 'align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;'
        + 'background:#f5f7fa;color:#1f2937;text-align:center;padding:24px}'
        + 'div{max-width:320px;background:#fff;padding:30px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.05)}'
        + 'h1{font-size:20px;margin:0 0 10px;color:#375255}p{font-size:15px;color:#6b7280;line-height:1.5;margin:0}</style></head>'
        + '<body><div><h1>Página não baixada</h1><p>Conecte-se à internet e use "Salvar &gt; Modo Offline" para baixar o conteúdo.</p></div></body></html>';
}

function reply(event, payload) {
    if (event.ports && event.ports[0]) event.ports[0].postMessage(payload);
    else if (event.source) event.source.postMessage(payload);
    return Promise.resolve();
}

self.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.action) return;

    if (data.action === 'START_DOWNLOAD') {
        event.waitUntil(startDownload(event.source, data.semana));
    } else if (data.action === 'CLEAR_CACHE') {
        event.waitUntil(clearOfflineCaches().then(() => reply(event, { type: 'CACHE_CLEARED' })));
    } else if (data.action === 'CACHE_STATUS') {
        event.waitUntil(getCacheStatus(data.semana).then((status) => reply(event, status)));
    }
});

function buildManifest() {
    const base = scope();
    const app = APP_FILES.map((p) => (p.indexOf('http') === 0 ? p : base + p));
    const bibleHtml = [];
    const bibleJson = [];
    for (let i = 0; i < BIBLE_BOOKS.length; i++) {
        const b = BIBLE_BOOKS[i];
        bibleHtml.push(base + 'biblia/livro/' + b.folder + '/' + b.file + '.html');
        bibleJson.push(base + 'sentinela/biblia/data/' + b.file + '.json');
    }
    return { app: app, bibleHtml: bibleHtml, bibleJson: bibleJson };
}

async function processInBatches(tasks, batchSize, source, progressRef) {
    const failed = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(async (task) => {
            try {
                const res = await fetch(task.url, { cache: 'reload', credentials: 'omit' });
                if (res && (res.ok || res.type === 'opaque')) {
                    await task.cache.put(task.url, res.clone());
                    return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        }));
        batch.forEach((task, index) => {
            if (!results[index] && task.required) failed.push(task);
            if (task.required && progressRef) progressRef.loaded++;
        });
        if (source && progressRef) {
            source.postMessage({ type: 'DOWNLOAD_PROGRESS', loaded: progressRef.loaded, total: progressRef.total });
        }
    }
    return failed;
}

async function startDownload(source, semanaStr) {
    try {
        const appCache = await caches.open(CACHE_APP);
        const bibleCache = await caches.open(CACHE_BIBLE);
        const man = buildManifest();

        const tasks = [];
        for (let i = 0; i < man.app.length; i++) tasks.push({ url: man.app[i], cache: appCache, required: true });
        for (let i = 0; i < man.bibleHtml.length; i++) tasks.push({ url: man.bibleHtml[i], cache: bibleCache, required: true });
        for (let i = 0; i < man.bibleJson.length; i++) tasks.push({ url: man.bibleJson[i], cache: bibleCache, required: true });

        const required = tasks.filter((t) => t.required).length;
        const progressRef = { loaded: 0, total: required };
        let failed = await processInBatches(tasks, 6, source, progressRef);

        if (failed.length > 0) {
            progressRef.loaded -= failed.length;
            failed = await processInBatches(failed, 3, source, progressRef);
        }

        if (semanaStr) {
            await downloadSentinela(bibleCache, semanaStr);
        }

        await setFlag();

        const missing = failed.length;
        if (source) source.postMessage({
            type: 'DOWNLOAD_COMPLETE',
            ok: missing === 0,
            loaded: progressRef.total - missing,
            total: progressRef.total,
            missing: missing
        });
    } catch (e) {
        if (source) source.postMessage({ type: 'DOWNLOAD_ERROR' });
    }
}

async function downloadSentinela(cache, semanaStr) {
    const base = scope();
    const artUrl = base + 'sentinela/artigos/' + semanaStr + '.html';
    try {
        const res = await fetch(artUrl, { cache: 'reload', credentials: 'omit' });
        if (!res || !res.ok) return;
        await cache.put(artUrl, res.clone());
        const html = await res.text();
        const re = /class=["']imagem(\d+)["']/g;
        const ids = [];
        let m;
        while ((m = re.exec(html))) ids.push(m[1]);

        const tasks = [];
        for (let i = 0; i < ids.length; i++) {
            tasks.push({ url: base + 'sentinela/imagem/semanas/' + semanaStr + '/img' + ids[i] + '.png', cache: cache, required: false });
            tasks.push({ url: base + 'sentinela/imagem/semanas/' + semanaStr + '/leg' + ids[i] + '.txt', cache: cache, required: false });
        }
        await processInBatches(tasks, 5, null, null);
    } catch (e) {}
}

async function clearOfflineCaches() {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
}

async function countPresentInCache(urls, cacheName) {
    let present = 0;
    try {
        const cache = await caches.open(cacheName);
        for (let i = 0; i < urls.length; i++) {
            if (await cache.match(urls[i], { ignoreSearch: true })) present++;
        }
    } catch (e) {}
    return present;
}

async function getCacheStatus(semanaStr) {
    if (!('caches' in self)) {
        return { type: 'CACHE_STATUS', hasCache: false, complete: false, present: 0, total: 0 };
    }

    const flag = await hasFlag();
    if (!flag) {
        return {
            type: 'CACHE_STATUS',
            hasCache: false,
            complete: false,
            present: 0,
            total: 0,
            semana: semanaStr
        };
    }

    const man = buildManifest();
    const appPresent = await countPresentInCache(man.app, CACHE_APP);
    const bibleHtmlPresent = await countPresentInCache(man.bibleHtml, CACHE_BIBLE);
    const bibleJsonPresent = await countPresentInCache(man.bibleJson, CACHE_BIBLE);

    const present = appPresent + bibleHtmlPresent + bibleJsonPresent;
    const total = man.app.length + man.bibleHtml.length + man.bibleJson.length;

    let articlePresent = false;
    if (semanaStr) {
        const articleUrl = scope() + 'sentinela/artigos/' + semanaStr + '.html';
        try {
            const bibleCache = await caches.open(CACHE_BIBLE);
            articlePresent = !!(await bibleCache.match(articleUrl, { ignoreSearch: true }));
        } catch (e) {}
    }

    return {
        type: 'CACHE_STATUS',
        hasCache: present > 0,
        complete: total > 0 && present === total,
        present: present,
        total: total,
        articlePresent: articlePresent,
        semana: semanaStr
    };
}
