"use client";

import React, { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon, FileText } from "lucide-react";

interface ServiceForm {
  title: string;
  link?: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initialData?: { id: string; title: string; imageUrl?: string | null; link?: string | null } | null;
}

export default function ServiceModal({ isOpen, onClose, onSave, initialData }: ServiceModalProps) {
  const [form, setForm] = useState<ServiceForm>({ title: "", link: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ title: "", link: "" });
      setImageFile(null);
      setPreview(null);
      return;
    }
    if (initialData) {
      setForm({ title: initialData.title, link: initialData.link || "" });
      setPreview(initialData.imageUrl || null);
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
    data.append("title", form.title);
    if (form.link) data.append("link", form.link);
    if (imageFile) data.append("image", imageFile);
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Service</h2>
            <p className="text-sm text-gray-600">Upload image and title</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Enter title"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Optional Link</label>
            <input
              type="text"
              value={form.link || ""}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <p className="text-sm">Upload an image</p>
                </div>
              )}
              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Select Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-md">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
