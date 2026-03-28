import { create } from 'zustand';
import type { AppState, HairGender, HairLength, Hairstyle } from '../types';

interface AppStore extends AppState {
  setSelectedHairstyle: (hairstyle: Hairstyle | null) => void;
  setUploadedImage: (file: File, imageUrl: string) => void;
  resetUpload: () => void;
  clearResult: () => void;
  setResultImageUrl: (url: string | null) => void;
  setGeneratedAdvice: (advice: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setFilterLength: (length: 'all' | HairLength) => void;
  setFilterGender: (gender: HairGender) => void;
  setActiveTab: (tab: 'studio' | 'sessions') => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedHairstyle: null,
  uploadedImage: null,
  uploadedImageUrl: null,
  resultImageUrl: null,
  generatedAdvice: null,
  isGenerating: false,
  filterLength: 'all',
  filterGender: 'female',
  activeTab: 'studio',
  setSelectedHairstyle: (hairstyle) => set({ selectedHairstyle: hairstyle }),
  setUploadedImage: (file, imageUrl) => {
    const previousUrl = get().uploadedImageUrl;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    set({
      uploadedImage: file,
      uploadedImageUrl: imageUrl,
      resultImageUrl: null,
      generatedAdvice: null,
    });
  },
  resetUpload: () => {
    const previousUrl = get().uploadedImageUrl;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    set({
      uploadedImage: null,
      uploadedImageUrl: null,
      resultImageUrl: null,
      generatedAdvice: null,
      isGenerating: false,
    });
  },
  clearResult: () => set({ resultImageUrl: null, generatedAdvice: null, isGenerating: false }),
  setResultImageUrl: (url) => set({ resultImageUrl: url }),
  setGeneratedAdvice: (advice) => set({ generatedAdvice: advice }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setFilterLength: (length) => set({ filterLength: length }),
  setFilterGender: (gender) => set({ filterGender: gender }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
