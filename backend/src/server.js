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

  if (error) return res.status(500).json({ error: error.message });
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
