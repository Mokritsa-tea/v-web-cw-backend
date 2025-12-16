export interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string;
  image?: { original?: string };
  score: string;
  episodes: number;
  status: string;
  description?: string;
  genres: Array<{
    id: number;
    name: string;
    russian: string;
  }>;
}
