export async function fetchDealById(id: number) {
  const response = await fetch('http://localhost:3001/api/bitrix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error('Erro ao acessar API do Bitrix');
  }

  const data = await response.json();
  return data.result;
}
