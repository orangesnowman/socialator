export interface Design {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  destinationUrl: string;
  createdAt: number;
  updatedAt: number;
}

export type Language = 'en' | 'es';
