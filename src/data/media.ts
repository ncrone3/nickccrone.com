import catalog from "./media.json";

export const mediaTypes = [
  "book",
  "movie",
  "show",
  "album",
  "song",
  "youtube",
  "podcast",
  "reel",
  "article",
  "game",
  "other",
] as const;

export type MediaType = (typeof mediaTypes)[number];

export type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  creator?: string;
  year?: number;
  image: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  links: {
    primary: string;
    source?: string;
  };
  description?: string;
  tags: string[];
  addedAt: string;
  featured?: boolean;
};

type MediaCatalog = {
  schemaVersion: 1;
  items: MediaItem[];
};

export type TileVariant =
  | "small"
  | "song"
  | "square"
  | "poster"
  | "wide"
  | "featureSquare"
  | "featurePoster"
  | "featureWide";

const typedCatalog = catalog as MediaCatalog;

export const mediaItems = typedCatalog.items;

export function getMediaTypeLabel(type: MediaType) {
  const labels: Record<MediaType, string> = {
    book: "Book",
    movie: "Movie",
    show: "Show",
    album: "Album",
    song: "Song",
    youtube: "YouTube",
    podcast: "Podcast",
    reel: "Reel",
    article: "Article",
    game: "Game",
    other: "Other",
  };

  return labels[type];
}

export function getSearchableText(item: MediaItem) {
  return [
    item.title,
    item.creator,
    item.type,
    item.year,
    item.description,
    ...item.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getTileVariant(item: MediaItem): TileVariant {
  if (item.type === "youtube") {
    return item.featured ? "featureWide" : "wide";
  }

  if (item.type === "book" || item.type === "movie" || item.type === "show") {
    return item.featured ? "featurePoster" : "poster";
  }

  if (item.type === "song") {
    return item.featured ? "square" : "song";
  }

  if (item.type === "album") {
    return item.featured ? "featureSquare" : "square";
  }

  const { width, height } = item.image;

  if (item.type === "reel") {
    if (width && height && width > height * 1.2) {
      return item.featured ? "featureWide" : "wide";
    }

    return item.featured ? "featurePoster" : "poster";
  }

  if (width && height && width > height * 1.2) {
    return item.featured ? "featureWide" : "wide";
  }

  return item.featured ? "featureSquare" : "small";
}
