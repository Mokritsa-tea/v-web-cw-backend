import axios from 'axios';

export const shikimoriClient = axios.create({
  baseURL: 'https://shikimori.one/api',
  headers: {
    'User-Agent': 'anime-catalog-app',
  },
});
