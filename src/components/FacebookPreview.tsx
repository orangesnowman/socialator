import React from 'react';
import { MoreHorizontal, Globe } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../translations';

interface FacebookPreviewProps {
  imageUrl: string;
  title: string;
  description: string;
  destinationUrl: string;
  language: Language;
}

export const FacebookPreview: React.FC<FacebookPreviewProps> = ({
  imageUrl,
  title,
  description,
  destinationUrl,
  language,
}) => {
  const t = getTranslation(language);

  // Extract domain cleanly for Facebook link display
  const getDisplayDomain = (urlStr: string): string => {
    if (!urlStr || !urlStr.trim()) return t.defaultPreviewDomain;
    try {
      let formatted = urlStr.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
      }
      const parsed = new URL(formatted);
      return parsed.hostname.toUpperCase();
    } catch {
      return urlStr.replace(/^https?:\/\//i, '').split('/')[0].toUpperCase() || t.defaultPreviewDomain;
    }
  };

  const displayDomain = getDisplayDomain(destinationUrl);
  const displayTitle = title.trim() || t.defaultPreviewTitle;
  const displayDescription = description.trim() || t.defaultPreviewDescription;

  return (
    <div
      id="facebook-mockup-card"
      className="w-full bg-white rounded-lg border border-slate-200/90 shadow-sm p-4 sm:p-5 text-slate-900 transition-all"
    >
      {/* Facebook Post Author Header */}
      <div className="flex items-center justify-between mb-3" id="post-author-header">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-slate-300 flex-shrink-0"
            id="page-avatar"
            aria-hidden="true"
          />
          <div>
            <div className="text-sm font-semibold text-slate-900 leading-tight" id="page-name">
              {t.postHeaderPageName}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5" id="page-post-time">
              <span>{t.postHeaderTime}</span>
              <span>·</span>
              <Globe className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
          aria-label="Post options"
          id="post-options-button"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Facebook Post Caption */}
      <p className="text-sm text-slate-800 mb-3 leading-normal" id="post-caption-text">
        {t.postText}
      </p>

      {/* Facebook Link Card Preview */}
      <div
        id="facebook-link-card-container"
        className="w-full rounded-md border border-slate-200 overflow-hidden bg-slate-50 transition hover:bg-slate-100/70 cursor-pointer"
      >
        {/* Link Card Media Banner */}
        <div className="relative w-full aspect-[1.91/1] bg-slate-200 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Graceful fallback if image link fails to load
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
              }}
            />
          ) : (
            <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
              <span>{t.pasteOrUpload}</span>
            </div>
          )}
        </div>

        {/* Link Card Meta Info Box */}
        <div className="p-3 bg-slate-50/90 border-t border-slate-200/80" id="link-card-meta">
          <div
            className="text-[11px] font-medium tracking-wider text-slate-500 uppercase truncate"
            id="link-card-domain"
          >
            {displayDomain}
          </div>
          <div
            className="text-[15px] sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5"
            id="link-card-title"
          >
            {displayTitle}
          </div>
          <div
            className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 mt-1 leading-relaxed"
            id="link-card-description"
          >
            {displayDescription}
          </div>
        </div>
      </div>
    </div>
  );
};
