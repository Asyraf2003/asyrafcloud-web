// Original procedural sculpture. No model, texture, or rendering dependency is fetched.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const scale=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>scale(a,1/(Math.hypot(...a)||1));
const mix=(a,b,t)=>a+(b-a)*t;
function multiply(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
function transform(p=[0,0,0],r=[0,0,0],s=1){const[x,y,z]=r,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);const a=new Float32Array([cy*cz,cy*sz,-sy,0,sx*sy*cz-cx*sz,sx*sy*sz+cx*cz,sx*cy,0,cx*sy*cz+sx*sz,cx*sy*sz-sx*cz,cx*cy,0,p[0],p[1],p[2],1]);for(let i=0;i<12;i++)a[i]*=s;return a;}
function projection(eye,target,aspect,fov){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);const v=new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);const f=1/Math.tan(fov/2),n=.1,far=70,p=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+n)/(n-far),-1,0,0,2*far*n/(n-far),0]);return multiply(p,v);}
function apply(m,a,w=1){return [m[0]*a[0]+m[4]*a[1]+m[8]*a[2]+m[12]*w,m[1]*a[0]+m[5]*a[1]+m[9]*a[2]+m[13]*w,m[2]*a[0]+m[6]*a[1]+m[10]*a[2]+m[14]*w];}
const path=t=>[(2+.70*Math.cos(3*t))*Math.cos(2*t),(2+.70*Math.cos(3*t))*Math.sin(2*t),.86*Math.sin(3*t)];
function frame(t){const p=path(t),tangent=norm(sub(path(t+.001),path(t-.001))),side=norm(cross(tangent,norm(p))),up=norm(cross(side,tangent));return {p,tangent,side,up};}
// The knot is divided into eight capped, independently moving members.
export function buildSculptureMesh(part,segments=38,sides=32){const data=[],start=part/8*TAU+.008,end=(part+1)/8*TAU-.008;
 const point=(u,v)=>{const f=frame(mix(start,end,u)),c=Math.cos(v),s=Math.sin(v),radius=.43*(1+.025*Math.cos(u*TAU*9));const n=norm(add(scale(f.up,c),scale(f.side,s)));const p=add(f.p,add(scale(f.up,c*radius),scale(f.side,s*radius*.93)));return [...p,...n,u,v/TAU];};
 for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=point(i/segments,j/sides*TAU),b=point((i+1)/segments,j/sides*TAU),c=point((i+1)/segments,(j+1)/sides*TAU),d=point(i/segments,(j+1)/sides*TAU);data.push(...a,...b,...c,...a,...c,...d);}
 for(const u of [0,1]){const f=frame(mix(start,end,u)),n=scale(f.tangent,u?1:-1),center=[...f.p,...n,u,.5];for(let j=0;j<sides;j++){const a=point(u,j/sides*TAU),b=point(u,(j+1)/sides*TAU);data.push(...center,...a.slice(0,3),...n,u,0,...b.slice(0,3),...n,u,1);}}
 return new Float32Array(data);
}
function ring(radius,tube,segments=80,sides=20){const data=[],p=(u,v)=>{const c=Math.cos(v),s=Math.sin(v),a=Math.cos(u),b=Math.sin(u);return[(radius+tube*c)*a,(radius+tube*c)*b,tube*s,c*a,c*b,s,u/TAU,v/TAU];};for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=p(i/segments*TAU,j/sides*TAU),b=p((i+1)/segments*TAU,j/sides*TAU),c=p((i+1)/segments*TAU,(j+1)/sides*TAU),d=p(i/segments*TAU,(j+1)/sides*TAU);data.push(...a,...b,...c,...a,...c,...d);}return new Float32Array(data);}
export const vertexSource=`
attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUV;
uniform mat4 uModel;uniform mat4 uVP;
varying vec3 vPosition;varying vec3 vNormal;varying vec2 vUV;
void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);vUV=aUV;gl_Position=uVP*p;}`;
export const fragmentSource=`
precision highp float;
varying vec3 vPosition;varying vec3 vNormal;varying vec2 vUV;
uniform vec3 uEye;uniform vec3 uColor;uniform float uMetal;uniform float uRoughness;
vec3 environment(vec3 r){
 float key=smoothstep(.15,.23,r.y)*(1.0-smoothstep(.66,.75,r.y));
 float strip=exp(-pow((r.x+.62)*12.0,2.0))*smoothstep(-.25,.1,r.y);
 float rim=pow(max(dot(r,normalize(vec3(.95,.22,.25))),0.0),45.0);
 float acid=pow(max(dot(r,normalize(vec3(-.5,-.25,.5))),0.0),22.0);
 vec3 env=mix(vec3(.018,.025,.017),vec3(.24,.28,.23),smoothstep(-.5,1.0,r.y));
 env+=key*vec3(1.9,2.05,1.9)+strip*vec3(3.5,3.6,3.2)+rim*vec3(2.7,2.9,2.5)+acid*vec3(.35,.55,.02);
 return env;
}
void main(){vec3 n=normalize(vNormal),v=normalize(uEye-vPosition);vec3 r=reflect(-v,n);
 float fresnel=pow(1.0-max(dot(n,v),0.0),5.0);float light=max(dot(n,normalize(vec3(-.5,1.0,1.0))),0.0);
 vec3 reflection=mix(environment(r),environment(normalize(mix(r,n,.45))),uRoughness*.5);
 float brushing=1.0-.025*sin(vUV.y*900.0)*sin(vUV.x*600.0);
 vec3 diffuse=uColor*(.12+light*.8)+reflection*.08;
 vec3 metal=reflection*uColor*brushing*(.82+.18*fresnel);
 vec3 c=mix(diffuse,metal,uMetal);c=c*(2.51*c+.03)/(c*(2.43*c+.59)+.14);
 gl_FragColor=vec4(pow(clamp(c,0.0,1.0),vec3(.454545)),1.0);
}`;
class GPU {
 constructor(canvas){this.canvas=canvas;const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});if(!gl)throw new Error('WebGL unavailable');this.gl=gl;this.backend='webgl';this.cache=new Map();
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
 const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);this.program=gl.createProgram();gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
 this.u=Object.fromEntries(['uModel','uVP','uEye','uColor','uMetal','uRoughness'].map(n=>[n,gl.getUniformLocation(this.program,n)]));this.a=['aPosition','aNormal','aUV'].map(n=>gl.getAttribLocation(this.program,n));gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);this.ratio=Math.min(devicePixelRatio||1,1.7);
 }
 begin(eye,target,fov){const c=this.canvas,g=this.gl,w=Math.max(1,Math.round(c.clientWidth*this.ratio)),h=Math.max(1,Math.round(c.clientHeight*this.ratio));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}g.viewport(0,0,w,h);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(this.program);g.uniformMatrix4fv(this.u.uVP,false,projection(eye,target,w/h,fov));g.uniform3fv(this.u.uEye,eye);}
 draw(mesh,model,material){const gl=this.gl;let m=this.cache.get(mesh);if(!m){m={buffer:gl.createBuffer(),count:mesh.length/8};gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);this.cache.set(mesh,m);}gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);this.a.forEach((a,i)=>{if(a>=0){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,[3,3,2][i],gl.FLOAT,false,32,[0,12,24][i]);}});gl.uniformMatrix4fv(this.u.uModel,false,model);gl.uniform3fv(this.u.uColor,material.color);gl.uniform1f(this.u.uMetal,material.metal);gl.uniform1f(this.u.uRoughness,material.roughness);gl.drawArrays(gl.TRIANGLES,0,m.count);}
 end(){}
 dispose(){for(const m of this.cache.values())this.gl.deleteBuffer(m.buffer);this.gl.deleteProgram(this.program);}
}
// Software rendering uses the same 3D members, depth test, and smooth normals.
// A studio-reflection lookup keeps the per-pixel fallback bounded without flat polygon shading.
class Software {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});if(!this.ctx)throw new Error('Canvas unavailable');this.backend='canvas2d';this.materials=new Map();this.ratio=1.25;this.lastSize='';}
 matcap(material){const key=JSON.stringify(material);if(this.materials.has(key))return this.materials.get(key);const size=256,out=new Uint8Array(size*size*3);const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};const l=norm([-.5,1,1]),rimDir=norm([.95,.22,.25]),acidDir=norm([-.5,-.25,.5]);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=x/(size-1)*2-1,ny=y/(size-1)*2-1,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),n=[nx,ny,nz],r=[2*nz*nx,2*nz*ny,2*nz*nz-1];const keyLight=smooth(.15,.23,r[1])*(1-smooth(.66,.75,r[1])),strip=Math.exp(-Math.pow((r[0]+.62)*12,2))*smooth(-.25,.1,r[1]),rim=Math.pow(Math.max(dot(r,rimDir),0),45),acid=Math.pow(Math.max(dot(r,acidDir),0),22),light=Math.max(dot(n,l),0),fresnel=Math.pow(1-nz,5);
 for(let k=0;k<3;k++){const env=mix([.018,.025,.017][k],[.24,.28,.23][k],smooth(-.5,1,r[1]))+keyLight*[1.9,2.05,1.9][k]+strip*[3.5,3.6,3.2][k]+rim*[2.7,2.9,2.5][k]+acid*[.35,.55,.02][k];let color=mix(material.color[k]*(.12+light*.8)+env*.08,env*material.color[k]*(.82+.18*fresnel),material.metal);color=color*(2.51*color+.03)/(color*(2.43*color+.59)+.14);out[(y*size+x)*3+k]=Math.round(Math.pow(clamp(color),.454545)*255);}}
 this.materials.set(key,out);return out;}
 begin(eye,target,fov){const c=this.canvas;const pixelBudget=1200000;let ratio=Math.min(this.ratio,Math.sqrt(pixelBudget/(c.clientWidth*c.clientHeight)));const w=Math.max(1,Math.round(c.clientWidth*ratio)),h=Math.max(1,Math.round(c.clientHeight*ratio));if(c.width!==w||c.height!==h){c.width=w;c.height=h;this.image=this.ctx.createImageData(w,h);this.depth=new Float32Array(w*h);}this.image.data.fill(0);this.depth.fill(Infinity);this.eye=eye;this.vp=projection(eye,target,w/h,fov);this.viewZ=norm(sub(eye,target));this.viewX=norm(cross([0,1,0],this.viewZ));this.viewY=cross(this.viewZ,this.viewX);this.width=w;this.height=h;}
 draw(mesh,model,material){const vp=this.vp,w=this.width,h=this.height,out=this.image.data,depth=this.depth,matcap=this.matcap(material);const vertices=new Float32Array(mesh.length/8*6);for(let i=0,j=0;i<mesh.length;i+=8,j+=6){const p=apply(model,[mesh[i],mesh[i+1],mesh[i+2]]),normal=norm(apply(model,[mesh[i+3],mesh[i+4],mesh[i+5]],0));const qx=vp[0]*p[0]+vp[4]*p[1]+vp[8]*p[2]+vp[12],qy=vp[1]*p[0]+vp[5]*p[1]+vp[9]*p[2]+vp[13],qz=vp[2]*p[0]+vp[6]*p[1]+vp[10]*p[2]+vp[14],qw=vp[3]*p[0]+vp[7]*p[1]+vp[11]*p[2]+vp[15];vertices[j]=(qx/qw*.5+.5)*w;vertices[j+1]=(-qy/qw*.5+.5)*h;vertices[j+2]=qz/qw;vertices[j+3]=dot(normal,this.viewX);vertices[j+4]=dot(normal,this.viewY);vertices[j+5]=dot(normal,this.viewZ);}
 for(let i=0;i<vertices.length;i+=18){const a=vertices.subarray(i,i+6),b=vertices.subarray(i+6,i+12),c=vertices.subarray(i+12,i+18);if((a[5]+b[5]+c[5])<-.1||a[2]>1||b[2]>1||c[2]>1)continue;const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<.001)continue;const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));const inv=1/den,ux=(b[1]-c[1])*inv,vx=(c[1]-a[1])*inv;
 for(let y=y0;y<=y1;y++){let u=((b[1]-c[1])*(x0+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))*inv,v=((c[1]-a[1])*(x0+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))*inv;for(let x=x0;x<=x1;x++,u+=ux,v+=vx){const t=1-u-v;if(u<0||v<0||t<0)continue;const z=u*a[2]+v*b[2]+t*c[2],idx=y*w+x;if(z>=depth[idx])continue;let nx=u*a[3]+v*b[3]+t*c[3],ny=u*a[4]+v*b[4]+t*c[4],nz=u*a[5]+v*b[5]+t*c[5];const len=1/(Math.sqrt(nx*nx+ny*ny+nz*nz)||1);nx*=len;ny*=len;const tx=clamp(Math.round((nx*.5+.5)*255),0,255),ty=clamp(Math.round((ny*.5+.5)*255),0,255),m=(ty*256+tx)*3,o=idx*4;out[o]=matcap[m];out[o+1]=matcap[m+1];out[o+2]=matcap[m+2];out[o+3]=255;depth[idx]=z;}}}
 }
 end(){this.ctx.putImageData(this.image,0,0);}
 dispose(){this.materials.clear();}
}
const chrome={color:[.83,.89,.79],metal:1,roughness:.12};
const acid={color:[.57,.83,.022],metal:.68,roughness:.24};
const ceramic={color:[.64,.69,.59],metal:.22,roughness:.5};
export function createSculpture(canvas){let renderer;try{renderer=new GPU(canvas);}catch(error){if(error.message!=='WebGL unavailable')throw error;renderer=new Software(canvas);}const software=renderer.backend==='canvas2d';canvas.dataset.renderer=renderer.backend;const meshes=Array.from({length:8},(_,i)=>buildSculptureMesh(i,software?36:48,software?30:40)),smallRing=ring(1.25,.34,software?42:72,software?16:28);let frameID=0,visible=true,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,destroyed=false,lost=false,time=0,last=0,lastDraw=0,progress=0,smoothProgress=0,expanded=false,spread=0,angleX=.45,angleY=-.35,targetX=.45,targetY=-.35,pointer=null,dirty=true;
 const render=(now)=>{frameID=0;if(destroyed||lost||!visible||document.hidden)return;const interval=software?120:16;if(now-lastDraw<interval){frameID=requestAnimationFrame(render);return;}const dt=Math.min((now-last)/1000,.05)||.016;last=now;lastDraw=now;if(!paused)time+=dt;const factor=paused?1:Math.min(1,dt*6);angleX=mix(angleX,targetX,factor);angleY=mix(angleY,targetY,factor);smoothProgress=mix(smoothProgress,progress,factor);spread=mix(spread,expanded?1:0,factor);const p=smoothProgress,expand=spread+p*.65,aspect=canvas.clientWidth/canvas.clientHeight;
 const distance=aspect<.9?11.7:8.6,eye=[.3+p*.4,.25+p*.7,distance-p*.9];renderer.begin(eye,[0,0,0],.70);const overall=transform([0,-.05,0],[angleX+Math.sin(time*.12)*.06+p*.35,angleY+time*.055+p*.7,-.2+p*.25]);
 for(let i=0;i<8;i++){const f=frame((i+.5)/8*TAU),direction=norm(f.p),shift=scale(direction,expand*.9);shift[2]+=Math.sin(i*2.2)*expand*.6;const local=transform(shift,[Math.sin(i*1.7)*expand*.2,Math.cos(i*2.1)*expand*.25,Math.sin(i)*expand*.15]);renderer.draw(meshes[i],multiply(overall,local),i===1||i===5?acid:chrome);}
 // Two secondary members extend the depth beyond the frame, not a ring around a logo.
 renderer.draw(smallRing,transform([-4.25-expand*.6,1.2,-2.4],[.8+time*.05,.7,-.2],.78),ceramic);
 renderer.draw(smallRing,transform([4.25+expand*.7,-1.3,-1.6],[1.1,-.55+time*.06,.3],.68),acid);
 renderer.end();dirty=false;if(!paused||Math.abs(angleX-targetX)+Math.abs(angleY-targetY)+Math.abs(spread-(expanded?1:0))>.01)frameID=requestAnimationFrame(render);
 };
 function request(){dirty=true;if(!frameID&&visible&&!document.hidden&&!destroyed&&!lost){last=performance.now();frameID=requestAnimationFrame(render);}}
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else{cancelAnimationFrame(frameID);frameID=0;}},{rootMargin:'80px'});visibility.observe(canvas);
 const resize=new ResizeObserver(request);resize.observe(canvas);
 function onVisibility(){if(document.hidden){cancelAnimationFrame(frameID);frameID=0;}else request();}document.addEventListener('visibilitychange',onVisibility);
 function toggle(){expanded=!expanded;canvas.dispatchEvent(new CustomEvent('sculpture:expand',{detail:{expanded},bubbles:true}));request();return expanded;}
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY,ax:targetX,ay:targetY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!pointer)return;targetY=pointer.ay+(e.clientX-pointer.x)*.006;targetX=clamp(pointer.ax+(e.clientY-pointer.y)*.004,-1.1,1.3);request();});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Home'].includes(e.key))return;e.preventDefault();if(e.key===' ')toggle();if(e.key==='ArrowLeft')targetY-=.2;if(e.key==='ArrowRight')targetY+=.2;if(e.key==='ArrowUp')targetX-=.15;if(e.key==='ArrowDown')targetX+=.15;if(e.key==='Home'){targetX=.45;targetY=-.35;expanded=false;canvas.dispatchEvent(new CustomEvent('sculpture:expand',{detail:{expanded},bubbles:true}));}request();});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frameID);frameID=0;canvas.dataset.renderState='context-lost';});canvas.addEventListener('webglcontextrestored',()=>{renderer=new GPU(canvas);lost=false;canvas.dataset.renderState='ready';request();});
 canvas.dataset.renderState='ready';request();return{toggle,scroll(value){progress=value;request();},motion(value){paused=value;if(paused){cancelAnimationFrame(frameID);frameID=0;}request();},dispose(){destroyed=true;cancelAnimationFrame(frameID);visibility.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',onVisibility);renderer.dispose();},get backend(){return renderer.backend;}};
}
