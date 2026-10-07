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


const heroEl=document.querySelector('.hero');
const globeStage=document.getElementById('globeStage');
const globeCanvas=document.getElementById('globeCanvas');

if(heroEl && globeCanvas){
  (()=>{
    const gl=globeCanvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
    if(!gl)return;

    const vertexSource=[
      'attribute vec2 aPosition;',
      'varying vec2 vUv;',
      'void main(){',
      'vUv=aPosition*0.5+0.5;',
      'gl_Position=vec4(aPosition,0.0,1.0);',
      '}'
    ].join('\n');

    const fragmentSource=[
      'precision highp float;',
      'uniform sampler2D uEarth;',
      'uniform float uYaw;',
      'uniform float uPitch;',
      'uniform float uAlpha;',
      'varying vec2 vUv;',
      'const float PI=3.141592653589793;',
      'mat3 rotX(float a){float s=sin(a),c=cos(a);return mat3(1.0,0.0,0.0,0.0,c,-s,0.0,s,c);}',
      'mat3 rotY(float a){float s=sin(a),c=cos(a);return mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c);}',
      'void main(){',
      'vec2 p=vUv*2.0-1.0;p.y*=-1.0;',
      'float r2=dot(p,p);if(r2>1.0)discard;',
      'float z=sqrt(max(0.0,1.0-r2));',
      'vec3 n=normalize(vec3(p.x,p.y,z));',
      'n=rotX(uPitch)*rotY(uYaw)*n;',
      'float lon=atan(n.z,n.x);',
      'float lat=asin(clamp(n.y,-1.0,1.0));',
      'vec2 uv=vec2(lon/(2.0*PI)+0.5,0.5-lat/PI);',
      'vec3 tex=texture2D(uEarth,uv).rgb;',
      'vec3 lightDir=normalize(vec3(-0.48,0.20,0.84));',
      'float diffuse=max(dot(n,lightDir),0.0);',
      'float day=0.30+0.84*diffuse;',
      'vec3 viewDir=vec3(0.0,0.0,1.0);',
      'float rim=pow(1.0-max(dot(n,viewDir),0.0),2.3);',
      'float spec=pow(max(dot(reflect(-lightDir,n),viewDir),0.0),22.0);',
      'vec3 color=tex*day;',
      'color+=vec3(0.18,0.40,0.55)*rim*0.28;',
      'color+=vec3(1.0,0.72,0.38)*spec*0.12;',
      'float edge=pow(max(0.0,1.0-r2),0.12);',
      'gl_FragColor=vec4(color,uAlpha*edge);',
      '}'
    ].join('\n');

    const compile=(type,source)=>{
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source);
      gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(shader));return null;}
      return shader;
    };
    const vs=compile(gl.VERTEX_SHADER,vertexSource);
    const fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
    if(!vs||!fs)return;

    const program=gl.createProgram();
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(program));return;}
    gl.useProgram(program);

    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'aPosition');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

    const yawLoc=gl.getUniformLocation(program,'uYaw');
    const pitchLoc=gl.getUniformLocation(program,'uPitch');
    const alphaLoc=gl.getUniformLocation(program,'uAlpha');
    const texLoc=gl.getUniformLocation(program,'uEarth');

    const texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([8,18,27,255,20,52,62,255,20,52,62,255,8,18,27,255]));

    const earth=new Image();
    earth.crossOrigin='anonymous';
    earth.onload=()=>{
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,earth);
    };
    earth.src='https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';

    let yaw=.35,pitch=-.12,targetYaw=yaw,targetPitch=pitch;
    let scrollSpeed=.00018,lastX=null,lastY=null,pointerActive=false;
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

    const updateScrollSpeed=()=>{
      const r=heroEl.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);
      scrollSpeed=.00012+p*.00058;
    };
    addEventListener('scroll',updateScrollSpeed,{passive:true});
    updateScrollSpeed();

    heroEl.addEventListener('pointermove',e=>{
      const r=heroEl.getBoundingClientRect();
      const nx=e.clientX/r.width-.5,ny=e.clientY/r.height-.5;
      if(lastX!==null){targetYaw+=(e.clientX-lastX)*.006;targetPitch=clamp(targetPitch-(e.clientY-lastY)*.003,-.5,.5);}
      lastX=e.clientX;lastY=e.clientY;pointerActive=true;
      globeCanvas.style.transform='translate3d(0,0,0) rotateX('+(ny*-1.2)+'deg) rotateY('+(nx*1.6)+'deg)';
    });
    heroEl.addEventListener('pointerleave',()=>{lastX=null;lastY=null;pointerActive=false;globeCanvas.style.transform='translate3d(0,0,0)';});

    const resize=()=>{
      const rect=globeCanvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
      const w=Math.max(1,Math.floor(rect.width*dpr)),h=Math.max(1,Math.floor(rect.height*dpr));
      if(globeCanvas.width!==w||globeCanvas.height!==h){globeCanvas.width=w;globeCanvas.height=h;gl.viewport(0,0,w,h);}
    };
    addEventListener('resize',resize);resize();

    const render=()=>{
      requestAnimationFrame(render);
      if(!reduced&&!pointerActive)targetYaw+=scrollSpeed;
      yaw+=(targetYaw-yaw)*.085;pitch+=(targetPitch-pitch)*.085;
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
      gl.uniform1f(yawLoc,yaw);gl.uniform1f(pitchLoc,pitch);gl.uniform1f(alphaLoc,.92);
      gl.uniform1i(texLoc,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.drawArrays(gl.TRIANGLES,0,6);
    };
    render();
  })();
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
const heroCopy=document.querySelector('.copy');
const productCards=[...document.querySelectorAll('.prod')];

if(!motionReduced){
  addEventListener('scroll',()=>{
    const y=scrollY;
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
