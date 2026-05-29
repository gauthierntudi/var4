"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/crop-image";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

type InscriptionPhotoFieldProps = {
  value: File | null;
  previewUrl: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
};

export function InscriptionPhotoField({
  value,
  previewUrl,
  onChange,
}: InscriptionPhotoFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const resetCropState = useCallback(() => {
    setCropSource(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const revokeIfBlob = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const openFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
        setError("Format non pris en charge. Utilisez JPG, PNG ou WebP.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("La photo ne doit pas dépasser 8 Mo.");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCropSource(objectUrl);
    },
    [],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) openFile(file);
    },
    [openFile],
  );

  const onDragEnter = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const cancelCrop = () => {
    if (cropSource) revokeIfBlob(cropSource);
    resetCropState();
  };

  const confirmCrop = async () => {
    if (!cropSource || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedImageBlob(cropSource, croppedAreaPixels);
      const file = new File([blob], "photo-var4.jpg", { type: "image/jpeg" });
      const nextPreview = URL.createObjectURL(blob);

      revokeIfBlob(previewUrl);
      revokeIfBlob(cropSource);
      onChange(file, nextPreview);
      resetCropState();
      setError(null);
    } catch {
      setError("Impossible de recadrer la photo. Réessayez.");
    }
  };

  const removePhoto = () => {
    revokeIfBlob(previewUrl);
    onChange(null, null);
    setError(null);
  };

  const replacePhoto = () => {
    inputRef.current?.click();
  };

  return (
    <div className="inscription-photo">
      <div className="inscription-photo__header">
        <label className="inscription-photo__label" htmlFor={inputId}>
          Photo
        </label>
        <span className="inscription-photo__hint">Portrait · recadrage inclus</span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="inscription-photo__input"
        onChange={onInputChange}
      />

      {previewUrl ? (
        <div className="inscription-photo__preview">
          <div className="inscription-photo__preview-frame">
            {/* Blob preview — next/image incompatible with object URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Aperçu de votre photo" className="inscription-photo__preview-image" />
          </div>
          <div className="inscription-photo__preview-meta">
            <p className="inscription-photo__preview-name">{value?.name ?? "photo-var4.jpg"}</p>
            <p className="inscription-photo__preview-note">Photo prête à être jointe à votre inscription.</p>
          </div>
          <div className="inscription-photo__preview-actions">
            <button type="button" className="inscription-photo__ghost-btn" onClick={replacePhoto}>
              Changer
            </button>
            <button type="button" className="inscription-photo__ghost-btn inscription-photo__ghost-btn--danger" onClick={removePhoto}>
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`inscription-photo__dropzone ${isDragging ? "is-dragging" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <span className="inscription-photo__dropzone-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V8M12 8L9 11M12 8L15 11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16.5V18.5C4 19.3284 4.67157 20 5.5 20H18.5C19.3284 20 20 19.3284 20 18.5V16.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
              <path
                d="M4 16.5L8.2 12.3C8.6 11.9 9.2 11.9 9.6 12.3L13.2 15.9C13.6 16.3 14.2 16.3 14.6 15.9L16.8 13.7C17.2 13.3 17.8 13.3 18.2 13.7L20 15.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="inscription-photo__dropzone-title">Glissez votre photo ici</span>
          <span className="inscription-photo__dropzone-text">ou cliquez pour parcourir · JPG, PNG, WebP</span>
        </button>
      )}

      {error ? <p className="inscription-photo__error">{error}</p> : null}

      {cropSource ? (
        <div className="inscription-photo__cropper" role="dialog" aria-modal="true" aria-label="Recadrer la photo">
          <div className="inscription-photo__cropper-backdrop" onClick={cancelCrop} aria-hidden />

          <div className="inscription-photo__cropper-panel">
            <div className="inscription-photo__cropper-head">
              <div>
                <p className="inscription-photo__cropper-title">Recadrer</p>
                <p className="inscription-photo__cropper-subtitle">Ajustez le cadrage de votre portrait</p>
              </div>
              <button type="button" className="inscription-photo__cropper-close" onClick={cancelCrop} aria-label="Annuler le recadrage">
                ✕
              </button>
            </div>

            <div className="inscription-photo__cropper-stage">
              <Cropper
                image={cropSource}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="inscription-photo__zoom">
              <label htmlFor={`${inputId}-zoom`}>Zoom</label>
              <input
                id={`${inputId}-zoom`}
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </div>

            <div className="inscription-photo__cropper-actions">
              <button type="button" className="inscription-photo__ghost-btn" onClick={cancelCrop}>
                Annuler
              </button>
              <button type="button" className="inscription-photo__confirm-btn" onClick={confirmCrop}>
                Valider la photo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
