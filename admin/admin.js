// ─────────────────────────────────────────────
// ADMIN.JS — Legacy Motors
// ─────────────────────────────────────────────

const ADMIN_EMAIL = (window.ADMIN_CONFIG || {}).email;
const ADMIN_PASSWORD = (window.ADMIN_CONFIG || {}).password;

const loginScreen = document.getElementById('loginScreen');
const adminApp = document.getElementById('adminApp');
const saveBtn = document.getElementById('saveBtn');
const imageFile = document.getElementById('imageFile');
const carForm = document.getElementById('carForm');
const carId = document.getElementById('carId');
const formTitle = document.getElementById('formTitle');
const carsTable = document.getElementById('carsTable');
const adminSearch = document.getElementById('adminSearch');

// ── Auth ──────────────────────────────────────────────────────────────────
function checkAuth() {
  const ok = sessionStorage.getItem('legacy_admin') === 'true';
  loginScreen.classList.toggle('hidden', ok);
  adminApp.classList.toggle('hidden', !ok);
  document.documentElement.style.visibility = 'visible';
  if (ok) loadAndRender();
}

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const emailVal = document.getElementById('email').value;
  const passVal = document.getElementById('password').value;
  if (emailVal === ADMIN_EMAIL && passVal === ADMIN_PASSWORD) {
    sessionStorage.setItem('legacy_admin', 'true');
    checkAuth();
  } else {
    alert('Login ou senha incorretos.');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('legacy_admin');
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  checkAuth();
});

// ── Cloudinary ────────────────────────────────────────────────────────────
function isCloudinaryReady() {
  return window.CLOUDINARY_CONFIG &&
    CLOUDINARY_CONFIG.cloudName && !CLOUDINARY_CONFIG.cloudName.includes('COLOQUE') &&
    CLOUDINARY_CONFIG.uploadPreset && !CLOUDINARY_CONFIG.uploadPreset.includes('COLOQUE');
}

async function uploadToCloudinary(file) {
  if (!isCloudinaryReady()) {
    throw new Error('Cloudinary não configurado. Abra assets/config.js e preencha cloudName e uploadPreset.');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'Auto legacy - Concessionaria/imagens - legacy motors');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: 'POST', body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erro ao enviar imagem para o Cloudinary.');
  return data.secure_url;
}

// ── Carregar e renderizar tabela ──────────────────────────────────────────
let _adminCars = [];

async function loadAndRender() {
  carsTable.innerHTML = '<tr><td colspan="5" style="color:#999">Carregando...</td></tr>';
  _adminCars = await fetchCars();
  renderTable();
}

// ── Salvar veículo ────────────────────────────────────────────────────────
saveBtn.addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const brand = document.getElementById('brand').value.trim();
  const model = document.getElementById('model').value.trim();
  const year = document.getElementById('year').value;
  const price = document.getElementById('price').value;
  const km = document.getElementById('km').value;

  if (!name || !brand || !model) { alert('Preencha nome, marca e modelo.'); return; }
  if (!year || !price || !km) { alert('Preencha ano, preço e quilometragem.'); return; }

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    let image = document.getElementById('imageUrl').value.trim();
    if (imageFile.files[0]) {
      saveBtn.textContent = 'Enviando imagem...';
      image = await uploadToCloudinary(imageFile.files[0]);
    }

    const item = {
      id: carId.value || String(Date.now()),
      name, brand, model,
      year: Number(year),
      price: Number(price),
      km: Number(km),
      type: document.getElementById('type').value,
      gear: document.getElementById('gear').value,
      fuel: document.getElementById('fuel').value,
      status: document.getElementById('status').value,
      image,
      description: document.getElementById('description').value.trim()
    };

    const idx = _adminCars.findIndex(c => c.id === item.id);
    if (idx >= 0) _adminCars[idx] = item; else _adminCars.unshift(item);

    saveBtn.textContent = 'Sincronizando...';
    await saveCarsRemote(_adminCars);

    clearForm();
    renderTable();
    alert('Veículo salvo com sucesso!');
  } catch (err) {
    alert(err.message || 'Erro ao salvar veículo.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvar veículo';
  }
});

// ── Limpar formulário ─────────────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', clearForm);
function clearForm() {
  carForm.reset();
  carId.value = '';
  formTitle.textContent = 'Adicionar veículo';
}

// ── Editar ────────────────────────────────────────────────────────────────
function editCar(id) {
  const c = _adminCars.find(x => x.id === id);
  if (!c) return;
  carId.value = c.id || '';
  document.getElementById('name').value = c.name || '';
  document.getElementById('brand').value = c.brand || '';
  document.getElementById('model').value = c.model || '';
  document.getElementById('year').value = c.year || '';
  document.getElementById('price').value = c.price || '';
  document.getElementById('km').value = c.km || '';
  document.getElementById('type').value = c.type || 'Novo';
  document.getElementById('gear').value = c.gear || 'Automático';
  document.getElementById('fuel').value = c.fuel || 'Flex';
  document.getElementById('status').value = c.status || 'Disponível';
  document.getElementById('imageUrl').value = c.image || '';
  document.getElementById('description').value = c.description || '';
  formTitle.textContent = 'Editar veículo';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Excluir ───────────────────────────────────────────────────────────────
async function deleteCar(id) {
  if (!confirm('Remover este veículo?')) return;
  _adminCars = _adminCars.filter(c => c.id !== id);
  saveFavorites(getFavorites().filter(f => f !== id));
  await saveCarsRemote(_adminCars);
  renderTable();
}

// ── Busca no painel ───────────────────────────────────────────────────────
adminSearch.addEventListener('input', renderTable);

function renderTable() {
  const q = (adminSearch.value || '').toLowerCase();
  const rows = _adminCars
    .filter(c => `${c.name} ${c.brand} ${c.model}`.toLowerCase().includes(q))
    .map(c => `<tr>
      <td><img src="${c.image || '../assets/placeholder.jpg'}"
           onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=300&q=60'"></td>
      <td><strong>${c.name}</strong><br>${c.brand} • ${c.year}</td>
      <td>${formatMoney(c.price)}</td>
      <td>${c.status}</td>
      <td>
        <button class="btn small"         onclick="editCar('${c.id}')">Editar</button>
        <button class="btn outline small" onclick="deleteCar('${c.id}')">Excluir</button>
      </td>
    </tr>`).join('');

  carsTable.innerHTML = rows || '<tr><td colspan="5">Nenhum veículo cadastrado.</td></tr>';
}

// Limpa a sessão ao fechar/sair da página
window.addEventListener('pagehide', (e) => {
  if (!e.persisted) {
    localStorage.removeItem('legacy_admin');
  }
});

checkAuth();
