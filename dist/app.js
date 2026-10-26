import './scene.js';
import {projects,media} from './content.js';
import {initAudio} from './audio.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ease='cubic-bezier(.22,1,.36,1)',reduced=matchMedia('(prefers-reduced-motion: reduce)');
let userMotion=null;try{userMotion=localStorage.getItem('asyraf-motion');}catch{}
let paused=userMotion===null?reduced.matches:userMotion==='off',toastTimer;
function notify(message){const t=$('.toast');t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2800);}
function animate(el,frames,options={}){if(paused)return null;return el.animate(frames,{duration:650,easing:ease,fill:'both',...options});}
const settle=a=>a? a.finished.catch(()=>{}):Promise.resolve();
const motionButton=$('#motion-toggle');motionButton.hidden=false;
function applyMotion(){document.documentElement.classList.toggle('motion-paused',paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.replaceChildren(document.createTextNode(paused?'MOTION OFF ':'MOTION ON '));const dot=document.createElement('span');dot.ariaHidden='true';dot.textContent='◉';motionButton.append(dot);if(paused)document.getAnimations().forEach(a=>{if(a.effect?.getTiming().iterations!==Infinity)try{a.finish();}catch{}});document.dispatchEvent(new CustomEvent('portfolio:motion',{detail:{paused}}));$$('video[data-project-video]').forEach(v=>{if(paused)v.pause();else{const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)v.play().catch(()=>{});}});}
motionButton.addEventListener('click',()=>{paused=!paused;userMotion=paused?'off':'on';try{localStorage.setItem('asyraf-motion',userMotion);}catch{}applyMotion();});
reduced.addEventListener('change',e=>{if(userMotion===null){paused=e.matches;applyMotion();}});applyMotion();

// Owner-fillable media. The composition remains intentional while src is null.
const videoObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting&&!paused)target.play().catch(()=>{});else target.pause();}),{threshold:.1});
function mountMedia(root=document){root.querySelectorAll('[data-media]').forEach(slot=>{const d=media[slot.dataset.media];if(!d?.src||slot.querySelector('.owner-media'))return;const el=document.createElement(d.type==='video'?'video':'img');el.className='owner-media';if(d.type==='video'){el.muted=true;el.loop=true;el.playsInline=true;el.preload='metadata';el.dataset.projectVideo='true';el.setAttribute('aria-label',d.alt);videoObserver.observe(el);}else{el.alt=d.alt;el.loading='lazy';el.decoding='async';}el.src=d.src;el.addEventListener('error',()=>{slot.classList.remove('has-media');el.remove();},{once:true});slot.prepend(el);slot.classList.add('has-media');});}
mountMedia();

// Opening motion belongs to the content, not to an artificial loading timer.
if(!location.hash||location.hash==='#top'){
  $$('.hero-name>span').forEach((el,i)=>animate(el,[{transform:'translateY(115%) rotate(4deg)'},{transform:'translateY(0) rotate(0)'}],{duration:1050,delay:100+i*65}));
  animate($('.hero-object'),[{opacity:0,transform:'translateY(50px) rotate(-8deg)'},{opacity:1,transform:'translateY(0) rotate(0)'}],{duration:1400,delay:200});
  animate($('.hero-bottom'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:550});
}
const revealObserver=new IntersectionObserver(entries=>{for(const {target,isIntersecting}of entries){if(!isIntersecting)continue;revealObserver.unobserve(target);animate(target,[{opacity:0,transform:'translateY(35px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0px)'}],{duration:800});}},{threshold:.08});
$$('.work-intro,.project,.approach-heading,.approach-body,.principles,.studio-intro,.workspace-layout,.contact-intro,.contact-big').forEach(el=>revealObserver.observe(el));

// Letter rollovers retain one clear accessible name.
function rollover(el){
  const nodes=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());if(!nodes.length)return;
  const label=el.getAttribute('aria-label')||el.textContent.trim();el.setAttribute('aria-label',label);
  for(const node of nodes){const fragment=document.createElement('span');fragment.className='roll-phrase';fragment.ariaHidden='true';for(const part of node.textContent.split(/(\s+)/)){if(!part)continue;if(/^\s+$/.test(part)){fragment.append(document.createTextNode(part));continue;}const word=document.createElement('span');word.className='roll-word';word.ariaHidden='true';for(const char of part){const letter=document.createElement('span');letter.className='roll-letter';letter.textContent=char;letter.dataset.letter=char;word.append(letter);}fragment.append(word);}node.replaceWith(fragment);}
  const letters=[...el.querySelectorAll('.roll-letter')];
  const run=up=>{if(paused)return;letters.forEach((letter,i)=>{const from=getComputedStyle(letter).transform;letter.getAnimations().forEach(a=>a.cancel());animate(letter,[{transform:from==='none'?'translateY(0)':from},{transform:up?'translateY(-120%)':'translateY(0)'}],{duration:up?440:330,delay:Math.min(i*12,160),easing:'cubic-bezier(.4,0,.2,1)'});});};
  el.addEventListener('pointerenter',()=>run(true));el.addEventListener('pointerleave',()=>run(false));el.addEventListener('focus',()=>run(true));el.addEventListener('blur',()=>run(false));
}
$$('.site-header nav a,.contact-link,.project-info h3,.all-source>span:last-child,.contact-big h2,.social-links a').forEach(rollover);

// Two editorial views of the same four projects, with geometry-aware layout motion.
$('.work-filters').hidden=false;$('.work-view').hidden=false;
const cards=$$('.project'),grid=$('.project-grid');
function relayout(mutate){const before=new Map(cards.map(c=>[c,c.getBoundingClientRect()]));mutate();for(const c of cards){if(c.hidden)continue;const after=c.getBoundingClientRect(),old=before.get(c),dx=old.left-after.left,dy=old.top-after.top;if(old.width&&old.height)animate(c,[{transform:`translate(${dx}px,${dy}px)`,opacity:.6},{transform:'translate(0,0)',opacity:1}],{duration:620});else animate(c,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}]);}}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{relayout(()=>cards.forEach(c=>{c.hidden=b.dataset.filter!=='all'&&c.dataset.category!==b.dataset.filter;}));$$('[data-filter]').forEach(n=>{const active=n===b;n.classList.toggle('active',active);n.setAttribute('aria-pressed',String(active));});}));
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{relayout(()=>grid.classList.toggle('index-mode',b.dataset.view==='index'));$$('[data-view]').forEach(n=>{const active=n===b;n.classList.toggle('active',active);n.setAttribute('aria-pressed',String(active));});}));

const finePointer=matchMedia('(hover:hover) and (pointer:fine)'),cursor=$('.cursor-label');let pointerFrame=0,pointer=[0,0];
if(finePointer.matches){
  document.addEventListener('pointermove',e=>{pointer=[e.clientX+16,e.clientY+16];if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{cursor.style.transform=`translate(${pointer[0]}px,${pointer[1]}px) translate(-50%,-50%)`;pointerFrame=0;});},{passive:true});
  $$('.project-visual').forEach(el=>{el.addEventListener('pointerenter',()=>{if(!paused){cursor.textContent='EXPLORE ↗';cursor.classList.add('visible');}});el.addEventListener('pointerleave',()=>{cursor.classList.remove('visible');el.style.transform='';});el.addEventListener('pointermove',e=>{if(paused)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1100px) rotateX(${-y*3}deg) rotateY(${x*3}deg)`;});});
}

// The transition is a short bridge between real route states.
const curtain=$('#route-transition'),strips=$$('.transition-strips>span');let routeQueue=Promise.resolve();
function transition(label,mutate,{motion=true}={}){
  routeQueue=routeQueue.catch(()=>{}).then(async()=>{
    if(paused||!motion){mutate();return;}
    document.documentElement.classList.add('transitioning');$('.transition-label').textContent=label;
    try{if(curtain.showPopover)curtain.showPopover();else curtain.classList.add('visible');
      const cover=strips.map((s,i)=>animate(s,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:370,delay:i*22,easing:'cubic-bezier(.76,0,.24,1)'}));
      animate($('.transition-label'),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,delay:190});
      await Promise.all(cover.map(settle));mutate();
      if(!paused){const uncover=strips.map((s,i)=>animate(s,[{transform:'scaleY(1)',transformOrigin:'top'},{transform:'scaleY(0)',transformOrigin:'top'}],{duration:390,delay:i*18,easing:'cubic-bezier(.76,0,.24,1)'}));animate($('.transition-label'),[{opacity:1},{opacity:0}],{duration:180});await Promise.all(uncover.map(settle));}
    }finally{if(curtain.matches(':popover-open'))curtain.hidePopover();curtain.classList.remove('visible');document.documentElement.classList.remove('transitioning');strips.forEach(s=>s.getAnimations().forEach(a=>a.cancel()));}
  });return routeQueue;
}
const dialog=$('#project-dialog'),keys=Object.keys(projects);let currentKey=null,projectFocus=null,returnHash='#work',previousOverflow='';
const routeKey=()=>{const match=location.hash.match(/^#project\/([a-z]+)$/);return match&&projects[match[1]]?match[1]:null;};
function fillCase(key){
  const d=projects[key];currentKey=key;$('#case-index').textContent=`${d.index} / SELECTED WORK`;$('#case-category').textContent=d.category;$('#case-title').textContent=d.name;$('#case-subtitle').textContent=d.subtitle;$('#case-summary').textContent=d.summary;$('#case-status').textContent=d.status;
  const ul=$('#case-details');ul.replaceChildren(...d.details.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  $('#case-source').href=d.source;const live=$('#case-live');live.hidden=!d.live;if(d.live){live.href=d.live;live.textContent=d.liveLabel||'Visit the live site ↗';}
  const visual=$('#case-visual');visual.className=`case-visual ${key}`;const slot=document.createElement('div');slot.className='case-slot media-slot';slot.dataset.media=key;const number=document.createElement('span');number.className='case-poster-index mono';number.textContent=`${d.index} / ${d.category}`;const poster=document.createElement('strong');poster.textContent=d.poster;const note=document.createElement('span');note.className='case-poster-note mono';note.textContent='PROJECT FILM / INTERFACE STUDY';slot.append(number,poster,note);visual.replaceChildren(slot);mountMedia(visual);
  $('#next-case-name').textContent=projects[keys[(keys.indexOf(key)+1)%keys.length]].name;dialog.scrollTop=0;
  animate($('.case-heading'),[{opacity:0,transform:'translateY(38px)'},{opacity:1,transform:'translateY(0)'}],{duration:750});
  animate(visual,[{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)'}],{duration:900,delay:80});
  document.title=`${d.name} — Asyraf Mubarak`;
}
function openProject(key,{historyMode='push',motion=true}={}){
  if(!projects[key])return;
  if(!dialog.open){projectFocus=document.activeElement;returnHash=location.hash&&!routeKey()?location.hash:'#work';}
  if(historyMode==='push')history.pushState({portfolioRoute:'project',from:returnHash},'',`#project/${key}`);
  else if(historyMode==='replace')history.replaceState({portfolioRoute:'project',from:returnHash},'',`#project/${key}`);
  return transition(`${projects[key].index} / ${projects[key].name.toUpperCase()}`,()=>{const resolved=routeKey();if(!resolved)return;if(!dialog.open){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}fillCase(resolved);$('#close-case').focus({preventScroll:true});cursor.classList.remove('visible');},{motion});
}
function closeProject({motion=true}={}){if(!dialog.open)return;return transition('BACK TO THE CONNECTIONS',()=>{if(routeKey()){fillCase(routeKey());return;}dialog.querySelectorAll('video').forEach(v=>{v.pause();videoObserver.unobserve(v);});dialog.close();currentKey=null;document.body.style.overflow=previousOverflow;document.title='Asyraf Mubarak — Systems in Motion';projectFocus?.focus({preventScroll:true});},{motion});}
function requestClose(){if(history.state?.portfolioRoute==='project'&&history.state.from)history.back();else{history.replaceState({},'',returnHash);closeProject();}}
$$('[data-case]').forEach(a=>a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openProject(a.dataset.case);}));
$('#close-case').addEventListener('click',requestClose);dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
$('#next-case').addEventListener('click',()=>{if(currentKey)openProject(keys[(keys.indexOf(currentKey)+1)%keys.length],{historyMode:'replace'});});
window.addEventListener('hashchange',()=>{const key=routeKey();if(key&&key!==currentKey)openProject(key,{historyMode:'none'});else if(!key&&dialog.open)closeProject();});
if(routeKey())openProject(routeKey(),{historyMode:'none',motion:false});

const colophon=$('#colophon-dialog');let notesFocus;
$('#design-notes').hidden=false;$('#design-notes').addEventListener('click',()=>{notesFocus=document.activeElement;colophon.showModal();animate($('.colophon-content'),[{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'translateY(0)'}],{duration:700});});
$('#close-colophon').addEventListener('click',()=>colophon.close());colophon.addEventListener('close',()=>notesFocus?.focus({preventScroll:true}));

$('#copy-email').hidden=false;$('#copy-email').addEventListener('click',async()=>{try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText('asyrafwebsite@gmail.com');notify('EMAIL COPIED. LET’S CONNECT.');}catch{const range=document.createRange();range.selectNodeContents($('.email-link'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);notify('EMAIL SELECTED — COPY IT TO KEEP IN TOUCH.');}});
function updateTime(){const value=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Makassar',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());$('#local-time').textContent=value+' WITA';}updateTime();setInterval(updateTime,30000);
let progressFrame=0;function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;progressFrame=0;}addEventListener('scroll',()=>{if(!progressFrame)progressFrame=requestAnimationFrame(updateProgress);},{passive:true});updateProgress();
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('.site-header nav a').forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}),{rootMargin:'-20% 0px -50% 0px'});$$('#work,#approach,#studio').forEach(s=>sectionObserver.observe(s));
$$('.principles details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)animate(d.querySelector('p'),[{opacity:0,transform:'translateY(-7px)'},{opacity:1,transform:'translateY(0)'}],{duration:350});}));
initAudio(notify);
document.documentElement.dataset.experience='ready';
