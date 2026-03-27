export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { url, type } = req.body || {};
  if (!url) { res.status(400).json({ error: 'Missing url parameter' }); return; }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': type === 'image' ? 'image/*' : 'text/html,application/xhtml+xml,*/*',
      },
      redirect: 'follow',
    });

    if (type === 'image') {
      // Return image as binary
      const buffer = Buffer.from(await response.arrayBuffer());
      const ct = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', ct);
      res.status(response.status).send(buffer);
    } else {
      // Return HTML/text
      const text = await response.text();
      res.status(response.status).json({ html: text, status: response.status });
    }
  } catch (err) {
    console.error('Fetch URL error:', err.message);
    res.status(502).json({ error: 'Fetch error: ' + err.message });
  }
}
