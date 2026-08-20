(() => {
  const LIST_KEY = 'biy-checked-days';
  const RATE_KEY = 'biy-playback-rate';

  const container = document.getElementById('days');
  // use the page audio element so controls are visible to the user
  const audio = document.getElementById('audioPlayer');
  if (audio) audio.preload = 'none';
  const player = document.getElementById('player');
  const hidePlayerBtn = document.getElementById('hidePlayer');
  const seekBar = document.getElementById('seekBar');
  const currentTimeLabel = document.getElementById('currentTime');
  const durationLabel = document.getElementById('duration');
  const playbackRateSelect = document.getElementById('playbackRate');
  const rateValue = localStorage.getItem(RATE_KEY);
  const parsedRate = rateValue ? parseFloat(rateValue) : 1;
  const storedRate = Number.isFinite(parsedRate) ? Math.min(4, Math.max(0.5, parsedRate)) : 1;

  if (playbackRateSelect) playbackRateSelect.value = String(storedRate);

  function formatTime(seconds){
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  }

  function updatePlaybackPosition(){
    if (!audio) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (seekBar) {
      seekBar.max = String(duration);
      seekBar.value = String(Math.min(audio.currentTime, duration));
      seekBar.disabled = duration === 0;
    }
    if (currentTimeLabel) currentTimeLabel.textContent = formatTime(audio.currentTime);
    if (durationLabel) durationLabel.textContent = formatTime(duration);
  }


  // initialize playback rate from storage
  function initRate(){
    try {
      if (audio && Number.isFinite(storedRate)) {
         audio.playbackRate = storedRate;
         localStorage.setItem(RATE_KEY, String(audio.playbackRate)); 
      }
    } catch(_) {}
  }

  // listen for native control rate changes and persist them
  if (audio) {
    audio.addEventListener('loadedmetadata', initRate);
    audio.addEventListener('ratechange', ()=>{
      try { 
        localStorage.setItem(RATE_KEY, String(audio.playbackRate)); 
        if (playbackRateSelect) playbackRateSelect.value = String(audio.playbackRate);
      } catch(_) {}
    });
    audio.addEventListener('loadedmetadata', updatePlaybackPosition);
    audio.addEventListener('durationchange', updatePlaybackPosition);
    audio.addEventListener('timeupdate', updatePlaybackPosition);
  }

  if (seekBar && audio) {
    seekBar.addEventListener('input', () => {
      audio.currentTime = Number(seekBar.value);
      updatePlaybackPosition();
    });
  }

  if (playbackRateSelect && audio) {
    playbackRateSelect.addEventListener('change', () => {
      audio.playbackRate = Number(playbackRateSelect.value);
    });
  }

  // initialize rate immediately if already loaded
  if (audio && audio.readyState >= 1) {
    initRate();
  }

  function pad(n){ return String(n).padStart(3,'0'); }

  function getStored(){
    try { return new Set(JSON.parse(localStorage.getItem(LIST_KEY) || '[]')); }
    catch(e){ return new Set(); }
  }
  function saveStored(set){
    localStorage.setItem(LIST_KEY, JSON.stringify([...set]));
  }

  const checkedSet = getStored();

  // compute number of days in current year (handles leap)
  const year = new Date().getFullYear();
  const daysInYear = Math.round((new Date(year+1,0,1) - new Date(year,0,1)) / 86400000);

  function mkLabelForDay(n){
    const d = new Date(year,0,1);
    d.setDate(n);

    const optionsDate = { month: 'long', day: 'numeric' };
    const optionsDay = { weekday: 'long' };

    const monthDayString = d.toLocaleDateString('en-US', optionsDate);
    const dayOfWeekString = d.toLocaleDateString('en-US', optionsDay);
    
    return `${monthDayString}, ${dayOfWeekString}`;
  }

  function build() {
    const frag = document.createDocumentFragment();
    for(let i=1;i<=daysInYear;i++){
      const idx = pad(i);
      const id = 'day-'+idx;
      const wrapper = document.createElement('div');
      wrapper.className = 'day';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.dataset.day = idx;
      if (checkedSet.has(idx)) input.checked = true;

      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = `Day ${idx} - ${mkLabelForDay(i)}`;

      wrapper.appendChild(input);
      wrapper.appendChild(label);
      frag.appendChild(wrapper);

      input.addEventListener('change', async (e) => {
        const day = e.target.dataset.day;
        if (e.target.checked) {
          // checked: play audio and store
          try {
            // set src and play (user-initiated)
            if (audio) {
              audio.pause();
              // ensure stored playbackRate is applied before play
              try {
                if (Number.isFinite(storedRate)) {
                  audio.playbackRate = storedRate;
                };
              } catch(_) {}
              audio.src = `https://listenersbible.com/wp-content/themes/salient/biy/Day_${day}.mp3?_=1`;
              audio.currentTime = 0;
              // reveal player controls
              if (player) player.hidden = false;
              await audio.play();
            }
          } catch(err) {
            // ignore playback errors
          }
          checkedSet.add(day);
        } else {
          // unchecked: remove from storage, no audio
          if (audio) audio.pause();
          checkedSet.delete(day);
        }
        saveStored(checkedSet);
      });
    }
    container.innerHTML = '';
    container.appendChild(frag);
  }

  function scrollToFirstUnchecked() {
    const first = container.querySelector('input:not(:checked)');
    if (first) {
      // position the item at the top of the scrollable area
      container.scrollTo({ top: first.offsetTop-145, behavior: 'auto' });
    } else {
      container.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
  
  // menu toggle + accessibility
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const controls = document.getElementById('controls');
  function openMenu(){ menu.classList.add('show'); menuBtn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false'); }
  function closeMenu(){ menu.classList.remove('show'); menuBtn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true'); }
  function toggleMenu(){ if(menu.classList.contains('show')) closeMenu(); else openMenu(); }

  menuBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMenu(); });
  // close when clicking outside
  document.addEventListener('click', (e)=>{ if(!menu.contains(e.target) && !menuBtn.contains(e.target)) closeMenu(); });
  // close on Escape
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

  // About dialog
  const aboutBtn = document.getElementById('about');
  const aboutDialog = document.getElementById('aboutDialog');
  const aboutClose = document.getElementById('aboutClose');
  function openAbout(){
    closeMenu();
    aboutDialog.setAttribute('aria-hidden','false');
    // move focus to close button for accessibility
    aboutClose.focus();
  }
  function closeAbout(){ aboutDialog.setAttribute('aria-hidden','true'); }

  aboutBtn.addEventListener('click', (e)=>{ e.stopPropagation(); openAbout(); });
  aboutClose.addEventListener('click', closeAbout);
  // click on backdrop closes
  aboutDialog.addEventListener('click', (e)=>{ if(e.target.matches('.dialog-backdrop') || e.target.dataset.close==='true') closeAbout(); });
  // ESC also closes the about dialog
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') { if(aboutDialog && aboutDialog.getAttribute('aria-hidden')==='false') closeAbout(); } });

  document.getElementById('clear').addEventListener('click', () => {
    if(!confirm('Clear all checked days?')) return;
    if (audio) audio.pause();
    checkedSet.clear();
    saveStored(checkedSet);
    build();
    closeMenu();
    requestAnimationFrame(scrollToFirstUnchecked);
  });

  document.getElementById('checkAll').addEventListener('click', () => {
    for(let i=1;i<=daysInYear;i++) checkedSet.add(pad(i));
    saveStored(checkedSet);
    build();
    closeMenu();
    requestAnimationFrame(scrollToFirstUnchecked);
  });

  // player hide behaviour
  if (hidePlayerBtn) hidePlayerBtn.addEventListener('click', ()=>{
    if (audio) audio.pause();
    if (player) player.hidden = true;
  });

  build();
  // scroll after initial render
  requestAnimationFrame(scrollToFirstUnchecked);
})();