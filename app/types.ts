export interface TextDocument {
  id: string;
  content: string;
  timestamp: number;
}

export interface Highlight {
  id: string;
  textId: string;
  highlightedText: string;
  sentence: string;
  timestamp: number;
  position?: number;
  isLearned?: boolean;
  isFavorite?: boolean;
}

export type WordFilterType = 'all' | 'learned' | 'favorite' | 'unlearned'; 