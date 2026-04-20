"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClient } from "@/context/ClientContext";

type PlatformType = "facebook" | "instagram" | "linkedin" | "youtube";
type PostFormat = "feed" | "story" | "reels" | "carousel";

interface PlatformSettings {
  enabled: boolean;
  captionOverride: string;
  useOverride: boolean;
  linkUrl?: string;
  isReel?: boolean;
}

export default function CreatePostPage() {
  const { activeClient } = useClient();
  const [globalCaption, setGlobalCaption] = useState("");
  const [postFormat, setPostFormat] = useState<PostFormat>("feed");
  const [platforms, setPlatforms] = useState<Record<PlatformType, PlatformSettings>>({
    facebook: { enabled: true, captionOverride: "", useOverride: false, linkUrl: "" },
    instagram: { enabled: true, captionOverride: "", useOverride: false, isReel: false },
    linkedin: { enabled: false, captionOverride: "", useOverride: false },
    youtube: { enabled: false, captionOverride: "", useOverride: false },
  });
  
  const [activeTab, setActiveTab] = useState<PlatformType>("facebook");
  const [scheduledDate, setScheduledDate] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [firstComment, setFirstComment] = useState("");
  const [locationName, setLocationName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const backendUrl = "https://unbiased-sponge-workable.ngrok-free.app";

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        const localPreview = URL.createObjectURL(file);
        setPreviewUrls(prev => [...prev, localPreview]);
        const formData = new FormData();
        formData.append("file", file);
        try {
          const response = await fetch(`${backendUrl}/api/media/upload`, {
            method: "POST",
            headers: { "ngrok-skip-browser-warning": "true" },
            body: formData,
          });
          const data = await response.json();
          if (data.status === "success") {
             setMedia(prev => [...prev, data.url]);
          }
        } catch (err) {
          console.error("Upload failed:", err);
        }
      }
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const togglePlatform = (id: PlatformType) => {
    setPlatforms(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled }
    }));
  };

  const updatePlatformSetting = (id: PlatformType, key: keyof PlatformSettings, value: any) => {
    setPlatforms(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: value }
    }));
  };

  const handleSubmit = async (isImmediate = false) => {
    if (!activeClient) return;
    if (!globalCaption || media.length === 0) {
      setSubmitStatus({ type: 'error', message: 'Add media and caption first.' });
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    const activePlatformIds = Object.entries(platforms).filter(([_, data]) => data.enabled).map(([id]) => id);
    const captionOverrides: Record<string, string> = {};
    const platformData: Record<string, any> = {};
    Object.entries(platforms).forEach(([id, data]) => {
      if (data.enabled) {
        if (data.useOverride && data.captionOverride) captionOverrides[id] = data.captionOverride;
        platformData[id] = { is_story: postFormat === "story", is_reel: postFormat === "reels" || data.isReel, link: id === "facebook" ? data.linkUrl : undefined };
      }
    });
    const schedTime = isImmediate ? null : (scheduledDate ? new Date(scheduledDate).toISOString() : null); 
    try {
      const response = await fetch(`${backendUrl}/api/posts/?client_id=${activeClient.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ title: "Post", content_type: postFormat, caption: globalCaption, caption_overrides: captionOverrides, platform_data: platformData, scheduled_at: schedTime, publish_now: isImmediate, platforms: activePlatformIds, media_urls: media, first_comment: firstComment, location_name: locationName, thumbnail_url: thumbnailUrl }),
      });
      if (!response.ok) throw new Error("Post failed");
      setSubmitStatus({ type: 'success', message: isImmediate ? 'Published!' : 'Scheduled!' });
      setGlobalCaption(""); setMedia([]); setPreviewUrls([]);
    } catch (err) {
      setSubmitStatus({ type: 'error', message: 'Error posting.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col text-gray-900 selection:bg-yellow-200 uppercase tracking-tight">
      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/workspace" className="text-gray-400 hover:text-black transition-all font-bold text-sm">
            &larr; Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <h1 className="text-sm font-black tracking-tight uppercase">Create Post <span className="text-gray-300">— {activeClient?.name}</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="btn-simple btn-white text-xs">Save Draft</button>
          <button onClick={() => handleSubmit(true)} disabled={isSubmitting} className="btn-simple btn-yellow text-xs shadow-md shadow-yellow-500/10">Post Now</button>
        </div>
      </header>

      {submitStatus && <div className={`p-3 text-center text-xs font-bold ${submitStatus.type === 'success' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-50 text-red-600'}`}>{submitStatus.message}</div>}

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[55%] overflow-y-auto p-6 md:p-10 bg-white">
          <div className="max-w-xl mx-auto space-y-10 pb-20">
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Format</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {['feed', 'story', 'reels', 'carousel'].map((f) => (
                    <button key={f} onClick={() => setPostFormat(f as any)} className={`p-4 rounded-xl border text-center transition-all ${postFormat === f ? 'bg-yellow-50 border-yellow-400 ring-4 ring-yellow-400/10' : 'bg-white border-gray-100'}`}>
                      <div className="font-bold text-[11px] uppercase">{f}</div>
                    </button>
                 ))}
              </div>
            </section>

            <section className="simple-card p-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Media</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="h-32 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden relative">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => removeMedia(idx)} className="absolute top-1 right-1 bg-white p-1 rounded-full text-xs font-bold shadow-sm">✕</button>
                  </div>
                ))}
                <button onClick={() => document.getElementById('media-upload')?.click()} className="h-32 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1">
                  <span className="text-xl text-gray-300">+</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Upload</span>
                </button>
              </div>
              <input id="media-upload" type="file" multiple className="hidden" onChange={handleMediaChange} />
            </section>

            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Post to</h2>
              <div className="flex gap-2">
                {(Object.keys(platforms) as PlatformType[]).map((id) => (
                  <button key={id} onClick={() => togglePlatform(id)} className={`px-5 py-2 rounded-full font-bold text-xs ${platforms[id].enabled ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>{id.toUpperCase()}</button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Caption</h2>
              <textarea value={globalCaption} onChange={(e) => setGlobalCaption(e.target.value)} placeholder="Write something..." className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all font-medium" />
            </section>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 relative">
          <div className="w-[320px] h-[640px] bg-black rounded-[2.5rem] border-[6px] border-[#222] shadow-2xl overflow-hidden relative flex flex-col">
             <div className="flex-1 bg-white text-black pt-8">
               <div className="px-3 py-2 text-[10px] font-bold italic uppercase">{activeClient?.name}</div>
               {previewUrls.length > 0 && <img src={previewUrls[0]} className="w-full aspect-square object-cover" />}
               <div className="p-3 text-[10px]">{globalCaption || "Preview text..."}</div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
