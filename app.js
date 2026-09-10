/* ============================================================
   STATE MANAGEMENT
   ============================================================ */
const state = {
  catalogue: [],       // All products in catalogue
  cart: [],            // Products added to cart (starts EMPTY)
  selectedCatalogueIds: new Set(), // IDs selected in catalogue via checkbox
  allSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], // Dynamic sizes extracted from dataset
  activeTab: 'catalogue', // Opens on Catalogue tab by default
  filterGrade: 'ALL',
  search: '',
  fileName: '',
  ratioLevel: 'Brick+Sleeve', // 'Category', 'Brick', 'Brick+Neck', 'Brick+Sleeve'
  // Grouped Ratios: groupKey -> { A: {SIZE: ratioVal}, B: {...}, C: {...} }
  groupRatios: {}
};

const SIZE_ORDER_HINTS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', 'FREE', 'FS'];

function sizeSortKey(label) {
  const upper = String(label).trim().toUpperCase();
  const idx = SIZE_ORDER_HINTS.indexOf(upper);
  if (idx !== -1) return idx;
  const num = parseFloat(label);
  if (!isNaN(num)) return 100 + num;
  return 500;
}

/* Dynamic ratio generator for given size list */
function createDefaultRatio(sizesList, grade) {
  const map = {};
  sizesList.forEach(sz => {
    const sUpper = String(sz).toUpperCase();
    if (grade === 'A') {
      if (sUpper === 'S') map[sz] = 1;
      else if (sUpper === 'M') map[sz] = 2;
      else if (sUpper === 'L') map[sz] = 1;
      else map[sz] = 0;
    } else if (grade === 'B') {
      if (sUpper === 'S') map[sz] = 2;
      else if (sUpper === 'M') map[sz] = 2;
      else if (sUpper === 'L') map[sz] = 1;
      else map[sz] = 0;
    } else if (grade === 'C') {
      if (sUpper === 'S') map[sz] = 1;
      else if (sUpper === 'M') map[sz] = 1;
      else if (sUpper === 'L') map[sz] = 2;
      else map[sz] = 0;
    }
  });
  return map;
}

/* ============================================================
   SMOOTH TOAST MESSAGES
   ============================================================ */
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    <span>${escapeHtml(msg)}</span>
  `;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ============================================================
   SAMPLE CATALOGUE DATA
   ============================================================ */
function getSampleCatalogue() {
  return [
    {
      id: 'cat_133739801',
      title: 'JJIACE JJBONDI TAPE AKM - Black (133739801)',
      code: '133739801',
      mrp: '₹3,999.00',
      cost: '₹2,479.38',
      grade: 'A',
      category: 'Bottom_Wear',
      brick: 'CARGO',
      neck: 'Standard',
      sleeve: 'Full Length',
      img: 'images/dress_18076E.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_133739802',
      title: 'JJIACE JJBONDI TAPE AKM - Shadow (133739802)',
      code: '133739802',
      mrp: '₹3,999.00',
      cost: '₹2,479.38',
      grade: 'A',
      category: 'Bottom_Wear',
      brick: 'CARGO',
      neck: 'Standard',
      sleeve: 'Full Length',
      img: 'images/dress_18522BM.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_133739805',
      title: 'JJIACE JJBONDI TAPE AKM - Crockery (133739805)',
      code: '133739805',
      mrp: '₹3,999.00',
      cost: '₹2,479.38',
      grade: 'B',
      category: 'Bottom_Wear',
      brick: 'CARGO',
      neck: 'Standard',
      sleeve: 'Full Length',
      img: 'images/dress_18076H.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_133739806',
      title: 'JJIACE JJBONDI TAPE AKM - Forest Night (133739806)',
      code: '133739806',
      mrp: '₹3,999.00',
      cost: '₹2,479.38',
      grade: 'B',
      category: 'Bottom_Wear',
      brick: 'CARGO',
      neck: 'Standard',
      sleeve: 'Full Length',
      img: 'images/dress_teal_1788943943216.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_223204401',
      title: 'JJCO KANE CARGO - Beige (223204401)',
      code: '223204401',
      mrp: '₹4,499.00',
      cost: '₹2,789.00',
      grade: 'A',
      category: 'Bottom_Wear',
      brick: 'CARGO',
      neck: 'Standard',
      sleeve: 'Full Length',
      img: 'images/dress_brown_mustard_1788943926741.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_223204402',
      title: 'JJCO KANE CARGO - Black (223204402)',
      code: '223204402',
      mrp: '₹4,499.00',
      cost: '₹2,789.00',
      grade: 'A',
      category: 'Bottom_Wear',
      brick: 'CARGO',
      neck: 'Standard',
      sleeve: 'Full Length',
      img: 'images/dress_blue_maroon_1788943901202.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_223204405',
      title: 'JJCO KANE CARGO - Olive Night (223204405)',
      code: '223204405',
      mrp: '₹4,499.00',
      cost: '₹2,789.00',
      grade: 'B',
      category: 'Bottom_Wear',
      brick: 'CARGO',
      neck: 'Standard',
      sleeve: 'Full Length',
      img: 'images/dress_18522BM.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902287201',
      title: 'JPSTGORDON SHARK SWEAT PANTS - Light Grey (902287201)',
      code: '902287201',
      mrp: '₹2,499.00',
      cost: '₹1,549.00',
      grade: 'B',
      category: 'Bottom_Wear',
      brick: 'SWEAT PANTS',
      neck: 'Elastic',
      sleeve: 'Full Length',
      img: 'images/dress_18076E.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902287203',
      title: 'JPSTGORDON SHARK SWEAT PANTS - Black (902287203)',
      code: '902287203',
      mrp: '₹2,499.00',
      cost: '₹1,549.00',
      grade: 'C',
      category: 'Bottom_Wear',
      brick: 'SWEAT PANTS',
      neck: 'Elastic',
      sleeve: 'Full Length',
      img: 'images/dress_18076H.png',
      sizes: { XS: 0, S: 1, M: 1, L: 2, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902287301',
      title: 'JPSTWILL FUSION SWEAT PANTS - Light Grey (902287301)',
      code: '902287301',
      mrp: '₹2,499.00',
      cost: '₹1,549.00',
      grade: 'C',
      category: 'Bottom_Wear',
      brick: 'SWEAT PANTS',
      neck: 'Elastic',
      sleeve: 'Full Length',
      img: 'images/dress_18522BM.png',
      sizes: { XS: 0, S: 1, M: 1, L: 2, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902412401',
      title: 'JJEGINGHAM TWILL SHIRT L/S - Dusty Olive (902412401)',
      code: '902412401',
      mrp: '₹2,999.00',
      cost: '₹1,859.00',
      grade: 'A',
      category: 'Top_Wear',
      brick: 'SHIRTS',
      neck: 'Regular Collar',
      sleeve: 'Full Sleeve',
      img: 'images/dress_18076E.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902412402',
      title: 'JJEGINGHAM TWILL SHIRT L/S - Port Royale (902412402)',
      code: '902412402',
      mrp: '₹2,999.00',
      cost: '₹1,859.00',
      grade: 'B',
      category: 'Top_Wear',
      brick: 'SHIRTS',
      neck: 'Regular Collar',
      sleeve: 'Full Sleeve',
      img: 'images/dress_blue_maroon_1788943901202.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902266201',
      title: 'JJESHERIDAN SHIRT L/S - Light Blue Denim (902266201)',
      code: '902266201',
      mrp: '₹2,999.00',
      cost: '₹1,859.00',
      grade: 'A',
      category: 'Top_Wear',
      brick: 'SHIRTS',
      neck: 'Regular Collar',
      sleeve: 'Full Sleeve',
      img: 'images/dress_teal_1788943943216.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902412501',
      title: 'JJEOXFORD SHIRT LS - Navy Blazer (902412501)',
      code: '902412501',
      mrp: '₹2,499.00',
      cost: '₹1,549.00',
      grade: 'A',
      category: 'Top_Wear',
      brick: 'SHIRTS',
      neck: 'Regular Collar',
      sleeve: 'Full Sleeve',
      img: 'images/dress_18076E.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902194602',
      title: 'JJPR MARCUS POPLIN SHIRT LS - Jet Black (902194602)',
      code: '902194602',
      mrp: '₹2,499.00',
      cost: '₹1,549.00',
      grade: 'B',
      category: 'Top_Wear',
      brick: 'SHIRTS',
      neck: 'Regular Collar',
      sleeve: 'Full Sleeve',
      img: 'images/dress_18522BM.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_901458501',
      title: 'JJPR TECHNO CREW NECK T-SHIRT SS - Jet Black (901458501)',
      code: '901458501',
      mrp: '₹999.00',
      cost: '₹619.00',
      grade: 'C',
      category: 'Top_Wear',
      brick: 'T-SHIRTS',
      neck: 'Round Neck',
      sleeve: 'Half Sleeve',
      img: 'images/dress_18076H.png',
      sizes: { XS: 0, S: 1, M: 1, L: 2, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_901482501',
      title: 'JJCO LITHION SS TSHIRT - Comfrey Green (901482501)',
      code: '901482501',
      mrp: '₹999.00',
      cost: '₹619.00',
      grade: 'A',
      category: 'Top_Wear',
      brick: 'T-SHIRTS',
      neck: 'Round Neck',
      sleeve: 'Half Sleeve',
      img: 'images/dress_teal_1788943943216.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_902273701',
      title: 'JJECORP LOGO TEE SS O-NECK - Black (902273701)',
      code: '902273701',
      mrp: '₹999.00',
      cost: '₹619.00',
      grade: 'B',
      category: 'Top_Wear',
      brick: 'T-SHIRTS',
      neck: 'Round Neck',
      sleeve: 'Half Sleeve',
      img: 'images/dress_blue_maroon_1788943901202.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_280182702',
      title: 'JJCO CIARANAO TSHIRT SS - Brilliant White (280182702)',
      code: '280182702',
      mrp: '₹1,499.00',
      cost: '₹929.00',
      grade: 'A',
      category: 'Top_Wear',
      brick: 'T-SHIRTS',
      neck: 'Round Neck',
      sleeve: 'Half Sleeve',
      img: 'images/dress_18076E.png',
      sizes: { XS: 0, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }
    },
    {
      id: 'cat_900768502',
      title: 'JJOR DICE POLO SS - Jet Black (900768502)',
      code: '900768502',
      mrp: '₹1,999.00',
      cost: '₹1,239.00',
      grade: 'B',
      category: 'Top_Wear',
      brick: 'T-SHIRTS',
      neck: 'Polo Neck',
      sleeve: 'Half Sleeve',
      img: 'images/dress_brown_mustard_1788943926741.png',
      sizes: { XS: 0, S: 2, M: 2, L: 1, XL: 0, XXL: 0 }
    }
  ];
}

function initData() {
  state.catalogue = getSampleCatalogue();
  extractAllSizesFromDataset();
  // Cart starts completely empty - items are added when user selects them from Catalogue!
  state.cart = [];
  state.selectedCatalogueIds = new Set();
  state.activeTab = 'catalogue';
  ensureGroupRatios();
  render();
}

function extractAllSizesFromDataset() {
  const sizeSet = new Set();
  const allProducts = [...state.catalogue, ...state.cart];
  allProducts.forEach(p => {
    if (p.sizes) {
      Object.keys(p.sizes).forEach(s => sizeSet.add(s));
    }
  });

  if (sizeSet.size > 0) {
    state.allSizes = [...sizeSet].sort((a, b) => sizeSortKey(a) - sizeSortKey(b));
  } else {
    state.allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }
}

function createCartItem(catItem) {
  const gRatio = getRatioForProduct(catItem);
  return {
    ...catItem,
    sizes: { ...gRatio },
    sets: 1
  };
}

/* ============================================================
   ATTRIBUTE LEVEL GROUPING LOGIC (Requirement 4)
   ============================================================ */
function getGroupKey(item) {
  const level = state.ratioLevel;
  if (level === 'Category') return item.category || 'Dresses';
  if (level === 'Brick') return item.brick || 'Apparel';
  if (level === 'Brick+Neck') return `${item.brick || 'Apparel'} - ${item.neck || 'Standard Neck'}`;
  if (level === 'Brick+Sleeve') return `${item.brick || 'Apparel'} - ${item.sleeve || '3/4TH SLEEVE'}`;
  return item.category || 'Dresses';
}

function ensureGroupRatios() {
  const allProducts = [...state.catalogue, ...state.cart];
  allProducts.forEach(p => {
    const key = getGroupKey(p);
    if (!state.groupRatios[key]) {
      state.groupRatios[key] = {
        A: createDefaultRatio(state.allSizes, 'A'),
        B: createDefaultRatio(state.allSizes, 'B'),
        C: createDefaultRatio(state.allSizes, 'C')
      };
    }
  });
}

function getRatioForProduct(item) {
  const key = getGroupKey(item);
  const group = state.groupRatios[key];
  if (group && group[item.grade]) {
    return { ...group[item.grade] };
  }
  return createDefaultRatio(state.allSizes, item.grade);
}

/* ============================================================
   MAIN RENDERER & TAB SWITCHING
   ============================================================ */
function render() {
  extractAllSizesFromDataset();

  // Update Badges & Counts
  document.getElementById('cartBadge').textContent = state.cart.length;
  document.getElementById('catalogueBadge').textContent = state.catalogue.length;
  document.getElementById('selectedCount').textContent = state.selectedCatalogueIds.size;

  // Toggle Navigation Pills UI
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });

  const cartView = document.getElementById('cartView');
  const catalogueView = document.getElementById('catalogueView');
  const cartActions = document.getElementById('cartActions');
  const catalogueActions = document.getElementById('catalogueActions');

  if (state.activeTab === 'cart') {
    cartView.style.display = 'block';
    catalogueView.style.display = 'none';
    cartActions.style.display = 'block';
    catalogueActions.style.display = 'none';
    renderCart();
  } else {
    cartView.style.display = 'none';
    catalogueView.style.display = 'block';
    cartActions.style.display = 'none';
    catalogueActions.style.display = 'block';
    renderCatalogue();
  }
}

/* ============================================================
   CART RENDERER
   ============================================================ */
function calculateProductTotal(p) {
  const sizeSum = Object.values(p.sizes).reduce((acc, q) => acc + (Number(q) || 0), 0);
  const sets = Number(p.sets) || 1;
  return sizeSum * sets;
}

function renderCart() {
  const container = document.getElementById('cartCardsContainer');
  if (!container) return;

  const filtered = state.cart.filter(p => {
    if (state.filterGrade !== 'ALL' && p.grade !== state.filterGrade) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      if (!matchTitle && !matchCode) return false;
    }
    return true;
  });

  document.getElementById('itemsCount').textContent = `${filtered.length} Item${filtered.length === 1 ? '' : 's'} in Cart`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background:#fff; border-radius:8px; border:1px solid #E2E8F0; padding:48px; text-align:center; color:#64748B; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <h3 style="margin-bottom:8px; color:#0F172A; font-weight:700;">Your Cart is Empty</h3>
        <p style="font-size:13px; margin-bottom:18px;">Select products from the Catalogue tab and add them to your cart.</p>
        <button class="btn primary-btn" id="browseCatBtn">Browse Catalogue</button>
      </div>
    `;

    const browseBtn = document.getElementById('browseCatBtn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        state.activeTab = 'catalogue';
        render();
      });
    }
    return;
  }

  container.innerHTML = filtered.map((p, i) => {
    const total = calculateProductTotal(p);
    const productSizes = Object.keys(p.sizes).length ? Object.keys(p.sizes) : state.allSizes;

    return `
      <div class="item-card" data-id="${p.id}" style="animation-delay: ${i * 0.05}s;">
        <!-- Dark Navy Header Bar -->
        <div class="item-card-header">
          <div class="item-card-title">${escapeHtml(p.title)}</div>
          <div class="item-card-meta">
            <span>MRP: ${escapeHtml(p.mrp)}</span>
            <span>Cost: ${escapeHtml(p.cost)}</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="item-card-body">
          <!-- Left: Thumbnail & Code Badge -->
          <div class="item-card-left">
            <img class="product-img" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.code)}" onerror="this.src='images/dress_18076E.png'" />
            <div class="code-badge">${escapeHtml(p.code)}</div>
          </div>

          <!-- Center Controls -->
          <div class="item-card-center">
            <!-- Grade Dropdown -->
            <div class="control-field grade-field">
              <label for="grade_select_${p.id}">GRADE</label>
              <select class="grade-select" id="grade_select_${p.id}" name="grade_select_${p.id}" data-id="${p.id}" aria-label="Grade selection for ${escapeHtml(p.code)}">
                <option value="A" ${p.grade === 'A' ? 'selected' : ''}>A</option>
                <option value="B" ${p.grade === 'B' ? 'selected' : ''}>B</option>
                <option value="C" ${p.grade === 'C' ? 'selected' : ''}>C</option>
              </select>
            </div>

            <!-- Dynamic Size Inputs Container (Scrollable on small screens) -->
            <div class="size-inputs-scroll">
              <div class="size-inputs-row">
                ${productSizes.map(sz => `
                  <div class="control-field">
                    <label for="input_${p.id}_${sz}">${escapeHtml(sz)}</label>
                    <input type="number" min="0" id="input_${p.id}_${sz}" name="input_${p.id}_${sz}" aria-label="Quantity for size ${escapeHtml(sz)} of ${escapeHtml(p.code)}" class="num-input size-input" data-id="${p.id}" data-size="${escapeHtml(sz)}" value="${p.sizes[sz] ?? 0}" />
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Calculation Group: Sets x Total -->
            <div class="item-card-calc">
              <span class="symbol-x" aria-hidden="true">✕</span>

              <div class="control-field sets-field">
                <label for="sets_${p.id}">SETS</label>
                <input type="number" min="1" id="sets_${p.id}" name="sets_${p.id}" aria-label="Sets count for ${escapeHtml(p.code)}" class="num-input sets-input" data-id="${p.id}" value="${p.sets ?? 1}" />
              </div>

              <span class="symbol-equal" aria-hidden="true">=</span>
              <div class="total-badge-wrap">
                <span class="total-label">TOTAL PCS</span>
                <span class="calculated-total" id="total-${p.id}">${total}</span>
              </div>
            </div>
          </div>

          <!-- Right Action: Trash Delete Icon -->
          <div class="item-card-right">
            <button class="delete-btn" data-id="${p.id}" title="Delete item from cart" aria-label="Delete ${escapeHtml(p.code)} from cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  attachCartEvents();
}

/* ============================================================
   CATALOGUE RENDERER
   ============================================================ */
function renderCatalogue() {
  const container = document.getElementById('catalogueGrid');
  if (!container) return;

  const filtered = state.catalogue.filter(p => {
    if (state.filterGrade !== 'ALL' && p.grade !== state.filterGrade) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      if (!matchTitle && !matchCode) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; background:#fff; border-radius:8px; padding:48px; text-align:center; color:#64748B;">
        <p>No products found in catalogue matching filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item, i) => {
    const isSelected = state.selectedCatalogueIds.has(item.id);
    const inCart = state.cart.some(c => c.id === item.id);
    return `
      <div class="cat-card" style="animation-delay: ${i * 0.04}s;">
        <label for="cat_cb_${item.id}" class="visually-hidden">Select ${escapeHtml(item.code)}</label>
        <input type="checkbox" id="cat_cb_${item.id}" name="cat_cb_${item.id}" aria-label="Select ${escapeHtml(item.code)}" class="cat-card-checkbox cat-select-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''} />
        <div class="cat-card-top">
          <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.code)}" onerror="this.src='images/dress_18076E.png'" />
          <div class="cat-card-info">
            <div class="cat-card-title">${escapeHtml(item.title)}</div>
            <div class="grade-badge grade-${item.grade}">Grade ${item.grade}</div>
            <div class="cat-card-meta">
              <span>Code: <strong>${escapeHtml(item.code)}</strong></span>
              <span>MRP: <strong>${escapeHtml(item.mrp)}</strong></span>
              <span>Sleeve: <strong>${escapeHtml(item.sleeve || '3/4TH SLEEVE')}</strong></span>
            </div>
          </div>
        </div>
        <div class="cat-card-actions">
          ${inCart ? `
            <button class="btn-in-cart toggle-cart-btn" data-id="${item.id}" title="Click to remove from cart" aria-label="Remove ${escapeHtml(item.code)} from cart">
              ✓ In Cart (Remove)
            </button>
          ` : `
            <button class="btn-add-cat toggle-cart-btn" data-id="${item.id}" aria-label="Add ${escapeHtml(item.code)} to cart">
              + Add to Cart
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  attachCatalogueEvents();
}

function attachCatalogueEvents() {
  document.querySelectorAll('.cat-select-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      if (e.target.checked) state.selectedCatalogueIds.add(id);
      else state.selectedCatalogueIds.delete(id);
      document.getElementById('selectedCount').textContent = state.selectedCatalogueIds.size;
    });
  });

  // Individual Catalogue "Add to Cart" / "In Cart (Remove)" button click handler
  document.querySelectorAll('.toggle-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const catItem = state.catalogue.find(c => c.id === id);
      if (!catItem) return;

      const cartIndex = state.cart.findIndex(c => c.id === id);
      if (cartIndex > -1) {
        // Remove from cart
        state.cart.splice(cartIndex, 1);
        state.selectedCatalogueIds.delete(id);
        render();
        toast(`Removed ${catItem.code} from cart`);
      } else {
        // Add to cart
        state.cart.push(createCartItem(catItem));
        state.selectedCatalogueIds.add(id);
        render();
        toast(`Added ${catItem.code} to cart!`);
      }
    });
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============================================================
   CART EVENT LISTENERS (With Animated Deletion)
   ============================================================ */
function attachCartEvents() {
  // Delete item from cart with smooth exit animation
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = state.cart.find(c => c.id === id);
      const card = document.querySelector(`.item-card[data-id="${id}"]`);

      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95) translateY(12px)';
        setTimeout(() => {
          state.cart = state.cart.filter(p => p.id !== id);
          state.selectedCatalogueIds.delete(id);
          render();
          toast(`Removed ${item ? item.code : 'item'} from cart`);
        }, 200);
      } else {
        state.cart = state.cart.filter(p => p.id !== id);
        state.selectedCatalogueIds.delete(id);
        render();
        toast(`Removed ${item ? item.code : 'item'} from cart`);
      }
    });
  });

  // Size inputs manual edit
  document.querySelectorAll('.size-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.dataset.id;
      const size = e.target.dataset.size;
      const val = parseInt(e.target.value, 10) || 0;
      const product = state.cart.find(p => p.id === id);
      if (product) {
        product.sizes[size] = Math.max(0, val);
        updateCardTotalUI(product);
      }
    });
  });

  // Sets input change
  document.querySelectorAll('.sets-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.dataset.id;
      const val = parseInt(e.target.value, 10) || 1;
      const product = state.cart.find(p => p.id === id);
      if (product) {
        product.sets = Math.max(1, val);
        const baseRatio = getRatioForProduct(product);
        Object.keys(product.sizes).forEach(sz => {
          product.sizes[sz] = (baseRatio[sz] || 0) * product.sets;
        });
        Object.keys(product.sizes).forEach(sz => {
          const sInp = document.querySelector(`.size-input[data-id="${id}"][data-size="${sz}"]`);
          if (sInp) sInp.value = product.sizes[sz];
        });
        updateCardTotalUI(product);
      }
    });
  });

  // Grade dropdown change
  document.querySelectorAll('.grade-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const newGrade = e.target.value;
      const product = state.cart.find(p => p.id === id);
      if (product) {
        product.grade = newGrade;
        const baseRatio = getRatioForProduct(product);
        Object.keys(product.sizes).forEach(sz => {
          product.sizes[sz] = (baseRatio[sz] || 0) * product.sets;
        });
        renderCart();
        toast(`Changed to Grade ${newGrade}`);
      }
    });
  });
}

function updateCardTotalUI(product) {
  const totalElem = document.getElementById(`total-${product.id}`);
  if (totalElem) {
    const newTotal = calculateProductTotal(product);
    if (totalElem.textContent !== String(newTotal)) {
      totalElem.textContent = newTotal;
      totalElem.style.color = '#2563EB';
      totalElem.style.transform = 'scale(1.25)';
      setTimeout(() => {
        totalElem.style.transform = 'scale(1)';
        totalElem.style.color = '#0F172A';
      }, 220);
    }
  }
}

/* ============================================================
   INPUT RATIO MODAL MANAGEMENT
   ============================================================ */
function setupRatioModal() {
  const backdrop = document.getElementById('ratioModalBackdrop');
  const openBtn = document.getElementById('openRatioModalBtn');
  const closeBtn = document.getElementById('closeRatioModalBtn');
  const levelSelect = document.getElementById('ratioLevelSelect');
  const resetBtn = document.getElementById('resetRatioBtn');
  const setBtn = document.getElementById('setRatioBtn');

  openBtn.addEventListener('click', () => {
    populateRatioModalBody();
    backdrop.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    backdrop.classList.remove('active');
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('active');
  });

  levelSelect.addEventListener('change', (e) => {
    state.ratioLevel = e.target.value;
    ensureGroupRatios();
    populateRatioModalBody();
    toast(`Ratio level set to: ${state.ratioLevel}`);
  });

  resetBtn.addEventListener('click', () => {
    ensureGroupRatios();
    Object.keys(state.groupRatios).forEach(groupKey => {
      ['A', 'B', 'C'].forEach(g => {
        state.allSizes.forEach(sz => {
          state.groupRatios[groupKey][g][sz] = 0;
        });
      });
    });
    populateRatioModalBody();
    toast('Ratios reset to zero');
  });

  setBtn.addEventListener('click', () => {
    Object.keys(state.groupRatios).forEach(groupKey => {
      ['A', 'B', 'C'].forEach(g => {
        state.allSizes.forEach(sz => {
          const inp = document.querySelector(`.group-ratio-input[data-group="${CSS.escape(groupKey)}"][data-grade="${g}"][data-size="${sz}"]`);
          if (inp) {
            state.groupRatios[groupKey][g][sz] = parseInt(inp.value, 10) || 0;
          }
        });
      });
    });

    state.cart.forEach(p => {
      const baseRatio = getRatioForProduct(p);
      Object.keys(p.sizes).forEach(sz => {
        p.sizes[sz] = (baseRatio[sz] || 0) * (p.sets || 1);
      });
    });

    renderCart();
    backdrop.classList.remove('active');
    toast(`Saved size ratios for ${state.ratioLevel} level!`);
  });
}

function populateRatioModalBody() {
  const modalBody = document.getElementById('ratioModalBody');
  if (!modalBody) return;

  ensureGroupRatios();
  const groupKeys = Object.keys(state.groupRatios);

  modalBody.innerHTML = groupKeys.map((groupKey, idx) => `
    <div class="category-accordion">
      <div class="category-header" data-idx="${idx}">
        <span>${escapeHtml(groupKey)}</span>
        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </div>

      <div class="category-content" id="cat-content-${idx}">
        ${['A', 'B', 'C'].map(g => `
          <div class="grade-ratio-block">
            <div class="grade-header-bar">GRADE ${g}</div>
            <div class="size-ratio-grid">
              ${state.allSizes.map(sz => `
                <div class="size-ratio-cell">
                  <label for="ratio_${idx}_${g}_${sz}">${escapeHtml(sz)}</label>
                  <input type="number" min="0" id="ratio_${idx}_${g}_${sz}" name="ratio_${idx}_${g}_${sz}" aria-label="Grade ${g} ${escapeHtml(sz)} ratio for ${escapeHtml(groupKey)}" class="size-ratio-input group-ratio-input"
                    data-group="${escapeHtml(groupKey)}" data-grade="${g}" data-size="${escapeHtml(sz)}"
                    value="${state.groupRatios[groupKey][g][sz] ?? 0}" />
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  modalBody.querySelectorAll('.category-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const idx = hdr.dataset.idx;
      const content = document.getElementById(`cat-content-${idx}`);
      if (content) {
        hdr.classList.toggle('collapsed');
        content.classList.toggle('hidden');
      }
    });
  });
}

/* ============================================================
   ADD TO CART FLOW
   ============================================================ */
function setupCatalogueActions() {
  const addBtn = document.getElementById('addSelectedToCartBtn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    if (state.selectedCatalogueIds.size === 0) {
      toast('Please select at least one product from catalogue');
      return;
    }

    let addedCount = 0;
    state.selectedCatalogueIds.forEach(id => {
      const item = state.catalogue.find(c => c.id === id);
      if (item && !state.cart.some(c => c.id === id)) {
        state.cart.push(createCartItem(item));
        addedCount++;
      }
    });

    state.activeTab = 'cart';
    render();
    toast(`Added ${addedCount} product(s) to Cart!`);
  });
}

/* ============================================================
   SEARCH, FILTERS & TABS
   ============================================================ */
function setupNavigationAndFilters() {
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      render();
    });
  });

  const searchBox = document.getElementById('searchBox');
  const gradeFilter = document.getElementById('gradeFilter');
  const dropdownBtn = document.getElementById('sampleDataDropdownBtn');
  const dropdownWrapper = dropdownBtn ? dropdownBtn.closest('.dropdown-wrapper') : null;
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const downloadSampleBtn = document.getElementById('downloadSampleBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');

  // Toggle Dropdown Menu on Click
  if (dropdownBtn && dropdownWrapper) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = dropdownWrapper.classList.toggle('active');
      dropdownBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Close Dropdown when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!dropdownWrapper.contains(e.target)) {
        dropdownWrapper.classList.remove('active');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close Dropdown on Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdownWrapper.classList.contains('active')) {
        dropdownWrapper.classList.remove('active');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      state.search = e.target.value;
      render();
    });
  }

  if (gradeFilter) {
    gradeFilter.addEventListener('change', () => {
      state.filterGrade = gradeFilter.value;
      render();
    });
  }

  // Restore Sample Catalogue Handler
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      if (dropdownWrapper) {
        dropdownWrapper.classList.remove('active');
        if (dropdownBtn) dropdownBtn.setAttribute('aria-expanded', 'false');
      }
      initData();
      toast('Restored sample catalogue items successfully!');
    });
  }

  // Download Sample Excel Handler
  if (downloadSampleBtn) {
    downloadSampleBtn.addEventListener('click', () => {
      if (dropdownWrapper) {
        dropdownWrapper.classList.remove('active');
        if (dropdownBtn) dropdownBtn.setAttribute('aria-expanded', 'false');
      }
      generateSampleExcel();
    });
  }

  // Clear Workspace Data Handler
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      if (dropdownWrapper) {
        dropdownWrapper.classList.remove('active');
        if (dropdownBtn) dropdownBtn.setAttribute('aria-expanded', 'false');
      }
      state.catalogue = [];
      state.cart = [];
      state.selectedCatalogueIds = new Set();
      state.activeTab = 'catalogue';
      render();
      toast('Cleared all catalogue and cart data');
    });
  }
}

/* Downloadable Excel Sample Generator */
function generateSampleExcel() {
  const sampleData = [
    { Product_Name: 'JJIACE JJBONDI TAPE AKM - Black (133739801)', Code: '133739801', Grade: 'A', MRP: 3999, Cost: 2479.38, Category: 'Bottom_Wear', Brick: 'CARGO', Neck: 'Standard', Sleeve: 'Full Length', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJIACE JJBONDI TAPE AKM - Shadow (133739802)', Code: '133739802', Grade: 'A', MRP: 3999, Cost: 2479.38, Category: 'Bottom_Wear', Brick: 'CARGO', Neck: 'Standard', Sleeve: 'Full Length', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJIACE JJBONDI TAPE AKM - Crockery (133739805)', Code: '133739805', Grade: 'B', MRP: 3999, Cost: 2479.38, Category: 'Bottom_Wear', Brick: 'CARGO', Neck: 'Standard', Sleeve: 'Full Length', S: 2, M: 2, L: 1 },
    { Product_Name: 'JJIACE JJBONDI TAPE AKM - Forest Night (133739806)', Code: '133739806', Grade: 'B', MRP: 3999, Cost: 2479.38, Category: 'Bottom_Wear', Brick: 'CARGO', Neck: 'Standard', Sleeve: 'Full Length', S: 2, M: 2, L: 1 },
    { Product_Name: 'JJCO KANE CARGO - Beige (223204401)', Code: '223204401', Grade: 'A', MRP: 4499, Cost: 2789.00, Category: 'Bottom_Wear', Brick: 'CARGO', Neck: 'Standard', Sleeve: 'Full Length', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJCO KANE CARGO - Black (223204402)', Code: '223204402', Grade: 'A', MRP: 4499, Cost: 2789.00, Category: 'Bottom_Wear', Brick: 'CARGO', Neck: 'Standard', Sleeve: 'Full Length', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJCO KANE CARGO - Olive Night (223204405)', Code: '223204405', Grade: 'B', MRP: 4499, Cost: 2789.00, Category: 'Bottom_Wear', Brick: 'CARGO', Neck: 'Standard', Sleeve: 'Full Length', S: 2, M: 2, L: 1 },
    { Product_Name: 'JPSTGORDON SHARK SWEAT PANTS - Light Grey (902287201)', Code: '902287201', Grade: 'B', MRP: 2499, Cost: 1549.00, Category: 'Bottom_Wear', Brick: 'SWEAT PANTS', Neck: 'Elastic', Sleeve: 'Full Length', S: 2, M: 2, L: 1 },
    { Product_Name: 'JPSTGORDON SHARK SWEAT PANTS - Black (902287203)', Code: '902287203', Grade: 'C', MRP: 2499, Cost: 1549.00, Category: 'Bottom_Wear', Brick: 'SWEAT PANTS', Neck: 'Elastic', Sleeve: 'Full Length', S: 1, M: 1, L: 2 },
    { Product_Name: 'JPSTWILL FUSION SWEAT PANTS - Light Grey (902287301)', Code: '902287301', Grade: 'C', MRP: 2499, Cost: 1549.00, Category: 'Bottom_Wear', Brick: 'SWEAT PANTS', Neck: 'Elastic', Sleeve: 'Full Length', S: 1, M: 1, L: 2 },
    { Product_Name: 'JJEGINGHAM TWILL SHIRT L/S - Dusty Olive (902412401)', Code: '902412401', Grade: 'A', MRP: 2999, Cost: 1859.00, Category: 'Top_Wear', Brick: 'SHIRTS', Neck: 'Regular Collar', Sleeve: 'Full Sleeve', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJEGINGHAM TWILL SHIRT L/S - Port Royale (902412402)', Code: '902412402', Grade: 'B', MRP: 2999, Cost: 1859.00, Category: 'Top_Wear', Brick: 'SHIRTS', Neck: 'Regular Collar', Sleeve: 'Full Sleeve', S: 2, M: 2, L: 1 },
    { Product_Name: 'JJESHERIDAN SHIRT L/S - Light Blue Denim (902266201)', Code: '902266201', Grade: 'A', MRP: 2999, Cost: 1859.00, Category: 'Top_Wear', Brick: 'SHIRTS', Neck: 'Regular Collar', Sleeve: 'Full Sleeve', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJEOXFORD SHIRT LS - Navy Blazer (902412501)', Code: '902412501', Grade: 'A', MRP: 2499, Cost: 1549.00, Category: 'Top_Wear', Brick: 'SHIRTS', Neck: 'Regular Collar', Sleeve: 'Full Sleeve', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJPR MARCUS POPLIN SHIRT LS - Jet Black (902194602)', Code: '902194602', Grade: 'B', MRP: 2499, Cost: 1549.00, Category: 'Top_Wear', Brick: 'SHIRTS', Neck: 'Regular Collar', Sleeve: 'Full Sleeve', S: 2, M: 2, L: 1 },
    { Product_Name: 'JJPR TECHNO CREW NECK T-SHIRT SS - Jet Black (901458501)', Code: '901458501', Grade: 'C', MRP: 999, Cost: 619.00, Category: 'Top_Wear', Brick: 'T-SHIRTS', Neck: 'Round Neck', Sleeve: 'Half Sleeve', S: 1, M: 1, L: 2 },
    { Product_Name: 'JJCO LITHION SS TSHIRT - Comfrey Green (901482501)', Code: '901482501', Grade: 'A', MRP: 999, Cost: 619.00, Category: 'Top_Wear', Brick: 'T-SHIRTS', Neck: 'Round Neck', Sleeve: 'Half Sleeve', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJECORP LOGO TEE SS O-NECK - Black (902273701)', Code: '902273701', Grade: 'B', MRP: 999, Cost: 619.00, Category: 'Top_Wear', Brick: 'T-SHIRTS', Neck: 'Round Neck', Sleeve: 'Half Sleeve', S: 2, M: 2, L: 1 },
    { Product_Name: 'JJCO CIARANAO TSHIRT SS - Brilliant White (280182702)', Code: '280182702', Grade: 'A', MRP: 1499, Cost: 929.00, Category: 'Top_Wear', Brick: 'T-SHIRTS', Neck: 'Round Neck', Sleeve: 'Half Sleeve', S: 1, M: 2, L: 1 },
    { Product_Name: 'JJOR DICE POLO SS - Jet Black (900768502)', Code: '900768502', Grade: 'B', MRP: 1999, Cost: 1239.00, Category: 'Top_Wear', Brick: 'T-SHIRTS', Neck: 'Polo Neck', Sleeve: 'Half Sleeve', S: 2, M: 2, L: 1 }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Catalogue");
  XLSX.writeFile(wb, "Sample_Catalogue.xlsx");
  toast('Downloaded Sample_Catalogue.xlsx');
}

/* ============================================================
   EXCEL FILE PARSER & AUTOMATIC COLUMN MATCHER
   ============================================================ */
/* ============================================================
   EXCEL FILE PARSER, DRAG-AND-DROP & COLUMN MATCHER
   ============================================================ */
function setupFileUploader() {
  const fileInput = document.getElementById('fileInput');
  if (!fileInput) return;

  // Standard File Input Change Handler
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleExcelFile(file);
    e.target.value = '';
  });

  // Drag and Drop File Upload Support
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.add('drag-active');
  });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === document.body || e.clientX <= 0 || e.clientY <= 0) {
      document.body.classList.remove('drag-active');
    }
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove('drag-active');
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      const file = dt.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        handleExcelFile(file);
      } else {
        toast('Please drop a valid .xlsx, .xls, or .csv file');
      }
    }
  });
}

function handleExcelFile(file) {
  state.fileName = file.name;
  const reader = new FileReader();

  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      if (!wb.SheetNames.length) {
        toast('Workbook contains no sheets');
        return;
      }

      // Read first sheet with data
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows || !rows.length) {
        toast(`Sheet "${sheetName}" is empty`);
        return;
      }

      // Directly process and update Catalogue instantly!
      processExcelRowsToCatalogue(rows);
    } catch (err) {
      console.error('Excel parse error:', err);
      toast('Could not read file. Please ensure it is a valid .xlsx, .xls, or .csv workbook.');
    }
  };

  reader.readAsArrayBuffer(file);
}

function processExcelRowsToCatalogue(rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);

  const titleCol = guessCol(headers, [/product.*name|title|product|style.*name/i]) || headers[0] || '';
  const codeCol = guessCol(headers, [/code|sku|style.*code|style.*no|id/i]) || headers[0] || '';
  const gradeCol = guessCol(headers, [/grade/i]) || '';
  const mrpCol = guessCol(headers, [/mrp|price|rate/i]) || '';
  const catCol = guessCol(headers, [/category|dept|department/i]) || '';
  const brickCol = guessCol(headers, [/brick|vendor.*brick|type/i]) || '';
  const neckCol = guessCol(headers, [/neck|collar/i]) || '';
  const sleeveCol = guessCol(headers, [/sleeve|arm/i]) || '';

  const sizeHeaders = headers.filter(h => {
    const clean = String(h).trim().toUpperCase();
    return SIZE_ORDER_HINTS.includes(clean) || /^\d{2,3}$/.test(clean);
  });

  const detectedSizes = sizeHeaders.length ? sizeHeaders : ['S', 'M', 'L'];

  state.catalogue = rows.map((r, i) => {
    const g = gradeCol && r[gradeCol] ? (r[gradeCol]).toString().trim().toUpperCase() : 'A';
    const validGrade = ['A','B','C'].includes(g) ? g : 'A';
    const sizeMap = {};

    detectedSizes.forEach(sz => {
      const val = parseFloat(r[sz]);
      sizeMap[sz] = isNaN(val) ? 0 : val;
    });

    // Default size ratios if no size count columns exist
    if (!sizeHeaders.length) {
      if (validGrade === 'A') { sizeMap['S'] = 1; sizeMap['M'] = 2; sizeMap['L'] = 1; }
      else if (validGrade === 'B') { sizeMap['S'] = 2; sizeMap['M'] = 2; sizeMap['L'] = 1; }
      else { sizeMap['S'] = 1; sizeMap['M'] = 1; sizeMap['L'] = 2; }
    }

    const rawMrp = mrpCol && r[mrpCol] ? String(r[mrpCol]).trim() : '1999';
    const formattedMrp = rawMrp.startsWith('₹') ? rawMrp : `₹${parseFloat(rawMrp.replace(/[^0-9.]/g, '') || 1999).toLocaleString('en-IN')}.00`;

    let thumbImg = 'images/dress_18076E.png';
    if (i % 5 === 1) thumbImg = 'images/dress_18522BM.png';
    else if (i % 5 === 2) thumbImg = 'images/dress_18076H.png';
    else if (i % 5 === 3) thumbImg = 'images/dress_teal_1788943943216.png';
    else if (i % 5 === 4) thumbImg = 'images/dress_brown_mustard_1788943926741.png';

    return {
      id: 'imp_' + Date.now() + '_' + i,
      title: (titleCol && r[titleCol]) ? String(r[titleCol]).trim() : `Apparel Item ${i+1}`,
      code: (codeCol && r[codeCol]) ? String(r[codeCol]).trim() : `STYLE-${1000+i}`,
      mrp: formattedMrp,
      cost: '₹1,239.38',
      grade: validGrade,
      category: (catCol && r[catCol]) ? String(r[catCol]).trim() : 'Apparel',
      brick: (brickCol && r[brickCol]) ? String(r[brickCol]).trim() : 'Casual',
      neck: (neckCol && r[neckCol]) ? String(r[neckCol]).trim() : 'Standard Neck',
      sleeve: (sleeveCol && r[sleeveCol]) ? String(r[sleeveCol]).trim() : 'Full Sleeve',
      img: thumbImg,
      sizes: sizeMap
    };
  });

  extractAllSizesFromDataset();
  state.selectedCatalogueIds = new Set();
  state.cart = [];
  ensureGroupRatios();
  state.activeTab = 'catalogue';
  render();
  toast(`Uploaded "${state.fileName}" - ${state.catalogue.length} products loaded into Catalogue!`);
}

function guessCol(headers, regexList) {
  for (const rx of regexList) {
    const match = headers.find(h => rx.test(String(h).trim()));
    if (match) return match;
  }
  return '';
}

function openMappingModal(rows) {
  const headers = Object.keys(rows[0]);
  const backdrop = document.getElementById('mappingModalBackdrop');
  const modal = document.getElementById('mappingModal');

  const guessTitle = guessCol(headers, [/product.*name|title|product|style.*name/i]) || headers[0] || '';
  const guessCode = guessCol(headers, [/code|sku|style.*code|style.*no|id/i]) || headers[0] || '';
  const guessGrade = guessCol(headers, [/grade/i]) || '';
  const guessMRP = guessCol(headers, [/mrp|price|rate/i]) || '';
  const guessCategory = guessCol(headers, [/category|dept|department/i]) || '';
  const guessBrick = guessCol(headers, [/brick|vendor.*brick|type/i]) || '';
  const guessNeck = guessCol(headers, [/neck|collar/i]) || '';
  const guessSleeve = guessCol(headers, [/sleeve|arm/i]) || '';

  const sizeHeaders = headers.filter(h => {
    const clean = String(h).trim().toUpperCase();
    return SIZE_ORDER_HINTS.includes(clean) || /^\d{2,3}$/.test(clean);
  });

  const renderSelect = (id, labelText, defaultMatch) => `
    <div class="map-row">
      <label for="${id}">${labelText}</label>
      <select id="${id}" name="${id}" aria-label="${labelText}">
        <option value="">-- None / Auto --</option>
        ${headers.map(h => `<option value="${escapeHtml(h)}" ${h === defaultMatch ? 'selected' : ''}>${escapeHtml(h)}</option>`).join('')}
      </select>
    </div>
  `;

  modal.innerHTML = `
    <h3>Map Excel Columns</h3>
    <p class="sub-text">Confirm column mappings for "${escapeHtml(state.fileName)}" (${rows.length} rows)</p>

    ${renderSelect('mapTitle', 'Title / Name', guessTitle)}
    ${renderSelect('mapCode', 'Product Code / SKU', guessCode)}
    ${renderSelect('mapGrade', 'Grade (A / B / C)', guessGrade)}
    ${renderSelect('mapMRP', 'MRP / Price', guessMRP)}
    ${renderSelect('mapCategory', 'Category', guessCategory)}
    ${renderSelect('mapBrick', 'Brick', guessBrick)}
    ${renderSelect('mapNeck', 'Neck Type', guessNeck)}
    ${renderSelect('mapSleeve', 'Sleeve Type', guessSleeve)}

    ${sizeHeaders.length ? `<p style="font-size:11px; color:#475569; margin:10px 0 4px;"><strong>Detected Size Breakdown Columns:</strong> ${sizeHeaders.join(', ')}</p>` : '<p style="font-size:11px; color:#94A3B8; margin:10px 0 4px;">No specific size columns detected; default size ratio S:1, M:2, L:1 will be generated.</p>'}

    <div class="mapping-actions">
      <button class="btn secondary-btn" id="cancelMapBtn" style="color:#334155;">Cancel</button>
      <button class="btn primary-btn" id="confirmMapBtn">Import Excel Data</button>
    </div>
  `;

  backdrop.classList.add('active');

  document.getElementById('cancelMapBtn').addEventListener('click', () => backdrop.classList.remove('active'));
  document.getElementById('confirmMapBtn').addEventListener('click', () => {
    const titleCol = document.getElementById('mapTitle').value;
    const codeCol = document.getElementById('mapCode').value;
    const gradeCol = document.getElementById('mapGrade').value;
    const mrpCol = document.getElementById('mapMRP').value;
    const catCol = document.getElementById('mapCategory').value;
    const brickCol = document.getElementById('mapBrick').value;
    const neckCol = document.getElementById('mapNeck').value;
    const sleeveCol = document.getElementById('mapSleeve').value;

    const detectedSizes = sizeHeaders.length ? sizeHeaders : ['S', 'M', 'L'];

    state.catalogue = rows.map((r, i) => {
      const g = gradeCol && r[gradeCol] ? (r[gradeCol]).toString().trim().toUpperCase() : 'A';
      const validGrade = ['A','B','C'].includes(g) ? g : 'A';
      const sizeMap = {};

      detectedSizes.forEach(sz => {
        const val = parseFloat(r[sz]);
        sizeMap[sz] = isNaN(val) ? 0 : val;
      });

      // Sample fallback sizes if sheet rows have no size counts
      if (!sizeHeaders.length) {
        if (validGrade === 'A') { sizeMap['S'] = 1; sizeMap['M'] = 2; sizeMap['L'] = 1; }
        else if (validGrade === 'B') { sizeMap['S'] = 2; sizeMap['M'] = 2; sizeMap['L'] = 1; }
        else { sizeMap['S'] = 1; sizeMap['M'] = 1; sizeMap['L'] = 2; }
      }

      const rawMrp = mrpCol && r[mrpCol] ? String(r[mrpCol]).trim() : '1999';
      const formattedMrp = rawMrp.startsWith('₹') ? rawMrp : `₹${parseFloat(rawMrp.replace(/[^0-9.]/g, '') || 1999).toLocaleString('en-IN')}.00`;

      // Select matching thumbnail image
      let thumbImg = 'images/dress_18076E.png';
      if (i % 5 === 1) thumbImg = 'images/dress_18522BM.png';
      else if (i % 5 === 2) thumbImg = 'images/dress_18076H.png';
      else if (i % 5 === 3) thumbImg = 'images/dress_teal_1788943943216.png';
      else if (i % 5 === 4) thumbImg = 'images/dress_brown_mustard_1788943926741.png';

      return {
        id: 'imp_' + Date.now() + '_' + i,
        title: (titleCol && r[titleCol]) ? String(r[titleCol]).trim() : `Apparel Item ${i+1}`,
        code: (codeCol && r[codeCol]) ? String(r[codeCol]).trim() : `STYLE-${1000+i}`,
        mrp: formattedMrp,
        cost: '₹1,239.38',
        grade: validGrade,
        category: (catCol && r[catCol]) ? String(r[catCol]).trim() : 'Apparel',
        brick: (brickCol && r[brickCol]) ? String(r[brickCol]).trim() : 'Casual',
        neck: (neckCol && r[neckCol]) ? String(r[neckCol]).trim() : 'Standard Neck',
        sleeve: (sleeveCol && r[sleeveCol]) ? String(r[sleeveCol]).trim() : 'Full Sleeve',
        img: thumbImg,
        sizes: sizeMap
      };
    });

    extractAllSizesFromDataset();
    state.selectedCatalogueIds = new Set();
    state.cart = [];
    ensureGroupRatios();
    backdrop.classList.remove('active');
    state.activeTab = 'catalogue';
    render();
    toast(`Successfully imported ${state.catalogue.length} products into Catalogue!`);
  });
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupRatioModal();
  setupCatalogueActions();
  setupNavigationAndFilters();
  setupFileUploader();
});
