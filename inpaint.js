export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const forwardHeaders = { 'Accept': 'image/*' };
    if (req.headers['content-type']) forwardHeaders['Content-Type'] = req.headers['content-type'];
    if (req.headers['authorization']) forwardHeaders['Authorization'] = req.headers['authorization'];

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit/inpaint', {
      method: 'POST',
      headers: forwardHeaders,
      body: body,
    });

    const responseBuffer = Buffer.from(await response.arrayBuffer());
    const ct = response.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);

    res.status(response.status).send(responseBuffer);
  } catch (err) {
    console.error('Inpaint error:', err.message);
    res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}
