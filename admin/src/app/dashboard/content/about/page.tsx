"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";

type AboutData = {
  id: string;
  isActive: boolean;
  heroSection?: {
    id: string;
    title: string;
    subtitle: string;
    isActive: boolean;
  } | null;
  heritageSection?: {
    id: string;
    title: string;
    content: string[];
    isActive: boolean;
  } | null;
  beyondSparkle?: {
    id: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string; icon: string }[];
    footerText?: string;
    isActive: boolean;
  } | null;
  celebrations?: {
    id: string;
    title: string;
    content: string[];
    collections: string[];
    isActive: boolean;
  } | null;
  gemologist?: {
    id: string;
    name: string;
    title: string;
    company: string;
    expertise: string[];
    messageTitle: string;
    message: string[];
    signature: string;
    isActive: boolean;
  } | null;
  knowledge?: {
    id: string;
    title: string;
    subtitle: string;
    content: string[];
    isActive: boolean;
  } | null;
  promise?: {
    id: string;
    title: string;
    promises: string[];
    isActive: boolean;
  } | null;
  brandPromise?: {
    id: string;
    brandName: string;
    tagline: string;
    buttonText: string;
    buttonLink?: string;
    isActive: boolean;
  } | null;
} | null;

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(null);
  const [activeTab, setActiveTab] = useState("hero");
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    heroSection: { title: "", subtitle: "", isActive: true },
    heritageSection: { title: "", content: [""], isActive: true },
    beyondSparkle: { title: "", subtitle: "", items: [{ title: "", description: "", icon: "" }], footerText: "", isActive: true },
    celebrations: { title: "", content: [""], collections: [""], isActive: true },
    gemologist: { name: "", title: "", company: "", expertise: [""], messageTitle: "", message: [""], signature: "", isActive: true },
    knowledge: { title: "", subtitle: "", content: [""], isActive: true },
    promise: { title: "", promises: [""], isActive: true },
    brandPromise: { brandName: "", tagline: "", buttonText: "", buttonLink: "", isActive: true }
  });

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
        if (d) {
          setForm({
            heroSection: { 
              title: d.heroSection?.title || "", 
              subtitle: d.heroSection?.subtitle || "", 
              isActive: d.heroSection?.isActive ?? true 
            },
            heritageSection: { 
              title: d.heritageSection?.title || "", 
              content: d.heritageSection?.content || [""], 
              isActive: d.heritageSection?.isActive ?? true 
            },
            beyondSparkle: { 
              title: d.beyondSparkle?.title || "", 
              subtitle: d.beyondSparkle?.subtitle || "", 
              items: d.beyondSparkle?.items || [{ title: "", description: "", icon: "" }],
              footerText: d.beyondSparkle?.footerText || "",
              isActive: d.beyondSparkle?.isActive ?? true 
            },
            celebrations: { 
              title: d.celebrations?.title || "", 
              content: d.celebrations?.content || [""], 
              collections: d.celebrations?.collections || [""],
              isActive: d.celebrations?.isActive ?? true 
            },
            gemologist: { 
              name: d.gemologist?.name || "", 
              title: d.gemologist?.title || "", 
              company: d.gemologist?.company || "",
              expertise: d.gemologist?.expertise || [""],
              messageTitle: d.gemologist?.messageTitle || "",
              message: d.gemologist?.message || [""],
              signature: d.gemologist?.signature || "",
              isActive: d.gemologist?.isActive ?? true 
            },
            knowledge: { 
              title: d.knowledge?.title || "", 
              subtitle: d.knowledge?.subtitle || "", 
              content: d.knowledge?.content || [""], 
              isActive: d.knowledge?.isActive ?? true 
            },
            promise: { 
              title: d.promise?.title || "", 
              promises: d.promise?.promises || [""], 
              isActive: d.promise?.isActive ?? true 
            },
            brandPromise: { 
              brandName: d.brandPromise?.brandName || "", 
              tagline: d.brandPromise?.tagline || "", 
              buttonText: d.brandPromise?.buttonText || "",
              buttonLink: d.brandPromise?.buttonLink || "",
              isActive: d.brandPromise?.isActive ?? true 
            }
          });
        }
      } else {
        toast.error(typeof result.message === "string" ? result.message : "Failed to load about page");
      }
    } catch (error) {
      toast.error("Failed to fetch about page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [field]: value }
    }));
  };

  const handleArrayChange = (section: string, field: string, index: number, value: string) => {
    setForm(prev => {
      const newArray = [...(prev[section as keyof typeof prev] as any)[field]];
      newArray[index] = value;
      return {
        ...prev,
        [section]: { ...prev[section as keyof typeof prev], [field]: newArray }
      };
    });
  };

  const addArrayItem = (section: string, field: string) => {
    setForm(prev => {
      const newArray = [...(prev[section as keyof typeof prev] as any)[field]];
      newArray.push("");
      return {
        ...prev,
        [section]: { ...prev[section as keyof typeof prev], [field]: newArray }
      };
    });
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setForm(prev => {
      const newArray = [...(prev[section as keyof typeof prev] as any)[field]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [section]: { ...prev[section as keyof typeof prev], [field]: newArray }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        heroSection: form.heroSection,
        heritageSection: form.heritageSection,
        beyondSparkle: form.beyondSparkle,
        celebrations: form.celebrations,
        gemologist: form.gemologist,
        knowledge: form.knowledge,
        promise: form.promise,
        brandPromise: form.brandPromise
      };

      const result: any = await axiosInstance.post("/api/about", payload);
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

  const tabs = [
    { id: "hero", label: "Hero Section" },
    { id: "heritage", label: "Heritage Section" },
    { id: "sparkle", label: "Beyond Sparkle" },
    { id: "celebrations", label: "Celebrations" },
    { id: "gemologist", label: "Gemologist" },
    { id: "knowledge", label: "Knowledge" },
    { id: "promise", label: "Promise" },
    { id: "brand", label: "Brand Promise" }
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="About">
        <div className="p-6">
          <div className="py-20 text-center text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="About">
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "hero" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={form.heroSection.title}
                    onChange={(e) => handleChange("heroSection", "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter hero title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={form.heroSection.subtitle}
                    onChange={(e) => handleChange("heroSection", "subtitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    placeholder="Enter hero subtitle"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="heroActive"
                    checked={form.heroSection.isActive}
                    onChange={(e) => handleChange("heroSection", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="heroActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}

            {activeTab === "heritage" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Heritage Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={form.heritageSection.title}
                    onChange={(e) => handleChange("heritageSection", "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter heritage title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Paragraphs</label>
                  {form.heritageSection.content.map((paragraph, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        value={paragraph}
                        onChange={(e) => handleArrayChange("heritageSection", "content", index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                        placeholder={`Paragraph ${index + 1}`}
                      />
                      {form.heritageSection.content.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("heritageSection", "content", index)}
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem("heritageSection", "content")}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Paragraph
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="heritageActive"
                    checked={form.heritageSection.isActive}
                    onChange={(e) => handleChange("heritageSection", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="heritageActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}

            {activeTab === "gemologist" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Gemologist Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={form.gemologist.name}
                      onChange={(e) => handleChange("gemologist", "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter gemologist name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={form.gemologist.title}
                      onChange={(e) => handleChange("gemologist", "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter title"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={form.gemologist.company}
                    onChange={(e) => handleChange("gemologist", "company", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
                  {form.gemologist.expertise.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange("gemologist", "expertise", index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Expertise ${index + 1}`}
                      />
                      {form.gemologist.expertise.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("gemologist", "expertise", index)}
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem("gemologist", "expertise")}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Expertise
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Title</label>
                  <input
                    type="text"
                    value={form.gemologist.messageTitle}
                    onChange={(e) => handleChange("gemologist", "messageTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter message title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Paragraphs</label>
                  {form.gemologist.message.map((paragraph, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        value={paragraph}
                        onChange={(e) => handleArrayChange("gemologist", "message", index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                        placeholder={`Message paragraph ${index + 1}`}
                      />
                      {form.gemologist.message.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("gemologist", "message", index)}
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem("gemologist", "message")}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Paragraph
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                  <input
                    type="text"
                    value={form.gemologist.signature}
                    onChange={(e) => handleChange("gemologist", "signature", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter signature"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gemologistActive"
                    checked={form.gemologist.isActive}
                    onChange={(e) => handleChange("gemologist", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="gemologistActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}

            {activeTab === "sparkle" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Beyond Sparkle Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={form.beyondSparkle.title}
                    onChange={(e) => handleChange("beyondSparkle", "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={form.beyondSparkle.subtitle}
                    onChange={(e) => handleChange("beyondSparkle", "subtitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    placeholder="Enter subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Items</label>
                  {form.beyondSparkle.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) => {
                              const newItems = [...form.beyondSparkle.items];
                              newItems[index].icon = e.target.value;
                              handleChange("beyondSparkle", "items", newItems);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="🌍"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...form.beyondSparkle.items];
                              newItems[index].title = e.target.value;
                              handleChange("beyondSparkle", "items", newItems);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Item title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...form.beyondSparkle.items];
                              newItems[index].description = e.target.value;
                              handleChange("beyondSparkle", "items", newItems);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Item description"
                          />
                        </div>
                      </div>
                      {form.beyondSparkle.items.length > 1 && (
                        <button
                          onClick={() => {
                            const newItems = form.beyondSparkle.items.filter((_, i) => i !== index);
                            handleChange("beyondSparkle", "items", newItems);
                          }}
                          className="mt-2 px-3 py-1 text-red-600 bg-red-50 rounded text-sm hover:bg-red-100"
                        >
                          Remove Item
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...form.beyondSparkle.items, { title: "", description: "", icon: "" }];
                      handleChange("beyondSparkle", "items", newItems);
                    }}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Item
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                  <textarea
                    value={form.beyondSparkle.footerText}
                    onChange={(e) => handleChange("beyondSparkle", "footerText", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                    placeholder="Enter footer text (optional)"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sparkleActive"
                    checked={form.beyondSparkle.isActive}
                    onChange={(e) => handleChange("beyondSparkle", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sparkleActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}

            {activeTab === "celebrations" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Celebrations Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={form.celebrations.title}
                    onChange={(e) => handleChange("celebrations", "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Paragraphs</label>
                  {form.celebrations.content.map((paragraph, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        value={paragraph}
                        onChange={(e) => handleArrayChange("celebrations", "content", index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                        placeholder={`Paragraph ${index + 1}`}
                      />
                      {form.celebrations.content.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("celebrations", "content", index)}
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem("celebrations", "content")}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Paragraph
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collections</label>
                  {form.celebrations.collections.map((collection, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={collection}
                        onChange={(e) => handleArrayChange("celebrations", "collections", index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Collection ${index + 1}`}
                      />
                      {form.celebrations.collections.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("celebrations", "collections", index)}
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem("celebrations", "collections")}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Collection
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="celebrationsActive"
                    checked={form.celebrations.isActive}
                    onChange={(e) => handleChange("celebrations", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="celebrationsActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}

            {activeTab === "knowledge" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Knowledge Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={form.knowledge.title}
                    onChange={(e) => handleChange("knowledge", "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={form.knowledge.subtitle}
                    onChange={(e) => handleChange("knowledge", "subtitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    placeholder="Enter subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Paragraphs</label>
                  {form.knowledge.content.map((paragraph, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        value={paragraph}
                        onChange={(e) => handleArrayChange("knowledge", "content", index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                        placeholder={`Paragraph ${index + 1}`}
                      />
                      {form.knowledge.content.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("knowledge", "content", index)}
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem("knowledge", "content")}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Paragraph
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="knowledgeActive"
                    checked={form.knowledge.isActive}
                    onChange={(e) => handleChange("knowledge", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="knowledgeActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}

            {activeTab === "promise" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Promise Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={form.promise.title}
                    onChange={(e) => handleChange("promise", "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promises</label>
                  {form.promise.promises.map((promise, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={promise}
                        onChange={(e) => handleArrayChange("promise", "promises", index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Promise ${index + 1}`}
                      />
                      {form.promise.promises.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("promise", "promises", index)}
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem("promise", "promises")}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Promise
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="promiseActive"
                    checked={form.promise.isActive}
                    onChange={(e) => handleChange("promise", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="promiseActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}

            {activeTab === "brand" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Brand Promise Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={form.brandPromise.brandName}
                      onChange={(e) => handleChange("brandPromise", "brandName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={form.brandPromise.buttonText}
                      onChange={(e) => handleChange("brandPromise", "buttonText", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter button text"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <textarea
                    value={form.brandPromise.tagline}
                    onChange={(e) => handleChange("brandPromise", "tagline", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    placeholder="Enter tagline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                  <input
                    type="text"
                    value={form.brandPromise.buttonLink}
                    onChange={(e) => handleChange("brandPromise", "buttonLink", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter button link (optional)"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="brandActive"
                    checked={form.brandPromise.isActive}
                    onChange={(e) => handleChange("brandPromise", "isActive", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="brandActive" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
                {saving ? "Saving..." : "Save All"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
