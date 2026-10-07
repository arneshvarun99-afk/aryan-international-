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
  import('https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js').then(async THREE=>{
    const {OrbitControls}=await import('https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/controls/OrbitControls.js');

    const renderer=new THREE.WebGLRenderer({
      canvas:globeCanvas,
      alpha:true,
      antialias:true,
      powerPreference:'high-performance'
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.setSize(globeCanvas.clientWidth,globeCanvas.clientHeight,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=.95;

    const scene=new THREE.Scene();

    const camera=new THREE.PerspectiveCamera(28,1,.1,100);
    camera.position.set(0,0,5.25);

    scene.add(new THREE.AmbientLight(0x768995,.42));

    const sun=new THREE.DirectionalLight(0xffead0,2.85);
    sun.position.set(-3.8,1.7,4.8);
    scene.add(sun);

    const rim=new THREE.DirectionalLight(0x4c8298,.55);
    rim.position.set(4,-1,-3);
    scene.add(rim);

    const globe=new THREE.Group();
    scene.add(globe);

    const radius=2.08;
    const loader=new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const map=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
    );
    map.colorSpace=THREE.SRGBColorSpace;

    const normal=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
    );

    const specular=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
    );

    const earth=new THREE.Mesh(
      new THREE.SphereGeometry(radius,160,160),
      new THREE.MeshPhongMaterial({
        map,
        normalMap:normal,
        normalScale:new THREE.Vector2(.55,.55),
        specularMap:specular,
        specular:new THREE.Color(0x71838c),
        shininess:20
      })
    );
    globe.add(earth);

    // Independent cloud shell creates real depth as the camera moves around the sphere.
    const cloudMap=loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
    );
    const clouds=new THREE.Mesh(
      new THREE.SphereGeometry(radius*1.012,128,128),
      new THREE.MeshPhongMaterial({
        map:cloudMap,
        transparent:true,
        opacity:.16,
        depthWrite:false
      })
    );
    globe.add(clouds);

    // Real atmospheric shell, not a CSS circle.
    const atmosphere=new THREE.Mesh(
      new THREE.SphereGeometry(radius*1.045,128,128),
      new THREE.MeshBasicMaterial({
        color:0x70abc2,
        transparent:true,
        opacity:.085,
        side:THREE.BackSide,
        blending:THREE.AdditiveBlending,
        depthWrite:false
      })
    );
    globe.add(atmosphere);

    globe.rotation.y=-.45;
    globe.rotation.x=-.08;

    const controls=new OrbitControls(camera,globeCanvas);
    controls.enableDamping=true;
    controls.dampingFactor=.055;
    controls.enablePan=false;
    controls.enableZoom=true;
    controls.minDistance=4.35;
    controls.maxDistance=6.5;
    controls.rotateSpeed=.42;
    controls.zoomSpeed=.65;
    controls.autoRotate=true;
    controls.autoRotateSpeed=.32;
    controls.target.set(0,0,0);
    controls.update();

    let interactionTimer=0;

    globeCanvas.addEventListener('pointerdown',()=>{
      controls.autoRotate=false;
      clearTimeout(interactionTimer);
    });

    globeCanvas.addEventListener('pointerup',()=>{
      clearTimeout(interactionTimer);
      interactionTimer=setTimeout(()=>{
        controls.autoRotate=true;
      },700);
    });

    // Scrolling through the hero subtly changes the cinematic rotation rate.
    const updateAutoRotate=()=>{
      const r=heroEl.getBoundingClientRect();
      const p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
      controls.autoRotateSpeed=.20+p*.55;
    };
    addEventListener('scroll',updateAutoRotate,{passive:true});
    updateAutoRotate();

    // Gentle cursor parallax, separate from the actual 3D drag rotation.
    let targetTiltX=0,targetTiltY=0,tiltX=0,tiltY=0;
    heroEl.addEventListener('pointermove',e=>{
      const r=heroEl.getBoundingClientRect();
      const nx=e.clientX/r.width-.5;
      const ny=e.clientY/r.height-.5;
      targetTiltX=-ny*.055;
      targetTiltY=nx*.055;
    });
    heroEl.addEventListener('pointerleave',()=>{
      targetTiltX=0;
      targetTiltY=0;
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

    const animate=()=>{
      requestAnimationFrame(animate);

      // Independent cloud drift makes the sphere read as physically layered.
      clouds.rotation.y+=.00012;
      clouds.rotation.x+=.000015;

      tiltX+=(targetTiltX-tiltX)*.06;
      tiltY+=(targetTiltY-tiltY)*.06;
      globe.rotation.z=tiltY;
      atmosphere.rotation.z=tiltY;

      controls.update();
      renderer.render(scene,camera);
    };

    animate();
  }).catch(err=>{
    console.error('3D globe failed to initialise:',err);
  });
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
