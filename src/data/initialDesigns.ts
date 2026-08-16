import { Design } from '../types';

export const INITIAL_DESIGNS: Design[] = [
  {
    id: 'elevate-space-1',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
    title: 'Elevate Your Space',
    description: 'Timeless design. Thoughtful living.',
    destinationUrl: 'https://your-website.com',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'dark-luxe-2',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop',
    title: 'Elevate Your Space - Dark Edition',
    description: 'Timeless design. Modern moody aesthetics.',
    destinationUrl: 'https://your-website.com/dark-collection',
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'warm-neutral-3',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop',
    title: 'Elevate Your Space - Warm Botanics',
    description: 'Natural materials and organic textures for peaceful living.',
    destinationUrl: 'https://your-website.com/warm-neutral',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'minimal-light-4',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop',
    title: 'Elevate Your Space - Scandinavian Minimal',
    description: 'Clean silhouettes and functional luxury.',
    destinationUrl: 'https://your-website.com/minimal',
    createdAt: Date.now() - 3600000 * 1,
    updatedAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'charcoal-lounge-5',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
    title: 'Elevate Your Space - Studio Collection',
    description: 'Craftsmanship meets contemporary comfort.',
    destinationUrl: 'https://your-website.com/studio',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
