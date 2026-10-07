
/* Full-screen 3D Earth from the supplied reference implementation */
(function initEarthHero(){
  const container=document.getElementById('canvas-container');
  const hero=document.querySelector('.hero');
  if(!container || !hero || !window.THREE || !THREE.OrbitControls) return;

  let scene,camera,renderer,globe,stars,controls;
  let mouseX=0,mouseY=0,targetX=0,targetY=0;
  let autoRotateSpeed=.55;
  const clock=performance.now();

  function init(){
    scene=new THREE.Scene();
    scene.fog=new THREE.FogExp2(0x030712,0.0008);

    camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.z=218;

    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.1;
    container.appendChild(renderer.domElement);

    controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;
    controls.dampingFactor=.05;
    controls.enableZoom=false;
    controls.autoRotate=true;
    controls.autoRotateSpeed=autoRotateSpeed;
    controls.enablePan=false;

    const ambientLight=new THREE.AmbientLight(0xffffff,.8);
    scene.add(ambientLight);

    const sunLight=new THREE.DirectionalLight(0xfff5ea,1.8);
    sunLight.position.set(200,100,150);
    scene.add(sunLight);

    const blueRimLight=new THREE.DirectionalLight(0x3b82f6,.8);
    blueRimLight.position.set(-200,-50,-100);
    scene.add(blueRimLight);

    const globeRadius=82;
    const geometry=new THREE.SphereGeometry(globeRadius,96,96);
    const textureLoader=new THREE.TextureLoader();
    const mapTexture=textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

    const material=new THREE.MeshStandardMaterial({
      map:mapTexture,
      roughness:.62,
      metalness:.08
    });

    globe=new THREE.Mesh(geometry,material);
    globe.rotation.y=-.35;
    scene.add(globe);

    const atmosphereGeo=new THREE.SphereGeometry(globeRadius+2.0,96,96);
    const atmosphereMat=new THREE.MeshBasicMaterial({
      color:0x60a5fa,
      transparent:true,
      opacity:.15,
      side:THREE.BackSide
    });
    scene.add(new THREE.Mesh(atmosphereGeo,atmosphereMat));

    createMinimalStarfield();

    document.addEventListener('mousemove',onDocumentMouseMove,{passive:true});
    window.addEventListener('resize',onWindowResize);
  }

  function createMinimalStarfield(){
    const starCount=180;
    const geometry=new THREE.BufferGeometry();
    const positions=new Float32Array(starCount*3);

    for(let i=0;i<starCount;i++){
      const i3=i*3;
      positions[i3]=(Math.random()-.5)*800;
      positions[i3+1]=(Math.random()-.5)*800;
      positions[i3+2]=(Math.random()-.5)*800;
    }

    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));

    const material=new THREE.PointsMaterial({
      color:0xffffff,
      size:1.2,
      transparent:true,
      opacity:.5,
      blending:THREE.AdditiveBlending,
      depthWrite:false
    });

    stars=new THREE.Points(geometry,material);
    scene.add(stars);
  }

  function onDocumentMouseMove(event){
    mouseX=(event.clientX-window.innerWidth/2)*.0003;
    mouseY=(event.clientY-window.innerHeight/2)*.0003;
  }

  function onWindowResize(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  }

  function animate(){
    requestAnimationFrame(animate);

    targetX+=(mouseX-targetX)*.05;
    targetY+=(mouseY-targetY)*.05;

    // Cursor parallax is a gentle camera movement, not a fake 2D globe transform.
    camera.position.x=THREE.MathUtils.lerp(camera.position.x,targetX*45,.04);
    camera.position.y=THREE.MathUtils.lerp(camera.position.y,-targetY*45,.04);
    camera.lookAt(scene.position);

    if(stars) stars.rotation.y-=.0001;

    // Scroll through the hero subtly changes auto-rotation speed.
    const r=hero.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,(window.innerHeight-r.top)/(window.innerHeight+r.height)));
    controls.autoRotateSpeed=.45+progress*.25;

    controls.update();
    renderer.render(scene,camera);
  }

  init();
  animate();
})();
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
