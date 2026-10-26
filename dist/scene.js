import {createSculpture} from './webgl.js';
const canvas=document.getElementById('hero-canvas'),button=document.getElementById('assembly-toggle');
let sculpture;
try{
 sculpture=createSculpture(canvas);
 const setExpanded=expanded=>{button.setAttribute('aria-pressed',String(expanded));button.setAttribute('aria-label',expanded?'Reconnect the sculpture':'Expand the sculpture');};
 button.addEventListener('click',()=>setExpanded(sculpture.toggle()));
 canvas.addEventListener('sculpture:expand',e=>setExpanded(e.detail.expanded));
 document.addEventListener('portfolio:scroll',e=>sculpture.scroll(e.detail.progress));
 document.addEventListener('portfolio:motion',e=>sculpture.motion(e.detail.paused));
 sculpture.motion(document.body.classList.contains('motion-off'));
 window.addEventListener('pagehide',e=>{if(!e.persisted)sculpture.dispose();});
}catch(error){
 // The editorial stage remains usable if the platform cannot render either backend.
 canvas.hidden=true;button.hidden=true;document.querySelector('.stage-hint').textContent='SCROLL TO DISCOVER ↓';document.querySelector('.stage-top span:last-child').textContent='THE INTERCONNECTION STUDY';console.warn('Sculpture could not initialize:',error.message);
}
