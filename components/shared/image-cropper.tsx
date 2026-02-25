"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area, Point } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { FaX, FaMinus, FaPlus } from "react-icons/fa6";

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspect?: number;
}

export function ImageCropper({
  imageSrc,
  onCancel,
  onCropComplete,
  aspect = 1,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompletion = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createCroppedImage = async () => {
    try {
      if (!croppedAreaPixels) return;
      setIsCropping(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-100/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-primary-100 z-10 bg-white">
          <h3 className="heading-4 text-primary-900">Adjust Photo</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-primary-100 rounded-full transition-colors text-primary-500"
          >
            <FaX className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-[400px] w-full bg-primary-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompletion}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={false}
            classes={{
              containerClassName: "bg-primary-100",
              cropAreaClassName:
                "border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]",
            }}
          />
        </div>

        <div className="p-6 space-y-6 bg-white z-10">
          <div className="flex items-center gap-4">
            <FaMinus className="size-5 text-brand-400" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-primary-200 rounded-lg transition-all appearance-none cursor-pointer accent-brand-500 focus:outline-none"
            />
            <FaPlus className="size-5 text-brand-400" />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              className="flex-1 rounded-xl"
              onClick={createCroppedImage}
              disabled={isCropping}
            >
              {isCropping ? "Saving..." : "Apply"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.95,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
