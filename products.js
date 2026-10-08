const DATA={
garlic:{
 title:"Fresh Garlic",tag:"AGRO · BULK SUPPLY",bg:"url('garlic.svg')",
 hero:"A clean buyer brief turns a commodity enquiry into a quoteable requirement.",
 why:"For garlic, international buyers usually care about origin, grade, bulb size, cleanliness, packing format, quantity and destination. Lead with those variables and the conversation becomes immediately actionable.",
 buyer:"Tell us your destination, estimated quantity, required grade/size, packaging format and any inspection or documentation requirements you need.",
 specs:[["Origin","India / buyer-approved sourcing"],["Grade","Buyer-specified"],["Packing","Mesh, carton or buyer requirement"],["Quantity","Quote by requested volume"],["Destination","Port / country"],["Quality","Agreed specification before order"]]
},
turmeric:{
 title:"Erode Turmeric",tag:"GI ORIGIN · PREMIUM SPICE",bg:"url('https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=1600&q=85')",
 hero:"A provenance-led spice story for buyers who care about origin as well as product.",
 why:"Erode Manjal (Erode Turmeric) is a registered Geographical Indication in India. The official GI record lists it as an agricultural good from Tamil Nadu. For export marketing, the safe commercial approach is to verify that the offered lot is covered by the GI and that the supplier is appropriately authorized before presenting it as GI-certified.",
 buyer:"Ask for the turmeric form, whole or powdered, target curcumin specification if applicable, packing, quantity, destination and whether GI documentation is required.",
 specs:[["GI name","Erode Manjal (Erode Turmeric)"],["Status","Registered GI"],["Geography","Tamil Nadu, India"],["Form","Whole / powder by requirement"],["Packing","Bulk or buyer-specific"],["Verification","Source + authorized-user check"]]
},
spices:{
 title:"Whole Spices",tag:"SPICES · ORIGIN SOURCING",bg:"url('https://images.unsplash.com/photo-1599909533730-f9d85c55b1ad?auto=format&fit=crop&w=1600&q=85')",
 hero:"Build a spice basket around the buyer's market, not a one-size-fits-all catalogue.",
 why:"Indian spice sourcing becomes more valuable when the buyer can specify the exact spice, grade, cleanliness, cut, packing and destination requirements. This category can cover a tailored basket rather than only one SKU.",
 buyer:"Name the spice, annual or trial volume, form, grade/specification, packing format, destination and any food-safety or inspection requirement.",
 specs:[["Examples","Pepper, chilli, cumin, coriander and more"],["Form","Whole / crushed / powdered"],["Grade","Buyer-specific"],["Packing","Bulk / private label by requirement"],["Quantity","Trial or commercial volume"],["Compliance","Destination-specific requirements"]]
},
"pvc-taps":{
 title:"PVC Taps",tag:"PLUMBING · TRADE SUPPLY",bg:"url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=85')",
 hero:"Straightforward utility products where model, finish and packing matter.",
 why:"Plumbing buyers often need a precise combination of model, size, material, thread, finish, packing and carton quantity. Presenting these details early makes a supplier conversation much faster.",
 buyer:"Send the model or reference photo, material preference, thread/size, colour or finish, quantity, packing requirement and destination.",
 specs:[["Material","PVC / plastic"],["Application","Domestic and utility plumbing"],["Model","Buyer-specific"],["Packing","Bulk or retail-ready"],["Quantity","By requirement"],["Destination","Country / port"]]
},
"pvc-fittings":{
 title:"PVC Fittings",tag:"PLUMBING · FITTING RANGE",bg:"linear-gradient(135deg,#647682,#27353e)",
 hero:"A specification-driven category built around size, type and connection.",
 why:"Fitting enquiries convert faster when they include the exact fitting type, nominal size, connection standard, quantity and application. That is the brief to build here.",
 buyer:"Tell us the fitting type, size range, standard, pressure/application requirement, quantity and packaging format.",
 specs:[["Range","Elbow, tee, coupler and more"],["Size","Buyer-specified"],["Standard","As required by market"],["Application","Water / utility plumbing"],["Packing","Carton / bulk"],["Quantity","By SKU or mixed order"]]
},
coir:{
 title:"Coir Products",tag:"NATURAL FIBRE · INDIA",bg:"url('https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=1600&q=85')",
 hero:"A natural-fibre category where application and format define the right product.",
 why:"Coir sourcing can span horticulture, agriculture and other commercial uses. Buyers should lead with the form, dimensions, density or specification, packing and intended application so the right supply can be matched.",
 buyer:"Tell us the coir product form, dimensions/specification, application, quantity, packing and destination.",
 specs:[["Category","Coir / natural fibre"],["Applications","Horticulture, agriculture, commercial"],["Form","Buyer-specific"],["Packing","Bulk / palletized by requirement"],["Quantity","Trial / commercial"],["Destination","Country / port"]]
}
};

const cards=[...document.querySelectorAll('.pCard')], viewer=document.getElementById('viewer'), panel=document.getElementById('viewerPanel');
cards.forEach(card=>card.classList.add('cascadeReady'));
const top=document.getElementById('viewerTop'), title=document.getElementById('vTitle'), tag=document.getElementById('vEyebrow'), hero=document.getElementById('vHero'), why=document.getElementById('vWhy'), buyer=document.getElementById('vBuyer'), specs=document.getElementById('vSpecs'), rfq=document.getElementById('vRfq'), next=document.getElementById('vNext');
let current=0;
const order=cards.map(c=>c.dataset.key);

/* Assign reliable product artwork and initialise scroll choreography. */
cards.forEach((card,index)=>{
  const data=DATA[card.dataset.key];
  card.style.setProperty('--bg',data.bg);
  card.style.setProperty('--cardSpeed',card.dataset.speed||1);
  card.style.setProperty('--delay',`${40 + (index%3)*90}ms`);
  card.style.setProperty('--index',index+1);
});

const grid=document.getElementById('productGrid');
let motionFrame=0;
function updateMotion(){
  motionFrame=0;
  const vh=innerHeight;
  const gridRect=grid?grid.getBoundingClientRect():null;
  cards.forEach(card=>{
    const r=card.getBoundingClientRect();
    const center=r.top+r.height/2;
    const distance=(center-vh/2)/(vh*.72);
    const speed=parseFloat(card.dataset.speed)||1;
    const lift=Math.max(-30,Math.min(30,-distance*20*speed));
    const imgY=Math.max(-22,Math.min(22,-distance*15*speed));
    const imageScale=1.05+Math.min(.055,Math.abs(distance)*.028);
    card.style.setProperty('--lift',`${lift}px`);
    card.style.setProperty('--imgY',`${imgY}px`);
    card.style.setProperty('--imgScale',imageScale.toFixed(3));
  });
  if(gridRect){
    const hero=document.querySelector('.hero');
    const heroCenter=hero?hero.getBoundingClientRect().top:0;
    document.documentElement.style.setProperty('--heroShift',`${Math.max(-36,Math.min(20,heroCenter*-0.07))}px`);
  }
}
function requestMotion(){
  if(!motionFrame) motionFrame=requestAnimationFrame(updateMotion);
}
requestMotion();
addEventListener('scroll',requestMotion,{passive:true});
addEventListener('resize',requestMotion);

cards.forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(matchMedia('(max-width: 900px)').matches) return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.setProperty('--ry',`${x*2.6}deg`);
    card.style.setProperty('--rx',`${-y*2.2}deg`);
  });
  card.addEventListener('pointerleave',()=>{
    card.style.setProperty('--ry','0deg');
    card.style.setProperty('--rx','0deg');
  });
});

function render(key){
 const d=DATA[key]; current=order.indexOf(key);
 top.style.setProperty('--panelBg',d.bg);
 top.style.backgroundImage=d.bg.startsWith('url')?`linear-gradient(180deg,#0002,#000d),${d.bg}`:`linear-gradient(180deg,#0002,#000d),${d.bg}`;
 title.textContent=d.title; tag.textContent=d.tag; hero.textContent=d.hero; why.textContent=d.why; buyer.textContent=d.buyer;
 specs.innerHTML=d.specs.map(s=>`<div class="spec"><b>${s[0]}</b>${s[1]}</div>`).join('');
 rfq.href='index.html#quote';
 next.textContent=current===order.length-1?'Back to first product ↗':'Open next product ↗';
}
function openViewer(key){
 render(key); viewer.classList.add('open'); viewer.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeViewer(){viewer.classList.remove('open');viewer.setAttribute('aria-hidden','true');document.body.style.overflow='';}
cards.forEach(c=>c.addEventListener('click',()=>openViewer(c.dataset.key)));
document.getElementById('closeViewer').addEventListener('click',closeViewer);
viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeViewer()});
next.addEventListener('click',()=>openViewer(order[(current+1)%order.length]));

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.13,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const cardIo=new IntersectionObserver(es=>es.forEach((e)=>{
  if(e.isIntersecting){
    e.target.classList.add('show');
    cardIo.unobserve(e.target);
  }
}),{threshold:.08,rootMargin:'0px 0px -10% 0px'});
cards.forEach(el=>cardIo.observe(el));
function progress(){const h=document.documentElement.scrollHeight-innerHeight;document.getElementById('progress').style.width=(scrollY/Math.max(1,h)*100)+'%'}
addEventListener('scroll',progress,{passive:true});progress();