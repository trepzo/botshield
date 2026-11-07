export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Roblox-Cookie, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const cookie = req.headers['x-roblox-cookie'];
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  try {
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    if (cookie) headers['Cookie'] = `.ROBLOSECURITY=${cookie}`;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];

    // Prepare the fetch options
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    // If it's a POST request, pass the body along
    if (req.method === 'POST' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstream = await fetch(`https://${path}`, fetchOptions);
    
    // Handle image responses
    if (upstream.headers.get('content-type')?.includes('image')) {
      const buffer = await upstream.arrayBuffer();
      res.setHeader('Content-Type', upstream.headers.get('content-type'));
      return res.status(upstream.status).send(Buffer.from(buffer));
    }

    // Handle normal JSON responses
    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
