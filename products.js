const DATA={
garlic:{title:"Fresh Garlic",tag:"AGRO · BULK SUPPLY",image:"https://images.unsplash.com/photo-1756361946221-00d12b875342?auto=format&fit=crop&w=1800&q=88",hero:"A clean buyer brief turns a commodity enquiry into a quoteable requirement.",why:"International garlic buyers usually care about origin, grade, bulb size, cleanliness, packing format, quantity and destination.",buyer:"Tell us your destination, estimated quantity, required grade/size, packaging format and inspection or documentation requirements.",specs:[["Origin","India / buyer-approved sourcing"],["Grade","Buyer-specified"],["Packing","Mesh, carton or buyer requirement"],["Quantity","Quote by requested volume"],["Destination","Port / country"],["Quality","Agreed specification before order"]]},
turmeric:{title:"Erode Turmeric",tag:"GI ORIGIN · PREMIUM SPICE",image:"https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?auto=format&fit=crop&w=1800&q=88",hero:"A provenance-led spice story for buyers who care about origin as well as product.",why:"Erode Manjal (Erode Turmeric) is a registered Geographical Indication in India. Verify the offered lot and supplier authorization before presenting it as GI-certified.",buyer:"Ask for the form, target curcumin specification where applicable, packing, quantity, destination and whether GI documentation is required.",specs:[["GI name","Erode Manjal (Erode Turmeric)"],["Status","Registered GI"],["Geography","Tamil Nadu, India"],["Form","Whole / powder by requirement"],["Packing","Bulk or buyer-specific"],["Verification","Source + authorized-user check"]]},
spices:{title:"Whole Spices",tag:"SPICES · ORIGIN SOURCING",image:"https://images.unsplash.com/photo-1771541897176-44a3e01dc484?auto=format&fit=crop&w=1800&q=88",hero:"Build a spice basket around the buyer's market, not a one-size-fits-all catalogue.",why:"Indian spice sourcing becomes more useful when the buyer specifies the exact spice, grade, cleanliness, cut, packing and destination requirements.",buyer:"Name the spice, volume, form, grade/specification, packing format, destination and any food-safety or inspection requirement.",specs:[["Examples","Pepper, chilli, cumin, coriander and more"],["Form","Whole / crushed / powdered"],["Grade","Buyer-specific"],["Packing","Bulk / private label by requirement"],["Quantity","Trial or commercial volume"],["Compliance","Destination-specific requirements"]]},
"pvc-taps":{title:"PVC Taps",tag:"PLUMBING · TRADE SUPPLY",image:"https://images.unsplash.com/photo-1773177930292-463ca3c5b86a?auto=format&fit=crop&w=1800&q=88",hero:"Straightforward utility products where model, finish and packing matter.",why:"Plumbing buyers often need a precise combination of model, size, material, thread, finish, packing and carton quantity.",buyer:"Send the model or reference photo, material preference, thread/size, colour or finish, quantity, packing requirement and destination.",specs:[["Material","PVC / plastic"],["Application","Domestic and utility plumbing"],["Model","Buyer-specific"],["Packing","Bulk or retail-ready"],["Quantity","By requirement"],["Destination","Country / port"]]},
"pvc-fittings":{title:"PVC Fittings",tag:"PLUMBING · FITTING RANGE",image:"https://images.unsplash.com/photo-1549277512-89b1c704ffe8?auto=format&fit=crop&w=1800&q=88",hero:"A specification-driven category built around size, type and connection.",why:"Fitting enquiries convert faster when they include the exact fitting type, nominal size, connection standard, quantity and application.",buyer:"Tell us the fitting type, size range, standard, pressure/application requirement, quantity and packaging format.",specs:[["Range","Elbow, tee, coupler and more"],["Size","Buyer-specified"],["Standard","As required by market"],["Application","Water / utility plumbing"],["Packing","Carton / bulk"],["Quantity","By SKU or mixed order"]]},
coir:{title:"Coir Products",tag:"NATURAL FIBRE · INDIA",image:"https://images.unsplash.com/photo-1783068358342-bf21fb32017b?auto=format&fit=crop&w=1800&q=88",hero:"A natural-fibre category where application and format define the right product.",why:"Coir sourcing can span horticulture, agriculture and other commercial uses. Buyers should lead with the form, dimensions or specification, packing and intended application.",buyer:"Tell us the coir product form, dimensions/specification, application, quantity, packing and destination.",specs:[["Category","Coir / natural fibre"],["Applications","Horticulture, agriculture, commercial"],["Form","Buyer-specific"],["Packing","Bulk / palletized by requirement"],["Quantity","Trial / commercial"],["Destination","Country / port"]]}
};

const cards=[...document.querySelectorAll(".productCard")];
const viewer=document.getElementById("viewer");
const viewerTop=document.getElementById("viewerTop");
const close=document.getElementById("closeViewer");
const vTitle=document.getElementById("vTitle");
const vTag=document.getElementById("vEyebrow");
const vHero=document.getElementById("vHero");
const vWhy=document.getElementById("vWhy");
const vBuyer=document.getElementById("vBuyer");
const vSpecs=document.getElementById("vSpecs");
const next=document.getElementById("vNext");
let current=0;

function openProduct(index){
  current=index;
  const d=DATA[cards[index].dataset.key];
  viewerTop.style.backgroundImage="linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.82)),url('"+d.image+"')";
  vTitle.textContent=d.title;
  vTag.textContent=d.tag;
  vHero.textContent=d.hero;
  vWhy.textContent=d.why;
  vBuyer.textContent=d.buyer;
  vSpecs.innerHTML=d.specs.map(function(s){return "<div class='spec'><b>"+s[0]+"</b>"+s[1]+"</div>";}).join("");
  next.textContent=current===cards.length-1?"Back to first product ↗":"Open next product ↗";
  viewer.classList.add("open");
  viewer.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}
function closeProduct(){
  viewer.classList.remove("open");
  viewer.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}
cards.forEach(function(card,i){
  card.addEventListener("click",function(){openProduct(i);});
  card.addEventListener("pointermove",function(e){
    if(innerWidth<900)return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform="translateY(-8px) perspective(1100px) rotateX("+(-y*2).toFixed(2)+"deg) rotateY("+(x*2.4).toFixed(2)+"deg)";
  });
  card.addEventListener("pointerleave",function(){card.style.transform="";});
});
close.addEventListener("click",closeProduct);
viewer.addEventListener("click",function(e){if(e.target===viewer)closeProduct();});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeProduct();});
next.addEventListener("click",function(){openProduct((current+1)%cards.length);});

let raf=0;
function parallax(){
  raf=0;
  const vh=innerHeight;
  cards.forEach(function(card){
    const img=card.querySelector(".productImage");
    const r=card.getBoundingClientRect();
    const p=Math.max(-1,Math.min(1,(r.top+r.height/2-vh/2)/(vh*.9)));
    img.style.transform="translate3d(0,"+(-p*18).toFixed(1)+"px,0) scale("+(1.045+Math.abs(p)*.018).toFixed(3)+")";
  });
}
addEventListener("scroll",function(){if(!raf)raf=requestAnimationFrame(parallax);},{passive:true});
addEventListener("resize",parallax);
parallax();

function progress(){
  const h=document.documentElement.scrollHeight-innerHeight;
  document.getElementById("progress").style.width=(scrollY/Math.max(h,1)*100)+"%";
}
addEventListener("scroll",progress,{passive:true});
progress();
