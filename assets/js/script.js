// Initialize AOS
AOS.init({
  duration: 700,
  once: true
});

// Theme toggle (dark / light)
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
  if(document.body.classList.contains('light-mode')){
    gsap.to(document.body, { backgroundColor: '#0a1128', color: '#fff', duration: 0.6 });
    gsap.to('.card.glass', { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', duration: 0.6 });
  } else {
    gsap.to(document.body, { backgroundColor: '#f0f4f8', color: '#111', duration: 0.6 });
    gsap.to('.card.glass', { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)', duration: 0.6 });
  }
  document.body.classList.toggle('light-mode');
  themeIcon.classList.toggle('fa-moon');
  themeIcon.classList.toggle('fa-sun');
});

// Elements
const form = document.getElementById('ccForm');
const hasilEl = document.getElementById('hasil');
const exampleEl = document.getElementById('example');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const loadingBar = document.getElementById('loading-bar');

function formatNumber(n){
  return Number(n.toFixed(2)).toLocaleString('id-ID');
}

function calculateCC(bore, stroke, silinder){
  // formula: (π / 4) * bore^2 * stroke * silinder
  return (Math.PI / 4) * Math.pow(bore, 2) * stroke * silinder;
}

// Load last result from localStorage
window.addEventListener('load', () => {
  const last = localStorage.getItem('kalkulator_cc_last');
  if(last){
    try{
      const obj = JSON.parse(last);
      hasilEl.textContent = formatNumber(obj.cc);
      exampleEl.textContent = `${obj.bore} mm × ${obj.stroke} mm × ${obj.silinder} silinder`;
    }catch(e){}
  }
});

// Animate number using GSAP tween
function animateNumber(targetEl, toValue){
  const obj = { val: parseFloat(targetEl.textContent.replace(/[^0-9.\-]/g,'')) || 0 };
  gsap.to(obj, {
    val: toValue,
    duration: 1.3,
    ease: "power1.out",
    onUpdate: () => {
      targetEl.textContent = formatNumber(obj.val);
    }
  });
}

// Handle form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  loadingBar.style.display = 'block';
  loadingBar.style.width = '0%';

  const bore_mm = parseFloat(document.getElementById('bore').value);
  const stroke_mm = parseFloat(document.getElementById('stroke').value);
  const silinder = parseInt(document.getElementById('silinder').value);

  // Convert mm to cm
  const bore = bore_mm / 10;
  const stroke = stroke_mm / 10;

  if(isNaN(bore) || isNaN(stroke) || isNaN(silinder) || bore <= 0 || stroke <= 0 || silinder <= 0){
    gsap.fromTo(form, { x: -6 }, { x: 6, duration: 0.08, yoyo: true, repeat: 5, clearProps: "x" });
    alert('Mohon masukkan nilai bore, stroke, dan jumlah silinder yang valid (lebih dari 0).');
    loadingBar.style.display = 'none';
    return;
  }

  gsap.to(loadingBar, {
    width: "100%",
    duration: 1,
    ease: "power1.inOut",
    onComplete: () => {
      loadingBar.style.display = 'none';
      loadingBar.style.width = '0%';

      const cc = calculateCC(bore, stroke, silinder);
      animateNumber(hasilEl, cc);

      exampleEl.textContent = `${bore_mm} mm × ${stroke_mm} mm × ${silinder} silinder`;

      // save last to localStorage
      localStorage.setItem('kalkulator_cc_last', JSON.stringify({ bore: bore_mm, stroke: stroke_mm, silinder, cc }));
    }
  });
});

// Reset behavior
form.addEventListener('reset', () => {
  setTimeout(() => {
    hasilEl.textContent = '0';
    exampleEl.textContent = '—';
    localStorage.removeItem('kalkulator_cc_last');
  }, 50);
});

// Copy button
copyBtn.addEventListener('click', () => {
  const text = hasilEl.textContent + ' cc';
  navigator.clipboard.writeText(text).then(() => {
    gsap.fromTo(copyBtn, { scale: 1 }, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, clearProps: "scale" });
    alert('Hasil disalin: ' + text);
  });
});

// Download result as txt
downloadBtn.addEventListener('click', () => {
  const last = localStorage.getItem('kalkulator_cc_last');
  const data = last ? JSON.parse(last) : { bore: '-', stroke: '-', silinder: '-', cc: 0 };
  const content = `Hasil Kalkulator Kapasitas Mesin\nBore: ${data.bore} mm\nStroke: ${data.stroke} mm\nJumlah silinder: ${data.silinder}\nKapasitas: ${formatNumber(data.cc)} cc\n\n(Dibuat oleh Dimas)`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hasil_kalkulator_cc.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
