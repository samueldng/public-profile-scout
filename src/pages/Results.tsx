interface SearchResult {
  platform: string;
  name?: string;
  url: string;
  description?: string;
  relevanceScore?: number;
  location?: string;
  title?: string;
}

interface PersonProfile {
  name: string;
  confidence: number;
  profiles: SearchResult[];
  education?: string[];
  experiences?: string[];
  location?: string;
  summary?: string;
  username?: string;
}