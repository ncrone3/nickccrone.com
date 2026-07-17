"use client";

import {
  ChevronLeft,
  ChevronRight,
  Disc3,
  ExternalLink,
  Home,
  ListMusic,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SVGProps,
} from "react";

type Backdrop = {
  label: string;
  image: string;
  tint: string;
};

type PanelId = "top" | "recent";
type TopType = "songs" | "albums" | "artists";
type TopRange = "week" | "month" | "year";

type Track = {
  id?: string;
  title: string;
  artist: string;
  image: string;
  album?: string;
  spotifyUrl?: string;
  lastfmUrl?: string;
  playcount?: number;
  playedAt?: string;
  isPlaying?: boolean;
  progressMs?: number | null;
  durationMs?: number;
};

type SpotifyCurrentResponse = {
  currentlyPlaying: Track | null;
  error?: string;
  retryAfter?: string | null;
  updatedAt?: string;
};

type RecentTracksResponse = {
  recentlyPlayed: Track[];
  errors?: {
    recentlyPlayed?: string;
  };
  error?: string;
  updatedAt?: string;
};

type LastfmTopResponse = {
  items: Track[];
  error?: string;
  updatedAt?: string;
};

function SpotifyIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1.04.25c-2.85-1.74-6.44-2.13-10.67-1.17a.75.75 0 0 1-.33-1.46c4.62-1.06 8.58-.6 11.8 1.37.35.22.46.68.24 1.01Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.26-2-8.23-2.58-12.08-1.41a.94.94 0 0 1-.54-1.8c4.39-1.33 9.86-.68 13.6 1.61.44.27.58.85.31 1.29Zm.13-3.4C15.18 8.3 8.72 8.08 4.98 9.22a1.12 1.12 0 0 1-.66-2.15c4.3-1.31 11.43-1.05 15.92 1.61a1.12 1.12 0 0 1-1.14 1.95Z" />
    </svg>
  );
}

function LinkedInIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.68H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.23 0H1.76C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.76 24h20.47c.97 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z" />
    </svg>
  );
}

function GitHubIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}

const backdrops: Backdrop[] = [
  {
    label: "Alpine lake",
    image: "/livemusic/alpine-lake.jpg",
    tint: "from-sky-950/15 via-black/10 to-black/35",
  },
  {
    label: "Golden mountain",
    image: "/livemusic/golden-mountain.jpg",
    tint: "from-black/45 via-slate-900/20 to-black/55",
  },
];

const spotifyProfileUrl =
  "https://open.spotify.com/user/fitnick8?si=f3c8b82e33094ed7";

const socialLinks = [
  {
    label: "Spotify",
    href: spotifyProfileUrl,
    icon: SpotifyIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/nicholas-crone/",
    icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/ncrone3",
    icon: GitHubIcon,
  },
];

const panelLabels: Record<PanelId, string> = {
  top: "Top picks",
  recent: "Recent",
};

// Data source plan: Spotify for live playback, Last.fm for listening history.
const SPOTIFY_CURRENT_REFRESH_INTERVAL_MS = 30_000;
const RECENT_TRACKS_REFRESH_INTERVAL_MS = 30_000;
const LASTFM_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const HIDDEN_TAB_REFRESH_INTERVAL_MS = 2 * 60 * 1000;
const RECENT_TRACKS_PENDING_MESSAGE = "Recently played will update soon.";

const placeholderTopTracks: Track[] = [
  {
    title: "What Was That",
    artist: "Lorde",
    image: "/photos/bottom-david-laid.jpg",
  },
  {
    title: "back & forth",
    artist: "nate.sib, 2hollis",
    image: "/photos/bottom-eye-of-a-fallen-angel.jpg",
  },
  {
    title: "SECRETS",
    artist: "NOTION, Cameron Hayes",
    image: "/photos/bottom-great-wave.jpg",
  },
  {
    title: "Team",
    artist: "Lorde",
    image: "/photos/bottom-sisyphus.jpg",
  },
  {
    title: "Nangs",
    artist: "Tame Impala",
    image: "/photos/bottom-what-if-you-fly.jpg",
  },
];

const placeholderRecentTracks: Track[] = [
  {
    title: "Scary Monsters and Nice Sprites",
    artist: "Skrillex",
    image: "/photos/bottom-connor-mcgregor-dc.avif",
  },
  {
    title: "lie",
    artist: "2hollis",
    image: "/photos/bottom-mindfulness.jpg",
  },
  {
    title: "areyoulistening",
    artist: "Gunnr",
    image: "/photos/bottom-eren-free.jpg",
  },
  {
    title: "Eventually",
    artist: "Tame Impala",
    image: "/photos/bottom-what-if-you-fly.jpg",
  },
  {
    title: "Pure Heroine",
    artist: "Lorde",
    image: "/photos/bottom-sisyphus.jpg",
  },
];

const placeholderCurrentlyPlaying: Track = {
  title: "Nothing playing..",
  artist: "",
  image: "/photos/bottom-eye-of-a-fallen-angel.jpg",
  spotifyUrl: spotifyProfileUrl,
};

const fallbackAlbumArt = "/photos/bottom-eye-of-a-fallen-angel.jpg";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTrackImage = (track: Track) => track.image || fallbackAlbumArt;

function TrackRow({ track }: { track: Track }) {
  const href = track.spotifyUrl ?? track.lastfmUrl;
  const content = (
    <div className="grid grid-cols-[4rem_1fr] items-center gap-4">
      <div className="relative size-16 overflow-hidden rounded-sm border border-black/10 bg-zinc-200">
        <Image
          src={getTrackImage(track)}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-black">
          {track.title}
        </p>
        <p className="mt-1 truncate text-xs text-black/65">
          {track.artist}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return <li>{content}</li>;
  }

  return (
    <li>
      <a
        href={href}
        aria-label={`Open ${track.title} by ${track.artist}`}
        className="block rounded-sm transition hover:bg-black/5"
      >
        {content}
      </a>
    </li>
  );
}

function SidePanel({
  id,
  isOpen,
  onToggle,
  children,
}: {
  id: PanelId;
  isOpen: boolean;
  onToggle: (id: PanelId) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-stretch">
      {isOpen ? (
        <section className="relative h-[28rem] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-r-xl border border-black/20 bg-white/90 shadow-xl backdrop-blur-sm sm:w-[20rem]">
          <button
            type="button"
            aria-label={`Collapse ${panelLabels[id]}`}
            onClick={() => onToggle(id)}
            className="absolute right-0 top-0 z-10 grid h-full w-5 place-items-center border-l border-black/10 bg-white/80 text-black transition hover:bg-white"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex h-full flex-col overflow-y-auto p-4 pr-7">
            {children}
          </div>
        </section>
      ) : (
        <button
          type="button"
          aria-label={`Open ${panelLabels[id]}`}
          onClick={() => onToggle(id)}
          className="grid h-[28rem] w-5 place-items-center rounded-full border border-black/20 bg-white/90 text-black shadow-lg transition hover:bg-white"
        >
          <ChevronRight size={14} />
          <span className="sr-only">{panelLabels[id]}</span>
        </button>
      )}
    </div>
  );
}

function TopPanel({
  tracks,
  topType,
  topRange,
  onTopTypeChange,
  onTopRangeChange,
}: {
  tracks: Track[];
  topType: TopType;
  topRange: TopRange;
  onTopTypeChange: (type: TopType) => void;
  onTopRangeChange: (range: TopRange) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-[0.8rem]">
        <span>Top 5</span>
        <select
          aria-label="Top item type"
          value={topType}
          onChange={(event) => onTopTypeChange(event.target.value as TopType)}
          className="rounded border border-black/20 bg-white px-2 py-1 text-xs"
        >
          <option value="songs">songs</option>
          <option value="albums">albums</option>
          <option value="artists">artists</option>
        </select>
        <span>of the</span>
        <select
          aria-label="Top item time range"
          value={topRange}
          onChange={(event) => onTopRangeChange(event.target.value as TopRange)}
          className="rounded border border-black/20 bg-white px-2 py-1 text-xs"
        >
          <option value="week">week</option>
          <option value="month">month</option>
          <option value="year">year</option>
        </select>
      </div>
      <ol className="mt-5 flex flex-1 flex-col justify-between">
        {tracks.map((track) => (
          <TrackRow key={getTrackKey(track)} track={track} />
        ))}
      </ol>
    </>
  );
}

function RecentPanel({
  statusMessage,
  tracks,
}: {
  statusMessage?: string | null;
  tracks: Track[];
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListMusic size={17} />
          <h2 className="text-sm font-semibold">Recently played</h2>
        </div>
      </div>
      {tracks.length > 0 ? (
        <ul className="mt-5 flex flex-1 flex-col justify-between">
          {tracks.map((track) => (
            <TrackRow key={getTrackKey(track)} track={track} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-sm text-black/55">
          {statusMessage ?? "Recently played is unavailable right now."}
        </div>
      )}
    </>
  );
}

function PlayerCard({
  cardRef,
  heading,
  isCurrent,
  isDragging,
  isPlaced,
  position,
  statusMessage,
  track,
  updatedAt,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  heading: string;
  isCurrent: boolean;
  isDragging: boolean;
  isPlaced: boolean;
  position: { x: number; y: number };
  statusMessage?: string | null;
  track: Track;
  updatedAt?: string;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const progressPercent = getProgressPercent(track, updatedAt, now, isCurrent);
  const hasProgress = isCurrent && Boolean(track.durationMs);
  const trackProgressKey = track.id ?? track.spotifyUrl ?? track.title;

  useEffect(() => {
    if (!hasProgress) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 1_000);

    return () => window.clearInterval(intervalId);
  }, [hasProgress, trackProgressKey]);

  return (
    <div
      ref={cardRef}
      role="application"
      aria-label="Draggable music status card"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`z-30 w-56 touch-none select-none rounded-lg border border-black/10 bg-white/95 p-4 text-center text-black shadow-2xl transition-opacity ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${
        isPlaced
          ? "lg:absolute opacity-100"
          : "lg:absolute opacity-0 max-lg:opacity-100"
      } max-lg:mx-auto max-lg:w-full max-lg:max-w-64 max-lg:cursor-default max-lg:touch-auto lg:touch-none`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <Disc3
          size={16}
          className={isCurrent ? "animate-spin" : undefined}
          style={isCurrent ? { animationDuration: "3s" } : undefined}
        />
        <h2 className="text-base font-medium">{heading}</h2>
      </div>
      <a
        href={track.spotifyUrl ?? spotifyProfileUrl}
        aria-label={`Open ${track.title} on Spotify`}
        className="mt-3 block overflow-hidden rounded-sm border border-black/10 bg-zinc-50"
      >
        <Image
          src={getTrackImage(track)}
          alt={track.album ?? "Album art"}
          width={384}
          height={384}
          className="aspect-square w-full object-cover"
        />
      </a>
      {progressPercent !== null ? (
        <div
          aria-label="Track progress"
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10"
        >
          <div
            className="h-full rounded-full bg-black transition-[width] duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      ) : null}
      <p className="mt-3 text-2xl leading-none">{track.title}</p>
      {track.artist ? (
        <p className="mt-2 text-base leading-none">{track.artist}</p>
      ) : null}
      <a
        href={track.spotifyUrl ?? spotifyProfileUrl}
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-black/65 transition hover:text-black"
      >
        Open Spotify
        <ExternalLink size={12} />
      </a>
      {statusMessage ? (
        <p className="mt-3 text-[0.7rem] leading-snug text-black/50">
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}

function getProgressPercent(
  track: Track,
  updatedAt: string | undefined,
  now: number,
  isCurrent: boolean,
) {
  if (!isCurrent || !track.durationMs || track.durationMs <= 0) {
    return null;
  }

  const fetchedAt = updatedAt ? Date.parse(updatedAt) : now;
  const elapsedSinceFetch = Number.isFinite(fetchedAt)
    ? Math.max(0, now - fetchedAt)
    : 0;
  const progressMs = (track.progressMs ?? 0) + elapsedSinceFetch;

  return clamp((progressMs / track.durationMs) * 100, 0, 100);
}

function getTrackKey(track: Track) {
  return [
    track.id,
    track.spotifyUrl,
    track.playedAt,
    track.title,
    track.artist,
    track.album,
  ]
    .filter(Boolean)
    .join("-");
}

function getRetryAfterMs(retryAfter: string | null | undefined) {
  const retryAfterSeconds = Number(retryAfter);

  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds * 1000
    : null;
}

export default function LiveMusicPage() {
  const [backdropIndex, setBackdropIndex] = useState(0);
  const [openPanels, setOpenPanels] = useState<Record<PanelId, boolean>>({
    top: true,
    recent: true,
  });
  const [topType, setTopType] = useState<TopType>("songs");
  const [topRange, setTopRange] = useState<TopRange>("month");
  const [lastfmTopTracks, setLastfmTopTracks] = useState<Track[] | null>(null);
  const [spotifyCurrentData, setSpotifyCurrentData] =
    useState<SpotifyCurrentResponse | null>(null);
  const [recentTracksData, setRecentTracksData] =
    useState<RecentTracksResponse | null>(null);
  const [spotifyCurrentError, setSpotifyCurrentError] = useState<string | null>(
    null,
  );
  const [recentTracksError, setRecentTracksError] = useState<string | null>(
    null,
  );
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isPlayerPlaced, setIsPlayerPlaced] = useState(false);
  const [isDraggingPlayer, setIsDraggingPlayer] = useState(false);
  const hasPlacedPlayer = useRef(false);
  const dashboardAreaRef = useRef<HTMLDivElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);
  const isDraggingPlayerRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const currentPlaybackRequestId = useRef(0);
  const recentTracksRequestId = useRef(0);
  const topTracksRequestId = useRef(0);
  const activeBackdrop = backdrops[backdropIndex];
  const currentlyPlaying = spotifyCurrentData?.currentlyPlaying;
  const displayedRecentTracks = recentTracksData
    ? recentTracksData.recentlyPlayed
    : placeholderRecentTracks;
  const recentTracksStatus =
    recentTracksData?.errors?.recentlyPlayed ?? recentTracksError;
  const lastPlayedTrack = recentTracksData?.recentlyPlayed[0] ?? null;
  const displayedPlayerTrack =
    currentlyPlaying ?? lastPlayedTrack ?? placeholderCurrentlyPlaying;
  const playerCardHeading = currentlyPlaying
    ? "Currently Playing"
    : lastPlayedTrack
      ? "Last Played"
      : "Nothing Playing";
  const displayedTopTracks = lastfmTopTracks?.length
    ? lastfmTopTracks
    : placeholderTopTracks;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | undefined;
    let controller: AbortController | null = null;

    function scheduleNextLoad(delayMs = SPOTIFY_CURRENT_REFRESH_INTERVAL_MS) {
      timeoutId = window.setTimeout(loadCurrentPlayback, delayMs);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        return;
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      loadCurrentPlayback();
    }

    async function loadCurrentPlayback() {
      if (document.hidden) {
        scheduleNextLoad(HIDDEN_TAB_REFRESH_INTERVAL_MS);
        return;
      }

      const requestId = currentPlaybackRequestId.current + 1;
      currentPlaybackRequestId.current = requestId;
      controller?.abort();
      controller = new AbortController();
      let nextRefreshMs = SPOTIFY_CURRENT_REFRESH_INTERVAL_MS;

      try {
        const response = await fetch("/api/spotify/current", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as SpotifyCurrentResponse;

        if (!isMounted || requestId !== currentPlaybackRequestId.current) {
          return;
        }

        if (response.ok) {
          setSpotifyCurrentData(data);
          setSpotifyCurrentError(null);
        } else {
          nextRefreshMs =
            getRetryAfterMs(data.retryAfter) ?? SPOTIFY_CURRENT_REFRESH_INTERVAL_MS;
          setSpotifyCurrentError(
            data.error ?? "Unable to load current Spotify playback.",
          );
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (isMounted && requestId === currentPlaybackRequestId.current) {
          setSpotifyCurrentError("Unable to load current Spotify playback.");
        }
      } finally {
        if (isMounted && requestId === currentPlaybackRequestId.current) {
          scheduleNextLoad(nextRefreshMs);
        }
      }
    }

    loadCurrentPlayback();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      controller?.abort();

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let controller: AbortController | null = null;

    async function loadRecentTracks() {
      if (document.hidden) {
        return;
      }

      const requestId = recentTracksRequestId.current + 1;
      recentTracksRequestId.current = requestId;
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch("/api/lastfm/recent", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as RecentTracksResponse;

        if (!isMounted || requestId !== recentTracksRequestId.current) {
          return;
        }

        if (response.ok) {
          setRecentTracksData((currentData) => {
            if (data.recentlyPlayed.length > 0) {
              return data;
            }

            return currentData?.recentlyPlayed.length ? currentData : data;
          });
          setRecentTracksError(
            data.recentlyPlayed.length > 0
              ? null
              : data.errors?.recentlyPlayed ?? RECENT_TRACKS_PENDING_MESSAGE,
          );
        } else {
          setRecentTracksError(RECENT_TRACKS_PENDING_MESSAGE);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (isMounted && requestId === recentTracksRequestId.current) {
          setRecentTracksError(RECENT_TRACKS_PENDING_MESSAGE);
        }
      }
    }

    function handleVisibilityChange() {
      if (!document.hidden) {
        loadRecentTracks();
      }
    }

    loadRecentTracks();
    const intervalId = window.setInterval(
      loadRecentTracks,
      RECENT_TRACKS_REFRESH_INTERVAL_MS,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let controller: AbortController | null = null;

    async function loadLastfmTopTracks() {
      if (document.hidden) {
        return;
      }

      const requestId = topTracksRequestId.current + 1;
      topTracksRequestId.current = requestId;
      controller?.abort();
      controller = new AbortController();

      try {
        const params = new URLSearchParams({
          type: topType,
          period: topRange,
        });
        const response = await fetch(`/api/lastfm/top?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as LastfmTopResponse;

        if (isMounted && requestId === topTracksRequestId.current) {
          setLastfmTopTracks(response.ok ? data.items : null);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (isMounted && requestId === topTracksRequestId.current) {
          setLastfmTopTracks(null);
        }
      }
    }

    function handleVisibilityChange() {
      if (!document.hidden) {
        loadLastfmTopTracks();
      }
    }

    loadLastfmTopTracks();
    const intervalId = window.setInterval(
      loadLastfmTopTracks,
      LASTFM_REFRESH_INTERVAL_MS,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, [topType, topRange]);

  useEffect(() => {
    function placePlayer() {
      const dashboardArea = dashboardAreaRef.current;
      const playerCard = playerCardRef.current;

      if (!dashboardArea) {
        return;
      }

      setPlayerPosition((currentPosition) => {
        const cardWidth = playerCard?.offsetWidth ?? 224;
        const cardHeight = playerCard?.offsetHeight ?? 356;
        const margin = 24;
        const maxX = dashboardArea.clientWidth - cardWidth - margin;
        const maxY = dashboardArea.clientHeight - cardHeight - margin;

        if (!hasPlacedPlayer.current) {
          hasPlacedPlayer.current = true;
          return {
            x: clamp(dashboardArea.clientWidth - cardWidth - 72, margin, maxX),
            y: clamp(86, margin, maxY),
          };
        }

        return {
          x: clamp(currentPosition.x, margin, maxX),
          y: clamp(currentPosition.y, margin, maxY),
        };
      });
      setIsPlayerPlaced(true);
    }

    placePlayer();
    window.addEventListener("resize", placePlayer);

    return () => window.removeEventListener("resize", placePlayer);
  }, []);

  function togglePanel(id: PanelId) {
    setOpenPanels((currentPanels) => ({
      ...currentPanels,
      [id]: !currentPanels[id],
    }));
  }

  function handlePlayerPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const isDesktopLayout = window.matchMedia("(min-width: 1024px)").matches;
    const isLinkTarget =
      event.target instanceof HTMLElement && event.target.closest("a");

    if (!isDesktopLayout || isLinkTarget) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    isDraggingPlayerRef.current = true;
    setIsDraggingPlayer(true);
  }

  function handlePlayerPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dashboardArea = dashboardAreaRef.current;

    if (!isDraggingPlayerRef.current || !dashboardArea) {
      return;
    }

    const margin = 12;
    const cardWidth = event.currentTarget.offsetWidth;
    const cardHeight = event.currentTarget.offsetHeight;
    const dashboardRect = dashboardArea.getBoundingClientRect();

    setPlayerPosition({
      x: clamp(
        event.clientX - dashboardRect.left - dragOffset.current.x,
        margin,
        dashboardArea.clientWidth - cardWidth - margin,
      ),
      y: clamp(
        event.clientY - dashboardRect.top - dragOffset.current.y,
        margin,
        dashboardArea.clientHeight - cardHeight - margin,
      ),
    });
  }

  function handlePlayerPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isDraggingPlayerRef.current = false;
    setIsDraggingPlayer(false);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#ddd8d4] text-black">
      <div
        className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-500"
        style={{ backgroundImage: `url('${activeBackdrop.image}')` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${activeBackdrop.tint}`} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="grid min-h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-black/25 bg-white/20 px-5 backdrop-blur-sm sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              aria-label="Back to portfolio"
              className="grid size-9 shrink-0 place-items-center rounded-sm bg-black/5 text-black transition hover:bg-black hover:text-white"
            >
              <Home size={20} strokeWidth={2.3} />
            </Link>
            <h1 className="truncate text-xl font-medium sm:text-2xl">
              Nick Crone&apos;s Live Music Dashboard:
            </h1>
          </div>

          <button
            type="button"
            aria-label={`Switch backdrop from ${activeBackdrop.label}`}
            aria-pressed={backdropIndex === 1}
            onClick={() =>
              setBackdropIndex((currentIndex) =>
                currentIndex === 0 ? 1 : 0,
              )
            }
            className="relative h-5 w-10 shrink-0 rounded-full bg-black p-1 shadow-inner transition"
          >
            <span
              className={`block size-3 rounded-full bg-sky-200 transition-transform ${
                backdropIndex === 1 ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>

          <nav
            aria-label="Live music social links"
            className="flex justify-self-end gap-3"
          >
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-9 place-items-center rounded-sm bg-black/5 text-black transition hover:bg-black hover:text-white"
              >
                <Icon size={23} strokeWidth={2.4} />
              </a>
            ))}
          </nav>
        </header>

        <div
          ref={dashboardAreaRef}
          className="relative flex flex-1 px-4 py-6 sm:px-8 max-lg:flex-col max-lg:gap-6"
        >
          <aside className="z-20 flex items-start gap-1 max-lg:flex-wrap max-lg:self-start max-sm:w-full max-sm:flex-col">
            <SidePanel id="top" isOpen={openPanels.top} onToggle={togglePanel}>
              <TopPanel
                tracks={displayedTopTracks}
                topType={topType}
                topRange={topRange}
                onTopTypeChange={setTopType}
                onTopRangeChange={setTopRange}
              />
            </SidePanel>

            <SidePanel
              id="recent"
              isOpen={openPanels.recent}
              onToggle={togglePanel}
            >
              <RecentPanel
                statusMessage={recentTracksStatus}
                tracks={displayedRecentTracks}
              />
            </SidePanel>

          </aside>

          <PlayerCard
            cardRef={playerCardRef}
            heading={playerCardHeading}
            isCurrent={Boolean(currentlyPlaying?.isPlaying)}
            isDragging={isDraggingPlayer}
            isPlaced={isPlayerPlaced}
            position={playerPosition}
            track={displayedPlayerTrack}
            statusMessage={spotifyCurrentError}
            updatedAt={spotifyCurrentData?.updatedAt}
            onPointerCancel={handlePlayerPointerUp}
            onPointerDown={handlePlayerPointerDown}
            onPointerMove={handlePlayerPointerMove}
            onPointerUp={handlePlayerPointerUp}
          />
        </div>
      </div>
    </main>
  );
}
