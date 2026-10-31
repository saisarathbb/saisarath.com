(function () {
  'use strict';
  const html = document.documentElement;
  const themeBtn = document.getElementById('theme-btn');
  function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', saved);
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
  initTheme();
  window.copyEmail = function (e) {
    if (e) e.preventDefault();
    const email = 'hello@saisarath.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(showToast);
    } else {
      const ta = document.createElement('textarea');
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    }
  };
  function showToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
  const sigSvg = document.querySelector('.signature-svg');
  if (sigSvg) {
    const paths = Array.from(sigSvg.querySelectorAll('path'));
    const pathLengths = paths.map(p => {
      const len = (typeof p.getTotalLength === 'function') ? p.getTotalLength() : 1000;
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = `${len}`;
      return len;
    });
    const speed = 3.7;
    const timings = [
      { dur: 2350, pause: 150 },
      { dur: 1650, pause: 200 },
      { dur: 350,  pause: 250 },
      { dur: 2350, pause: 150 },
      { dur: 4800, pause: 180 },
      { dur: 350,  pause: 150 }
    ];
    const schedule = [];
    let cur = 0;
    for (let i = 0; i < timings.length; i++) {
      const item = timings[i];
      const scaledDur = item.dur / speed;
      const scaledPause = item.pause / speed;
      schedule.push({
        start: cur,
        end: cur + scaledDur,
        duration: scaledDur
      });
      cur += scaledDur + scaledPause;
    }
    const totalDuration = cur;
    let animFrameId = null;
    function runSignatureAnimation() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        paths.forEach(p => {
          p.style.strokeDashoffset = '0';
        });
        return;
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      paths.forEach((p, idx) => {
        p.style.strokeDashoffset = `${pathLengths[idx]}`;
      });
      let startTime = null;
      function step(now) {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        for (let i = 0; i < schedule.length; i++) {
          const s = schedule[i];
          const len = pathLengths[i];
          const p = paths[i];
          if (elapsed >= s.end) {
            p.style.strokeDashoffset = '0';
          } else if (elapsed >= s.start && elapsed < s.end) {
            const prog = Math.max(0, Math.min(1, (elapsed - s.start) / s.duration));
            p.style.strokeDashoffset = `${len * (1 - prog)}`;
          } else {
            p.style.strokeDashoffset = `${len}`;
          }
        }
        if (elapsed < totalDuration) {
          animFrameId = requestAnimationFrame(step);
        } else {
          paths.forEach(p => {
            p.style.strokeDashoffset = '0';
          });
          animFrameId = null;
        }
      }
      animFrameId = requestAnimationFrame(step);
    }
    if (document.readyState === 'complete') {
      setTimeout(runSignatureAnimation, 300);
    } else {
      window.addEventListener('load', () => {
        setTimeout(runSignatureAnimation, 300);
      });
    }
    const seal = document.querySelector('.signature-seal');
    if (seal) {
      seal.style.cursor = 'pointer';
      seal.setAttribute('title', 'Replay signature');
      seal.addEventListener('click', runSignatureAnimation);
    }
  }
})();
