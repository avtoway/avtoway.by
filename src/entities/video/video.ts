export interface Video {
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
