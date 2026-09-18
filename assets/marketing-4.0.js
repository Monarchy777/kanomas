/**
 * Kanomas Tasikmalaya - Marketing Digital 4.0 Interactive Engine
 * Inspired by high-converting, deeply-touching human-centered architecture
 */

// Global State
const KanomasState = {
  activeTab: 'semua',
  packages: [],
  hajiPackages: [],
  selectedPackage: null,
  quizAnswers: {
    target: '',
    priority: '',
    timeframe: ''
  },
  quizStep: 1,
  savings: {
    people: 1,
    months: 12,
    baseCost: 32000000
  },
  csPhone: '628112113363'
};

document.addEventListener('DOMContentLoaded', () => {
  initHeroVideoPerformance();
  initLivePackages();
  initSavingsCalculator();
  initQuiz();
  initFaq();
  initSolutionTabs();
  initModals();
  initCounters();
  initKeyboardAccessibility();
});

function initHeroVideoPerformance() {
  const video = document.getElementById('hero-thawaf-video');
  const heroSection = document.getElementById('hero');
  if (!video || !heroSection) return;

  // Respect system accessibility setting for reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
    return;
  }

  // Efficient IntersectionObserver: Pause video when scrolled past hero to save CPU, GPU & battery
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (video.paused) {
            video.play().catch(() => {});
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { threshold: 0.15 });

    observer.observe(heroSection);
  }
}

function initKeyboardAccessibility() {
  document.querySelectorAll('.pkg-filter-btn, .quiz-opt-btn, .sol-tab-btn, .faq-item-header').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

/* ==========================================================================
   1. Live Packages Loader (API with Clean Backup Fallback)
   ========================================================================== */
function isDummyPackage(p) {
  if (!p || !p.title) return true;
  const title = p.title.toLowerCase();
  if (title.includes('voluptas') || title.includes('totam') || title.includes('laborum') || 
      title.includes('reiciendis') || title.includes('illo deserunt') || title.includes('dolor')) {
    return true;
  }
  const price = parseFloat(p.base_price || p.price_quad || p.price || 0);
  if (price > 0 && price < 1000000 && !title.includes('tabungan')) {
    return true;
  }
  return false;
}

async function initLivePackages() {
  const container = document.getElementById('package-list-grid');
  if (!container) return;

  // Load verified packages directly from local api_backup.json
  try {
    const backupRes = await fetch('/data/api_backup.json');
    const backupData = await backupRes.json();
    KanomasState.packages = (backupData['paket-umrah'] || []).filter(p => !isDummyPackage(p));
    KanomasState.hajiPackages = (backupData['paket-haji'] || []).filter(p => !isDummyPackage(p));
  } catch (e) {
    console.warn('Menggunakan data paket statis internal.');
  }

  renderPackages('semua');
}

function filterPackages(category) {
  KanomasState.activeTab = category;
  
  // Update filter buttons UI
  document.querySelectorAll('.pkg-filter-btn').forEach(btn => {
    if (btn.dataset.category === category) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  renderPackages(category);
}

function renderPackages(category) {
  const container = document.getElementById('package-list-grid');
  if (!container) return;

  let list = [];
  if (category === 'haji') {
    list = KanomasState.hajiPackages.map(p => ({ ...p, isHaji: true }));
  } else if (category === 'plus') {
    list = KanomasState.packages.filter(p => p.category === 'plus' || (p.title && p.title.toLowerCase().includes('plus')));
  } else if (category === 'reguler') {
    list = KanomasState.packages.filter(p => p.category === 'reguler' || !p.category || p.category === 'promo');
  } else {
    // Semua
    list = [...KanomasState.packages, ...KanomasState.hajiPackages.map(p => ({ ...p, isHaji: true }))];
  }

  // Filter out any dummy entries
  list = list.filter(p => !isDummyPackage(p));

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <p class="text-slate-700 font-semibold text-sm">Jadwal keberangkatan untuk kategori ini sedang disiapkan. Hubungi CS untuk reservasi awal.</p>
        <button onclick="openBookingModalWithTopic('Konsultasi Jadwal Khusus')" class="mt-4 px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold rounded-xl text-xs shadow-md transition">Konsultasi Jadwal</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(pkg => {
    const isHaji = pkg.isHaji || (pkg.category && pkg.category.includes('haji'));
    const priceNum = parseFloat(pkg.base_price || pkg.price_quad || pkg.price || 0);
    const formattedPrice = priceNum > 0 ? 'Rp ' + priceNum.toLocaleString('id-ID') : 'Hubungi CS';
    const departure = pkg.departure_date || 'Musim 1447H / 2026';
    const duration = pkg.duration || '9 - 12 Hari';
    const airline = pkg.airline_name || 'Garuda / Oman Air';
    const hotelMakkah = pkg.hotel_makkah_name || 'Bintang 5 Dekat Pelataran';
    const hotelMadinah = pkg.hotel_madinah_name || 'Bintang 5 Dekat Nabawi';
    const badge = isHaji ? 'HAJI KHUSUS' : (pkg.category === 'plus' ? 'UMRAH PLUS' : (pkg.category === 'tabungan' ? 'PROGRAM TABUNGAN' : (pkg.status ? pkg.status.toUpperCase() : 'PROGRAM UNGGULAN')));
    const isBogo = pkg.title && pkg.title.toLowerCase().includes('bayar 1');

    const imgUrl = pkg.cover_image || pkg.image || 'assets/flyers/flyer-umroh-bintang4-garuda-5okt.jpg';
    const igLinkHtml = pkg.ig_url ? `
      <a href="${pkg.ig_url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="absolute bottom-3 right-4 px-2.5 py-1 rounded-lg bg-pink-600/90 hover:bg-pink-700 text-white text-[10px] font-bold backdrop-blur-sm border border-white/20 flex items-center gap-1 transition shadow-sm">
        <svg class="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        <span>Lihat di IG</span>
      </a>
    ` : '';

    return `
      <div class="bento-card group overflow-hidden flex flex-col bg-white border border-slate-200/90 hover:border-[#ea580c] rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl">
        <!-- Card Image & Badge -->
        <div class="relative h-64 overflow-hidden bg-slate-950 cursor-pointer" onclick="openFlyerLightbox('${imgUrl}', '${pkg.title.replace(/'/g, "\\'")}', '${formattedPrice}')">
          <img src="${imgUrl}" alt="${pkg.title}" class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35"></div>
          
          <span class="absolute top-4 left-4 px-3.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${isHaji ? 'bg-emerald-600 text-white' : 'bg-[#ea580c] text-white'} shadow-md">
            ${badge}
          </span>
          
          <button type="button" class="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-[#ea580c] text-white text-xs font-bold backdrop-blur-sm border border-white/20 flex items-center gap-1.5 transition">
            <span>🔍 Perbesar Flyer</span>
          </button>
          
          <span class="absolute bottom-3 left-4 text-xs font-bold text-white flex items-center gap-1.5 drop-shadow-md">
            <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            ${departure}
          </span>

          ${igLinkHtml}
        </div>

        <!-- Card Body -->
        <div class="p-6 flex flex-col flex-grow justify-between">
          <div>
            <h3 class="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#ea580c] transition-colors line-clamp-2">
              ${pkg.title}
            </h3>
            
            <!-- Features List -->
            <div class="mt-4 space-y-2 text-xs text-slate-600 font-medium">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span>Durasi: <strong class="text-slate-800">${duration}</strong> • ${airline}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span class="truncate">Makkah: <strong class="text-slate-800">${hotelMakkah}</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span class="truncate">Madinah: <strong class="text-slate-800">${hotelMadinah}</strong></span>
              </div>
            </div>
          </div>

          <!-- Price & CTA -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Investasi Mulai</span>
              <span class="text-lg sm:text-xl font-black text-[#ea580c] font-mono">${formattedPrice}</span>
              ${isBogo ? '<span class="text-[10px] text-emerald-700 font-extrabold block">✓ Bayar 1 Berangkat 2 Orang</span>' : ''}
            </div>
            <button onclick="openBookingModalWithTopic('${pkg.title.replace(/'/g, "\\'")}')" class="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5">
              <span>Konsultasi</span>
              <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   2. Interactive Quiz: Refleksi Niat Ibadah Menuju Baitullah
   ========================================================================== */
function initQuiz() {
  updateQuizUI();
}

function selectQuizOption(questionType, value, element) {
  KanomasState.quizAnswers[questionType] = value;
  
  // Highlight clicked button in current step
  const stepContainer = element.closest('.quiz-step-pane');
  if (stepContainer) {
    stepContainer.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.classList.remove('selected', 'active');
      btn.setAttribute('aria-checked', 'false');
    });
    element.classList.add('selected', 'active');
    element.setAttribute('aria-checked', 'true');
  }

  // Auto advance to next step after brief delay
  setTimeout(() => {
    if (KanomasState.quizStep < 3) {
      KanomasState.quizStep++;
      updateQuizUI();
    } else {
      showQuizResult();
    }
  }, 280);
}

function prevQuizStep() {
  if (KanomasState.quizStep > 1) {
    KanomasState.quizStep--;
    updateQuizUI();
  }
}

function restartQuiz() {
  KanomasState.quizStep = 1;
  KanomasState.quizAnswers = { target: '', priority: '', timeframe: '' };
  
  document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
    btn.classList.remove('selected', 'active');
    btn.setAttribute('aria-checked', 'false');
  });

  const resultPane = document.getElementById('quiz-result-pane');
  const questionsPane = document.getElementById('quiz-questions-pane');
  if (resultPane) resultPane.classList.add('hidden');
  if (questionsPane) questionsPane.classList.remove('hidden');

  updateQuizUI();
}

function updateQuizUI() {
  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`quiz-step-dot-${i}`);
    if (dot) {
      if (i === KanomasState.quizStep) {
        dot.className = 'w-7 h-7 rounded-full bg-[#ea580c] text-white font-black text-xs flex items-center justify-center shadow-md';
        dot.innerText = i;
      } else if (i < KanomasState.quizStep) {
        dot.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm';
        dot.innerText = '✓';
      } else {
        dot.className = 'w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center';
        dot.innerText = i;
      }
    }
  }

  // Show only active step pane
  document.querySelectorAll('.quiz-step-pane').forEach((pane, idx) => {
    if (idx + 1 === KanomasState.quizStep) {
      pane.classList.remove('hidden');
    } else {
      pane.classList.add('hidden');
    }
  });

  const backBtn = document.getElementById('quiz-back-btn');
  if (backBtn) {
    if (KanomasState.quizStep > 1) {
      backBtn.classList.remove('invisible');
    } else {
      backBtn.classList.add('invisible');
    }
  }
}

function showQuizResult() {
  const questionsPane = document.getElementById('quiz-questions-pane');
  const resultPane = document.getElementById('quiz-result-pane');
  if (!questionsPane || !resultPane) return;

  questionsPane.classList.add('hidden');
  resultPane.classList.remove('hidden');

  const { target, priority, timeframe } = KanomasState.quizAnswers;

  // Compute recommendation
  let recTitle = 'Paket Umroh Bintang 4 Garuda Indonesia (Bonus Kereta Cepat)';
  let recDesc = 'Sangat ideal untuk kenyamanan maksimal ibadah, dengan penerbangan langsung Garuda Indonesia, hotel dekat pelataran, free restoran Al Romansiah, dan bonus Kereta Cepat Haramain.';
  let recBadge = 'Pilihan Paling Sesuai Kebutuhan Anda';

  if (target.includes('Orang Tua') || priority.includes('Pelataran')) {
    recTitle = 'Program Shafa - Umrah Pelataran Direct Bintang 5 (Etihad)';
    recDesc = 'Dirancang khusus untuk kemudahan fisik: Hotel Bintang 5 menempel pelataran Masjidil Haram & Nabawi, tim pendamping siaga, dan bimbingan manasik intensif.';
  } else if (priority.includes('Tabungan') || timeframe.includes('Menabung')) {
    recTitle = 'Program Tabungan Umroh Kanomas Berkah via BSI';
    recDesc = 'Wujudkan niat suci dengan menabung syariah fleksibel di BSI tanpa potongan administrasi bulanan dan bebas biaya tersembunyi.';
  } else if (priority.includes('Wisata') || target.includes('Keluarga')) {
    recTitle = 'Umrah Promo Plus Muscat (Bayar 1 Berangkat 2 / 11 Hari)';
    recDesc = 'Perpaduan ibadah khusyuk di Tanah Suci sekaligus City Tour 1 Malam di Muscat Oman bersama maskapai Oman Air (Promo Buy 1 Get 1 Free).';
  } else if (priority.includes('Hemat') || priority.includes('Biaya')) {
    recTitle = 'Umrah Promo Paket Hemat Garuda Indonesia (Rp 27,9 Jt / 10 Hari)';
    recDesc = 'Paket super hemat penerbangan Garuda Indonesia start Tasikmalaya dengan fasilitas lengkap makan 3x sehari + AlBaik, hotel nyaman, dan visa resmi.';
  }

  const titleEl = document.getElementById('quiz-rec-title');
  const descEl = document.getElementById('quiz-rec-desc');
  const badgeEl = document.getElementById('quiz-rec-badge');
  const waBtn = document.getElementById('quiz-rec-wa-btn');

  if (titleEl) titleEl.innerText = recTitle;
  if (descEl) descEl.innerText = recDesc;
  if (badgeEl) badgeEl.innerText = recBadge;

  if (waBtn) {
    const waMessage = `Assalamu'alaikum Kanomas Tasikmalaya. Saya baru saja mengisi Refleksi Niat Ibadah di website:
- Rencana Ibadah Bersama: ${target || 'Keluarga'}
- Prioritas Utama: ${priority || 'Kenyamanan Ibadah'}
- Target Waktu: ${timeframe || 'Tahun Ini'}
Rekomendasi Website: *${recTitle}*.
Mohon info jadwal, flyer resmi, dan panduan pendaftarannya. Terima kasih.`;
    
    waBtn.href = `https://wa.me/${KanomasState.csPhone}?text=${encodeURIComponent(waMessage)}`;
  }
}

/* ==========================================================================
   3. Interactive Savings Calculator (Simulasi Tabungan Umrah)
   ========================================================================== */
function initSavingsCalculator() {
  const peopleSlider = document.getElementById('calc-people-slider');
  const monthsSlider = document.getElementById('calc-months-slider');

  if (peopleSlider) {
    peopleSlider.addEventListener('input', (e) => {
      KanomasState.savings.people = parseInt(e.target.value);
      updateSavingsUI();
    });
  }

  if (monthsSlider) {
    monthsSlider.addEventListener('input', (e) => {
      KanomasState.savings.months = parseInt(e.target.value);
      updateSavingsUI();
    });
  }

  updateSavingsUI();
}

function updateSavingsUI() {
  const { people, months, baseCost } = KanomasState.savings;

  const peopleVal = document.getElementById('calc-people-val');
  const monthsVal = document.getElementById('calc-months-val');
  const totalCostVal = document.getElementById('calc-total-cost-val');
  const monthlyVal = document.getElementById('calc-monthly-val');
  const dailyVal = document.getElementById('calc-daily-val');
  const waBtn = document.getElementById('calc-wa-btn');

  const totalCost = people * baseCost;
  const monthly = Math.ceil(totalCost / months);
  const daily = Math.ceil(monthly / 30);

  if (peopleVal) peopleVal.innerText = `${people} Orang`;
  if (monthsVal) monthsVal.innerText = `${months} Bulan`;
  if (totalCostVal) totalCostVal.innerText = `Rp ${totalCost.toLocaleString('id-ID')}`;
  if (monthlyVal) monthlyVal.innerText = `Rp ${monthly.toLocaleString('id-ID')}`;
  if (dailyVal) dailyVal.innerText = `Rp ${daily.toLocaleString('id-ID')}`;

  if (waBtn) {
    const msg = `Assalamu'alaikum Kanomas Tasikmalaya, saya ingin konsultasi Rencana Tabungan Umrah untuk ${people} orang dengan target waktu ${months} bulan (estimasi sekitar Rp ${monthly.toLocaleString('id-ID')}/bulan). Bagaimana cara pembukaan rekening dan akad syariahnya?`;
    waBtn.href = `https://wa.me/${KanomasState.csPhone}?text=${encodeURIComponent(msg)}`;
  }
}

/* ==========================================================================
   4. Multi-Angle Solution Tabs
   ========================================================================== */
function initSolutionTabs() {
  const tabs = document.querySelectorAll('.sol-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      
      // Update tab buttons
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Show tab content
      document.querySelectorAll('.sol-tab-content').forEach(c => {
        if (c.id === targetId) {
          c.classList.remove('hidden');
        } else {
          c.classList.add('hidden');
        }
      });
    });

    // Keyboard navigation (Enter / Space)
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });
}

/* ==========================================================================
   5. FAQ Accordion
   ========================================================================== */
function initFaq() {
  document.querySelectorAll('.faq-item-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.faq-item');
      const body = item.querySelector('.faq-item-body');
      const icon = item.querySelector('.faq-icon');

      const isOpen = !body.classList.contains('hidden');

      // Close all first
      document.querySelectorAll('.faq-item-body').forEach(b => b.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));
      document.querySelectorAll('.faq-item').forEach(it => it.classList.remove('active'));

      // Toggle current
      if (!isOpen) {
        body.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
        item.classList.add('active');
      }
    });

    // Keyboard navigation (Enter / Space)
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });
}

/* ==========================================================================
   6. Modals & Consultation Handling
   ========================================================================== */
function initModals() {
  // Check welcome promo popup
  setTimeout(() => {
    const seen = sessionStorage.getItem('kanomas-welcome-popup-seen');
    if (!seen) {
      openPromoPopup();
    }
  }, 1200);

  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePromoPopup();
      closeBookingModal();
      closeFlyerLightbox();
    }
  });
}

function openFlyerLightbox(imgSrc, title, price) {
  const modal = document.getElementById('flyer-lightbox-modal');
  const img = document.getElementById('flyer-lightbox-img');
  const titleEl = document.getElementById('flyer-lightbox-title');
  const priceEl = document.getElementById('flyer-lightbox-price');
  const waBtn = document.getElementById('flyer-lightbox-wa-btn');

  if (img) img.src = imgSrc;
  if (titleEl) titleEl.innerText = title || 'Detail Flyer Program Umrah';
  if (priceEl) priceEl.innerText = price || 'Hubungi CS';

  if (waBtn) {
    const msg = `Assalamu'alaikum Kanomas Tasikmalaya, saya melihat flyer program *${title}* (${price}) di website. Mohon info ketersediaan seat dan jadwal lengkapnya.`;
    waBtn.href = `https://wa.me/${KanomasState.csPhone}?text=${encodeURIComponent(msg)}`;
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeFlyerLightbox() {
  const modal = document.getElementById('flyer-lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

window.openFlyerLightbox = openFlyerLightbox;
window.closeFlyerLightbox = closeFlyerLightbox;

function openPromoPopup() {
  const modal = document.getElementById('welcome-promo-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closePromoPopup() {
  const modal = document.getElementById('welcome-promo-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  sessionStorage.setItem('kanomas-welcome-popup-seen', 'true');
}

// Global exposure for console and onclick access
window.openPromoPopup = openPromoPopup;
window.closePromoPopup = closePromoPopup;
window.openKanomasPopup = openPromoPopup;
window.closeKanomasPopup = closePromoPopup;

function openBookingModalWithTopic(topic) {
  const modal = document.getElementById('booking-consultation-modal');
  const topicInput = document.getElementById('modal-package-select');
  if (topicInput && topic) {
    topicInput.value = topic;
  }
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-consultation-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

window.openBookingModalWithTopic = openBookingModalWithTopic;
window.closeBookingModal = closeBookingModal;

function submitConsultationForm(e) {
  e.preventDefault();
  const name = document.getElementById('modal-name-input')?.value || 'Sahabat Kanomas';
  const program = document.getElementById('modal-package-select')?.value || 'Umrah Reguler';
  const phone = document.getElementById('modal-phone-input')?.value || '-';
  const notes = document.getElementById('modal-notes-textarea')?.value || '-';

  const message = `Assalamu'alaikum Kanomas Tasikmalaya, saya ${name}.
Tertarik dengan program: *${program}*.
No. WhatsApp: ${phone}
Pertanyaan/Kebutuhan Khusus: ${notes}

Mohon panduan jadwal dan ketersediaan kuotanya. Terima kasih.`;

  const url = `https://wa.me/${KanomasState.csPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  closeBookingModal();
}

/* ==========================================================================
   7. Real-Time Counter & Tickers
   ========================================================================== */
function initCounters() {
  // Animate numbers if on screen
  const counterEl = document.querySelector('.inquiry-counter-val');
  if (counterEl) {
    let count = 1240;
    setInterval(() => {
      if (Math.random() > 0.65) {
        count++;
        counterEl.innerText = count.toLocaleString('id-ID');
      }
    }, 15000);
  }
}
