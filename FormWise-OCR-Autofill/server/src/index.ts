import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors());
app.use(helmet());

const prisma = new PrismaClient();
const JWT_PUBLIC_PEM = (process.env.JWT_PUBLIC_PEM || '').replace(/\\n/g, '\n');

function auth(req, res, next) {
  try {
    const h = req.headers['authorization'];
    if (!h) return res.status(401).json({ error: 'missing token' });
    const [, token] = h.split(' ');
    const payload = jwt.verify(token, JWT_PUBLIC_PEM, { algorithms: ['RS256'] });
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/templates', auth, async (req, res) => {
  const Body = z.object({ host: z.string(), name: z.string(), fields: z.any() });
  const data = Body.parse(req.body);
  const created = await prisma.template.create({ data });
  res.json(created);
});

app.get('/templates', auth, async (req, res) => {
  const host = z.string().parse(req.query.host);
  const list = await prisma.template.findMany({ where: { host } });
  res.json(list);
});

app.post('/mappings', auth, async (req, res) => {
  const Body = z.object({ host: z.string(), map: z.any() });
  const { host, map } = Body.parse(req.body);
  const userId = req.user.sub;
  const updated = await prisma.mapping.upsert({
    where: { userId_host: { userId, host } } as any,
    create: { userId, host, map },
    update: { map }
  });
  res.json(updated);
});

app.get('/mappings', auth, async (req, res) => {
  const host = z.string().parse(req.query.host);
  const userId = req.user.sub;
  const item = await prisma.mapping.findFirst({ where: { userId, host } });
  res.json(item);
});

app.post('/logs', auth, async (req, res) => {
  const Body = z.object({ action: z.string(), meta: z.any().optional() });
  const { action, meta } = Body.parse(req.body);
  const log = await prisma.auditLog.create({
    data: { userId: req.user.sub, action, meta: meta || {} }
  });
  res.json(log);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
