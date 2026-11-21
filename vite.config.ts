import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function localLeaderboardApiPlugin() {
  const filePath = path.join(process.cwd(), 'data', 'leaderboard.json');

  const readStore = () => {
    try {
      if (fs.existsSync(filePath)) {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  };

  const writeStore = (entries: unknown[]) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), 'utf-8');
  };

  return {
    name: 'local-leaderboard-api',
    configureServer(server: any) {
      server.middlewares.use('/api/leaderboard', (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'GET') {
          const entries = readStore();
          res.end(JSON.stringify({ entries }));
          return;
        }
        if (req.method === 'DELETE') {
          writeStore([]);
          res.end(JSON.stringify({ entries: [] }));
          return;
        }
        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk: any) => {
            bodyStr += chunk;
          });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const current = readStore();
              const map = new Map<string, any>();
              for (const item of current) {
                if (item?.id) map.set(item.id, item);
              }
              if (body?.entry?.id) {
                map.set(body.entry.id, body.entry);
              }
              if (Array.isArray(body?.entries)) {
                for (const item of body.entries) {
                  if (item?.id) map.set(item.id, item);
                }
              }
              const merged = Array.from(map.values()).sort(
                (a, b) => b.points - a.points
              );
              writeStore(merged);
              res.end(JSON.stringify({ entries: merged }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localLeaderboardApiPlugin()],
})
