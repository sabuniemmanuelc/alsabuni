(function(){
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

  // Translation helper: falls back to raw key if i18n manager or key is unavailable.
  function t(key){
    if(window.i18n && typeof window.i18n.t === 'function'){ return window.i18n.t(key); }
    return key;
  }

  var state = { serviceId:null, icon:null, durationKey:null, firstName:'', lastName:'', email:'', phone:'', org:'', timezone:'', brief:'', hearAbout:'', day:null, time:null, confirmed:false };

  var params = new URLSearchParams(window.location.search);
  var preselect = params.get('service');

  var cards = document.querySelectorAll('.service-card');

  function selectCard(card){
    cards.forEach(function(c){ c.classList.remove('selected'); });
    card.classList.add('selected');
    state.serviceId = card.getAttribute('data-service');
    state.icon = card.getAttribute('data-icon');
    state.durationKey = card.getAttribute('data-duration-key');
    document.getElementById('toStep2').disabled = false;
  }

  cards.forEach(function(card){
    card.addEventListener('click', function(){ selectCard(card); });
    var sid = card.getAttribute('data-service');
    if(preselect && sid && sid.toLowerCase() === preselect.toLowerCase()){
      selectCard(card);
    }
  });

  function setStep(n){
    document.querySelectorAll('.step-view').forEach(function(v){ v.classList.remove('active'); });
    document.getElementById('view-'+n).classList.add('active');
    document.querySelectorAll('.step-tab').forEach(function(tab){
      var s = parseInt(tab.getAttribute('data-step'), 10);
      tab.classList.remove('active','done');
      if(s < n) tab.classList.add('done');
      if(s === n) tab.classList.add('active');
    });
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // Re-render any dynamic (JS-set) text in the current language. Called on language
  // switch so previously-selected/confirmed content updates along with the static page.
  function refreshDynamicText(){
    if(!state.serviceId) return;
    var titleKey = 'svc_' + state.serviceId + '_title';
    var serviceLabel = state.icon + ' ' + t(titleKey);

    var chip = document.getElementById('chipService');
    if(chip){ chip.innerHTML = '<span data-i18n="chip_you_selected">' + t('chip_you_selected') + '</span> <strong>' + serviceLabel + '</strong>'; }

    var sumService = document.getElementById('sumService');
    if(sumService && sumService.textContent !== '—'){ sumService.textContent = serviceLabel; }
    var sumDuration = document.getElementById('sumDuration');
    if(sumDuration && sumDuration.textContent !== '—'){ sumDuration.textContent = t(state.durationKey); }

    if(state.confirmed){
      var cfService = document.getElementById('cf-service');
      if(cfService){ cfService.textContent = serviceLabel; }
    }
  }
  window.onLanguageChange = refreshDynamicText;

  document.getElementById('toStep2').addEventListener('click', function(){
    refreshDynamicText();
    setStep(2);
  });
  document.getElementById('toStep1').addEventListener('click', function(){ setStep(1); });
  document.getElementById('toStep2b').addEventListener('click', function(){ setStep(2); });

  function validateField(id, condition){
    var el = document.getElementById(id);
    if(condition){ el.classList.remove('invalid'); return true; }
    el.classList.add('invalid'); return false;
  }

  document.getElementById('toStep3').addEventListener('click', function(){
    var f = document.getElementById('detailsForm');
    var firstName = f.firstName.value.trim();
    var lastName = f.lastName.value.trim();
    var email = f.email.value.trim();
    var timezone = f.timezone.value;
    var brief = f.brief.value.trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    var ok = true;
    ok = validateField('f-firstName', firstName.length > 0) && ok;
    ok = validateField('f-lastName', lastName.length > 0) && ok;
    ok = validateField('f-email', emailOk) && ok;
    ok = validateField('f-timezone', timezone.length > 0) && ok;
    ok = validateField('f-brief', brief.length > 0) && ok;
    if(!ok) return;

    state.firstName = firstName; state.lastName = lastName; state.email = email;
    state.phone = f.phone.value.trim(); state.org = f.org.value.trim();
    state.timezone = timezone; state.brief = brief; state.hearAbout = f.hearAbout.value;

    document.getElementById('sumService').textContent = state.icon + ' ' + t('svc_' + state.serviceId + '_title');
    document.getElementById('sumDuration').textContent = t(state.durationKey);
    document.getElementById('sumName').textContent = state.firstName+' '+state.lastName;
    document.getElementById('sumEmail').textContent = state.email;
    document.getElementById('sumTimezone').textContent = state.timezone;
    document.getElementById('sumBrief').textContent = state.brief.length > 60 ? state.brief.slice(0,60)+'…' : state.brief;

    buildSchedule();
    setStep(3);
  });

  var days = ['Mon 22', 'Tue 23', 'Wed 24', 'Thu 25', 'Fri 26'];
  var slotsByDay = {
    'Mon 22': ['9:00 AM','11:30 AM','2:00 PM'],
    'Tue 23': ['10:00 AM','1:00 PM','3:30 PM'],
    'Wed 24': ['9:30 AM','12:00 PM'],
    'Thu 25': ['10:30 AM','1:30 PM','4:00 PM'],
    'Fri 26': ['9:00 AM','11:00 AM']
  };

  function buildSchedule(){
    var dayTabs = document.getElementById('dayTabs');
    dayTabs.innerHTML = '';
    days.forEach(function(d, i){
      var btn = document.createElement('button');
      btn.className = 'day-tab' + (i === 0 ? ' active' : '');
      btn.type = 'button';
      btn.textContent = d;
      btn.addEventListener('click', function(){
        dayTabs.querySelectorAll('.day-tab').forEach(function(t){ t.classList.remove('active'); });
        btn.classList.add('active');
        state.day = d; state.time = null;
        document.getElementById('confirmBooking').disabled = true;
        renderSlots(d);
      });
      dayTabs.appendChild(btn);
    });
    state.day = days[0];
    renderSlots(days[0]);
  }

  function renderSlots(day){
    var grid = document.getElementById('slotGrid');
    grid.innerHTML = '';
    slotsByDay[day].forEach(function(tm){
      var b = document.createElement('button');
      b.className = 'slot-btn';
      b.type = 'button';
      b.textContent = tm;
      b.addEventListener('click', function(){
        grid.querySelectorAll('.slot-btn').forEach(function(s){ s.classList.remove('selected'); });
        b.classList.add('selected');
        state.time = tm;
        document.getElementById('confirmBooking').disabled = false;
      });
      grid.appendChild(b);
    });
  }

  document.getElementById('confirmBooking').addEventListener('click', function(){
    state.confirmed = true;
    document.getElementById('cf-service').textContent = state.icon + ' ' + t('svc_' + state.serviceId + '_title');
    document.getElementById('cf-when').textContent = state.day+', '+state.time+' ('+state.timezone.split(' ')[0]+')';
    document.getElementById('cf-name').textContent = state.firstName+' '+state.lastName;
    document.getElementById('cf-email').textContent = state.email;
    setStep(4);
  });

  document.getElementById('bookAnother').addEventListener('click', function(){
    document.getElementById('detailsForm').reset();
    cards.forEach(function(c){ c.classList.remove('selected'); });
    document.getElementById('toStep2').disabled = true;
    document.querySelectorAll('.field').forEach(function(f){ f.classList.remove('invalid'); });
    state = { serviceId:null, icon:null, durationKey:null, firstName:'', lastName:'', email:'', phone:'', org:'', timezone:'', brief:'', hearAbout:'', day:null, time:null, confirmed:false };
    setStep(1);
  });
})();
