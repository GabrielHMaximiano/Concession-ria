const API_BASE = 'http://localhost:3001';

const form = document.getElementById('carro-form');
const carroIdInput = document.getElementById('carro-id');
const idInput = document.getElementById('id');
const marcaInput = document.getElementById('marca');
const modeloInput = document.getElementById('modelo');
const anoInput = document.getElementById('ano');
const precoInput = document.getElementById('preco');
const carrosBody = document.getElementById('carros-body');
const mensagem = document.getElementById('mensagem');
const formTitle = document.getElementById('form-title');
const btnCancelar = document.getElementById('btn-cancelar');

function setMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#fca5a5' : '#9ca3af';
}

function resetForm() {
  carroIdInput.value = '';
  form.reset();
  formTitle.textContent = 'Cadastrar carro';
  btnCancelar.classList.add('hidden');
  idInput.disabled = false;
}

function preencherFormulario(carro) {
  carroIdInput.value = carro.id;
  idInput.value = carro.id;
  idInput.disabled = true;
  marcaInput.value = carro.marca;
  modeloInput.value = carro.modelo;
  anoInput.value = carro.ano;
  precoInput.value = carro.preco;
  formTitle.textContent = `Editando carro #${carro.id}`;
  btnCancelar.classList.remove('hidden');
}

async function carregarCarros() {
  setMensagem('Carregando carros...');
  carrosBody.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE}/carros`);
    if (!response.ok) throw new Error('Falha ao buscar carros');

    const carros = await response.json();

    if (!carros.length) {
      carrosBody.innerHTML = '<tr><td colspan="6">Nenhum carro cadastrado.</td></tr>';
      setMensagem('Nenhum carro cadastrado.');
      return;
    }

    carrosBody.innerHTML = '';
    carros.forEach((carro) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${carro.id}</td>
        <td>${carro.marca}</td>
        <td>${carro.modelo}</td>
        <td>${carro.ano}</td>
        <td>R$ ${Number(carro.preco).toFixed(2)}</td>
        <td class="actions-cell">
          <button class="secondary" data-action="editar" data-id="${carro.id}">Editar</button>
          <button class="danger" data-action="excluir" data-id="${carro.id}">Excluir</button>
        </td>
      `;
      carrosBody.appendChild(tr);
    });

    setMensagem(`Total de carros: ${carros.length}`);
  } catch (error) {
    setMensagem(`Erro ao carregar carros: ${error.message}`, true);
  }
}

async function salvarCarro(event) {
  event.preventDefault();

  const id = carroIdInput.value;
  const payload = {
    id: Number(idInput.value),
    marca: marcaInput.value.trim(),
    modelo: modeloInput.value.trim(),
    ano: Number(anoInput.value),
    preco: Number(precoInput.value)
  };

  if (Number.isNaN(payload.id) || payload.id <= 0 || !payload.marca || !payload.modelo || Number.isNaN(payload.ano) || Number.isNaN(payload.preco)) {
    setMensagem('Preencha todos os campos corretamente.', true);
    return;
  }

  try {
    const isEdicao = Boolean(id);
    const url = isEdicao ? `${API_BASE}/carros/${id}` : `${API_BASE}/carros`;
    const method = isEdicao ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Erro ao salvar carro');

    setMensagem(isEdicao ? 'Carro atualizado com sucesso.' : 'Carro cadastrado com sucesso.');
    resetForm();
    await carregarCarros();
  } catch (error) {
    setMensagem(`Erro ao salvar: ${error.message}`, true);
  }
}

async function excluirCarro(id) {
  if (!confirm(`Deseja realmente excluir o carro #${id}?`)) return;

  try {
    const response = await fetch(`${API_BASE}/carros/${id}`, { method: 'DELETE' });
    const body = await response.json();

    if (!response.ok) throw new Error(body.error || 'Erro ao excluir');
    setMensagem('Carro excluído com sucesso.');
    await carregarCarros();
  } catch (error) {
    setMensagem(`Erro ao excluir: ${error.message}`, true);
  }
}

carrosBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === 'excluir') {
    await excluirCarro(id);
    return;
  }

  if (action === 'editar') {
    try {
      const response = await fetch(`${API_BASE}/carros`);
      const carros = await response.json();
      const carro = carros.find((item) => item.id === id);
      if (!carro) {
        setMensagem('Carro não encontrado para edição.', true);
        return;
      }
      preencherFormulario(carro);
      setMensagem(`Editando carro #${id}`);
    } catch (error) {
      setMensagem(`Erro ao iniciar edição: ${error.message}`, true);
    }
  }
});

btnCancelar.addEventListener('click', () => {
  resetForm();
  setMensagem('Edição cancelada.');
});

form.addEventListener('submit', salvarCarro);

carregarCarros();
