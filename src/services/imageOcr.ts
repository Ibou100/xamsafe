/**
 * Client-Side OCR and Image Pre-processing Service.
 *
 * Sovereign Privacy Principle:
 * - 100% in-browser processing via Canvas and Tesseract.js.
 * - Zero image transmission to any remote backend or third-party cloud.
 * - Images are scaled down (max 1600px) client-side before recognition.
 * - Only the resulting text is passed to the analysis pipeline.
 */

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_DIMENSION_PX = 1600;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné.' };
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Format d\'image non supporté. Veuillez sélectionner une capture JPG, PNG ou WebP.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'L\'image dépasse la taille maximale de 8 Mo. Veuillez compresser ou recadrer votre capture.',
    };
  }

  return { valid: true };
}

/**
 * Resizes an image file client-side so its longest dimension does not exceed maxDim.
 * Uses HTML5 Canvas and outputs a standard JPEG blob.
 */
export function downscaleImage(
  file: File,
  maxDim: number = MAX_IMAGE_DIMENSION_PX
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Impossible d\'initialiser le contexte graphique du navigateur.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression de l\'image en mémoire.'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve({ blob, dataUrl });
          },
          'image/jpeg',
          0.85
        );
      };

      img.onerror = () => {
        reject(new Error('Le fichier sélectionné est corrompu ou illisible.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Impossible de lire le fichier image.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Executes browser-side OCR using lazy-loaded tesseract.js with progress and timeout.
 */
export async function extractTextFromImage(
  imageSource: Blob | string,
  onProgress?: (progressPercent: number) => void,
  timeoutMs: number = 30000
): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Le délai de reconnaissance optique a expiré (30 secondes). Veuillez réessayer avec une image plus petite ou plus nette.'));
    }, timeoutMs);
  });

  const ocrPromise = (async () => {
    // Lazy load tesseract.js so it does not increase initial bundle weight
    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker('fra', 1, {
      logger: (m: any) => {
        if (m && m.status === 'recognizing text' && typeof m.progress === 'number') {
          const percent = Math.min(99, Math.round(m.progress * 100));
          if (onProgress) onProgress(percent);
        }
      },
    });

    try {
      const result = await worker.recognize(imageSource);
      return result.data.text ? result.data.text.trim() : '';
    } finally {
      await worker.terminate();
    }
  })();

  const text = await Promise.race([ocrPromise, timeoutPromise]);

  if (!text || text.length < 5) {
    throw new Error(
      'Aucun texte lisible n\'a pu être extrait de cette capture d\'écran. Veuillez vérifier que l\'image est nette et bien éclairée, ou collez directement le texte.'
    );
  }

  return text;
}
