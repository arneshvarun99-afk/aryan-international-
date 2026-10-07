const nav=document.getElementById('nav'),bar=document.getElementById('progress');
function fx(){const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(scrollY/Math.max(h,1)*100)+'%';nav.classList.toggle('scrolled',scrollY>40)}addEventListener('scroll',fx,{passive:true});fx();

const visuals=[...document.querySelectorAll('.story')];
visuals.forEach(story=>{
 const visual=story.querySelector('.stickyVisual'), img=visual.querySelector('.visualImage'), cap=visual.querySelector('strong'), sub=visual.querySelector('span');
 const steps=[...story.querySelectorAll('.step')];
 const obs=new IntersectionObserver(es=>es.forEach(e=>{
   if(e.isIntersecting){
      steps.forEach(s=>s.classList.remove('active'));e.target.classList.add('active');
      const title=e.target.dataset.title || e.target.querySelector('h3')?.textContent || '';
      const caption=e.target.dataset.caption || 'Buyer quality layer';
      cap.textContent=title;sub.textContent=caption;
      img.style.transform='scale(1.06)';img.style.filter='brightness(.84)';
      setTimeout(()=>{img.style.transform='scale(1)';img.style.filter='brightness(1)'},500);
   }
 }),{threshold:.55});
 steps.forEach(s=>obs.observe(s));
});
const firstSteps=document.querySelectorAll('.step:first-child');firstSteps.forEach(s=>s.classList.add('active'));