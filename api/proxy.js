export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Roblox-Cookie, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const cookie = req.headers['x-roblox-cookie'];
  if (!cookie) return res.status(400).json({ error: 'Missing cookie' });

  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  try {
    const upstream = await fetch(`https://${path}`, {
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
