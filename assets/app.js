// ─────────────────────────────────────────────
// APP.JS — Legacy Motors (site público)
// ─────────────────────────────────────────────

const menuBtn = document.getElementById('menuBtn');
const menu    = document.getElementById('menu');
if (menuBtn) menuBtn.addEventListener('click', () => menu.classList.toggle('open'));

// ── Template do card de carro ─────────────────────────────────────────────
function card(car) {
  const favs   = getFavorites();
  const active = favs.includes(car.id);
  return `<article class="car-card">
    <img src="${car.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80'}" alt="${car.name}" loading="lazy">
    <div class="car-content">
      <div class="car-top">
        <span>${car.type}</span>
        <button class="fav ${active ? 'active' : ''}" data-fav="${car.id}" title="Favoritar">♥</button>
      </div>
      <h3>${car.name}</h3>
      <p>${car.brand} • ${car.model}</p>
      <strong>${formatMoney(car.price)}</strong>
      <div class="tags">
        <span>${car.year}</span>
        <span>${Number(car.km || 0).toLocaleString('pt-BR')} km</span>
        <span>${car.gear}</span>
        <span>${car.fuel}</span>
      </div>
      <p class="desc">${car.description || ''}</p>
      <a class="btn full"         target="_blank" href="${whatsappLink(car)}">Tenho interesse</a>
      <a class="btn outline full" target="_blank" href="${whatsappLink(car)}">Agendar visita</a>
    </div>
  </article>`;
}

// ── Favoritar ─────────────────────────────────────────────────────────────
function bindFavs() {
  document.querySelectorAll('[data-fav]').forEach(btn =>
    btn.addEventListener('click', () => {
      const id   = btn.dataset.fav;
      const favs = getFavorites();
      saveFavorites(favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]);
      render(window._allCars || []);
    })
  );
}

// ── Renderiza o grid com filtros aplicados ────────────────────────────────
function render(allCars) {
  window._allCars = allCars; // guarda para reuso nos favoritos

  const favGrid = document.getElementById('favoritesGrid');
  const grid    = document.getElementById('carsGrid');
  const empty   = document.getElementById('emptyState');

  // Página de favoritos
  if (favGrid) {
    const favs = getFavorites();
    const list = allCars.filter(c => favs.includes(c.id));
    favGrid.innerHTML = list.map(card).join('');
    empty?.classList.toggle('hidden', list.length > 0);
    bindFavs();
    return;
  }

  if (!grid) return;

  // Filtros
  const q     = (document.getElementById('searchInput')?.value  || '').toLowerCase();
  const type  =  document.getElementById('typeFilter')?.value   || '';
  const brand =  document.getElementById('brandFilter')?.value  || '';
  const gear  =  document.getElementById('gearFilter')?.value   || '';
  const fuel  =  document.getElementById('fuelFilter')?.value   || '';
  const min   = Number(document.getElementById('minPrice')?.value || 0);
  const max   = Number(document.getElementById('maxPrice')?.value || Infinity) || Infinity;
  const sort  =  document.getElementById('sortSelect')?.value   || 'recentes';

  let cars = allCars.filter(c => c.status !== 'Vendido').filter(c => {
    const text = `${c.name} ${c.brand} ${c.model} ${c.year} ${c.fuel} ${c.gear} ${c.type}`.toLowerCase();
    return text.includes(q)
      && (!type  || c.type  === type)
      && (!brand || c.brand === brand)
      && (!gear  || c.gear  === gear)
      && (!fuel  || c.fuel  === fuel)
      && Number(c.price) >= min
      && Number(c.price) <= max;
  });

  const sorters = {
    modelo:    (a, b) => a.model.localeCompare(b.model),
    maiorPreco:(a, b) => b.price - a.price,
    menorPreco:(a, b) => a.price - b.price,
    anoNovo:   (a, b) => b.year  - a.year,
    menorKm:   (a, b) => a.km   - b.km,
    recentes:  (a, b) => String(b.id).localeCompare(String(a.id))
  };
  cars.sort(sorters[sort] || sorters.recentes);

  grid.innerHTML = cars.map(card).join('');
  empty?.classList.toggle('hidden', cars.length > 0);
  bindFavs();
}

// ── Preenche o select de marcas ───────────────────────────────────────────
function fillBrands(cars) {
  const select = document.getElementById('brandFilter');
  if (!select) return;
  const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))].sort();
  select.innerHTML = '<option value="">Todas as marcas</option>'
    + brands.map(b => `<option>${b}</option>`).join('');
}

// ── Inicialização ─────────────────────────────────────────────────────────
async function init() {
  // Mostra skeleton/loading enquanto carrega
  const grid = document.getElementById('carsGrid');
  if (grid) grid.innerHTML = '<p style="color:#999;padding:2rem">Carregando veículos...</p>';

  const cars = await fetchCars();
  fillBrands(cars);
  render(cars);

  // Listeners dos filtros — re-renderiza com os dados já carregados
  ['searchInput','typeFilter','brandFilter','gearFilter',
   'fuelFilter','minPrice','maxPrice','sortSelect'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => render(cars));
  });
}

init();
