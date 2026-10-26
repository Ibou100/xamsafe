import { describe, it, expect } from 'vitest';
import {
  validateImageFile,
  MAX_IMAGE_SIZE_BYTES,
} from '../services/imageOcr';

describe('imageOcr Service (Étape 4)', () => {
  it('valide un fichier JPG de taille raisonnable', () => {
    const file = new File(['mock content'], 'screenshot.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('valide un fichier PNG', () => {
    const file = new File(['mock content'], 'capture.png', { type: 'image/png' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('valide un fichier WebP', () => {
    const file = new File(['mock content'], 'capture.webp', { type: 'image/webp' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejette les formats non supportés (ex: PDF ou GIF)', () => {
    const pdfFile = new File(['mock pdf'], 'document.pdf', { type: 'application/pdf' });
    const resPdf = validateImageFile(pdfFile);
    expect(resPdf.valid).toBe(false);
    expect(resPdf.error).toContain('Format d\'image non supporté');

    const gifFile = new File(['mock gif'], 'anim.gif', { type: 'image/gif' });
    const resGif = validateImageFile(gifFile);
    expect(resGif.valid).toBe(false);
  });

  it('rejette les fichiers dépassant 8 Mo', () => {
    // Simulate oversized file
    const largeBlob = new Uint8Array(MAX_IMAGE_SIZE_BYTES + 1024);
    const oversizedFile = new File([largeBlob], 'huge.png', { type: 'image/png' });
    const res = validateImageFile(oversizedFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('8 Mo');
  });
});
