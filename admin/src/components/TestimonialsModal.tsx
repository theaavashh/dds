"use client";

import React, { useEffect, useState } from "react";
import { X, Upload, Trash2, User, FileText, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface TestimonialForm {
  customerName: string;
  description: string;
}

interface TestimonialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initialData?: { id: string; customerName: string; description: string; imageUrl?: string | null } | null;
}

export default function TestimonialsModal({ isOpen, onClose, onSave, initialData }: TestimonialsModalProps) {
  const [form, setForm] = useState<TestimonialForm>({ customerName: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ customerName: "", description: "" });
      setImageFile(null);
      setPreview(null);
      return;
    }
    if (initialData) {
      setForm({ customerName: initialData.customerName, description: initialData.description });
      if (initialData.imageUrl) {
        setPreview(getImageUrl(initialData.imageUrl));
      } else {
        setPreview(null);
      }
    } else {
      setForm({ customerName: "", description: "" });
      setPreview(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("customerName", form.customerName);
    data.append("description", form.description);
    if (imageFile) data.append("image", imageFile);
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-black custom-font">Add Testimonial</h2>
            <p className="text-sm text-gray-600">Upload client image and details</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Customer Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full text-black placeholder-black pl-10 pr-4 py-2.5  border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Enter customer name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-black placeholder-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                rows={5}
                placeholder="Write the testimonial content"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Client Image</label>
            {preview ? (
              <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setPreview(null); }}
                    className="bg-white text-red-500 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-gray-700">Click to upload image</p>
                  <p className="text-xs text-gray-500">PNG, JPG or GIF</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" form="" onClick={handleSubmit as any} className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 shadow-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
