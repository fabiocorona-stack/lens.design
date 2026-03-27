export const config = { api: { bodyParser: { sizeLimit: '10mb' }, responseLimit: '10mb' } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    res.status(500).json({ error: 'Server not configured: missing Anthropic API key' });
    return;
  }

  try {
    const { image, mediaType, systemPrompt, messages, maxTokens } = req.body;

    // Support two modes:
    // 1. Simple: { image, mediaType, systemPrompt } — single image scan
    // 2. Advanced: { messages, systemPrompt, maxTokens } — custom messages (e.g. multi-image try-on)
    let userMessages;

    if (messages) {
      // Advanced mode: client sends full messages array
      userMessages = messages;
    } else if (image) {
      // Simple mode: single image
      userMessages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image } },
          { type: 'text', text: 'Analyze this image and identify all design products visible. Return the JSON array as instructed.' }
        ]
      }];
    } else {
      res.status(400).json({ error: 'Missing image data or messages' });
      return;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens || 4000,
        system: systemPrompt || '',
        messages: userMessages
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(502).json({ error: 'Scan failed: ' + err.message });
  }
}
