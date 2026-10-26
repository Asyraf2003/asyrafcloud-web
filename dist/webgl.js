// Small native-WebGL renderer. Geometry, lighting, and interaction stay local.
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const vec = {
  sub: (a,b) => a.map((v,i)=>v-b[i]),
  dot: (a,b) => a.reduce((s,v,i)=>s+v*b[i],0),
  cross: (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  norm: a => { const d=Math.hypot(...a)||1; return a.map(v=>v/d); }
};
const identity = () => new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function multiply(a,b) {
  const r=new Float32Array(16);
  for(let c=0;c<4;c++) for(let row=0;row<4;row++)
    for(let k=0;k<4;k++) r[c*4+row]+=a[k*4+row]*b[c*4+k];
  return r;
}
function transform(position=[0,0,0], rotation=[0,0,0]) {
  const [x,y,z]=rotation;
  const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
  const rx=new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]);
  const ry=new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1]);
  const rz=new Float32Array([cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1]);
  const t=identity();t[12]=position[0];t[13]=position[1];t[14]=position[2];
  return multiply(t,multiply(rz,multiply(ry,rx)));
}
function perspective(fov,aspect,near=.1,far=100) {
  const f=1/Math.tan(fov/2),r=new Float32Array(16);
  r[0]=f/aspect;r[5]=f;r[10]=(far+near)/(near-far);r[11]=-1;r[14]=2*far*near/(near-far);return r;
}
function lookAt(eye,target) {
  const z=vec.norm(vec.sub(eye,target)),x=vec.norm(vec.cross([0,1,0],z)),y=vec.cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-vec.dot(x,eye),-vec.dot(y,eye),-vec.dot(z,eye),1]);
}
function roundedBox(w,h,d,r=.08,segments=5) {
  const half=[w/2,h/2,d/2],rad=Math.min(r,...half),inner=half.map(v=>v-rad),data=[];
  const faces=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]];
  const point=(face,u,v)=>{
    const [fixed,ua,va,sign]=face,p=[0,0,0];
    const axis=(t,h)=>t<1/3?-h+rad*t*3:t>2/3?h-rad+rad*(t-2/3)*3:mix(-h+rad,h-rad,(t-1/3)*3);
    p[fixed]=half[fixed]*sign;p[ua]=axis(u,half[ua]);p[va]=axis(v,half[va]);
    const q=p.map((n,i)=>clamp(n,-inner[i],inner[i])),n=vec.norm(vec.sub(p,q));
    return [...q.map((a,i)=>a+n[i]*rad),...n,u,v];
  };
  for(const face of faces) for(let i=0;i<segments;i++) for(let j=0;j<segments;j++) {
    const a=point(face,i/segments,j/segments),b=point(face,(i+1)/segments,j/segments),c=point(face,(i+1)/segments,(j+1)/segments),e=point(face,i/segments,(j+1)/segments);
    data.push(...a,...b,...c,...a,...c,...e);
  }
  return new Float32Array(data);
}
function torus(radius,tube,segments=88,sides=16) {
  const data=[];
  const p=(u,v)=>{const c=Math.cos(v),s=Math.sin(v),a=Math.cos(u),b=Math.sin(u);return [(radius+tube*c)*a,(radius+tube*c)*b,tube*s,c*a,c*b,s,u/TAU,v/TAU];};
  for(let i=0;i<segments;i++) for(let j=0;j<sides;j++) {
    const a=p(i/segments*TAU,j/sides*TAU),b=p((i+1)/segments*TAU,j/sides*TAU),c=p((i+1)/segments*TAU,(j+1)/sides*TAU),d=p(i/segments*TAU,(j+1)/sides*TAU);
    data.push(...a,...b,...c,...a,...c,...d);
  }return new Float32Array(data);
}
function cylinder(radius,height,sides=40) {
  const data=[];
  for(let i=0;i<sides;i++) {
    const a=i/sides*TAU,b=(i+1)/sides*TAU,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
    const p=[radius*ca,-height/2,radius*sa,ca,0,sa,0,0],q=[radius*cb,-height/2,radius*sb,cb,0,sb,1,0],r=[radius*cb,height/2,radius*sb,cb,0,sb,1,1],s=[radius*ca,height/2,radius*sa,ca,0,sa,0,1];
    data.push(...p,...q,...r,...p,...r,...s);
    for(const sign of [-1,1]) data.push(0,height/2*sign,0,0,sign,0,.5,.5,radius*ca,height/2*sign,radius*sa,0,sign,0,ca*.5+.5,sa*.5+.5,radius*cb,height/2*sign,radius*sb,0,sign,0,cb*.5+.5,sb*.5+.5);
  }return new Float32Array(data);
}
function plane(w,h) {return new Float32Array([-w/2,-h/2,0,0,0,1,0,0,w/2,-h/2,0,0,0,1,1,0,w/2,h/2,0,0,0,1,1,1,-w/2,-h/2,0,0,0,1,0,0,w/2,h/2,0,0,0,1,1,1,-w/2,h/2,0,0,0,1,0,1]);}
const vertexSource=`
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV;
uniform mat4 uModel; uniform mat4 uVP;
varying vec3 vPosition; varying vec3 vNormal; varying vec2 vUV;
void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);vUV=aUV;gl_Position=uVP*p;}`;
const fragmentSource=`
precision mediump float;
varying vec3 vPosition;varying vec3 vNormal;varying vec2 vUV;
uniform vec3 uEye;uniform vec3 uColor;uniform float uMetal;uniform float uSelected;uniform float uTime;uniform int uMode;uniform sampler2D uTexture;
void main(){
 if(uMode==2){gl_FragColor=texture2D(uTexture,vUV);return;}
 if(uMode==3){float d=length((vUV-.5)*vec2(1.0,1.5));float a=exp(-d*d*13.0)*.24;gl_FragColor=vec4(.17,.20,.33,a);return;}
 vec3 n=normalize(vNormal),v=normalize(uEye-vPosition),r=reflect(-v,n);
 float facing=max(dot(n,v),0.0),fresnel=pow(1.0-facing,4.0);
 vec3 l=normalize(vec3(-.45,1.1,1.0));float diff=max(dot(n,l),0.0);
 float strip=smoothstep(.13,.32,r.y)-smoothstep(.68,.84,r.y);
 float box=pow(max(dot(r,normalize(vec3(-.7,.8,1.0))),0.0),18.0);
 float edge=pow(max(dot(r,normalize(vec3(1.0,.0,.5))),0.0),28.0);
 vec3 env=vec3(.16,.18,.23)+vec3(.73,.77,.85)*strip+vec3(1.4,1.45,1.5)*box+vec3(.18,.23,.6)*edge;
 vec3 diffuse=uColor*(.25+.7*diff);
 vec3 chrome=env*uColor*(.85+.5*fresnel)+vec3(.06)*diff;
 vec3 color=mix(diffuse,chrome,uMetal);
 color+=vec3(.1,.15,.5)*fresnel*.16+uSelected*vec3(.02,.035,.09);
 color=pow(max(color,vec3(0.0)),vec3(.4545));
 gl_FragColor=vec4(color,1.0);
}`;

class Renderer {
  constructor(canvas) {
    this.canvas=canvas;this.backend='webgl';this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
    if(!this.gl) throw new Error('WebGL unavailable');
    const gl=this.gl,compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(e);}return s;};
    const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
    this.program=gl.createProgram();gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program));
    this.attributes=['aPosition','aNormal','aUV'].map(x=>gl.getAttribLocation(this.program,x));
    this.uniforms=Object.fromEntries(['uModel','uVP','uEye','uColor','uMetal','uSelected','uTime','uMode','uTexture'].map(n=>[n,gl.getUniformLocation(this.program,n)]));
    this.cache=new Map();this.textures=[];this.vp=identity();this.ratio=Math.min(window.devicePixelRatio||1,1.75);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;canvas.parentElement.classList.remove('has-webgl');canvas.parentElement.dataset.renderState='fallback';});
  }
  geometry(key,creator) {if(!this.cache.has(key)){const gl=this.gl,data=creator(),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this.cache.set(key,{buffer,count:data.length/8});}return this.cache.get(key);}
  box(w,h,d,r=.06){return this.geometry(`box:${w},${h},${d},${r}`,()=>roundedBox(w,h,d,r));}
  ring(radius,tube){return this.geometry(`ring:${radius},${tube}`,()=>torus(radius,tube));}
  cylinder(r,h){return this.geometry(`cyl:${r},${h}`,()=>cylinder(r,h));}
  plane(w,h){return this.geometry(`plane:${w},${h}`,()=>plane(w,h));}
  texture(source){const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);this.textures.push(t);return t;}
  begin(eye,target,fov=.67) {
    if(this.lost) return false;
    const gl=this.gl,c=this.canvas,w=Math.max(1,Math.round(c.clientWidth*this.ratio)),h=Math.max(1,Math.round(c.clientHeight*this.ratio));
    if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
    gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
    this.vp=multiply(perspective(fov,w/h),lookAt(eye,target));
    gl.uniformMatrix4fv(this.uniforms.uVP,false,this.vp);gl.uniform3fv(this.uniforms.uEye,eye);gl.uniform1f(this.uniforms.uTime,performance.now()/1000);
    return true;
  }
  draw(geometry,matrix,color=[.6,.65,.7],metal=.0,selected=0,mode=0,texture=null) {
    const gl=this.gl,u=this.uniforms;
    gl.bindBuffer(gl.ARRAY_BUFFER,geometry.buffer);
    const sizes=[3,3,2],offsets=[0,12,24];
    this.attributes.forEach((location,i)=>{if(location>=0){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,sizes[i],gl.FLOAT,false,32,offsets[i]);}});
    gl.uniformMatrix4fv(u.uModel,false,matrix);gl.uniform3fv(u.uColor,color);gl.uniform1f(u.uMetal,metal);gl.uniform1f(u.uSelected,selected);gl.uniform1i(u.uMode,mode);
    if(texture){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(u.uTexture,0);}
    gl.drawArrays(gl.TRIANGLES,0,geometry.count);
  }
  project(p){const m=this.vp,q=[0,0,0,0];for(let i=0;i<4;i++)q[i]=m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i];return [(q[0]/q[3]*.5+.5)*this.canvas.clientWidth,(-q[1]/q[3]*.5+.5)*this.canvas.clientHeight];}
  dispose(){for(const g of this.cache.values())this.gl.deleteBuffer(g.buffer);for(const t of this.textures)this.gl.deleteTexture(t);this.gl.deleteProgram(this.program);}
}

// The same meshes remain interactive when a browser cannot create a GPU context.
// This is a low-poly painter renderer, not a second set of illustration assets.
class SoftwareRenderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');if(!this.ctx)throw new Error('Canvas rendering unavailable');this.backend='canvas2d';this.cache=new Map();this.queue=[];this.vp=identity();this.eye=[0,0,1];this.gl={depthMask(){}};this.ratio=Math.min(devicePixelRatio||1,1.25);}
  geometry(key,creator){if(!this.cache.has(key))this.cache.set(key,{data:creator()});return this.cache.get(key);}
  box(w,h,d,r=.06){return this.geometry(`box:${w},${h},${d},${r}`,()=>roundedBox(w,h,d,r,Math.max(w,h,d)<.3?2:6));}
  ring(radius,tube){return this.geometry(`ring:${radius},${tube}`,()=>torus(radius,tube,88,16));}
  cylinder(r,h){return this.geometry(`cyl:${r},${h}`,()=>cylinder(r,h,24));}
  plane(w,h){return this.geometry(`plane:${w},${h}`,()=>plane(w,h));}
  texture(canvas){return {width:canvas.width,height:canvas.height,data:canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data};}
  begin(eye,target,fov=.67){const c=this.canvas,w=Math.max(1,Math.round(c.clientWidth*this.ratio)),h=Math.max(1,Math.round(c.clientHeight*this.ratio));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}this.ctx.setTransform(1,0,0,1,0,0);this.ctx.clearRect(0,0,w,h);this.ctx.setTransform(this.ratio,0,0,this.ratio,0,0);this.eye=eye;this.vp=multiply(perspective(fov,w/h),lookAt(eye,target));this.queue.length=0;if(!this.image||this.image.width!==w||this.image.height!==h){this.image=this.ctx.createImageData(w,h);this.depth=new Float32Array(w*h);}return true;}
  project(p){const m=this.vp,q=[0,0,0,0];for(let i=0;i<4;i++)q[i]=m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i];return [(q[0]/q[3]*.5+.5)*this.canvas.clientWidth,(-q[1]/q[3]*.5+.5)*this.canvas.clientHeight,q[2]/q[3],1/q[3]];}
  draw(geometry,model,color=[.6,.65,.7],metal=0,selected=0,mode=0,texture=null){
    const a=geometry.data,m=model;
    const smooth=(lo,hi,v)=>{const t=clamp((v-lo)/(hi-lo),0,1);return t*t*(3-2*t);};
    for(let i=0;i<a.length;i+=24){
      const points=[],world=[],normal=[0,0,0],uv=[];
      for(let j=0;j<3;j++){
        const o=i+j*8,p=[m[0]*a[o]+m[4]*a[o+1]+m[8]*a[o+2]+m[12],m[1]*a[o]+m[5]*a[o+1]+m[9]*a[o+2]+m[13],m[2]*a[o]+m[6]*a[o+1]+m[10]*a[o+2]+m[14]];
        normal[0]+=m[0]*a[o+3]+m[4]*a[o+4]+m[8]*a[o+5];normal[1]+=m[1]*a[o+3]+m[5]*a[o+4]+m[9]*a[o+5];normal[2]+=m[2]*a[o+3]+m[6]*a[o+4]+m[10]*a[o+5];
        world.push(p);points.push(this.project(p));uv.push([a[o+6],a[o+7]]);
      }
      const center=[0,1,2].map(k=>(world[0][k]+world[1][k]+world[2][k])/3),n=vec.norm(normal),v=vec.norm(this.eye);
      const facing=vec.dot(n,v);if(facing<-.02||points.some(p=>p[2]>1))continue;
      const ref=n.map((x,k)=>2*facing*x-v[k]),diff=Math.max(vec.dot(n,[-.29,.72,.63]),0),fresnel=Math.pow(1-Math.max(facing,0),4);
      const strip=smooth(.13,.32,ref[1])-smooth(.68,.84,ref[1]),softbox=Math.pow(Math.max(vec.dot(ref,[-.48,.55,.69]),0),18),edge=Math.pow(Math.max(vec.dot(ref,[.89,0,.45]),0),28);
      const rgb=color.map((base,k)=>{const env=[.16,.18,.23][k]+[.73,.77,.85][k]*strip+[1.4,1.45,1.5][k]*softbox+[.18,.23,.6][k]*edge;return Math.round(Math.pow(clamp(mix(base*(.25+.7*diff),env*base*(.85+.5*fresnel)+.06*diff,metal)+selected*[.02,.035,.09][k],0,1),.4545)*255);});
      this.queue.push({points,depth:points.reduce((s,p)=>s+p[2],0)/3,color:rgb,mode,texture,uv});
    }
  }
  end(){
    const width=this.image.width,height=this.image.height,out=this.image.data,zbuf=this.depth,ratio=this.ratio;
    out.fill(0);zbuf.fill(Infinity);
    for(const t of this.queue){
      const p=t.points.map(p=>[p[0]*ratio,p[1]*ratio,p[2],p[3]]),[a,b,c]=p;
      const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
      if(Math.abs(den)<.01)continue;
      const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0]))),minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const inv=1/den,w0x=(b[1]-c[1])*inv,w0y=(c[0]-b[0])*inv,w1x=(c[1]-a[1])*inv,w1y=(a[0]-c[0])*inv;
      for(let y=minY;y<=maxY;y++){
        let u=((b[1]-c[1])*(minX+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))*inv;
        let v=((c[1]-a[1])*(minX+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))*inv;
        for(let x=minX;x<=maxX;x++,u+=w0x,v+=w1x){
          const w=1-u-v;if(u<-.0001||v<-.0001||w<-.0001)continue;
          const z=u*a[2]+v*b[2]+w*c[2],index=y*width+x;if(z>=zbuf[index])continue;
          const o=index*4;
          if(t.mode===2&&t.texture){
            const reciprocal=u*a[3]+v*b[3]+w*c[3];
            const tx=(u*t.uv[0][0]*a[3]+v*t.uv[1][0]*b[3]+w*t.uv[2][0]*c[3])/reciprocal;
            const ty=(u*t.uv[0][1]*a[3]+v*t.uv[1][1]*b[3]+w*t.uv[2][1]*c[3])/reciprocal;
            const ix=clamp(Math.floor(tx*t.texture.width),0,t.texture.width-1),iy=clamp(Math.floor((1-ty)*t.texture.height),0,t.texture.height-1),source=(iy*t.texture.width+ix)*4;
            out[o]=t.texture.data[source];out[o+1]=t.texture.data[source+1];out[o+2]=t.texture.data[source+2];out[o+3]=255;
          }else if(t.mode===3){
            const tx=u*t.uv[0][0]+v*t.uv[1][0]+w*t.uv[2][0]-.5,ty=(u*t.uv[0][1]+v*t.uv[1][1]+w*t.uv[2][1]-.5)*1.5;
            out[o]=43;out[o+1]=51;out[o+2]=84;out[o+3]=Math.round(Math.exp(-(tx*tx+ty*ty)*13)*55);
          }else{out[o]=t.color[0];out[o+1]=t.color[1];out[o+2]=t.color[2];out[o+3]=255;}
          zbuf[index]=z;
        }
      }
    }
    this.ctx.setTransform(1,0,0,1,0,0);this.ctx.putImageData(this.image,0,0);
  }
  dispose(){this.cache.clear();this.queue.length=0;}
}

class Scene {
  constructor(canvas,draw,{continuous=true}={}) {
    this.canvas=canvas;try{this.renderer=new Renderer(canvas);}catch(error){if(error.message!=='WebGL unavailable')throw error;this.renderer=new SoftwareRenderer(canvas);}this.draw=draw;this.continuous=continuous;this.animating=false;this.visible=false;this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.frame=0;this.last=0;this.time=0;this.dragging=false;this.destroyed=false;
    this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.refresh();},{rootMargin:'80px'});this.observer.observe(canvas);
    this.resize=new ResizeObserver(()=>this.renderOnce());this.resize.observe(canvas);
    this.onVisibility=()=>this.refresh();document.addEventListener('visibilitychange',this.onVisibility);
    this.onLost=()=>this.stop();canvas.addEventListener('webglcontextlost',this.onLost);
    canvas.addEventListener('webglcontextrestored',()=>{this.renderer=new Renderer(canvas);canvas.parentElement.classList.add('has-webgl');canvas.parentElement.dataset.renderState='ready';this.refresh();});
    canvas.parentElement.dataset.renderState='ready';canvas.parentElement.dataset.renderBackend=this.renderer.backend;
    this.renderOnce();canvas.parentElement.classList.add('has-webgl');
  }
  renderOnce(){if(this.destroyed||this.renderer.lost)return;this.draw(this.renderer,0,this.time);this.renderer.end?.();}
  refresh(){this.stop();if(!this.paused&&this.visible&&!document.hidden&&!this.renderer.lost&&(this.continuous||this.animating)){this.last=performance.now();this.frame=requestAnimationFrame(t=>this.tick(t));}else this.renderOnce();}
  tick(t){if(this.destroyed)return;if(this.renderer.backend==='canvas2d'&&t-this.last<40){this.frame=requestAnimationFrame(n=>this.tick(n));return;}const dt=Math.min((t-this.last)/1000,.045);this.last=t;this.time+=dt;this.draw(this.renderer,dt,this.time);this.renderer.end?.();if(this.continuous||this.animating)this.frame=requestAnimationFrame(n=>this.tick(n));else this.frame=0;}
  stop(){cancelAnimationFrame(this.frame);this.frame=0;}
  motion(paused){this.paused=paused;this.refresh();}
  dispose(){this.destroyed=true;this.stop();this.observer.disconnect();this.resize.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);this.canvas.removeEventListener('webglcontextlost',this.onLost);this.renderer.dispose();}
}

function wireOrbit(scene,state,{onTap,onSpace}={}) {
  const c=scene.canvas;let start=null,moved=false;
  c.addEventListener('pointerdown',e=>{if(e.button!==0)return;start=[e.clientX,e.clientY];moved=false;scene.dragging=true;c.setPointerCapture(e.pointerId);});
  c.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start[0],dy=e.clientY-start[1];if(Math.abs(dx)+Math.abs(dy)>3)moved=true;state.yaw+=dx*.006;state.pitch=clamp(state.pitch+dy*.004,-.8,1.12);start=[e.clientX,e.clientY];if(scene.paused||!scene.continuous)scene.renderOnce();});
  const end=e=>{if(!start)return;start=null;scene.dragging=false;if(!moved&&e.type==='pointerup'&&onTap){const r=c.getBoundingClientRect();onTap(e.clientX-r.left,e.clientY-r.top);}if(c.hasPointerCapture(e.pointerId))c.releasePointerCapture(e.pointerId);};
  c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
  c.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home',' '];if(!keys.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')state.yaw-=.14;if(e.key==='ArrowRight')state.yaw+=.14;if(e.key==='ArrowUp')state.pitch=clamp(state.pitch-.1,-.8,1.12);if(e.key==='ArrowDown')state.pitch=clamp(state.pitch+.1,-.8,1.12);if(e.key==='Home'){state.yaw=state.homeYaw;state.pitch=state.homePitch;}if(e.key===' '&&onSpace){onSpace();if(scene.paused)scene.renderOnce();return;}scene.renderOnce();});
}

export function createHero(canvas) {
  const state={yaw:-.38,pitch:.15,homeYaw:-.38,homePitch:.15,explode:0,target:0,scroll:0,pointerX:0,pointerY:0};
  let scene;
  const draw=(r,dt,t)=>{
    const ease=dt?1-Math.exp(-dt*6):1;state.explode=mix(state.explode,state.target,ease);
    const drift=dt&&!scene?.dragging?Math.sin(t*.17)*.13:0,global=transform([0,.07,0],[state.pitch+state.pointerY*.045,state.yaw+drift+state.pointerX*.075,-.18+state.scroll*.12]);
    if(!r.begin([0,.1,6.75],[0,.05,0],.68))return;
    const e=state.explode,chrome=[.82,.85,.91],blue=[.11,.16,.93];
    const drawPart=(geo,pos,rot,color,metal=.9)=>r.draw(geo,multiply(global,transform(pos,rot)),color,metal);
    drawPart(r.box(.48,2.78,.62,.12),[-.51-e*.55,.03+e*.18,e*.3],[0,0,-.39-e*.18],chrome);
    drawPart(r.box(.48,2.78,.62,.12),[.51+e*.55,.03+e*.18,-e*.2],[0,0,.39+e*.18],chrome);
    drawPart(r.box(1.29,.38,.64,.09),[0,-.35-e*.55,e*.7],[e*.16,0,0],chrome);
    drawPart(r.box(.16,.23,.015,.015),[0,-.35-e*.55,.329+e*.7],[0,0,0],blue,.45);
    for(const sign of [-1,1]){
      drawPart(r.ring(.085,.025),[sign*(.405+e*.15),-.35-e*.55,.34+e*.7],[0,0,0],[.08,.1,.14],.7);
      drawPart(r.box(.17,.045,.016,.01),[sign*.405,-.35-e*.55,.369+e*.7],[0,0,.7*sign],[.24,.29,.4],.8);
    }
    const ringMat=multiply(global,transform([0,0,-.03],[.91+e*.2,-.54,-.42+e*.1]));
    r.draw(r.ring(1.84,.09),ringMat,blue,.62);
    r.draw(r.ring(1.84,.012),multiply(global,transform([0,0,-.03],[.91+e*.2,-.54,-.42+e*.1])),[.6,.68,1],.4);
  };
  scene=new Scene(canvas,draw);
  const toggle=()=>{state.target=state.target?0:1;if(scene.paused)scene.renderOnce();return !!state.target;};
  wireOrbit(scene,state,{onSpace:()=>{const pressed=toggle();document.dispatchEvent(new CustomEvent('portfolio:assembly',{detail:{pressed}}));}});
  canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();state.pointerX=(e.clientX-rect.left)/rect.width-.5;state.pointerY=(e.clientY-rect.top)/rect.height-.5;});
  return {motion:v=>scene.motion(v),toggle,scroll:v=>{state.scroll=v;},dispose:()=>scene.dispose()};
}

function terminalTexture() {
  const c=document.createElement('canvas');c.width=1024;c.height=640;const x=c.getContext('2d');
  x.fillStyle='#131725';x.fillRect(0,0,1024,640);x.fillStyle='#252a3d';x.fillRect(0,0,1024,55);
  ['#cc715e','#c3b77b','#8fb19a'].forEach((color,i)=>{x.fillStyle=color;x.beginPath();x.arc(28+i*23,28,6,0,TAU);x.fill();});
  x.font='18px monospace';x.fillStyle='#acb5ce';x.fillText('asyraf@arch — ~',398,34);
  x.font='bold 30px monospace';x.fillStyle='#7b8eff';x.fillText('asyraf@arch',48,110);x.fillStyle='#8c96b0';x.fillText('───────────',48,149);
  x.font='bold 118px monospace';x.fillStyle='#788aff';x.fillText('A',64,307);x.font='17px monospace';x.fillStyle='#788aff';x.fillText('/ make it yours /',44,358);
  const lines=[['OS','Arch Linux x86_64'],['WM','Openbox'],['TERM','Alacritty'],['EDIT','Neovim'],['MUX','tmux'],['MIND','Always exploring.']];
  lines.forEach(([a,b],i)=>{x.font='20px monospace';x.fillStyle='#8294ff';x.fillText(a,365,204+i*37);x.fillStyle='#d3d7e6';x.fillText(b,451,204+i*37);});
  x.fillStyle='#59627b';x.fillRect(48,468,928,1);x.font='21px monospace';x.fillStyle='#91ac9c';x.fillText('~ $',48,517);x.fillStyle='#d3d7e6';x.fillText('build --with-intent',108,517);x.fillStyle='#8294ff';x.fillRect(378,499,12,22);
  ['#253043','#6c7fff','#a8b0c5','#dddbd0','#a86b55','#8a9f8d','#5f6989','#c2c9de'].forEach((a,i)=>{x.fillStyle=a;x.fillRect(48+i*44,559,44,22);});return c;
}
export function createWorkspace(canvas,onInspect) {
  const state={yaw:.38,pitch:.52,homeYaw:.38,homePitch:.52,targetYaw:.38,targetPitch:.52,selected:'terminal',transition:0};let scene;
  const draw=(r,dt,t)=>{
    if(state.transition>0&&!scene?.dragging){const q=dt?1-Math.exp(-dt*4):1;state.yaw=mix(state.yaw,state.targetYaw,q);state.pitch=mix(state.pitch,state.targetPitch,q);if(Math.abs(state.yaw-state.targetYaw)+Math.abs(state.pitch-state.targetPitch)<.002){state.transition=0;if(scene)scene.animating=false;}}
    const pitch=clamp(state.pitch,.18,1.1),dist=9.1,eye=[Math.sin(state.yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(state.yaw)*Math.cos(pitch)*dist];
    if(!r.begin(eye,[0,-.15,0],.66))return;
    r.gl.depthMask(false);r.draw(r.plane(9,6),transform([0,-1.94,0],[-Math.PI/2,0,0]),[.2,.25,.4],0,0,3);r.gl.depthMask(true);
    const box=(dims,p,color,rad=.06,rot=[0,0,0],metal=.0,selected=0)=>r.draw(r.box(...dims,rad),transform(p,rot),color,metal,selected);
    const bone=[.72,.73,.71],graphite=[.075,.09,.14],blue=[.13,.2,.72];
    box([6.35,.22,3.45],[0,-1.16,0],[.64,.67,.72],.1);
    box([5.75,.08,2.95],[0,-1.29,0],[.22,.27,.4],.03);
    for(const x of [-2.6,2.6])for(const z of [-1.18,1.18])box([.16,.68,.16],[x,-1.63,z],[.29,.34,.48],.025);
    const monitorSelected=state.selected==='terminal'?.4:0;
    box([2.96,.13,.21],[-.54,1.52,-.66],graphite,.055,[0,0,0],.35,monitorSelected);
    box([2.96,.13,.21],[-.54,-.36,-.66],graphite,.055,[0,0,0],.35,monitorSelected);
    box([.13,1.84,.21],[-1.955,.58,-.66],graphite,.055,[0,0,0],.35,monitorSelected);
    box([.13,1.84,.21],[.875,.58,-.66],graphite,.055,[0,0,0],.35,monitorSelected);
    box([.17,.78,.17],[-.54,-.72,-.67],[.31,.36,.48],.04,[0,0,0],.5);
    box([1.2,.08,.61],[-.54,-1.01,-.6],[.31,.36,.48],.045,[0,0,0],.4);
    if(!r.monitorTexture)r.monitorTexture=r.texture(terminalTexture());
    r.draw(r.plane(2.72,1.73),transform([-.54,.6,-.545]),[1,1,1],0,0,2,r.monitorTexture);
    box([2.65,.13,.92],[-.55,-.94,.91],[.21,.25,.35],.08,[0,0,0],.35,state.selected==='tools'?.5:0);
    for(let row=0;row<4;row++)for(let col=0;col<13;col++){
      if(row===3&&col>3&&col<9)continue;
      const color=(row===0&&col===0)||(row===2&&col===12)?blue:bone;
      box([.155,.09,.145],[-1.72+col*.19,-.835,.61+row*.19],color,.022);
    }
    box([.92,.09,.145],[-.55,-.835,1.18],bone,.022);
    box([.41,.2,.62],[1.25,-.9,.95],bone,.15,[0,-.15,0],.05);
    box([.016,.014,.16],[1.25,-.79,.86],graphite,.005);
    box([.86,1.32,1.13],[2.1,-.4,-.56],blue,.095,[0,0,0],.3,state.selected==='mindset'?.6:0);
    for(let i=0;i<3;i++)box([.48,.065,.08],[2.1,-.22+i*.2,.055],[.44,.51,.76],.012);
    r.draw(r.cylinder(.025,.02),transform([2.1,-.83,.04],[Math.PI/2,0,0]),[.7,.78,1],.3);
    for(let i=0;i<3;i++){
      const y=-.91+i*.225;box([.76,.19,.7],[-2.32,y,.02],i===2?[.48,.53,.72]:[.27,.33,.5],.04);
      box([.13,.025,.018],[-2.12,y,.38],[.61,.72,1],.004);
    }
    r.draw(r.cylinder(.24,.46),transform([2.08,-.8,1.12]),[.73,.7,.64],.04);
    r.draw(r.cylinder(.193,.008),transform([2.08,-.563,1.12]),[.075,.055,.042],0);
    r.draw(r.ring(.14,.038),transform([2.35,-.78,1.12],[0,Math.PI/2,0]),[.73,.7,.64],.04);
  };
  scene=new Scene(canvas,draw,{continuous:false});
  const inspect=key=>{state.selected=key;const targets={terminal:[.38,.52],tools:[-.15,.92],mindset:[-.68,.58]};[state.targetYaw,state.targetPitch]=targets[key]||targets.terminal;state.transition=1;if(scene.paused){state.yaw=state.targetYaw;state.pitch=state.targetPitch;state.transition=0;scene.renderOnce();}else{scene.animating=true;scene.refresh();}};
  wireOrbit(scene,state,{onTap:(x,y)=>{const targets=[['terminal',[-.54,.6,-.5],95],['tools',[-.55,-.8,.9],85],['mindset',[2.1,-.3,-.2],75]];let best=null,score=Infinity;for(const [key,point,radius]of targets){const p=scene.renderer.project(point),d=Math.hypot(x-p[0],y-p[1])/radius;if(d<1&&d<score){score=d;best=key;}}if(best)onInspect(best);}});
  canvas.addEventListener('pointerdown',()=>{state.transition=0;});
  canvas.addEventListener('keydown',e=>{state.transition=0;if(['1','2','3'].includes(e.key)){e.preventDefault();onInspect(['terminal','tools','mindset'][Number(e.key)-1]);}});
  return {motion:v=>scene.motion(v),inspect,reset:()=>inspect('terminal'),dispose:()=>scene.dispose()};
}
