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

const analiseForm = document.getElementById('analise-form');
const analiseCarroIdInput = document.getElementById('analise-carro-id');
const analiseMarcaInput = document.getElementById('analise-marca');
const analiseModeloInput = document.getElementById('analise-modelo');
const analiseAnoInput = document.getElementById('analise-ano');
const analiseMensagem = document.getElementById('analise-mensagem');
const analiseResultado = document.getElementById('analise-resultado');
const resCondicao = document.getElementById('res-condicao');
const resScore = document.getElementById('res-score');
const resReferencia = document.getElementById('res-referencia');
const resSugerido = document.getElementById('res-sugerido');

const fotoLateralEsquerdaInput = document.getElementById('foto-lateral-esquerda');
const fotoLateralDireitaInput = document.getElementById('foto-lateral-direita');
const fotoFrontalInput = document.getElementById('foto-frontal');
const fotoTraseiraInput = document.getElementById('foto-traseira');
const fotoInternaInput = document.getElementById('foto-interna');
const fotoPortaMalasInput = document.getElementById('foto-porta-malas');
const fotoCapoAbertoInput = document.getElementById('foto-capo-aberto');

const dropZone = document.getElementById('drop-zone');
const dropZoneInput = document.getElementById('drop-zone-input');
const dropZoneLista = document.getElementById('drop-zone-lista');
let dropZoneFiles = [];

function setMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#fca5a5' : '#9ca3af';
}

function setAnaliseMensagem(texto, erro = false) {
  analiseMensagem.textContent = texto;
  analiseMensagem.style.color = erro ? '#fca5a5' : '#9ca3af';
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderDropZoneLista() {
  dropZoneLista.innerHTML = '';
  dropZoneFiles.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${file.name}`;
    dropZoneLista.appendChild(li);
  });
}

dropZone.addEventListener('click', () => dropZoneInput.click());
dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  const novosArquivos = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith('image/'));
  dropZoneFiles = [...dropZoneFiles, ...novosArquivos];
  renderDropZoneLista();
});

dropZoneInput.addEventListener('change', (event) => {
  const novosArquivos = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
  dropZoneFiles = [...dropZoneFiles, ...novosArquivos];
  renderDropZoneLista();
});

async function enviarAnalise(event) {
  event.preventDefault();

  const obrigatorias = [
    { categoria: 'lateral_esquerda', input: fotoLateralEsquerdaInput },
    { categoria: 'lateral_direita', input: fotoLateralDireitaInput },
    { categoria: 'frontal', input: fotoFrontalInput },
    { categoria: 'traseira', input: fotoTraseiraInput },
    { categoria: 'interna', input: fotoInternaInput },
    { categoria: 'porta_malas', input: fotoPortaMalasInput },
    { categoria: 'capo_aberto', input: fotoCapoAbertoInput }
  ];

  try {
    const obrigatoriasComArquivo = [];
    for (const item of obrigatorias) {
      const file = item.input.files?.[0];
      if (!file) {
        setAnaliseMensagem(`Falta a foto obrigatória: ${item.categoria.replace('_', ' ')}`, true);
        analiseResultado.classList.add('hidden');
        return;
      }
      obrigatoriasComArquivo.push({
        categoria: item.categoria,
        nome: file.name,
        conteudo: await fileToDataUrl(file)
      });
    }

    const adicionais = [];
    for (const file of dropZoneFiles) {
      adicionais.push({
        categoria: 'adicional',
        nome: file.name,
        conteudo: await fileToDataUrl(file)
      });
    }

    const fotos = [...obrigatoriasComArquivo, ...adicionais];

    const payload = {
      carro_id: Number(analiseCarroIdInput.value),
      marca: analiseMarcaInput.value.trim(),
      modelo: analiseModeloInput.value.trim(),
      ano: Number(analiseAnoInput.value),
      fotos
    };

    if (
      Number.isNaN(payload.carro_id) ||
      payload.carro_id <= 0 ||
      !payload.marca ||
      !payload.modelo ||
      Number.isNaN(payload.ano) ||
      fotos.length < 7
    ) {
      setAnaliseMensagem('Preencha os campos da análise corretamente.', true);
      analiseResultado.classList.add('hidden');
      return;
    }

    setAnaliseMensagem('Enviando fotos para análise...');
    const response = await fetch(`${API_BASE}/analise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await response.json();
    if (!response.ok) {
      if (Array.isArray(body.detalhes) && body.detalhes.length > 0) {
        const textoDetalhes = body.detalhes
          .map((d) => `${d.categoria}: ${d.motivo}`)
          .join(' | ');
        throw new Error(`${body.error || 'Fotos inválidas'} - ${textoDetalhes}`);
      }
      throw new Error(body.error || 'Erro ao analisar veículo');
    }

    const analiseIA = body.analise_ia || {};
    resCondicao.textContent = analiseIA.condicao ?? '-';
    resScore.textContent = analiseIA.score ?? '-';
    resReferencia.textContent = typeof analiseIA.valor_referencia === 'number'
      ? `R$ ${analiseIA.valor_referencia.toFixed(2)}`
      : '-';
    resSugerido.textContent = typeof analiseIA.valor_sugerido === 'number'
      ? `R$ ${analiseIA.valor_sugerido.toFixed(2)}`
      : '-';

    analiseResultado.classList.remove('hidden');
    setAnaliseMensagem('Análise concluída com sucesso.');
  } catch (error) {
    analiseResultado.classList.add('hidden');
    setAnaliseMensagem(`Erro na análise: ${error.message}`, true);
  }
}

form.addEventListener('submit', salvarCarro);
analiseForm.addEventListener('submit', enviarAnalise);

carregarCarros();
