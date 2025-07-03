import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Garante que o método seja POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    const { id } = req.body;

    // Valida o ID recebido
    if (!id) {
      res.status(400).json({ error: 'ID é obrigatório' });
      return;
    }

    // Chama a API do Bitrix
    const url = `https://wra-usa.bitrix24.com/rest/4223/6ilw6rjt5ipj0egx/crm.deal.get.json?id=${id}`;
    const response = await axios.get(url);

    // Retorna o resultado para o frontend
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro na API Bitrix:', error);
    res.status(500).json({ error: 'Erro ao consultar Bitrix' });
  }
}
