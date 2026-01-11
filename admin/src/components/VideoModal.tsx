"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Upload, FileText, Video } from "lucide-react";

interface VideoForm {
  title?: string;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initialData?: { id: string; title?: string | null; videoUrl?: string | null } | null;
}

export default function VideoModal({ isOpen, onClose, onSave, initialData }: VideoModalProps) {
  const [form, setForm] = useState<VideoForm>({ title: "" });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ title: "" });
      setVideoFile(null);
      setPreview(null);
      return;
    }
    if (initialData) {
      setForm({ title: initialData.title || "" });
      setPreview(initialData.videoUrl || null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
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
    if (!initialData && !videoFile) {
      toast.error("Please select a video file");
      return;
    }
    const data = new FormData();
    if (form.title) data.append("title", form.title);
    if (videoFile) data.append("video", videoFile);
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Video</h2>
            <p className="text-sm text-gray-600">Upload promotional or content video</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Enter title"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {preview ? (
                <video src={preview} controls className="mx-auto max-h-48 rounded-lg" />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Video className="w-10 h-10 mb-2" />
                  <p className="text-sm">Upload a video</p>
                </div>
              )}
              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Select Video</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
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
