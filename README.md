# BioPlay — Interactive Biology Made Simple

Learn biology by _doing_: drag, drop, toggle, build, and watch living systems react.

## Setup

```bash
git clone <repo-url> bioplay
cd bioplay
nvm use          # Node 24 LTS (see .nvmrc)
npm install
cp .env.example server/.env   # optional; defaults work
npm run dev      # starts API (3001) + client (5173)
```

Open http://localhost:5173.
