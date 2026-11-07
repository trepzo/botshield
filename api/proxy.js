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

    const upstream = await fetch(`https://${path}`, { headers });
    
    // If it's an image, convert it to Base64 so the browser CANNOT block it
    if (upstream.headers.get('content-type')?.includes('image')) {
      const buffer = await upstream.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mime = upstream.headers.get('content-type');
      return res.status(200).send(`data:${mime};base64,${base64}`);
    }

    // Otherwise send normal JSON
    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
