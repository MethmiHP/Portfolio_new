import { defaultProjects } from './defaults.js';

const sampleTitles = new Set([
  'courtroom speech-to-text',
  'slt call center platform',
  'restaurant pos system',
  'erp & sales mobile app',
]);

// Keep the CV projects visible while allowing admin content and media updates.
export function getDisplayProjects(savedProjects = []) {
  const projects = new Map(defaultProjects.map((project) => [project.title.toLowerCase(), project]));
  for (const project of Array.isArray(savedProjects) ? savedProjects : []) {
    const title = project.title?.trim().toLowerCase();
    if (!title || sampleTitles.has(title)) continue;
    const existing = projects.get(title);
    projects.set(title, { ...existing, ...project, image: project.image || existing?.image });
  }
  return [...projects.values()].sort((a, b) => (a.order || 0) - (b.order || 0));
}
