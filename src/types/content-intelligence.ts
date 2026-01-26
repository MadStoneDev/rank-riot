export interface ThinContentPage {
  id: string;
  url: string;
  title: string | null;
  word_count: number | null;
}

export interface PageBasic {
  id: string;
  url: string;
  title: string | null;
}

export interface DuplicateGroup {
  value: string;
  pages: PageBasic[];
}

export interface SimilarContentGroup {
  similarity: number;
  pages: PageBasic[];
}

export interface Keyword {
  word: string;
  count: number;
}

export interface PageWithKeywords extends PageBasic {
  keywords: Keyword[] | null;
}

export interface ContentIntelligenceData {
  thinContent: ThinContentPage[];
  missingMetaDescriptions: PageBasic[];
  missingTitles: PageBasic[];
  duplicateTitles: DuplicateGroup[];
  duplicateDescriptions: DuplicateGroup[];
  similarContent: SimilarContentGroup[];
  summary: {
    critical: number;
    warnings: number;
    passed: number;
    total: number;
  };
}

export interface ContentIntelligenceThresholds {
  thinContentWords: number;
  criticalThinContentWords: number;
  similarityThreshold: number;
}

export const DEFAULT_THRESHOLDS: ContentIntelligenceThresholds = {
  thinContentWords: 300,
  criticalThinContentWords: 100,
  similarityThreshold: 0.7,
};
