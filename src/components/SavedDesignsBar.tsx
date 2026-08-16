import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { Design, Language } from '../types';
import { getTranslation } from '../translations';

interface SavedDesignsBarProps {
  designs: Design[];
  selectedId: string | null;
  onSelectDesign: (design: Design) => void;
  onDeleteDesign?: (id: string, e: React.MouseEvent) => void;
  language: Language;
}

export const SavedDesignsBar: React.FC<SavedDesignsBarProps> = ({
  designs,
  selectedId,
  onSelectDesign,
  onDeleteDesign,
  language,
}) => {
  const t = getTranslation(language);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full mt-6" id="saved-designs-section">
      <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2.5" id="saved-designs-label">
        {t.savedDesignsHeader}
      </div>

      <div className="relative flex items-center group">
        {/* Left Scroll Arrow (if scrolled) */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute -left-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Scroll saved designs left"
          id="scroll-designs-left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Thumbnails Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-0.5 w-full scroll-smooth"
          id="saved-designs-scroll-row"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {designs.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 italic">{t.noSavedDesigns}</div>
          ) : (
            designs.map((design) => {
              const isSelected = selectedId === design.id;
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => onSelectDesign(design)}
                  id={`saved-design-thumb-${design.id}`}
                  className={`relative flex-shrink-0 w-24 sm:w-28 h-20 sm:h-22 rounded-md overflow-hidden bg-slate-100 cursor-pointer transition-all duration-150 text-left focus:outline-none group/card ${
                    isSelected
                      ? 'ring-2 ring-indigo-600 shadow-sm border border-transparent'
                      : 'border border-slate-200/90 hover:border-slate-400 hover:shadow-xs'
                  }`}
                  aria-label={`Select design ${design.title}`}
                  aria-pressed={isSelected}
                >
                  <img
                    src={design.imageUrl}
                    alt={design.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop';
                    }}
                  />

                  {/* Subtle caption overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 pt-3">
                    <p className="text-[10px] font-medium text-white truncate leading-tight">
                      {design.title || 'Untitled'}
                    </p>
                  </div>

                  {/* Delete icon on hover */}
                  {onDeleteDesign && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDesign(design.id, e);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          onDeleteDesign(design.id, e as any);
                        }
                      }}
                      title={t.deleteDesign}
                      className="absolute top-1 right-1 w-5 h-5 rounded bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-150 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Right Scroll Arrow */}
        {designs.length > 3 && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute -right-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            aria-label="Scroll saved designs right"
            id="scroll-designs-right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
