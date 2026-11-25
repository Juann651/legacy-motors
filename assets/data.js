// ─────────────────────────────────────────────
// DATA.JS — Legacy Motors
// Banco de dados via JSONBin.io (sincronizado entre dispositivos)
// ─────────────────────────────────────────────

const JSONBIN_URL = () =>
  `https://api.jsonbin.io/v3/b/${window.JSONBIN_CONFIG.binId}`;

const JSONBIN_HEADERS = () => ({
  'Content-Type': 'application/json',
  'X-Master-Key': window.JSONBIN_CONFIG.apiKey,
  'X-Bin-Versioning': 'false'   // sempre sobrescreve sem criar versões
});

const LEGACY_SAMPLE_CARS = [
  {
    id: '1', name: 'Toyota Corolla XEI', brand: 'Toyota', model: 'Corolla',
    year: 2023, price: 142900, km: 18000, type: 'Seminovo', gear: 'Automático',
    fuel: 'Flex', status: 'Disponível', description: 'Sedã completo, econômico e confortável.',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: '2', name: 'Jeep Compass Limited', brand: 'Jeep', model: 'Compass',
    year: 2022, price: 159900, km: 31000, type: 'Usado', gear: 'Automático',
    fuel: 'Diesel', status: 'Disponível', description: 'SUV robusto com excelente acabamento.',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: '3', name: 'BYD Dolphin EV', brand: 'BYD', model: 'Dolphin',
    year: 2024, price: 149900, km: 4000, type: 'Seminovo', gear: 'Automático',
    fuel: 'Elétrico', status: 'Disponível', description: 'Elétrico moderno, silencioso e econômico.',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80'
  }
];

// ── Verifica se o JSONBin está configurado ────────────────────────────────
function isJsonBinReady() {
  return window.JSONBIN_CONFIG &&
    JSONBIN_CONFIG.binId && !JSONBIN_CONFIG.binId.includes('COLOQUE') &&
    JSONBIN_CONFIG.apiKey && !JSONBIN_CONFIG.apiKey.includes('COLOQUE');
}

// ── Cache local para não bater na API a cada render ───────────────────────
let _carsCache = null;

// ── Lê todos os carros (async) ────────────────────────────────────────────
async function fetchCars() {
  if (!isJsonBinReady()) {
    console.warn('JSONBin não configurado — usando dados de exemplo.');
    return LEGACY_SAMPLE_CARS;
  }
  try {
    const res = await fetch(JSONBIN_URL() + `/latest?v=${Date.now()}`, {
      headers: JSONBIN_HEADERS()
    });
    const data = await res.json();
    const cars = data.record?.cars ?? [];
    _carsCache = cars.length ? cars : LEGACY_SAMPLE_CARS;
    return _carsCache;
  } catch (err) {
    console.error('Erro ao buscar carros:', err);
    return _carsCache || LEGACY_SAMPLE_CARS;
  }
}

// ── Salva todos os carros (async) ─────────────────────────────────────────
async function saveCarsRemote(cars) {
  if (!isJsonBinReady()) {
    console.warn('JSONBin não configurado — salvamento ignorado.');
    return;
  }
  _carsCache = cars;
  await fetch(JSONBIN_URL(), {
    method: 'PUT',
    headers: JSONBIN_HEADERS(),
    body: JSON.stringify({ cars })
  });
}

// ── Favoritos (continuam no localStorage — são por usuário) ───────────────
function getFavorites() {
  return JSON.parse(localStorage.getItem('legacy_favorites') || '[]');
}
function saveFavorites(favs) {
  localStorage.setItem('legacy_favorites', JSON.stringify(favs));
}

// ── Helpers de formatação ─────────────────────────────────────────────────
function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function whatsappLink(car) {
  return `https://wa.me/5527999999999?text=${encodeURIComponent('Olá, tenho interesse no veículo ' + car.name + ' da Legacy Motors.')}`;
}
