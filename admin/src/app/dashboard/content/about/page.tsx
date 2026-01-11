"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";

type AboutData = {
  id: string;
  title: string;
  description: string;
  ctaLink?: string | null;
  ctaTitle?: string | null;
  isActive: boolean;
  createdAt: string;
} | null;

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(null);
  const [form, setForm] = useState({ title: "", description: "", ctaLink: "", ctaTitle: "", isActive: true });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    setIsLoading(true);
    try {
      const result: any = await axiosInstance.get("/api/about");
      if (result.success) {
        const d = result.data || null;
        setData(d);
        setForm({
          title: d?.title || "",
          description: d?.description || "",
          ctaLink: d?.ctaLink || "",
          ctaTitle: d?.ctaTitle || "",
          isActive: d?.isActive ?? true
        });
      } else {
        toast.error(typeof result.message === "string" ? result.message : "Failed to load about page");
      }
    } catch (error) {
      toast.error("Failed to fetch about page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      let result: any;
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        ctaLink: form.ctaLink.trim() || undefined,
        ctaTitle: form.ctaTitle.trim() || undefined,
        isActive: form.isActive
      };
      if (data?.id) {
        result = await axiosInstance.put(`/api/about/${data.id}`, payload);
      } else {
        result = await axiosInstance.post(`/api/about`, payload);
      }
      if (result.success) {
        toast.success("About page saved");
        setData(result.data);
      } else {
        toast.error(typeof result.message === "string" ? result.message : "Failed to save");
      }
    } catch (error) {
      toast.error("Error saving about page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="About">
      <div className="p-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="py-20 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[140px]"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                  <input
                    type="url"
                    value={form.ctaLink}
                    onChange={(e) => handleChange("ctaLink", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Title</label>
                  <input
                    type="text"
                    value={form.ctaTitle}
                    onChange={(e) => handleChange("ctaTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Learn More"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active</label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={fetchAbout}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={saving}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
