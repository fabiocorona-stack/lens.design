export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { id } = req.query;

  try {
    const response = await fetch('https://api.fashn.ai/v1/status/' + id, {
      method: 'GET',
      headers: {
        'Authorization': req.headers['authorization'] || '',
      },
    });

    const data = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json').send(data);
  } catch (err) {
    console.error('FASHN status error:', err.message);
    res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}
