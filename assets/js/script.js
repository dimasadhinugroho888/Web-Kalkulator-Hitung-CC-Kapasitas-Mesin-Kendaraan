// Initialize AOS
AOS.init({
  duration: 700,
  once: true
});

// Theme toggle (dark / light)
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  if (document.body.classList.contains('light-mode')) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }
});

// Elements
const form = document.getElementById('ccForm');
const hasilEl = document.getElementById('hasil');
const exampleEl = document.getElementById('example');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');

function formatNumber(n){
  // show up to 2 decimal places, but remove trailing zeros
  return Number(n.toFixed(2)).toLocaleString('id-ID');
}

function calculateCC(bore, stroke, silinder){
  // formula: (π / 4) * bore² * stroke * silinder
  // bore & stroke input dalam mm, jadi dibagi 10 agar ke cm
  const bore_cm = bore / 10;
  const stroke_cm = stroke / 10;
  return (Math.PI / 4) * Math.pow(bore_cm, 2) * stroke_cm * silinder;
}

// Load last result from localStorage
window.addEventListener('load', () => {
  const last = localStorage.getItem('kalkulator_cc_last');
  if(last){
    try{
      const obj = JSON.parse(last);
      hasilEl.textContent = formatNumber(obj.cc);
      exampleEl.textContent = `${obj.bore} mm × ${obj.stroke} mm × ${obj.silinder} silinder`;
      // update icon theme if saved (optional)
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
  const bore = parseFloat(document.getElementById('bore').value);
  const stroke = parseFloat(document.getElementById('stroke').value);
  const silinder = parseInt(document.getElementById('silinder').value);

  if(isNaN(bore) || isNaN(stroke) || isNaN(silinder) || bore <= 0 || stroke <= 0 || silinder <= 0){
    gsap.fromTo(form, { x: -6 }, { x: 6, duration: 0.08, yoyo: true, repeat: 5, clearProps: "x" });
    alert('Mohon masukkan nilai bore, stroke, dan jumlah silinder yang valid (lebih dari 0).');
    return;
  }

  const cc = calculateCC(bore, stroke, silinder);
  animateNumber(hasilEl, cc);

  exampleEl.textContent = `${bore} mm × ${stroke} mm × ${silinder} silinder`;

  // save last to localStorage
  localStorage.setItem('kalkulator_cc_last', JSON.stringify({ bore, stroke, silinder, cc }));
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
  const content = `Hasil Kalkulator Kapasitas Mesin
Bore: ${data.bore} mm
Stroke: ${data.stroke} mm
Jumlah silinder: ${data.silinder}
Kapasitas: ${formatNumber(data.cc)} cc

(Dibuat oleh Dimas Adhi Nugroho)`;
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
