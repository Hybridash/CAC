import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3001);
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});
app.listen(port, () => console.log(`BioPlay API on http://localhost:${port}`));
