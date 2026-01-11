import React, { useState, useEffect } from 'react';
import { X, Upload, Type, Image as ImageIcon, Layout, Trash2, Palette, Check, RotateCcw } from 'lucide-react';
import Cropper from 'react-easy-crop';

interface HeroSectionData {
  desktopImageUrl?: string;
  mobileImageUrl?: string;
}

interface HeroSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: HeroSectionData;
  onSave: (data: FormData) => void;
}

export default function HeroSectionModal({ isOpen, onClose, initialData, onSave }: HeroSectionModalProps) {
  const [formData, setFormData] = useState<HeroSectionData>({
    desktopImageUrl: '',
    mobileImageUrl: '',
  });

  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  
  // Previews
  const [desktopImagePreview, setDesktopImagePreview] = useState<string | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);
  
  // Cropping state
  const [croppingImage, setCroppingImage] = useState<'desktop' | 'mobile' | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<null | any>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // Set initial previews for desktop and mobile images
      if (initialData.desktopImageUrl) {
        setDesktopImagePreview(initialData.desktopImageUrl);
      }
      
      if (initialData.mobileImageUrl) {
        setMobileImagePreview(initialData.mobileImageUrl);
      }
    }
  }, [initialData]);

  if (!isOpen) return null;

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void, setPreview: (s: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = (imageSrc: string, crop: any): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context is not available'));
          return;
        }

        const pixelRatio = window.devicePixelRatio;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height,
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        }, 'image/jpeg');
      };

      image.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleCropImage = async () => {
    if (!croppingImage) return;
    
    try {
      const imagePreview = croppingImage === 'desktop' ? desktopImagePreview : mobileImagePreview;
      if (!imagePreview || !croppedAreaPixels) return;
      
      const croppedBlob = await getCroppedImg(imagePreview, croppedAreaPixels);
      if (!croppedBlob) return;
      
      const fileName = croppingImage === 'desktop' ? 'desktop-cropped.jpg' : 'mobile-cropped.jpg';
      const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
      
      if (croppingImage === 'desktop') {
        setDesktopImageFile(croppedFile);
        setDesktopImagePreview(URL.createObjectURL(croppedBlob));
      } else {
        setMobileImageFile(croppedFile);
        setMobileImagePreview(URL.createObjectURL(croppedBlob));
      }
      
      // Reset cropping state
      setCroppingImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleCancelCrop = () => {
    setCroppingImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('desktopImageUrl', formData.desktopImageUrl || '');
    data.append('mobileImageUrl', formData.mobileImageUrl || '');

    if (desktopImageFile) data.append('desktopImage', desktopImageFile);
    if (mobileImageFile) data.append('mobileImage', mobileImageFile);

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 ">
          <div>
            <h2 className="text-xl font-bold text-gray-900 custom-font">Add Hero Section</h2>
            <p className="text-sm text-black">Configure the left and right split content</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-black hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="hero-form" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="p-2 rounded-lg">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 custom-font">Hero Section Images</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desktop Image */}
                <div>
                  <label className="block text-md font-medium text-black uppercase mb-2">Desktop Image</label>
                  <div className="space-y-3">
                    {desktopImagePreview && croppingImage !== 'desktop' ? (
                      <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={getImageUrl(desktopImagePreview)} alt="Desktop Preview" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => setCroppingImage('desktop')}
                            className="bg-white text-blue-600 px-3 py-1.5 rounded-lg font-medium shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-4 h-4" /> Crop
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setDesktopImageFile(null); setDesktopImagePreview(null); setFormData({...formData, desktopImageUrl: ''}); }}
                            className="bg-white text-red-500 px-3 py-1.5 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-blue-500" />
                          </div>
                          <p className="mb-1 text-sm font-medium text-gray-700">Click to upload desktop image</p>
                          <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setDesktopImageFile, setDesktopImagePreview)}
                        />
                      </label>
                    )}
                    
                    {/* Cropping UI for desktop image */}
                    {croppingImage === 'desktop' && desktopImagePreview && (
                      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Crop Desktop Image</h3>
                            <button 
                              onClick={handleCancelCrop}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                          
                          <div className="relative w-full h-96 bg-black/10 rounded-lg overflow-hidden">
                            <Cropper
                              image={desktopImagePreview}
                              crop={crop}
                              zoom={zoom}
                              aspect={16 / 9} // Default aspect ratio, can be adjusted
                              onCropChange={setCrop}
                              onZoomChange={setZoom}
                              onCropComplete={onCropComplete}
                            />
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">Zoom:</label>
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-32"
                              />
                              <span className="text-sm text-gray-600 w-10">{zoom.toFixed(1)}x</span>
                            </div>
                            
                            <div className="flex gap-3">
                              <button
                                onClick={handleCancelCrop}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCropImage}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" /> Apply Crop
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Image */}
                <div>
                  <label className="block text-md font-medium text-black uppercase mb-2">Mobile Image</label>
                  <div className="space-y-3">
                    {mobileImagePreview && croppingImage !== 'mobile' ? (
                      <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={getImageUrl(mobileImagePreview)} alt="Mobile Preview" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => setCroppingImage('mobile')}
                            className="bg-white text-blue-600 px-3 py-1.5 rounded-lg font-medium shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-4 h-4" /> Crop
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setMobileImageFile(null); setMobileImagePreview(null); setFormData({...formData, mobileImageUrl: ''}); }}
                            className="bg-white text-red-500 px-3 py-1.5 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-purple-500" />
                          </div>
                          <p className="mb-1 text-sm font-medium text-gray-700">Click to upload mobile image</p>
                          <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setMobileImageFile, setMobileImagePreview)}
                        />
                      </label>
                    )}
                    
                    {/* Cropping UI for mobile image */}
                    {croppingImage === 'mobile' && mobileImagePreview && (
                      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Crop Mobile Image</h3>
                            <button 
                              onClick={handleCancelCrop}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                          
                          <div className="relative w-full h-96 bg-black/10 rounded-lg overflow-hidden">
                            <Cropper
                              image={mobileImagePreview}
                              crop={crop}
                              zoom={zoom}
                              aspect={9 / 16} // Portrait aspect ratio for mobile
                              onCropChange={setCrop}
                              onZoomChange={setZoom}
                              onCropComplete={onCropComplete}
                            />
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">Zoom:</label>
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-32"
                              />
                              <span className="text-sm text-gray-600 w-10">{zoom.toFixed(1)}x</span>
                            </div>
                            
                            <div className="flex gap-3">
                              <button
                                onClick={handleCancelCrop}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCropImage}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" /> Apply Crop
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="hero-form"
            className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors shadow-lg shadow-black/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}