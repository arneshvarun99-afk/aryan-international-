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

const hero=document.querySelector('.hero'),globe=document.querySelector('.globe');
hero.addEventListener('mousemove',e=>{
  const x=(e.clientX/innerWidth-.5)*16,y=(e.clientY/innerHeight-.5)*12;
  globe.style.transform=`translate(${x}px,${y}px) rotateX(${-y*.25}deg) rotateY(${x*.25}deg)`;
});
hero.addEventListener('mouseleave',()=>globe.style.transform='translate(0,0)');

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


// Signature product launch interaction: the card "opens" into a dossier.

// Product search on the homepage
const productSearch=document.getElementById('productSearch');
const clearProductSearch=document.getElementById('clearProductSearch');
const productEmpty=document.getElementById('productEmpty');
const productCards=[...document.querySelectorAll('.prodGrid .prod')];
function filterProducts(){
  const q=(productSearch?.value||'').trim().toLowerCase();
  let visible=0;
  productCards.forEach(card=>{
    const match=!q || card.textContent.toLowerCase().includes(q);
    card.style.display=match?'flex':'none';
    if(match){
      card.classList.add('show');
      visible++;
    }else{
      card.classList.remove('show');
    }
  });
  if(productEmpty) productEmpty.style.display=(q && !visible)?'block':'none';
}
productSearch?.addEventListener('input',filterProducts);
clearProductSearch?.addEventListener('click',()=>{productSearch.value='';filterProducts();productSearch.focus()});

document.querySelectorAll('.productLaunch').forEach(card=>{
  card.addEventListener('click', e=>{
    if(e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    const href = card.getAttribute('href');
    card.classList.add('launching');
    document.body.classList.add('product-transition');
    setTimeout(()=>{ window.location.href = href; }, 520);
  });
});

/* Clear the transition overlay when returning via browser back/forward cache. */
function resetProductTransition(){
  document.body.classList.remove('product-transition');
  document.querySelectorAll('.productLaunch.launching').forEach(el=>el.classList.remove('launching'));
}
addEventListener('pageshow', resetProductTransition);