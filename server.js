import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const PUBLIC_DIR = path.join(ROOT, 'public');

async function ensureDirectories() {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
async function projectDir(slug) {
  const dir = path.join(PROJECTS_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

function normalizeWiki(project) {
  if (!Array.isArray(project.wiki)) project.wiki = [];
  project.wiki = project.wiki.map((page, index) => ({
    group: page.group || { en: index === 0 ? 'Getting Started' : 'Reference', ar: index === 0 ? 'البداية' : 'المرجع' },
    order: Number.isFinite(page.order) ? page.order : index,
    ...page,
    title: page.title || { en: page.id || 'Page', ar: page.id || 'صفحة' },
    body: page.body || { en: '', ar: '' }
  })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return project;
}

async function readProject(slug) {
  try {
    const raw = await fs.readFile(path.join(PROJECTS_DIR, slug, 'project.json'), 'utf8');
    return normalizeWiki(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeProject(slug, data) {
  const dir = await projectDir(slug);
  normalizeWiki(data);
  await fs.writeFile(path.join(dir, 'project.json'), JSON.stringify(data, null, 2));
  return data;
}

async function listProjects() {
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const project = await readProject(entry.name);
    if (project) projects.push(project);
  }
  projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return projects;
}

async function seed() {
  await ensureDirectories();
  const migrationFile = path.join(DATA_DIR, '.zxcrates-only-v3');
  let migrated = false;
  try { await fs.access(migrationFile); migrated = true; } catch {}

  const seedPath = path.join(ROOT, 'seed-zxcrates.json');
  const seedProject = JSON.parse(await fs.readFile(seedPath, 'utf8'));

  // One-time cleanup: remove old demo projects and refresh ZxCrates documentation.
  // Future owner-created projects are preserved after this migration.
  if (!migrated) {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== seedProject.slug) {
        await fs.rm(path.join(PROJECTS_DIR, entry.name), { recursive: true, force: true });
      }
    }
    await writeProject(seedProject.slug, seedProject);
    await fs.writeFile(migrationFile, new Date().toISOString(), 'utf8');
    return;
  }

  const existing = await readProject(seedProject.slug);
  if (!existing) await writeProject(seedProject.slug, seedProject);
}

await seed();

app.get('/api/projects', async (_req, res) => {
  res.json(await listProjects());
});

app.get('/api/projects/:slug', async (req, res) => {
  const project = await readProject(req.params.slug);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.get('/project-files/:slug/:file', async (req, res) => {
  const safeSlug = slugify(req.params.slug);
  const file = path.basename(req.params.file);
  const filePath = path.join(PROJECTS_DIR, safeSlug, file);
  if (!fsSync.existsSync(filePath)) return res.status(404).send('File not found');
  res.download(filePath);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Request failed' });
});

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

app.get('/{*splat}', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

app.listen(PORT, () => console.log(`ZxStudio running on http://localhost:${PORT}`));
