(function(){
  var nav = document.getElementById('nav');
  function onScroll(){
    if(window.scrollY > 12){ nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  var menuBtn = document.getElementById('menuBtn');
  var panel = document.getElementById('mobilePanel');
  menuBtn.addEventListener('click', function(){
    var open = panel.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  panel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      panel.classList.remove('open');
      menuBtn.setAttribute('aria-expanded','false');
    });
  });

  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var stored = null;
  try{ stored = window.localStorage.getItem('theme'); }catch(e){}
  if(stored === 'light' || stored === 'dark'){ root.setAttribute('data-theme', stored); }
  toggle.addEventListener('click', function(){
    var current = root.getAttribute('data-theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var effectiveCurrent = current || (prefersLight ? 'light' : 'dark');
    var next = effectiveCurrent === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ window.localStorage.setItem('theme', next); }catch(e){}
  });

  window.toggleTl = function(btn){
    var item = btn.closest('.tl-item');
    item.classList.toggle('open');
  };
})();
