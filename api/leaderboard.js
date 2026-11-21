import fs from 'fs';
import path from 'path';

const LOCAL_FILE = path.join(process.cwd(), 'data', 'leaderboard.json');

function readLocalFile() {
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      const raw = fs.readFileSync(LOCAL_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function writeLocalFile(entries) {
  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch {
    // On Vercel serverless, filesystem outside /tmp is read-only
  }
}

async function readRemoteGist(gistId, token) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'adi-en-test-vercel',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch gist: ${res.status}`);
  }
  const data = await res.json();
  const content = data?.files?.['leaderboard.json']?.content || '[]';
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeRemoteGist(gistId, token, entries) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'adi-en-test-vercel',
    },
    body: JSON.stringify({
      files: {
        'leaderboard.json': {
          content: JSON.stringify(entries, null, 2),
        },
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update gist: ${res.status}`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const gistId = process.env.GIST_ID;
  const token = process.env.GITHUB_TOKEN;
  const hasRemoteStore = Boolean(gistId && token);

  try {
    if (req.method === 'GET') {
      const entries = hasRemoteStore
        ? await readRemoteGist(gistId, token)
        : readLocalFile();
      const sorted = [...entries].sort((a, b) => b.points - a.points);
      return res.status(200).json({ entries: sorted });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const incoming = body?.entry;
      const incomingList = body?.entries;

      const current = hasRemoteStore
        ? await readRemoteGist(gistId, token)
        : readLocalFile();

      const map = new Map();
      for (const item of current) {
        if (item && item.id) map.set(item.id, item);
      }

      if (incoming && incoming.id) {
        map.set(incoming.id, incoming);
      }
      if (Array.isArray(incomingList)) {
        for (const item of incomingList) {
          if (item && item.id) map.set(item.id, item);
        }
      }

      const merged = Array.from(map.values())
        .sort((a, b) => b.points - a.points)
        .slice(0, 200);

      if (hasRemoteStore) {
        await writeRemoteGist(gistId, token, merged);
      }
      writeLocalFile(merged);

      return res.status(200).json({ entries: merged });
    }

    if (req.method === 'DELETE') {
      if (hasRemoteStore) {
        await writeRemoteGist(gistId, token, []);
      }
      writeLocalFile([]);
      return res.status(200).json({ entries: [] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Leaderboard API error:', err);
    return res.status(500).json({ error: 'Failed to process leaderboard request' });
  }
}
