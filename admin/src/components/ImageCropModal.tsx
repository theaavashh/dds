'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, Loader2 } from 'lucide-react';

interface ImageCropModalProps {
    image: string;
    aspect?: number; // Made optional
    onClose: () => void;
    onCropComplete: (croppedImage: Blob) => void;
    title?: string;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    image,
    aspect,
    onClose,
    onCropComplete,
    title = 'Crop Image'
}) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;

        let initialCrop: Crop;
        if (aspect) {
            initialCrop = centerCrop(
                makeAspectCrop(
                    {
                        unit: '%',
                        width: 90,
                    },
                    aspect,
                    width,
                    height
                ),
                width,
                height
            );
        } else {
            initialCrop = centerCrop(
                {
                    unit: '%',
                    width: 90,
                    height: 90,
                },
                width,
                height
            );
        }
        setCrop(initialCrop);
    }

    async function handleCropSave() {
        if (completedCrop && imgRef.current) {
            setIsProcessing(true);
            try {
                const blob = await getCroppedImg(imgRef.current, completedCrop);
                onCropComplete(blob);
            } catch (e) {
                console.error('Error cropping image:', e);
            } finally {
                setIsProcessing(false);
            }
        }
    }

    function getCroppedImg(image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x * scaleX,
            pixelCrop.y * scaleY,
            pixelCrop.width * scaleX,
            pixelCrop.height * scaleY,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative flex-1 bg-gray-100 overflow-auto p-8 flex justify-center items-start min-h-[400px]">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        className="shadow-lg"
                    >
                        <img
                            ref={imgRef}
                            src={image}
                            alt="Crop me"
                            onLoad={onImageLoad}
                            className="max-w-full h-auto"
                            style={{ maxHeight: '60vh' }}
                        />
                    </ReactCrop>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-500 italic">Drag and resize the box to select the crop area.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCropSave}
                            disabled={!completedCrop || isProcessing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Apply Crop
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
