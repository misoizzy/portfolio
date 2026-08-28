/* ─── Shared motion system ───
   data-reveal="up|left|right"  scroll-triggered reveal, optional data-delay="0.1" (seconds)
   data-count-to="306000"       count-up on reveal, optional data-count-suffix, data-count-decimals
   .hero-line > span            per-line hero text reveal on load (staggered via --line-delay)
   .btn, .pcard                 magnetic + hover micro-interactions (desktop only)
   Respects prefers-reduced-motion: reduce — falls back to static, fully visible content.
*/
(function(){
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toggleNav(){document.getElementById('nav').classList.toggle('open')}
  window.toggleNav = toggleNav;

  var bt = document.getElementById('bt');
  if (bt) addEventListener('scroll', function(){ bt.classList.toggle('show', scrollY > 400); }, {passive:true});

  if (reduced){
    document.querySelectorAll('[data-reveal],.fade-in').forEach(function(el){ el.classList.add('on'); });
    document.querySelectorAll('.hero-line').forEach(function(el){ el.classList.add('on'); });
    document.querySelectorAll('[data-count-to]').forEach(function(el){ el.textContent = formatCount(el, +el.dataset.countTo); });
    return;
  }

  /* reveal-on-scroll (covers legacy .fade-in + new [data-reveal]) */
  var revealTargets = document.querySelectorAll('[data-reveal],.fade-in');
  revealTargets.forEach(function(el, i){
    var delay = el.dataset.delay || (el.dataset.stagger != null ? (i % 8) * 0.06 : 0);
    el.style.setProperty('--reveal-delay', delay + 's');
  });
  var rio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('on'); rio.unobserve(e.target); }
    });
  }, {threshold:.12});
  revealTargets.forEach(function(el){ rio.observe(el); });

  /* skill bars (about.html legacy support) */
  var bars = document.querySelectorAll('.bar-fill');
  if (bars.length){
    var bio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) e.target.classList.add('on'); });
    }, {threshold:.3});
    bars.forEach(function(b){ bio.observe(b); });
  }

  /* hero line stagger on load */
  var lines = document.querySelectorAll('.hero-line');
  lines.forEach(function(el, i){
    el.querySelector('span') && el.querySelector('span').style.setProperty('--line-delay', (i * 0.09 + 0.1) + 's');
  });
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ lines.forEach(function(el){ el.classList.add('on'); }); }); });

  /* count-up numbers */
  function formatCount(el, val){
    var decimals = +el.dataset.countDecimals || 0;
    var suffix = el.dataset.countSuffix || '';
    var str = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US');
    if (!decimals) str = Math.round(val).toLocaleString('en-US');
    return str + suffix;
  }
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = +el.dataset.countTo, start = performance.now(), dur = 1100;
        function tick(now){
          var p = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = formatCount(el, to * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, {threshold:.5});
    counters.forEach(function(el){ el.textContent = formatCount(el, 0); cio.observe(el); });
  }

  /* magnetic buttons (desktop / fine-pointer only) */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.btn').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * .28;
        var y = (e.clientY - r.top - r.height/2) * .5;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }
})();
