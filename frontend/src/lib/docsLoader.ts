import fs from 'fs';
import path from 'path';

export interface DocFile {
  filename: string;
  title: string;
  content: string;
}

/**
 * Dynamically loads all markdown files from the docs directory.
 * Looks in multiple standard paths relative to process.cwd() to be resilient
 * to different Next.js runtime/deployment structures.
 */
export function loadProjectDocs(): DocFile[] {
  const possiblePaths = [
    path.join(process.cwd(), 'docs'),
    path.join(process.cwd(), 'frontend', 'docs'),
    path.join(process.cwd(), '..', 'docs'),
  ];

  let docsDir = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      docsDir = p;
      break;
    }
  }

  if (!docsDir) {
    console.warn('Documentation directory "/docs" not found in search paths:', possiblePaths);
    return [];
  }

  try {
    const files = fs.readdirSync(docsDir);
    const mdFiles = files.filter((file) => file.endsWith('.md'));

    const loadedDocs: DocFile[] = mdFiles.map((filename) => {
      const filePath = path.join(docsDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Clean/readable title from filename (e.g. about.md -> About)
      const title = filename
        .replace('.md', '')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        filename,
        title,
        content,
      };
    });

    return loadedDocs;
  } catch (error) {
    console.error('Error reading documentation files:', error);
    return [];
  }
}

/**
 * Returns all documentation content compiled into a single formatted string
 * suitable to be injected as system context for the Gemini model.
 */
export function getDocsContext(): string {
  const docs = loadProjectDocs();
  if (docs.length === 0) {
    return 'No documentation available.';
  }

  return docs
    .map((doc) => {
      return `--- START OF DOCUMENT: ${doc.title} (${doc.filename}) ---\n${doc.content}\n--- END OF DOCUMENT ---`;
    })
    .join('\n\n');
}
