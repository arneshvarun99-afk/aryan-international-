const nav=document.getElementById('nav'),bar=document.getElementById('progress');
function scrollFx(){
  const h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(scrollY/Math.max(1,h)*100)+'%';
  nav.classList.toggle('scrolled',scrollY>35);
}
addEventListener('scroll',scrollFx,{passive:true});scrollFx();

const obs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting)e.target.classList.add('show');
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

document.querySelectorAll('.h2').forEach(el=>{
  el.innerHTML=el.innerHTML.split(/(\s+)/).map(t=>{
    if(/^\s+$/.test(t)) return t;
    if(t.includes('<')) return t;
    return `<span class="word"><span>${t}</span></span>`;
  }).join('');
});
const wordObs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    const words=e.target.querySelectorAll('.word');
    words.forEach((w,i)=>setTimeout(()=>w.classList.add('show'),i*55));
    wordObs.unobserve(e.target);
  }
}),{threshold:.3});
document.querySelectorAll('.h2').forEach(el=>wordObs.observe(el));


const brandStage=document.getElementById('brandStage');
const brandWords=document.querySelectorAll('.brandWord');
if(brandStage){
  brandStage.addEventListener('mousemove',e=>{
    const r=brandStage.getBoundingClientRect();
    const nx=e.clientX/r.width-.5, ny=e.clientY/r.height-.5;
    brandWords.forEach(w=>{
      const speed=parseFloat(w.dataset.speed)||1;
      w.style.transform=`translate(${nx*34*speed}px,${ny*18*speed}px) rotateY(${nx*3*speed}deg)`;
    });
  });
  brandStage.addEventListener('mouseleave',()=>brandWords.forEach(w=>w.style.transform=''));
}
function brandScroll(){
  if(!brandStage)return;
  const r=brandStage.getBoundingClientRect();
  const p=(innerHeight-r.top)/(innerHeight+r.height);
  if(p>-0.1 && p<1.1) brandWords.forEach(w=>{
    const speed=parseFloat(w.dataset.speed)||1;
    w.style.transform=`translateX(${(p-.5)*110*speed}px)`;
  });
}
addEventListener('scroll',brandScroll,{passive:true});brandScroll();

const globeStage=document.getElementById('globeStage');
const globeCanvas=document.getElementById('globeCanvas');

if(globeStage && globeCanvas){
  const gl=globeCanvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:false});
  if(gl){
    const vertexSource=`
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main(){
        vUv=aPosition*0.5+0.5;
        gl_Position=vec4(aPosition,0.0,1.0);
      }`;
    const fragmentSource=`
      precision mediump float;
      uniform sampler2D uTexture;
      uniform float uYaw;
      uniform float uPitch;
      varying vec2 vUv;
      const float PI=3.141592653589793;
      mat3 rotX(float a){float s=sin(a),c=cos(a);return mat3(1.0,0.0,0.0,0.0,c,-s,0.0,s,c);}
      mat3 rotY(float a){float s=sin(a),c=cos(a);return mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c);}
      void main(){
        vec2 p=vUv*2.0-1.0;p.y*=-1.0;
        float r2=dot(p,p);if(r2>1.0) discard;
        float z=sqrt(max(0.0,1.0-r2));
        vec3 n=normalize(vec3(p.x,p.y,z));
        n=rotX(uPitch)*rotY(uYaw)*n;
        float lon=atan(n.z,n.x);
        float lat=asin(clamp(n.y,-1.0,1.0));
        vec2 uv=vec2(lon/(2.0*PI)+0.5,0.5-lat/PI);
        vec3 tex=texture2D(uTexture,uv).rgb;
        vec3 lightDir=normalize(vec3(-0.42,0.18,0.88));
        float diffuse=max(dot(n,lightDir),0.0);
        float softLight=0.48+0.72*diffuse;
        vec3 viewDir=vec3(0.0,0.0,1.0);
        float rim=pow(1.0-max(dot(n,viewDir),0.0),2.4);
        float spec=pow(max(dot(reflect(-lightDir,n),viewDir),0.0),26.0);
        vec3 color=tex*softLight;
        color+=vec3(0.55,0.74,1.0)*rim*0.18;
        color+=vec3(1.0,0.74,0.28)*spec*0.24;
        gl_FragColor=vec4(color,1.0);
      }`;

    function compile(type,source){
      const s=gl.createShader(type);
      gl.shaderSource(s,source);
      gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));gl.deleteShader(s);return null;}
      return s;
    }
    const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
    if(vs&&fs){
      const program=gl.createProgram();
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      if(gl.getProgramParameter(program,gl.LINK_STATUS)){
        gl.useProgram(program);

        const buffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const position=gl.getAttribLocation(program,'aPosition');
        gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);

        const yawLoc=gl.getUniformLocation(program,'uYaw'),pitchLoc=gl.getUniformLocation(program,'uPitch'),texLoc=gl.getUniformLocation(program,'uTexture');
        const texture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([7,16,25,255,18,42,48,255,18,42,48,255,7,16,25,255]));

        const earthTexture=new Image();
        earthTexture.crossOrigin='anonymous';
        earthTexture.onload=()=>{
          gl.bindTexture(gl.TEXTURE_2D,texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,earthTexture);
        };
        earthTexture.onerror=()=>console.warn('Earth texture could not be loaded; fallback texture remains active.');
        earthTexture.src='https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';

        let yaw=.25,pitch=-.08,targetYaw=yaw,targetPitch=pitch,lastX=null,lastY=null,hovering=false;
        const prefersReducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

        globeStage.addEventListener('pointerenter',e=>{hovering=true;lastX=e.clientX;lastY=e.clientY;globeStage.classList.add('is-grabbing')});
        globeStage.addEventListener('pointermove',e=>{
          const r=globeStage.getBoundingClientRect();
          const nx=e.clientX/r.width-.5,ny=e.clientY/r.height-.5;
          if(lastX!==null){targetYaw+=(e.clientX-lastX)*.008;targetPitch=clamp(targetPitch-(e.clientY-lastY)*.004,-.58,.58)}
          lastX=e.clientX;lastY=e.clientY;
          globeCanvas.style.transform=`rotateX(${-ny*2.6}deg) rotateY(${nx*3.2}deg)`;
        });
        globeStage.addEventListener('pointerleave',()=>{hovering=false;lastX=null;lastY=null;globeStage.classList.remove('is-grabbing');globeCanvas.style.transform=''});
        
        function resize(){
          const rect=globeCanvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
          const w=Math.max(1,Math.floor(rect.width*dpr)),h=Math.max(1,Math.floor(rect.height*dpr));
          if(globeCanvas.width!==w||globeCanvas.height!==h){globeCanvas.width=w;globeCanvas.height=h;gl.viewport(0,0,w,h)}
        }
        function render(){
          resize();
          if(!prefersReducedMotion&&!hovering) targetYaw+=.00055;
          yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;
          gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
          gl.uniform1f(yawLoc,yaw);gl.uniform1f(pitchLoc,pitch);gl.uniform1i(texLoc,0);
          gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.drawArrays(gl.TRIANGLES,0,6);
          requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
      }
    }
  }
}

document.querySelectorAll('.card,.prod,.step').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    if(innerWidth<900)return;
    const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    const rx=((y-r.height/2)/r.height)*-3,ry=((x-r.width/2)/r.width)*3;
    card.style.transform=`perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

document.querySelectorAll('.btn,.navbtn').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.06}px,${(e.clientY-r.top-r.height/2)*.06}px)`;
  });
  btn.addEventListener('mouseleave',()=>btn.style.transform='');
});


// Editorial motion inspired by premium athlete/product sites
const motionReduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroVisual=document.querySelector('.globeWrap');
const heroCopy=document.querySelector('.copy');
const productCards=[...document.querySelectorAll('.prod')];

if(!motionReduced){
  addEventListener('scroll',()=>{
    const y=scrollY;
    if(heroVisual){
      const shift=Math.min(45,y*.08);
      heroVisual.style.transform=`translate3d(0,${-shift}px,0)`;
    }
    if(heroCopy){
      heroCopy.style.transform=`translate3d(0,${Math.min(28,y*.035)}px,0)`;
    }
    productCards.forEach((card,i)=>{
      const r=card.getBoundingClientRect();
      const center=(innerHeight*.55-r.top)/innerHeight;
      const yMove=Math.max(-10,Math.min(10,center*7));
      card.style.setProperty('--scroll-y',yMove+'px');
    });
  },{passive:true});

  document.querySelectorAll('.card,.prod,.step').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      if(innerWidth<900)return;
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(900px) translateY(var(--scroll-y,0)) rotateX(${-y*2.2}deg) rotateY(${x*2.8}deg)`;
    });
    el.addEventListener('pointerleave',()=>{
      el.style.transform='';
    });
  });
}

// Make the first screen feel alive immediately, then let scrolling take over.
requestAnimationFrame(()=>document.querySelectorAll('.hero .reveal').forEach(el=>el.classList.add('show')));
