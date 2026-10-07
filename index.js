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
  import('https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js').then(THREE=>{
    const renderer=new THREE.WebGLRenderer({
      canvas:globeCanvas,
      alpha:true,
      antialias:true,
      powerPreference:'high-performance'
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=.92;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(28,1,.1,100);
    camera.position.set(0,0,5.35);

    scene.add(new THREE.AmbientLight(0x70808a,.48));

    const sun=new THREE.DirectionalLight(0xffead0,2.55);
    sun.position.set(-3.8,1.9,4.8);
    scene.add(sun);

    const rimLight=new THREE.DirectionalLight(0x4b8197,.48);
    rimLight.position.set(4,-1.5,-3.2);
    scene.add(rimLight);

    const earthGroup=new THREE.Group();
    scene.add(earthGroup);

    const radius=2.08;
    const loader=new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const earthMap=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
    );
    earthMap.colorSpace=THREE.SRGBColorSpace;

    const normalMap=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
    );

    const specularMap=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
    );

    const earth=new THREE.Mesh(
      new THREE.SphereGeometry(radius,144,144),
      new THREE.MeshPhongMaterial({
        map:earthMap,
        normalMap,
        normalScale:new THREE.Vector2(.52,.52),
        specularMap,
        specular:new THREE.Color(0x637782),
        shininess:16
      })
    );
    earthGroup.add(earth);

    const atmosphere=new THREE.Mesh(
      new THREE.SphereGeometry(radius*1.035,112,112),
      new THREE.MeshBasicMaterial({
        color:0x73a7bb,
        transparent:true,
        opacity:.07,
        side:THREE.BackSide,
        blending:THREE.AdditiveBlending,
        depthWrite:false
      })
    );
    earthGroup.add(atmosphere);

    const cloudMap=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
    );
    const clouds=new THREE.Mesh(
      new THREE.SphereGeometry(radius*1.012,112,112),
      new THREE.MeshPhongMaterial({
        map:cloudMap,
        transparent:true,
        opacity:.12,
        depthWrite:false
      })
    );
    earthGroup.add(clouds);

    let yaw=.52;
    let pitch=-.11;
    let targetYaw=yaw;
    let targetPitch=pitch;

    let velocityX=.00034;
    let velocityY=0;
    let pointerInside=false;
    let lastX=null;
    let lastY=null;
    let lastTime=performance.now();

    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

    // Slow cinematic idle spin, with the pointer changing direction/speed.
    const updateIdleSpeed=()=>{
      const r=heroEl.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);
      velocityX=.00022 + p*.00040;
    };
    addEventListener('scroll',updateIdleSpeed,{passive:true});
    updateIdleSpeed();

    heroEl.addEventListener('pointerenter',e=>{
      pointerInside=true;
      lastX=e.clientX;
      lastY=e.clientY;
    });

    heroEl.addEventListener('pointermove',e=>{
      const r=heroEl.getBoundingClientRect();
      const nx=e.clientX/r.width-.5;
      const ny=e.clientY/r.height-.5;

      if(lastX!==null){
        const dx=e.clientX-lastX;
        const dy=e.clientY-lastY;

        // Cursor motion adds inertia to the globe's natural rotation.
        velocityX+=dx*.000045;
        velocityY-=dy*.000020;
        velocityX=clamp(velocityX,-.012,.012);
        velocityY=clamp(velocityY,-.003,.003);
      }

      lastX=e.clientX;
      lastY=e.clientY;

      targetPitch+=((clamp(-ny*.18,-.18,.18))-targetPitch)*.06;

      globeCanvas.style.transform=
        'translate3d(0,0,0) rotateX('+(ny*-1.0)+'deg) rotateY('+(nx*1.15)+'deg)';
    });

    heroEl.addEventListener('pointerleave',()=>{
      pointerInside=false;
      lastX=null;
      lastY=null;
      globeCanvas.style.transform='translate3d(0,0,0)';
    });

    const resize=()=>{
      const rect=globeCanvas.getBoundingClientRect();
      const w=Math.max(1,rect.width);
      const h=Math.max(1,rect.height);
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    };

    addEventListener('resize',resize);
    resize();

    const clock=new THREE.Clock();

    const animate=(now)=>{
      requestAnimationFrame(animate);

      const dt=Math.min(32,now-lastTime);
      lastTime=now;
      const frame=dt/16.6667;

      // Keep a gentle perpetual motion, even when the cursor is still.
      if(!reduced){
        targetYaw+=velocityX*frame;
      }

      // Inertia decays back toward the slow cinematic idle speed.
      const r=heroEl.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);
      const idle=.00022+p*.00040;
      velocityX += (idle-velocityX)*.018;
      velocityY *= .92;

      yaw+=(targetYaw-yaw)*.045;
      pitch+=(targetPitch-pitch)*.045;

      earthGroup.rotation.y=yaw;
      earthGroup.rotation.x=pitch;

      // Clouds rotate just a touch faster to add depth.
      clouds.rotation.y=yaw*1.015;
      clouds.rotation.x=pitch*.997;

      renderer.render(scene,camera);
    };

    requestAnimationFrame(animate);
  }).catch(err=>console.error('3D Earth renderer failed:',err));
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
