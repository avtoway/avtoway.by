export interface YTVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxres: string;
  };
}
