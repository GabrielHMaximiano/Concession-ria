 const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  res.json({ status: 'ok', service: 'concessionaria-backend' });
});

app.get('/carros', async (req, res) => {
  const { data, error } = await supabase
    .from('carros')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

app.post('/carros', async (req, res) => {
  const { id, marca, modelo, ano, preco } = req.body;

  if (id === undefined || !marca || !modelo || !ano || preco === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: id, marca, modelo, ano, preco' });
  }

  const parsedId = Number(id);
  const parsedAno = Number(ano);
  const parsedPreco = Number(preco);

  if (Number.isNaN(parsedId) || parsedId <= 0 || Number.isNaN(parsedAno) || Number.isNaN(parsedPreco) || parsedPreco < 0) {
    return res.status(400).json({ error: 'Dados inválidos para id/ano/preco' });
  }

  const { data, error } = await supabase
    .from('carros')
    .insert([{ id: parsedId, marca, modelo, ano: parsedAno, preco: parsedPreco }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.put('/carros/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { marca, modelo, ano, preco } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (!marca || !modelo || !ano || preco === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: marca, modelo, ano, preco' });
  }

  const parsedAno = Number(ano);
  const parsedPreco = Number(preco);

  if (Number.isNaN(parsedAno) || Number.isNaN(parsedPreco) || parsedPreco < 0) {
    return res.status(400).json({ error: 'Dados inválidos para ano/preco' });
  }

  const { data, error } = await supabase
    .from('carros')
    .update({ marca, modelo, ano: parsedAno, preco: parsedPreco })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

app.delete('/carros/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const { data, error } = await supabase
    .from('carros')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Carro removido com sucesso', carro: data });
});

function validarFotosMockInteligente({ fotos, marca, modelo }) {
  const erros = [];

  const palavrasInvalidas = [
    'paisagem', 'landscape', 'natureza', 'nature', 'praia', 'beach',
    'montanha', 'mountain', 'ceu', 'sky', 'floresta', 'forest', 'cidade', 'city'
  ];

  const palavrasCarro = [
    'carro', 'car', 'vehicle', 'veiculo', 'auto', String(marca || '').toLowerCase(), String(modelo || '').toLowerCase()
  ].filter(Boolean);

  fotos.forEach((foto) => {
    const nome = String(foto.nome || '').toLowerCase();
    const categoria = String(foto.categoria || '');

    const temInvalida = palavrasInvalidas.some((p) => nome.includes(p));
    const temCarro = palavrasCarro.some((p) => p && nome.includes(p));
    const combinaCategoria = nome.includes(categoria.replace('_', '-')) || nome.includes(categoria.replace('_', ''));

    if (temInvalida) {
      erros.push({
        categoria,
        nome: foto.nome || 'arquivo',
        motivo: 'Imagem parece não ser de carro (paisagem/natureza detectada no nome do arquivo).'
      });
      return;
    }

    if (!temCarro && !combinaCategoria) {
      erros.push({
        categoria,
        nome: foto.nome || 'arquivo',
        motivo: 'Não foi possível confirmar que a imagem corresponde ao carro/categoria informada.'
      });
    }
  });

  return erros;
}

async function obterAvaliacaoIA({ marca, modelo, ano, fotos }) {
  const errosValidacao = validarFotosMockInteligente({ fotos, marca, modelo });

  if (errosValidacao.length > 0) {
    return {
      invalida: true,
      erros: errosValidacao
    };
  }

  const quantidade = Array.isArray(fotos) ? fotos.length : 0;

  if (quantidade >= 7) {
    return {
      condicao: 'boa',
      score: 8.1,
      valor_referencia: 95000,
      valor_sugerido: 94000
    };
  }

  return {
    condicao: 'regular',
    score: 6.9,
    valor_referencia: 88000,
    valor_sugerido: 84000
  };
}

app.post('/analise', async (req, res) => {
  const { carro_id, marca, modelo, ano, fotos } = req.body;

  if (!carro_id || !marca || !modelo || !ano || !Array.isArray(fotos)) {
    return res.status(400).json({ error: 'Campos obrigatórios: carro_id, marca, modelo, ano, fotos[]' });
  }

  const parsedCarroId = Number(carro_id);
  const parsedAno = Number(ano);

  if (Number.isNaN(parsedCarroId) || Number.isNaN(parsedAno)) {
    return res.status(400).json({ error: 'Dados inválidos para carro_id/ano' });
  }

  const categoriasObrigatorias = [
    'lateral_esquerda',
    'lateral_direita',
    'frontal',
    'traseira',
    'interna',
    'porta_malas',
    'capo_aberto'
  ];

  const faltantes = categoriasObrigatorias.filter(
    (categoria) =>
      !fotos.some(
        (foto) =>
          foto &&
          typeof foto === 'object' &&
          foto.categoria === categoria &&
          typeof foto.nome === 'string' &&
          typeof foto.conteudo === 'string' &&
          foto.conteudo.length > 0
      )
  );

  if (faltantes.length > 0) {
    return res.status(400).json({
      error: `Fotos obrigatórias ausentes: ${faltantes.join(', ')}`
    });
  }

  const { data: carro, error: carroError } = await supabase
    .from('carros')
    .select('*')
    .eq('id', parsedCarroId)
    .single();

  if (carroError) {
    if (carroError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }
    return res.status(500).json({ error: carroError.message });
  }

  const resultadoIA = await obterAvaliacaoIA({ marca, modelo, ano: parsedAno, fotos });

  if (resultadoIA?.invalida) {
    return res.status(400).json({
      error: 'Fotos inválidas para análise',
      detalhes: resultadoIA.erros
    });
  }

  if (
    resultadoIA?.valor_referencia === undefined ||
    resultadoIA?.valor_sugerido === undefined ||
    resultadoIA?.score === undefined
  ) {
    return res.status(502).json({ error: 'IA retornou dados incompletos para avaliação' });
  }

  const payload = {
    carro_id: parsedCarroId,
    nota: resultadoIA.score,
    comentario: `Condição ${resultadoIA.condicao} (mock IA)`,
    fotos
  };

  const { data: avaliacao, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .insert([payload])
    .select()
    .single();

  if (avaliacaoError) {
    return res.status(500).json({ error: avaliacaoError.message });
  }

  return res.status(201).json({
    carro_id: carro.id,
    veiculo: { marca, modelo, ano: parsedAno },
    analise_ia: {
      condicao: resultadoIA.condicao,
      score: resultadoIA.score,
      valor_referencia: Number(resultadoIA.valor_referencia),
      valor_sugerido: Number(resultadoIA.valor_sugerido)
    },
    avaliacao_salva: avaliacao
  });
});

app.post('/avaliacoes', async (req, res) => {
  const { carro_id, nota, comentario, fotos } = req.body;

  if (!carro_id || nota === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: carro_id, nota' });
  }

  const parsedCarroId = Number(carro_id);
  const parsedNota = Number(nota);

  if (Number.isNaN(parsedCarroId) || Number.isNaN(parsedNota) || parsedNota < 0 || parsedNota > 10) {
    return res.status(400).json({ error: 'Dados inválidos para carro_id/nota' });
  }

  if (fotos !== undefined && !Array.isArray(fotos)) {
    return res.status(400).json({ error: 'Campo fotos deve ser um array de URLs' });
  }

  const payload = {
    carro_id: parsedCarroId,
    nota: parsedNota,
    comentario: comentario || null,
    fotos: fotos || []
  };

  const { data, error } = await supabase
    .from('avaliacoes')
    .insert([payload])
    .select()
    .single();

  if (error) {
    if (error.code === '23503') {
      return res.status(404).json({ error: 'Carro não encontrado para avaliação' });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
});

app.get('/avaliacoes/:carroId', async (req, res) => {
  const carroId = Number(req.params.carroId);

  if (Number.isNaN(carroId)) {
    return res.status(400).json({ error: 'carroId inválido' });
  }

  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('carro_id', carroId)
    .order('id', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
