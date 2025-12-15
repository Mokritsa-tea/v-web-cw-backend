export interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string;
  image?: { original?: string };
  score: string;
  episodes: number;
  status: string;
  genres: {
    id: number;
    name: string;
    russian: string;
  }[];
}
