import { z } from "zod";

const ThumbnailSchema = z.object({
  url: z.string(),
});

const SnippetSchema = z.object({
  publishedAt: z.string(),
  title: z.string(),
  resourceId: z.object({ videoId: z.string() }),
  thumbnails: z.object({
    default: ThumbnailSchema,
    medium: ThumbnailSchema,
    high: ThumbnailSchema,
    maxres: ThumbnailSchema.optional(),
  }),
});

const PlaylistItemSchema = z.object({
  snippet: SnippetSchema,
});

export const PlaylistItemsResponseSchema = z.object({
  error: z.object({ message: z.string() }).optional(),
  items: z.array(PlaylistItemSchema).optional(),
});

const ContentDetailsSchema = z.object({
  duration: z.string(),
});

const VideoDetailsItemSchema = z.object({
  id: z.string(),
  contentDetails: ContentDetailsSchema,
});

export const VideoDetailsResponseSchema = z.object({
  error: z.object({ message: z.string() }).optional(),
  items: z.array(VideoDetailsItemSchema).optional(),
});
