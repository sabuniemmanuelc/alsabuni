(function(){
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var stored = null;
  try{ stored = window.localStorage.getItem('theme'); }catch(e){}
  if(stored === 'light' || stored === 'dark'){ root.setAttribute('data-theme', stored); }

  function currentThemeName(){
    var explicit = root.getAttribute('data-theme');
    if(explicit === 'light' || explicit === 'dark') return explicit;
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }

  toggle.addEventListener('click', function(){
    var next = currentThemeName() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ window.localStorage.setItem('theme', next); }catch(e){}
    // Cal.com's inline embed supports live theme updates via the same "ui" call.
    var cal = window.Cal && window.Cal.ns && window.Cal.ns['consultation-booking'];
    if(cal){ cal('ui', { theme: next }); }
  });

  // Translation helper: falls back to raw key if i18n manager or key is unavailable.
  function t(key){
    if(window.i18n && typeof window.i18n.t === 'function'){ return window.i18n.t(key); }
    return key;
  }

  var state = { serviceId:null, icon:null, durationKey:null, firstName:'', lastName:'', email:'', phone:'', org:'', timezone:'', brief:'', hearAbout:'', confirmed:false, confirmedWhen:'' };

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
      var cfWhen = document.getElementById('cf-when');
      if(cfWhen){ cfWhen.textContent = state.confirmedWhen || t('confirm_when_fallback'); }
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

    setStep(3);
    renderLiveScheduler();
  });

  // ===============================
  // CAL.COM INTEGRATION
  // Real event-type slugs for sabuniemmanuelc's Cal.com account.
  // ===============================
  var CAL_COM_CONFIG = {
    "research":    "sabuniemmanuelc/research-data-strategy",
    "business":    "sabuniemmanuelc/business-setup",
    "valuation":   "sabuniemmanuelc/valuation-traction",
    "legacy":      "sabuniemmanuelc/legacy-trust",
    "realestate":  "sabuniemmanuelc/real-estate-investment",
    "tax":         "sabuniemmanuelc/taxation-advisory"
  };

  function initialiseCalEmbed(){
    return new Promise(function(resolve){
      if(window.Cal && window.Cal.ns && window.Cal.ns['consultation-booking']){
        resolve(true);
        return;
      }

      // Cal.com's official embed snippet, left structurally unchanged since their
      // loader (embed.js) calls back into this exact `Cal` function once it loads.
      (function (C, A, L) {
        var p = function (a, ar) { a.q.push(ar); };
        var d = C.document;
        C.Cal = C.Cal || function () {
          var cal = C.Cal;
          var ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = [];
            var script = d.createElement("script");
            script.src = A;
            script.onerror = function(){ /* handled by the polling timeout below */ };
            d.head.appendChild(script);
            cal.loaded = true;
          }
          if (ar[0] === L) {
            var api = function () { p(api, arguments); };
            var namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else {
              p(cal, ar);
            }
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");

      window.Cal("init", "consultation-booking", { origin: "https://cal.com" });

      var count = 0;
      var check = setInterval(function(){
        count++;
        if(window.Cal && window.Cal.ns && window.Cal.ns['consultation-booking']){
          clearInterval(check);
          resolve(true);
        }
        if(count > 50){
          clearInterval(check);
          resolve(false); // script blocked or failed to load — renderLiveScheduler shows the fallback note
        }
      }, 100);
    });
  }

  function renderLiveScheduler(){
    var calLink = CAL_COM_CONFIG[state.serviceId];
    var target = document.getElementById('cal-inline');
    var setupNote = document.getElementById('calSetupNote');

    target.innerHTML = '';

    if(!calLink){
      setupNote.hidden = false;
      target.style.display = 'none';
      return;
    }

    setupNote.hidden = true;
    target.style.display = 'block';

    initialiseCalEmbed().then(function(loaded){
      var cal = window.Cal && window.Cal.ns && window.Cal.ns['consultation-booking'];

      if(!loaded || !cal){
        setupNote.hidden = false;
        target.style.display = 'none';
        return;
      }

      cal("inline", {
        elementOrSelector: "#cal-inline",
        calLink: calLink,
        config: {
          name: state.firstName + ' ' + state.lastName,
          email: state.email,
          theme: currentThemeName(),
          "metadata[service]": t('svc_' + state.serviceId + '_title'),
          "metadata[duration]": t(state.durationKey),
          "metadata[brief]": state.brief,
          "metadata[organisation]": state.org,
          "metadata[phone]": state.phone,
          "metadata[timezone]": state.timezone,
          "metadata[hearAbout]": state.hearAbout
        }
      });

      cal("ui", {
        theme: currentThemeName(),
        hideEventTypeDetails: true,
        showTimezoneWhenEventDetailsHidden: true
      });

      cal("on", {
        action: "bookingSuccessful",
        callback: function(e){
          try{
            var payload = e && e.detail && e.detail.data;
            if(payload && payload.startTime){
              var d = new Date(payload.startTime);
              state.confirmedWhen = d.toLocaleString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
            }
          }catch(err){ /* fall back to the generic confirmation message */ }

          state.confirmed = true;
          document.getElementById('cf-service').textContent = state.icon + ' ' + t('svc_' + state.serviceId + '_title');
          document.getElementById('cf-when').textContent = state.confirmedWhen || t('confirm_when_fallback');
          document.getElementById('cf-name').textContent = state.firstName+' '+state.lastName;
          document.getElementById('cf-email').textContent = state.email;
          setStep(4);
        }
      });
    });
  }

  document.getElementById('bookAnother').addEventListener('click', function(){
    document.getElementById('detailsForm').reset();
    cards.forEach(function(c){ c.classList.remove('selected'); });
    document.getElementById('toStep2').disabled = true;
    document.querySelectorAll('.field').forEach(function(f){ f.classList.remove('invalid'); });
    var cal = window.Cal && window.Cal.ns && window.Cal.ns['consultation-booking'];
    var target = document.getElementById('cal-inline');
    if(target){ target.innerHTML = ''; }
    state = { serviceId:null, icon:null, durationKey:null, firstName:'', lastName:'', email:'', phone:'', org:'', timezone:'', brief:'', hearAbout:'', confirmed:false, confirmedWhen:'' };
    setStep(1);
  });
})();
