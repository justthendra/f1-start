const lights = Array.prototype.slice.call(document.querySelectorAll('.light-strip'));
const time = document.querySelector('.time');
const best = document.querySelector('.best span');


let bestTime = Number(localStorage.getItem('best')) || Infinity;
let started = false;
let lightsOutTime = 0;
let raf;
let timeout;

// Milisaniye cinsinden gelen zamanı saniyeye çeviriyorum muhittin bey
function formatTime(time) {
  // Zamanı yuvarla
  time = Math.round(time);

  let outputTime = time / 1000;

  if (time < 10000) {
    outputTime = '0' + outputTime;
  }

  while (outputTime.length < 6) {
    outputTime += '0';
  }
  return outputTime;
}

// Eğer bestTime Infinity değilse (yani bir önceki en iyi zaman varsa),
// Bu zamanı saniye ve milisaniye cinsine çevir ve yaz kazım.
if (bestTime != Infinity) {
  best.textContent = formatTime(bestTime);
}

// Oyunu başlatıyoruz aslı hanım.
function start() {
  // Tüm ışıkları kapatın.
  for (const light of lights) {
    light.classList.remove('on');
  }

  // Zamanı sıfırlayın arkadaşlar.
  time.textContent = '00.000';
  time.classList.remove('anim');

  lightsOutTime = 0;
  let lightsOn = 0;

  const lightsStart = performance.now();

  function frame(now) {
    // Hangi ışığın yanması gerektiğini hesapla (her saniye bir ışık yanacak).
    const toLight = Math.floor((now - lightsStart) / 1000) + 1;

    // Eğer yakılması gereken yeni bir ışık varsa, şalteri kaldır efe.
    if (toLight > lightsOn) {
      for (const light of lights.slice(0, toLight)) {
        light.classList.add('on');
      }
    }

    // Eğer yanan ışık sayısı 5'ten azsa, bir sonraki frame için tekrar çağır.
    if (toLight < 5) {
      raf = requestAnimationFrame(frame);
    }
    else {
      // ibnelik olsun 5 saniye gecikme koyun araya.
      const delay = 5000;
      timeout = setTimeout(() => {
        for (const light of lights) {
          light.classList.remove('on');
        }
        lightsOutTime = performance.now(); // Işıkların kapandığı zamanı yazın tahtaya.
      }, delay);
    }
  }
  raf = requestAnimationFrame(frame);
}

function end(timeStamp) {
  cancelAnimationFrame(raf);
  clearTimeout(timeout);

  // Enayi daha lambalar sönmeden tıkladı.
  if (!lightsOutTime) {
    time.textContent = "Jump start!";
    time.classList.add('anim');
    return;
  }
  else {
    const thisTime = timeStamp - lightsOutTime;
    time.textContent = formatTime(thisTime);

    // Lavuk çok iyi bir zamanlama tutturdu yazın bunu tahtaya.
    if (thisTime < bestTime) {
      bestTime = thisTime;
      best.textContent = time.textContent;
      localStorage.setItem('best', thisTime);
    }

    time.classList.add('anim');
  }
}

// Kullanıcı tıklaması veya dokunmasıyla tetiklenen fonksiyon.
function tap(event) {
  let timeStamp = performance.now();

  // Eğer oyun başlamadıysa ve bir bağlantıya tıklanıyorsa, işlemi durdur.
  if (!started && event.target && event.target.closest && event.target.closest('a')) return;
  event.preventDefault();

  // Eğer oyun başladıysa, oyunu bitir. Aksi halde başlat.
  if (started) {
    end(timeStamp);
    started = false;
  }
  else {
    start();
    started = true;
  }
}

addEventListener('touchstart', tap, {passive: false});

addEventListener('mousedown', event => {
  if (event.button === 0) tap(event);
}, {passive: false});

addEventListener('keydown', event => {
  if (event.key == ' ') tap(event);
}, {passive: false});

// Eğer tarayıcıda service worker desteği varsa, service worker'ı kaydet.
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('./sw.js');
}
