export type HairLength = 'short' | 'medium' | 'long';
export type HairGender = 'female' | 'male' | 'all';

export interface Hairstyle {
  id: string;
  name: string;
  gender: HairGender;
  length: HairLength;
  imageUrl: string;
}

export interface AppState {
  selectedHairstyle: Hairstyle | null;
  uploadedImage: File | null;
  uploadedImageUrl: string | null;
  resultImageUrl: string | null;
  generatedAdvice: string | null;
  isGenerating: boolean;
  filterLength: 'all' | HairLength;
  filterGender: HairGender;
  activeTab: 'studio' | 'sessions';
}
