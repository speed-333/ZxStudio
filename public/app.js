const THEMES=['red','blue','purple','green','orange','cyan','pink'];
function setTheme(theme){
  if(!THEMES.includes(theme)) theme='red';
  document.documentElement.dataset.theme=theme;
  localStorage.setItem('zx-theme',theme);
  document.querySelectorAll('.theme-dot').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));
}
function initTheme(){const saved=localStorage.getItem('zx-theme');setTheme(saved && THEMES.includes(saved) ? saved : 'red');}

const state={lang:localStorage.getItem('zx-lang')||'ar',projects:[],project:null,homeExpanded:new Set(),sidebarExpanded:new Set()};

function initSnow(){
  const layer=document.getElementById('snowLayer');
  if(!layer || layer.dataset.ready==='1') return;
  layer.dataset.ready='1';
  const count=105;
  const fragment=document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const flake=document.createElement('span');
    flake.className='snowflake';
    const size=(Math.random()*2.2+1).toFixed(2);
    const left=(Math.random()*100).toFixed(2);
    const duration=(9+Math.random()*6).toFixed(2);
    const delay=(-Math.random()*15).toFixed(2);
    const drift=(Math.random()*90-45).toFixed(1);
    const opacity=(0.38+Math.random()*0.48).toFixed(2);
    flake.style.setProperty('--snow-size',`${size}px`);
    flake.style.setProperty('--snow-left',`${left}%`);
    flake.style.setProperty('--snow-duration',`${duration}s`);
    flake.style.setProperty('--snow-delay',`${delay}s`);
    flake.style.setProperty('--snow-drift',`${drift}px`);
    flake.style.setProperty('--snow-opacity',opacity);
    fragment.appendChild(flake);
  }
  layer.appendChild(fragment);
}

const I18N={
 en:{'nav.home':'Home','nav.projects':'Projects','nav.wiki':'Wiki','footer':'A public ZxStudio documentation hub for your Minecraft plugins.','hero.eyebrow':'ZxStudio / Plugin Studio','hero.title':'ZxStudio.\nYour plugins, documented.','hero.sub':'A polished public home for the plugins you build, with documentation and release information.','hero.discord':'Plugin Support','projects.kicker':'PROJECT','projects.title':'All plugins.','projects.lead':'Browse every plugin published by ZxStudio, then open its dedicated documentation and release information.','feature.1':'Paper + Folia','feature.1p':'Built for the current Paper API target and explicitly marked Folia-supported.','feature.2':'Plugin Features','feature.2p':'A variety of features designed to make plugin management, discovery and documentation simple and organized.','feature.3':'Full documentation','feature.3p':'Commands, permissions, YAML, rewards, keys, holograms, placeholders, KeyAll and troubleshooting.','feature.4':'Public documentation','feature.4p':'Visitors can browse plugins, documentation, releases and technical details.','back':'Back','download':'Download latest build','updated':'Updated','noFile':'No build uploaded yet.','wiki':'Wiki','search.title':'Search ZxStudio','search.placeholder':'Search wiki, commands, placeholders...'},
 ar:{'nav.home':'الرئيسية','nav.projects':'المشروع','nav.wiki':'الويكي','footer':'منصة ZxStudio العامة لعرض وتوثيق Plugins الخاصة بك.','hero.eyebrow':'ZxStudio / Plugin Studio','hero.title':'ZxStudio.\nكل Plugins الخاصة بك، موثقة.','hero.sub':'موقع ZxStudio الرئيسي لعرض Plugins التي تطورها، مع توثيق عام ومعلومات الإصدارات.','hero.cta':'استكشف الـPlugins','hero.docs':'افتح الويكي','hero.discord':'سيرفر دعم البلوقنات','projects.kicker':'المشروع','projects.title':'كل الـPlugins.','projects.lead':'هنا تجد كل Plugins التي ينشرها ZxStudio، وكل Plugin يملك Wiki مستقلاً ومنظماً.','feature.1':'Paper + Folia','feature.1p':'مبني على هدف Paper الحالي ومعلن رسميًا كمتوافق مع Folia.','feature.2':'مميزات الـPlugins','feature.2p':'مجموعة متنوعة من المميزات التي تساعد على تنظيم الـPlugins وعرضها وتوثيقها بشكل واضح وسهل.','feature.3':'ويكي كامل','feature.3p':'الأوامر والصلاحيات وYAML والجوائز والمفاتيح والهولوجرام والـPlaceholders وKeyAll وحل المشاكل.','feature.4':'توثيق عام','feature.4p':'الزوار يستطيعون تصفح الـPlugins والـWiki والإصدارات والمعلومات التقنية.','back':'رجوع','download':'تحميل آخر نسخة','updated':'آخر تحديث','noFile':'لم يتم رفع نسخة بعد.','wiki':'الويكي','search.title':'بحث ZxStudio','search.placeholder':'ابحث في الويكي والأوامر والـPlaceholders...'}
};
const t=k=>I18N[state.lang][k]||k;const el=s=>document.querySelector(s);
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function setLang(lang){state.lang=lang;localStorage.setItem('zx-lang',lang);document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.body.classList.toggle('rtl',lang==='ar');applyI18n();route();}
function applyI18n(){document.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=t(n.dataset.i18n));const s=el('#searchInput');if(s)s.placeholder=t('search.placeholder');const b=el('#langBtn');if(b)b.textContent=state.lang==='ar'?'English':'العربية';}
async function fetchProjects(){try{const r=await fetch('/api/projects',{cache:'no-store'});if(r.ok){state.projects=await r.json();}}catch(_e){}if(!state.projects.length){try{const r=await fetch('/seed-zxcrates.json',{cache:'no-store'});if(r.ok){state.projects=[await r.json()];}}catch(_e){}}state.project=state.projects.find(p=>p.slug==='zxcrates')||state.projects[0]||null;}
function projectCards(){const ps=state.projects||[];if(!ps.length)return '<div class="empty">No plugins found.</div>';return ps.map(p=>`<article class="card project-card"><div class="project-top"><div class="project-icon">${esc((p.name||p.slug||'P').slice(0,2))}</div><span class="status stable">stable</span></div><h3>${esc(p.name||p.slug)} <span class="muted">v${esc(p.version||'')}</span></h3><p>${esc(p.description?.[state.lang]||p.description?.en||'')}</p><div class="tags">${(p.tags||[]).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><a class="view-link" href="#/project/${encodeURIComponent(p.slug)}/wiki/${encodeURIComponent(p.wiki?.[0]?.id||'overview')}">${state.lang==='ar'?'فتح الويكي':'Open wiki'} →</a></article>`).join('');}
function home(){const ps=state.projects||[];const pluginRows=ps.map(p=>{const open=state.homeExpanded.has(p.slug);const first=p.wiki?.[0]?.id||'overview';const desc=esc(p.description?.[state.lang]||p.description?.en||'');const tags=(p.tags||[]).slice(0,5).map(x=>`<span class="tag">${esc(x)}</span>`).join('');return `<div class="home-plugin ${open?'expanded':''}"><div class="home-plugin-row"><a class="home-plugin-main" href="#/project/${encodeURIComponent(p.slug)}/wiki/${encodeURIComponent(first)}"><span class="project-icon large">${esc((p.name||p.slug||'P').slice(0,2))}</span><span class="home-plugin-copy"><strong>${esc(p.name||p.slug)}</strong><small>v${esc(p.version||'')}</small></span></a><button class="home-plugin-toggle" type="button" aria-expanded="${open?'true':'false'}" data-plugin-toggle="${esc(p.slug)}" title="${state.lang==='ar'?'عرض معلومات البلوقن':'Show plugin details'}"><span>⌄</span></button></div>${open?`<div class="home-plugin-details"><p>${desc}</p><div class="tags">${tags}</div><div class="home-plugin-actions"><a class="primary-btn small" href="#/project/${encodeURIComponent(p.slug)}/wiki/${encodeURIComponent(first)}">${state.lang==='ar'?'فتح الـWiki':'Open Wiki'} →</a><span class="plugin-mini-meta">${(p.tags||[]).length?`${p.tags.length} ${state.lang==='ar'?'تقنيات':'tags'}`:''}</span></div></div>`:''}</div>`}).join('');const firstPlugin=ps[0];const firstHref=firstPlugin?`#/project/${encodeURIComponent(firstPlugin.slug)}/wiki/${encodeURIComponent(firstPlugin.wiki?.[0]?.id||'overview')}`:'#/projects';return `${docsSidebar(null,'')}<div class="home-shell"><div class="home-content full-width-home"><div class="container"><section class="hero"><div><span class="eyebrow">✦ ${t('hero.eyebrow')}</span><h1>${t('hero.title').split('\n')[0]}<br><span class="gradient-text">${t('hero.title').split('\n')[1]}</span></h1><p>${t('hero.sub')}</p><div class="hero-actions"><a class="discord-btn" href="https://discord.gg/QUVSqXfyvC" target="_blank" rel="noopener noreferrer" aria-label="${t('hero.discord')}"><span class="discord-icon" aria-hidden="true"><svg viewBox="0 0 24 24" role="img"><path d="M19.54 5.16A16.3 16.3 0 0 0 15.54 4l-.55 1.13a14.4 14.4 0 0 0-5.98 0L8.46 4a16.33 16.33 0 0 0-4.01 1.16C1.9 9.04 1.21 12.81 1.56 16.53a16.18 16.18 0 0 0 4.92 2.5l1.18-1.62c-.65-.24-1.28-.54-1.87-.89.16-.12.31-.24.46-.36 3.61 1.66 7.52 1.66 11.08 0 .16.12.31.24.47.36-.6.35-1.23.65-1.88.89l1.18 1.62a16.2 16.2 0 0 0 4.92-2.5c.4-4.32-.68-8.05-2.48-11.37ZM8.58 14.94c-1.07 0-1.95-.97-1.95-2.17s.87-2.17 1.95-2.17 1.96.97 1.95 2.17c0 1.2-.87 2.17-1.95 2.17Zm6.84 0c-1.07 0-1.95-.97-1.95-2.17s.87-2.17 1.95-2.17 1.95.97 1.95 2.17-.87 2.17-1.95 2.17Z" fill="currentColor"/></svg></span><span>${t('hero.discord')}</span><span class="discord-arrow">↗</span></a></div></div><div class="hero-visual"><div class="code-card"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div class="code"><div><span class="r">studio:</span> <span class="w">ZxStudio</span></div><div><span class="r">plugins:</span> <span class="w">${ps.length}</span></div><div><span class="r">docs:</span> <span class="w">bilingual</span></div><div><span class="r">themes:</span> <span class="g">bright</span></div><div><span class="r">access:</span> <span class="g">read-only</span></div><div><span class="r">wiki:</span> <span class="g">organized</span></div><div><span class="r">focus:</span> <span class="g">Minecraft</span></div></div></div><div class="orb"></div><div class="glow-card"><strong>ZxStudio Plugins</strong><div class="stat-row"><span>${ps.length} plugins</span><span>AR / EN</span><span>public docs</span></div></div></div></section><section class="section"><div class="kicker">ZxStudio</div><h2>${state.lang==='ar'?'مركز نشر وتوثيق للـMinecraft Plugins':'Your Minecraft plugin publishing hub'}</h2><div class="feature-row" style="margin-top:22px"><div class="feature"><span>◈</span><h4>${t('feature.1')}</h4><p>${t('feature.1p')}</p></div><div class="feature"><span>✦</span><h4>${t('feature.2')}</h4><p>${t('feature.2p')}</p></div><div class="feature"><span>≡</span><h4>${t('feature.3')}</h4><p>${t('feature.3p')}</p></div><div class="feature"><span>◆</span><h4>${t('feature.4')}</h4><p>${t('feature.4p')}</p></div></div></section></div></div></div>`;}
function projects(){return `<div class="container page"><div class="section-head"><div><div class="kicker">${t('projects.kicker')}</div><h2>${t('projects.title')}</h2><p class="lead">${t('projects.lead')}</p></div></div><div class="grid single-grid">${projectCards()}</div></div>`;}
function pluginTreeList(p,activeId,filter=''){const activeSlug=p?.slug||'';const q=String(filter||'').trim().toLowerCase();const rows=(state.projects||[]).map(x=>{const first=x.wiki?.[0]?.id||'overview';const active=x.slug===activeSlug;const expanded=state.sidebarExpanded.has(x.slug);const name=x.name||x.slug||'Plugin';const matchesPlugin=!q||name.toLowerCase().includes(q)||String(x.slug||'').toLowerCase().includes(q);const pageGroups=new Map();for(const page of (x.wiki||[])){const label=page.group?.[state.lang]||page.group?.en||'Documentation';const title=page.title?.[state.lang]||page.title?.en||page.id;const hay=`${name} ${title} ${label}`.toLowerCase();if(q&&!matchesPlugin&&!hay.includes(q)) continue;if(!pageGroups.has(label))pageGroups.set(label,[]);pageGroups.get(label).push(page);}if(q&&!matchesPlugin&&!pageGroups.size)return '';const childId=`plugin-pages-${esc(x.slug).replace(/[^a-zA-Z0-9_-]/g,'-')}`;const childHtml=[...pageGroups.entries()].map(([label,pages])=>`<div class="plugin-child-group"><div class="plugin-child-group-title">${esc(label)}</div>${pages.map(page=>`<a class="plugin-child-link ${page.id===activeId&&active?'active':''}" href="#/project/${encodeURIComponent(x.slug)}/wiki/${encodeURIComponent(page.id)}"><span class="child-chevron">›</span><span>${esc(page.title?.[state.lang]||page.title?.en||page.id)}</span></a>`).join('')}</div>`).join('');const toggleLabel=state.lang==='ar'?(expanded?`إغلاق أقسام ${name}`:`فتح أقسام ${name}`):(expanded?`Collapse ${name} wiki sections`:`Expand ${name} wiki sections`);return `<div class="plugin-tree ${active?'current':''} ${expanded?'open':''}"><div class="plugin-tree-row"><a class="plugin-tree-name" href="#/project/${encodeURIComponent(x.slug)}/wiki/${encodeURIComponent(first)}"><span class="plugin-doc-icon">${esc((x.icon||x.name||x.slug||'P').slice(0,2))}</span><span class="plugin-tree-copy"><b>${esc(name)}</b><small>v${esc(x.version||'')}</small></span></a><button class="plugin-tree-toggle" type="button" aria-expanded="${expanded?'true':'false'}" aria-controls="${childId}" data-sidebar-toggle="${esc(x.slug)}" aria-label="${esc(toggleLabel)}" title="${esc(toggleLabel)}"><span aria-hidden="true">›</span></button></div><div class="plugin-tree-pages" id="${childId}">${childHtml||`<div class="plugin-empty-pages">${state.lang==='ar'?'لا توجد صفحات بعد':'No pages yet'}</div>`}</div></div>`;}).join('');return `<div class="plugin-tree-list">${rows||`<div class="empty-mini">${state.lang==='ar'?'لا توجد Plugins أو صفحات مطابقة.':'No matching plugins or pages.'}</div>`}</div>`;}
function pluginSidebar(p,activeId,filter=''){return `<div class="plugins-label">PLUGIN DOCUMENTATION</div><div class="sidebar-search"><span>⌕</span><input id="wikiSidebarSearch" value="${esc(filter)}" placeholder="${state.lang==='ar'?'البحث في الـPlugins والويكي...':'Search plugins and docs...'}"></div>${pluginTreeList(p,activeId,filter)}`;}
function groupedSidebar(p,activeId,filter=''){const groups=new Map();for(const x of (p.wiki||[])){const label=x.group?.[state.lang]||x.group?.en||'Reference';const text=(x.title?.[state.lang]||x.title?.en||x.id);if(filter && !(`${text} ${label}`.toLowerCase().includes(filter.toLowerCase()))) continue;if(!groups.has(label))groups.set(label,[]);groups.get(label).push(x);}return [...groups.entries()].map(([label,pages])=>`<div class="sidebar-group"><div class="sidebar-group-title">${esc(label)}</div>${pages.map(x=>`<a class="side-link ${x.id===activeId?'active':''}" href="#/project/${encodeURIComponent(p.slug)}/wiki/${encodeURIComponent(x.id)}"><span class="side-dot"></span>${esc(x.title?.[state.lang]||x.title?.en||x.id)}</a>`).join('')}</div>`).join('');}
function docsSidebar(p,activeId){const projectActive=!!p;return `<aside class="docs-sidebar"><div class="docs-sidebar-head"><a class="docs-brand" href="#/"><span class="docs-brand-mark">Z</span><span><b>ZxStudio</b><small>${state.lang==='ar'?'Plugin Documentation':'Plugin Documentation'}</small></span></a></div><nav class="docs-utility-nav"><a href="#/" class="utility-link ${!projectActive?'active':''}">⌂ <span>${state.lang==='ar'?'الرئيسية':'Home'}</span></a><a href="#/projects" class="utility-link">◫ <span>${state.lang==='ar'?'الـPlugins':'Plugins'}</span></a></nav>${pluginSidebar(p,activeId)}</aside>`;}
function highlightYaml(code=''){
  const escLine=(line)=>String(line).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return code.split('\n').map(line=>{
    const safe=escLine(line);
    if(/^\s*#/.test(line)) return `<span class="yaml-comment">${safe}</span>`;
    let x=safe;
    x=x.replace(/^(\s*)([^\s:#][^:]*):(.*)$/,(m,indent,key,rest)=>{
      return `${indent}<span class="yaml-key">${key}</span>:${rest}`;
    });
    x=x.replace(/(&quot;.*?&quot;|'[^']*')/g,'<span class="yaml-string">$1</span>');
    x=x.replace(/\b(true|false|null|yes|no)\b/g,'<span class="yaml-bool">$1</span>');
    x=x.replace(/(^|\s)(-?\d+(?:\.\d+)?)(?=\s|$)/g,'$1<span class="yaml-number">$2</span>');
    return `<span class="yaml-line">${x}</span>`;
  }).join('');
}
function highlightCode(code='',lang='text'){
  if(/^ya?ml$/i.test(lang)) return highlightYaml(code);
  return esc(code).split('\n').map(line=>`<span class="code-line">${line}</span>`).join('');
}
function renderFence(code,lang='text',filename=''){
  const cleanLang=(lang||'text').toLowerCase();
  const displayName=filename||({yaml:'YAML',yml:'YAML',json:'JSON',bash:'Shell',sh:'Shell',java:'Java',text:'Code'}[cleanLang]||cleanLang.toUpperCase());
  return `<div class="code-window"><div class="code-window-bar"><span class="code-window-title">${esc(displayName)}</span><span class="code-window-lang">${esc(cleanLang)}</span></div><pre class="syntax-code"><code>${highlightCode(code,cleanLang)}</code></pre></div>`;
}
function renderMarkdown(raw='',filename=''){
  let source=String(raw||'');
  const fences=[];
  source=source.replace(/```([A-Za-z0-9_-]*)\n([\s\S]*?)```/g,(_,lang,code)=>{
    const token=`@@CODEBLOCK_${fences.length}@@`;
    fences.push(renderFence(code.replace(/\n$/,''),lang||'text',filename));
    return token;
  });
  let s=esc(source)
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>');
  const lines=s.split('\n'); let out='',ul=false;
  for(const line of lines){
    if(/^@@CODEBLOCK_\d+@@$/.test(line)){ if(ul){out+='</ul>';ul=false;} out+=fences[Number(line.match(/\d+/)[0])]; continue; }
    if(/^<h[1-3]>/.test(line)){ if(ul){out+='</ul>';ul=false;} out+=line; continue; }
    if(/^[-*] /.test(line)){ if(!ul){out+='<ul>';ul=true;} out+=`<li>${line.slice(2)}</li>`; continue; }
    if(!line.trim()){ if(ul){out+='</ul>';ul=false;} continue; }
    if(ul){out+='</ul>';ul=false;} out+=`<p>${line}</p>`;
  }
  if(ul)out+='</ul>';
  return out;
}
function wikiHome(){return `<div class="container page"><div class="page-layout"><article class="article no-sidebar"><div class="kicker">ZxStudio / ${esc(state.project?.name||'Plugin')} Wiki</div><h1>${state.lang==='ar'?'المقدمة':'Overview'}</h1><p class="sub">${esc(state.project?.description?.[state.lang]||state.project?.description?.en||'')}</p><div class="doc-intro"><strong>${state.lang==='ar'?'توثيق ZxCrates داخل ZxStudio':'ZxCrates documentation inside ZxStudio'}</strong><p>${state.lang==='ar'?'ZxStudio هو الموقع الرئيسي، وكل Plugin يملك Wiki مستقلاً مع صفحات وأقسام منظمة في الشريط الجانبي.':'ZxStudio is the main site, while each plugin has its own organized wiki and documentation tree.'}</p></div><div class="grid wiki-cards">${(state.project?.wiki||[]).slice(0,6).map(x=>`<a class="card" href="#/project/${encodeURIComponent(state.project?.slug||'')}/wiki/${encodeURIComponent(x.id)}"><div class="kicker">${esc(x.group?.[state.lang]||x.group?.en||'')}</div><h3>${esc(x.title?.[state.lang]||x.title?.en||x.id)}</h3><p>${esc((x.body?.[state.lang]||x.body?.en||'').replace(/^#.*$/gm,'').slice(0,180))}…</p></a>`).join('')}</div></article></div></div>`;}
function projectWikiPage(id){const p=state.project;const page=(p?.wiki||[]).find(x=>x.id===id)||(p?.wiki||[])[0];if(!page)return wikiHome();return `${docsSidebar(p,id)}<div class="container page"><div class="project-crumbs"><a class="ghost-btn" href="#/projects">← ${t('back')}</a><div class="project-release"><span>ZxCrates</span><span>v${esc(p.version)}</span><span>${esc(p.updatedAt?.slice(0,10)||'')}</span></div></div><div class="page-layout"><article class="article no-sidebar"><div class="article-title-row"><div><div class="kicker">${esc(page.group?.[state.lang]||page.group?.en||'Reference')}</div><h1>${esc(page.title?.[state.lang]||page.title?.en||page.id)}</h1></div></div><div class="article-body">${renderMarkdown(page.body?.[state.lang]||page.body?.en||'', ({configuration:'config.yml', 'crate-yaml':'crate.yml', keyall:'keyall.yml', keys:'keys.yml'}[page.id]||''))}</div></article></div></div>`;}
function currentWikiId(){const h=location.hash||'';const m=h.match(/^#\/project\/[^/]+\/wiki\/(.+)$/);return m?decodeURIComponent(m[1]):'overview';}
function wiki(){return state.project?wikiHome():'<div class="container page"><div class="empty">ZxCrates wiki unavailable.</div></div>';}
function fillWikiEditor(){const p=state.project;const id=el('#wikiPage')?.value;const x=p?.wiki?.find(v=>v.id===id);if(!x)return;el('#groupEn').value=x.group?.en||'';el('#groupAr').value=x.group?.ar||'';el('#titleEn').value=x.title?.en||'';el('#titleAr').value=x.title?.ar||'';el('#bodyEn').value=x.body?.en||'';el('#bodyAr').value=x.body?.ar||'';}
function searchOpen(){el('#searchModal').classList.remove('hidden');el('#searchInput').focus();renderSearch('');}
function searchClose(){el('#searchModal').classList.add('hidden');}
function renderSearch(q){const box=el('#searchResults');if(!box)return;const p=state.project;const arr=(p?.wiki||[]).filter(x=>(x.title?.en+x.title?.ar+x.body?.en+x.body?.ar).toLowerCase().includes(q.toLowerCase())).slice(0,30);box.innerHTML=arr.map(x=>`<a class="result" href="#/project/${encodeURIComponent(state.project?.slug||'')}/wiki/${encodeURIComponent(x.id)}"><b>${esc(x.title?.[state.lang]||x.title?.en||x.id)}</b><small>${esc(x.group?.[state.lang]||x.group?.en||'')}</small></a>`).join('')||`<div class="empty">${state.lang==='ar'?'لا توجد نتائج':'No results'}</div>`;}
function route(){const hash=location.hash||'#/';if(hash==='#/'||hash==='#'){el('#app').innerHTML=home();}else if(hash==='#/projects'){el('#app').innerHTML=projects();}else if(hash==='#/wiki'){el('#app').innerHTML=wiki();}else if(hash.startsWith('#/project/')){const parts=hash.slice(2).split('/');const slug=decodeURIComponent(parts[1]||'');if(slug&&state.projects.some(x=>x.slug===slug)){state.project=state.projects.find(x=>x.slug===slug)||state.project;const id=parts[2]==='wiki'?decodeURIComponent(parts[3]||state.project?.wiki?.[0]?.id||'overview'):'overview';state.sidebarExpanded.add(slug);el('#app').innerHTML=projectWikiPage(id);}else{el('#app').innerHTML=home();}}else{el('#app').innerHTML=home();}applyI18n();}
document.addEventListener('click',e=>{
  if(e.target.closest('#themeBtn')){
    e.stopPropagation();
    document.getElementById('themeWrap')?.classList.toggle('open');
    return;
  }
  const dot=e.target.closest('.theme-dot');
  if(dot){
    setTheme(dot.dataset.theme);
    document.getElementById('themeWrap')?.classList.remove('open');
    return;
  }
  if(!e.target.closest('#themeWrap')) document.getElementById('themeWrap')?.classList.remove('open');
});
document.addEventListener('click',e=>{if(e.target.id==='langBtn')setLang(state.lang==='ar'?'en':'ar');if(e.target.id==='searchBtn')searchOpen();if(e.target.id==='closeSearch')searchClose();if(e.target.id==='wikiPage')fillWikiEditor();const toggle=e.target.closest('[data-plugin-toggle]');if(toggle){e.preventDefault();const slug=toggle.getAttribute('data-plugin-toggle');if(state.homeExpanded.has(slug))state.homeExpanded.delete(slug);else state.homeExpanded.add(slug);route();}const sideToggle=e.target.closest('[data-sidebar-toggle]');if(sideToggle&&!sideToggle.disabled){e.preventDefault();e.stopPropagation();const slug=sideToggle.getAttribute('data-sidebar-toggle');if(state.sidebarExpanded.has(slug))state.sidebarExpanded.delete(slug);else state.sidebarExpanded.add(slug);const activeId=currentWikiId();const sidebar=el('.docs-sidebar');const filter=el('#wikiSidebarSearch')?.value||'';if(sidebar){const oldTree=sidebar.querySelector('.plugin-tree-list');const temp=document.createElement('div');temp.innerHTML=pluginTreeList(state.project,activeId,filter);const fresh=temp.firstElementChild;if(oldTree&&fresh)oldTree.replaceWith(fresh);}}});
document.addEventListener('input',e=>{if(e.target.id==='searchInput')renderSearch(e.target.value);if(e.target.id==='wikiSidebarSearch'){const sidebar=el('.docs-sidebar');if(sidebar){const wrap=document.createElement('div');wrap.innerHTML=pluginTreeList(state.project,currentWikiId(),e.target.value);const fresh=wrap.firstElementChild;const oldTree=sidebar.querySelector('.plugin-tree-list');if(oldTree&&fresh)oldTree.replaceWith(fresh);}}});
window.addEventListener('hashchange',route);window.addEventListener('DOMContentLoaded',async()=>{initTheme();initSnow();initSnow();document.documentElement.lang=state.lang;document.documentElement.dir=state.lang==='ar'?'rtl':'ltr';document.body.classList.toggle('rtl',state.lang==='ar');await fetchProjects();route();el('#year').textContent=new Date().getFullYear();applyI18n();});
