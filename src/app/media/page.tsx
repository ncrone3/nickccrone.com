import type { Metadata } from "next";
import MediaWall from "./media-wall";

export const metadata: Metadata = {
  title: "Nick Crone\u2019s Media Wall",
  description:
    "A dense visual wall of books, movies, shows, albums, songs, and videos Nick enjoys.",
};

export default function MediaPage() {
  return <MediaWall />;
}
