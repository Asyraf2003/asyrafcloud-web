import {createHero,createWorkspace} from './webgl.js';

const scenes=[];
let hero,workspace;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const assembly=document.getElementById('assembly-toggle');
function setAssembly(pressed){assembly.setAttribute('aria-pressed',String(pressed));assembly.replaceChildren(document.createTextNode(pressed?'REASSEMBLE ':'DISASSEMBLE '));const icon=document.createElement('span');icon.ariaHidden='true';icon.textContent=pressed?'⊖':'⊕';assembly.append(icon);}
function fallback(id,label){const c=document.getElementById(id);c.parentElement.dataset.renderState='fallback';c.removeAttribute('tabindex');c.setAttribute('aria-label',label);c.hidden=true;}
try{hero=createHero(document.getElementById('hero-canvas'));scenes.push(hero);assembly.hidden=false;assembly.addEventListener('click',()=>setAssembly(hero.toggle()));}catch(error){fallback('hero-canvas','Static silver A monogram with a blue orbit.');document.querySelector('.drag-note').textContent='A SYSTEM IN BALANCE';console.info('Static monogram fallback active:',error.message);}
const inspection={
  terminal:{label:'01 / MAKE IT YOURS',title:'An open system.\nA personal setup.',copy:'Arch Linux with Openbox. Alacritty for the terminal, Neovim for the details, and tmux to keep the threads together.',href:'https://github.com/Asyraf2003/dotfiles',link:'Explore the dotfiles'},
  tools:{label:'02 / LESS FRICTION, MORE FOCUS',title:'Small tools.\nConnected thoughts.',copy:'Bash, Git, Neovim, and tmux. A lightweight collection of tools, maintained through reusable dotfiles and an explicit setup workflow.',href:'https://github.com/Asyraf2003/dotfiles',link:'See the setup'},
  mindset:{label:'03 / MAKE THE RULES VISIBLE',title:'Take it apart.\nUnderstand the pieces.',copy:'The same instinct connects the workspace to the work: explicit boundaries, reversible changes, and evidence that the parts still agree.',href:'https://github.com/Asyraf2003',link:'Follow the thinking'}
};
export function inspect(key){const d=inspection[key];if(!d)return;document.querySelectorAll('[data-inspect]').forEach(b=>{const active=b.dataset.inspect===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});document.getElementById('inspector-label').textContent=d.label;document.getElementById('inspector-title').textContent=d.title;document.getElementById('inspector-copy').textContent=d.copy;const link=document.getElementById('inspector-link');link.href=d.href;link.replaceChildren(document.createTextNode(d.link+' '));const arrow=document.createElement('span');arrow.ariaHidden='true';arrow.textContent='↗';link.append(arrow);workspace?.inspect(key);document.dispatchEvent(new CustomEvent('portfolio:inspect',{detail:{key}}));}
document.querySelectorAll('[data-inspect]').forEach(b=>b.addEventListener('click',()=>inspect(b.dataset.inspect)));
try{workspace=createWorkspace(document.getElementById('workspace-canvas'),inspect);scenes.push(workspace);const reset=document.getElementById('reset-view');reset.hidden=false;reset.addEventListener('click',()=>inspect('terminal'));}catch(error){fallback('workspace-canvas','Static Arch Linux terminal and keyboard study.');document.querySelector('.stage-bottom>span').textContent='EXPLORE THE THREE NOTES →';console.info('Static workspace fallback active:',error.message);}
document.addEventListener('portfolio:assembly',e=>setAssembly(e.detail.pressed));
document.addEventListener('portfolio:motion',e=>scenes.forEach(s=>s.motion(e.detail.paused)));
reduced.addEventListener('change',e=>scenes.forEach(s=>s.motion(e.matches)));
let scrollFrame=0;
window.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{const rect=document.getElementById('top').getBoundingClientRect();hero?.scroll(Math.min(1,Math.max(0,-rect.top/rect.height)));scrollFrame=0;});},{passive:true});
window.addEventListener('pagehide',e=>{if(!e.persisted)scenes.forEach(s=>s.dispose());});
