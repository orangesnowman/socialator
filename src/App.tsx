/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Link as LinkIcon, Check, Copy, ExternalLink } from 'lucide-react';
import { Design, Language } from './types';
import { getTranslation } from './translations';
import { INITIAL_DESIGNS } from './data/initialDesigns';
import { LanguageToggle } from './components/LanguageToggle';
import { FacebookPreview } from './components/FacebookPreview';
import { SavedDesignsBar } from './components/SavedDesignsBar';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const t = getTranslation(language);

  // Active form state
  const [currentId, setCurrentId] = useState<string>('elevate-space-1');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop'
  );
  const [title, setTitle] = useState<string>('Elevate Your Space');
  const [description, setDescription] = useState<string>('Timeless design. Thoughtful living.');
  const [destinationUrl, setDestinationUrl] = useState<string>('https://your-website.com');

  // Saved designs list
  const [designs, setDesigns] = useState<Design[]>(() => {
    try {
      const stored = localStorage.getItem('socialator_saved_designs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load local designs:', e);
    }
    return INITIAL_DESIGNS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [publicBaseUrl, setPublicBaseUrl] = useState<string>(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return origin.replace('ais-dev-', 'ais-pre-');
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with server if available
  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        if (cfg?.appUrl) {
          setPublicBaseUrl(cfg.appUrl);
        }
      })
      .catch(() => {});

    fetch('/api/designs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDesigns(data);
        }
      })
      .catch(() => {
        // Fallback to initial/local designs
      });
  }, []);

  // Helper to compute public share URL for any design ID
  const getPublicShareUrl = (id: string) => {
    const base = publicBaseUrl || window.location.origin.replace('ais-dev-', 'ais-pre-');
    return `${base}/share/${id}`;
  };

  // Save designs to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('socialator_saved_designs', JSON.stringify(designs));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [designs]);

  // Load a saved design into the editor
  const handleSelectDesign = (design: Design) => {
    setCurrentId(design.id);
    setImageUrl(design.imageUrl);
    setTitle(design.title);
    setDescription(design.description);
    setDestinationUrl(design.destinationUrl);
    setShareUrl(getPublicShareUrl(design.id));
    setSavedSuccess(false);
  };

  // Save action
  const handleSave = async () => {
    setIsSaving(true);
    const designId = currentId || `design-${Date.now()}`;
    const newDesign: Design = {
      id: designId,
      imageUrl: imageUrl.trim(),
      title: title.trim() || t.defaultPreviewTitle,
      description: description.trim() || t.defaultPreviewDescription,
      destinationUrl: destinationUrl.trim() || 'https://your-website.com',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Update local state immediately
    setDesigns((prev) => {
      const idx = prev.findIndex((d) => d.id === designId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newDesign;
        return next;
      }
      return [newDesign, ...prev];
    });

    // Sync with backend for public /share/:id Open Graph endpoint
    try {
      await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDesign),
      });
    } catch (err) {
      console.warn('Server sync failed, saved locally:', err);
    }

    const publicUrl = getPublicShareUrl(designId);
    setShareUrl(publicUrl);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImageUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle delete design
  const handleDeleteDesign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    try {
      await fetch(`/api/designs/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete on server failed:', err);
    }
    if (currentId === id) {
      const remaining = designs.filter((d) => d.id !== id);
      if (remaining.length > 0) {
        handleSelectDesign(remaining[0]);
      }
    }
  };

  // Copy share URL to clipboard
  const handleCopyShareUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-200">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        id="image-file-input"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Section */}
        <header className="flex items-start justify-between pb-6 mb-4 border-b border-transparent" id="app-header">
          <div>
            <div className="flex items-center gap-3">
              {/* App Logo */}
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-pink-400 font-bold text-lg shadow-sm select-none"
                id="app-logo-badge"
              >
                S
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950" id="app-title">
                {t.appTitle}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-2 max-w-xl font-normal leading-relaxed" id="app-subtitle">
              {t.appSubtitle}
            </p>
          </div>

          {/* Language Switch Toggle */}
          <div className="pt-1">
            <LanguageToggle language={language} onToggle={setLanguage} />
          </div>
        </header>

        {/* Main 2-Column Responsive Workspace */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6 items-start" id="main-workspace">
          {/* LEFT COLUMN: Input Controls */}
          <div className="lg:col-span-5 flex flex-col space-y-6" id="left-controls-column">
            {/* Facebook Platform Indicator Icon */}
            <div className="flex items-center" id="facebook-platform-icon-container">
              <div
                className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-xs"
                title="Facebook Link Preview"
                id="facebook-platform-badge"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
            </div>

            {/* Field 1: Image URL + Upload */}
            <div className="space-y-1.5" id="field-group-image">
              <label htmlFor="image-url-input" className="block text-sm font-medium text-slate-800">
                {t.imageUrlLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  id="image-url-input"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={t.imageUrlPlaceholder}
                  className="w-full h-11 px-3.5 pr-11 rounded-md border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                  title={t.uploadImage}
                  id="upload-image-button"
                  aria-label={t.uploadImage}
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Field 2: Title + Character Counter */}
            <div className="space-y-1.5" id="field-group-title">
              <label htmlFor="title-input" className="block text-sm font-medium text-slate-800">
                {t.titleLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  id="title-input"
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className="w-full h-11 px-3.5 pr-16 rounded-md border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition shadow-2xs"
                />
                <span
                  className="absolute right-3 text-xs text-slate-400 font-mono select-none pointer-events-none"
                  id="title-char-counter"
                >
                  {title.length} / 70
                </span>
              </div>
            </div>

            {/* Field 3: Description + Character Counter */}
            <div className="space-y-1.5" id="field-group-description">
              <label htmlFor="description-input" className="block text-sm font-medium text-slate-800">
                {t.descriptionLabel}
              </label>
              <div className="relative">
                <textarea
                  id="description-input"
                  rows={3}
                  value={description}
                  maxLength={250}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  className="w-full p-3.5 pb-7 rounded-md border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition resize-none shadow-2xs leading-relaxed"
                />
                <span
                  className="absolute right-3 bottom-2 text-xs text-slate-400 font-mono select-none pointer-events-none"
                  id="description-char-counter"
                >
                  {description.length} / 155
                </span>
              </div>
            </div>

            {/* Field 4: Destination URL */}
            <div className="space-y-1.5" id="field-group-destination">
              <label htmlFor="destination-url-input" className="block text-sm font-medium text-slate-800">
                {t.destinationUrlLabel}
              </label>
              <input
                id="destination-url-input"
                type="text"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder={t.destinationUrlPlaceholder}
                className="w-full h-11 px-3.5 rounded-md border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition shadow-2xs"
              />
            </div>

            {/* Action 5: Save Button */}
            <div className="pt-2" id="save-action-wrapper">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                id="save-design-button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-transparent hover:bg-slate-100 text-slate-900 font-medium text-sm border border-slate-300 hover:border-slate-400 active:bg-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">{t.savedBtn}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-slate-700" />
                    <span>{isSaving ? t.savingBtn : t.saveBtn}</span>
                  </>
                )}
              </button>
            </div>

            {/* Public Open Graph Share URL Box (when saved or active) */}
            {shareUrl && (
              <div
                className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 space-y-2"
                id="public-share-url-box"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                    {t.shareUrlTitle}
                  </span>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-normal"
                    title={t.openShareLink}
                  >
                    <span>{t.openShareLink}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-white px-2.5 py-1.5 border border-slate-200 rounded text-[11px] font-mono text-slate-600 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareUrl}
                    className="flex-shrink-0 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    {copiedShareLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{t.copiedLink}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t.copyLink}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Facebook Live Mockup + Saved Designs Library */}
          <div className="lg:col-span-7 flex flex-col" id="right-preview-column">
            {/* Live Facebook Post Card */}
            <FacebookPreview
              imageUrl={imageUrl}
              title={title}
              description={description}
              destinationUrl={destinationUrl}
              language={language}
            />

            {/* Saved Designs Library Carousel */}
            <SavedDesignsBar
              designs={designs}
              selectedId={currentId}
              onSelectDesign={handleSelectDesign}
              onDeleteDesign={handleDeleteDesign}
              language={language}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
