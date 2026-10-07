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
  (async()=>{
    try{
      const [THREE,d3,topojson,worldAtlasModule]=await Promise.all([
        import('https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js'),
        import('https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm'),
        import('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'),
        import('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/+esm')
      ]);
      const worldAtlas=worldAtlasModule.default||worldAtlasModule;
      const renderer=new THREE.WebGLRenderer({canvas:globeCanvas,alpha:true,antialias:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.05;

      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(34,1,.1,100);
      camera.position.set(0,0,5.3);

      scene.add(new THREE.AmbientLight(0x8faab5,.72));
      const key=new THREE.DirectionalLight(0xffead0,2.0);
      key.position.set(-3.5,1.5,4);
      scene.add(key);
      const fill=new THREE.DirectionalLight(0x6c9fc0,.6);
      fill.position.set(4,0,-2);
      scene.add(fill);

      const globeGroup=new THREE.Group();
      scene.add(globeGroup);

      const radius=2.08;
      const textureLoader=new THREE.TextureLoader();
      const earthTexture=textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
      earthTexture.colorSpace=THREE.SRGBColorSpace;

      const earth=new THREE.Mesh(
        new THREE.SphereGeometry(radius,96,96),
        new THREE.MeshPhongMaterial({
          map:earthTexture,
          shininess:8,
          specular:new THREE.Color(0x334455)
        })
      );
      globeGroup.add(earth);

      const atmosphere=new THREE.Mesh(
        new THREE.SphereGeometry(radius*1.04,64,64),
        new THREE.MeshBasicMaterial({
          color:0x5f9fba,
          transparent:true,
          opacity:.075,
          side:THREE.BackSide,
          blending:THREE.AdditiveBlending
        })
      );
      globeGroup.add(atmosphere);

      // Subtle trade-route orbital rings.
      const ringMaterial=new THREE.LineBasicMaterial({
        color:0xe2c07e,
        transparent:true,
        opacity:.14
      });
      for(const tilt of [.15,-.55,.85]){
        const pts=Array.from({length:128},(_,i)=>{
          const a=i/128*Math.PI*2;
          return new THREE.Vector3(Math.cos(a)*radius*1.16,Math.sin(a)*radius*1.16,0);
        });
        const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),ringMaterial);
        ring.rotation.x=Math.PI/3;
        ring.rotation.z=tilt;
        globeGroup.add(ring);
      }

      let yaw=.55,pitch=-.12,targetYaw=yaw,targetPitch=pitch;
      let lastX=null,lastY=null,hovering=false;
      const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

      globeStage.addEventListener('pointerenter',e=>{
        hovering=true;
        lastX=e.clientX;lastY=e.clientY;
      });
      globeStage.addEventListener('pointermove',e=>{
        const r=globeStage.getBoundingClientRect();
        const nx=e.clientX/r.width-.5,ny=e.clientY/r.height-.5;
        if(lastX!==null){
          targetYaw+=(e.clientX-lastX)*.0085;
          targetPitch=clamp(targetPitch-(e.clientY-lastY)*.0045,-.62,.62);
        }
        lastX=e.clientX;lastY=e.clientY;
        globeCanvas.style.transform=`rotateX(${ny*-2.2}deg) rotateY(${nx*2.8}deg)`;
      });
      globeStage.addEventListener('pointerleave',()=>{
        hovering=false;lastX=null;lastY=null;globeCanvas.style.transform='';
      });

      function resize(){
        const rect=globeCanvas.getBoundingClientRect();
        const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
        renderer.setSize(w,h,false);
        camera.aspect=w/h;
        camera.updateProjectionMatrix();
      }
      addEventListener('resize',resize);
      resize();

      const clock=new THREE.Clock();
      function render(){
        requestAnimationFrame(render);
        if(!reduced&&!hovering)targetYaw+=.00062;
        yaw+=(targetYaw-yaw)*.075;
        pitch+=(targetPitch-pitch)*.075;
        globeGroup.rotation.y=yaw;
        globeGroup.rotation.x=pitch;
        globeGroup.position.y=Math.sin(clock.getElapsedTime()*.65)*.018;
        renderer.render(scene,camera);
      }
      render();
    }catch(err){
      console.error('Interactive globe failed:',err);
    }
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
