import { useRef, useState, useCallback } from 'react';
import { fileToDataUrl, getFileSizeLabel } from '../services/imageUtils';

interface ImagePickerProps {
  imageDataUrl: string | null;
  onImageSelected: (dataUrl: string) => void;
  onImageCleared: () => void;
}

export function ImagePicker({ imageDataUrl, onImageSelected, onImageCleared }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Välj en bildfil (JPG, PNG, HEIC osv.)');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('Bilden är för stor (max 25 MB)');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      onImageSelected(dataUrl);
    } catch {
      setError('Kunde inte läsa bilden. Försök igen.');
    }
  }, [onImageSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleZoneClick = useCallback(() => {
    if (!imageDataUrl) {
      fileInputRef.current?.click();
    }
  }, [imageDataUrl]);

  return (
    <div>
      <div
        className={`image-picker-zone ${dragOver ? 'drag-over' : ''} ${imageDataUrl ? 'has-image' : ''}`}
        onClick={handleZoneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {imageDataUrl ? (
          <>
            <img src={imageDataUrl} alt="Scoutingbild" />
            <div className="image-size-badge">{getFileSizeLabel(imageDataUrl)}</div>
            <div className="image-overlay-actions">
              <button
                className="btn btn-secondary btn-sm btn-icon-sm"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                title="Byt bild"
              >
                🔄
              </button>
              <button
                className="btn btn-secondary btn-sm btn-icon-sm"
                onClick={(e) => { e.stopPropagation(); onImageCleared(); }}
                title="Ta bort bild"
              >
                ✕
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="image-picker-empty-icon">📷</div>
            <div className="image-picker-empty-text">Tryck för att välja bild</div>
            <div className="image-picker-empty-hint">eller dra och släpp här</div>
          </>
        )}
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: 10 }}>
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <div className="error-message">{error}</div>
          </div>
        </div>
      )}

      {!imageDataUrl && (
        <div className="image-picker-actions">
          <button className="btn btn-secondary" onClick={() => cameraInputRef.current?.click()}>
            <span>📸</span> Ta bild
          </button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <span>🖼️</span> Välj bild
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    </div>
  );
}
