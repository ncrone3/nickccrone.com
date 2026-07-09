"use client";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Disc3,
  ExternalLink,
  ListMusic,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SVGProps,
} from "react";

type Backdrop = {
  label: string;
  image: string;
  tint: string;
};

type PanelId = "top" | "recent" | "minutes";

type Track = {
  title: string;
  artist: string;
  image: string;
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

const socialLinks = [
  {
    label: "Spotify",
    href: "https://open.spotify.com/user/fitnick8?si=f3c8b82e33094ed7",
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
  minutes: "Minutes",
};

const topTracks: Track[] = [
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

const recentTracks: Track[] = [
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function TrackRow({ track }: { track: Track }) {
  return (
    <li className="grid grid-cols-[4rem_1fr] items-center gap-4">
      <div className="relative size-16 overflow-hidden rounded-sm border border-black/10 bg-zinc-200">
        <Image
          src={track.image}
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
        <section className="relative h-[28rem] w-[20rem] overflow-hidden rounded-r-xl border border-black/20 bg-white/90 shadow-xl backdrop-blur-sm">
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

export default function LiveMusicPage() {
  const [backdropIndex, setBackdropIndex] = useState(0);
  const [openPanels, setOpenPanels] = useState<Record<PanelId, boolean>>({
    top: true,
    recent: false,
    minutes: false,
  });
  const [topType, setTopType] = useState("songs");
  const [topRange, setTopRange] = useState("month");
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isPlayerPlaced, setIsPlayerPlaced] = useState(false);
  const [isDraggingPlayer, setIsDraggingPlayer] = useState(false);
  const hasPlacedPlayer = useRef(false);
  const dashboardAreaRef = useRef<HTMLDivElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);
  const isDraggingPlayerRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const activeBackdrop = backdrops[backdropIndex];

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
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("a")
    ) {
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
    <main className="relative min-h-screen overflow-hidden bg-[#ddd8d4] text-black">
      <div
        className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-500"
        style={{ backgroundImage: `url('${activeBackdrop.image}')` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${activeBackdrop.tint}`} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="grid min-h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-black/25 bg-white/20 px-5 backdrop-blur-sm sm:px-8">
          <div className="min-w-0">
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
          className="relative flex flex-1 px-4 py-6 sm:px-8"
        >
          <aside className="z-20 flex items-start gap-1 max-lg:flex-wrap max-lg:self-start">
            <SidePanel id="top" isOpen={openPanels.top} onToggle={togglePanel}>
              <div className="flex items-center gap-2 text-[0.8rem]">
                <span>Top 5</span>
                <select
                  aria-label="Top item type"
                  value={topType}
                  onChange={(event) => setTopType(event.target.value)}
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
                  onChange={(event) => setTopRange(event.target.value)}
                  className="rounded border border-black/20 bg-white px-2 py-1 text-xs"
                >
                  <option value="day">day</option>
                  <option value="month">month</option>
                  <option value="year">year</option>
                </select>
              </div>
              <ol className="mt-5 flex flex-1 flex-col justify-between">
                {topTracks.map((track) => (
                  <TrackRow
                    key={`${track.title}-${track.artist}`}
                    track={track}
                  />
                ))}
              </ol>
            </SidePanel>

            <SidePanel
              id="recent"
              isOpen={openPanels.recent}
              onToggle={togglePanel}
            >
              <div className="flex items-center gap-2">
                <ListMusic size={17} />
                <h2 className="text-sm font-semibold">Recently played...</h2>
              </div>
              <ul className="mt-5 flex flex-1 flex-col justify-between">
                {recentTracks.map((track) => (
                  <TrackRow
                    key={`${track.title}-${track.artist}`}
                    track={track}
                  />
                ))}
              </ul>
            </SidePanel>

            <SidePanel
              id="minutes"
              isOpen={openPanels.minutes}
              onToggle={togglePanel}
            >
              <div className="flex items-center gap-2">
                <Clock3 size={17} />
                <h2 className="text-sm font-semibold">Listening minutes</h2>
              </div>
              <div className="mt-8 space-y-8 text-center">
                <p>
                  <span className="block text-4xl font-semibold">20</span>
                  <span className="text-lg">mins today</span>
                </p>
                <p>
                  <span className="block text-4xl font-semibold">1,220</span>
                  <span className="text-lg">mins this month</span>
                </p>
                <p>
                  <span className="block text-4xl font-semibold">68,000</span>
                  <span className="text-lg">mins this year</span>
                </p>
              </div>
            </SidePanel>
          </aside>

          <section
            aria-label="Backend status"
            className="absolute bottom-5 left-5 right-5 z-10 max-w-xl rounded-xl border border-white/35 bg-black/35 p-4 text-sm text-white shadow-xl backdrop-blur-sm sm:left-auto sm:right-8 sm:w-[26rem]"
          >
            <div className="flex items-center gap-2 font-semibold">
              <BarChart3 size={17} />
              Front end preview
            </div>
            <p className="mt-2 text-white/80">
              Live Spotify and Last.fm data will plug in here once the backend
              is ready. The current tracks, totals, and artwork are placeholders.
            </p>
          </section>

          <div
            ref={playerCardRef}
            role="application"
            aria-label="Draggable currently playing card"
            onPointerDown={handlePlayerPointerDown}
            onPointerMove={handlePlayerPointerMove}
            onPointerUp={handlePlayerPointerUp}
            onPointerCancel={handlePlayerPointerUp}
            className={`z-30 w-56 touch-none select-none rounded-lg border border-black/10 bg-white/95 p-4 text-center text-black shadow-2xl transition-opacity ${
              isDraggingPlayer ? "cursor-grabbing" : "cursor-grab"
            } ${isPlayerPlaced ? "absolute opacity-100" : "absolute opacity-0"}`}
            style={{
              left: playerPosition.x,
              top: playerPosition.y,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Disc3 size={16} />
              <h2 className="text-base font-medium">Currently Playing</h2>
            </div>
            <div className="mt-3 overflow-hidden rounded-sm border border-black/10 bg-zinc-50">
              <Image
                src="/photos/bottom-eye-of-a-fallen-angel.jpg"
                alt="Placeholder album art"
                width={384}
                height={384}
                className="aspect-square w-full object-cover"
              />
            </div>
            <p className="mt-3 text-2xl leading-none">say my name</p>
            <p className="mt-2 text-base leading-none">kimj</p>
            <a
              href="https://open.spotify.com/"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-black/65 transition hover:text-black"
            >
              Open Spotify
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
