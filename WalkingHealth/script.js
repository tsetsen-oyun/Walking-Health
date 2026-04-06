const revealEls = document.querySelectorAll('section');

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.opacity = 1;
      e.target.style.transform = "none";
    }
  });
},{threshold:0.1});

revealEls.forEach(el=>{
  el.style.opacity = 0;
  el.style.transform = "translateY(40px)";
  el.style.transition = "0.6s";
  observer.observe(el);
});