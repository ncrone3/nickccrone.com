"use client";

import { Home, Info, Search, Shuffle } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SVGProps,
} from "react";
import {
  getMediaTypeLabel,
  getSearchableText,
  getTileVariant,
  mediaItems,
  type MediaItem,
  type TileVariant,
} from "@/data/media";

const tileVariantClassNames: Record<TileVariant, string> = {
  small: "col-span-1 row-span-1",
  song: "col-span-1 row-span-1",
  square: "col-span-2 row-span-2",
  poster: "col-span-2 row-span-3",
  wide: "col-span-3 row-span-2",
  featureSquare: "col-span-3 row-span-3",
  featurePoster: "col-span-3 row-span-5",
  featureWide: "col-span-4 row-span-2",
};

const localPackLookaheadSize = 24;

const tileVariantSpans: Record<TileVariant, { columns: number; rows: number }> =
  {
    small: { columns: 1, rows: 1 },
    song: { columns: 1, rows: 1 },
    square: { columns: 2, rows: 2 },
    poster: { columns: 2, rows: 3 },
    wide: { columns: 3, rows: 2 },
    featureSquare: { columns: 3, rows: 3 },
    featurePoster: { columns: 3, rows: 5 },
    featureWide: { columns: 4, rows: 2 },
  };

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

function shuffleIds(ids: string[]) {
  const nextIds = [...ids];

  for (let index = nextIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextIds[index], nextIds[swapIndex]] = [nextIds[swapIndex], nextIds[index]];
  }

  return nextIds;
}

function getPackingRank(item: MediaItem) {
  const variant = getTileVariant(item);

  if (variant === "featurePoster" || variant === "featureSquare") {
    return 0;
  }

  if (variant === "featureWide" || variant === "poster" || variant === "wide") {
    return 1;
  }

  if (variant === "square") {
    return 2;
  }

  return 3;
}

function packItemsByLocalRank(items: MediaItem[]) {
  return items
    .map((item, index) => ({ item, index }))
    .reduce<MediaItem[]>((packedItems, _entry, chunkStart, indexedItems) => {
      if (chunkStart % localPackLookaheadSize !== 0) {
        return packedItems;
      }

      const packedChunk = indexedItems
        .slice(chunkStart, chunkStart + localPackLookaheadSize)
        .sort((firstItem, secondItem) => {
          const rankDifference =
            getPackingRank(firstItem.item) - getPackingRank(secondItem.item);

          return rankDifference || firstItem.index - secondItem.index;
        })
        .map(({ item }) => item);

      return [...packedItems, ...packedChunk];
    }, []);
}

function getCellKey(row: number, column: number) {
  return `${row}:${column}`;
}

function getTileSpan(item: MediaItem, columnCount: number) {
  const span = tileVariantSpans[getTileVariant(item)];

  return {
    columns: Math.min(span.columns, columnCount),
    rows: span.rows,
  };
}

function itemFitsAt(
  item: MediaItem,
  row: number,
  column: number,
  columnCount: number,
  occupiedCells: Set<string>,
) {
  const span = getTileSpan(item, columnCount);

  if (column + span.columns > columnCount) {
    return false;
  }

  for (let rowOffset = 0; rowOffset < span.rows; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < span.columns; columnOffset += 1) {
      if (
        occupiedCells.has(getCellKey(row + rowOffset, column + columnOffset))
      ) {
        return false;
      }
    }
  }

  return true;
}

function findFirstOpenCell(occupiedCells: Set<string>, columnCount: number) {
  for (let row = 0; ; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (!occupiedCells.has(getCellKey(row, column))) {
        return { row, column };
      }
    }
  }
}

function findFirstPlacement(
  item: MediaItem,
  columnCount: number,
  occupiedCells: Set<string>,
) {
  for (let row = 0; ; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (itemFitsAt(item, row, column, columnCount, occupiedCells)) {
        return { row, column };
      }
    }
  }
}

function occupyCells(
  item: MediaItem,
  placement: { row: number; column: number },
  columnCount: number,
  occupiedCells: Set<string>,
) {
  const span = getTileSpan(item, columnCount);

  for (let row = placement.row; row < placement.row + span.rows; row += 1) {
    for (
      let column = placement.column;
      column < placement.column + span.columns;
      column += 1
    ) {
      occupiedCells.add(getCellKey(row, column));
    }
  }
}

function getBestLocalCandidateIndex(
  indexedItems: { item: MediaItem; index: number }[],
  columnCount: number,
  occupiedCells: Set<string>,
  placement: { row: number; column: number },
) {
  const lookaheadItems = indexedItems.slice(0, localPackLookaheadSize);
  const localCandidate = lookaheadItems
    .map((entry, localIndex) => ({ ...entry, localIndex }))
    .filter(({ item }) =>
      itemFitsAt(item, placement.row, placement.column, columnCount, occupiedCells),
    )
    .sort((firstItem, secondItem) => {
      const rankDifference =
        getPackingRank(firstItem.item) - getPackingRank(secondItem.item);

      return rankDifference || firstItem.localIndex - secondItem.localIndex;
    })[0];

  if (localCandidate) {
    return localCandidate.localIndex;
  }

  return indexedItems.findIndex(({ item }) =>
    itemFitsAt(item, placement.row, placement.column, columnCount, occupiedCells),
  );
}

function packItemsForDenseGrid(items: MediaItem[], columnCount?: number | null) {
  if (!columnCount || columnCount < 2) {
    return packItemsByLocalRank(items);
  }

  const indexedItems = items.map((item, index) => ({ item, index }));
  const packedItems: MediaItem[] = [];
  const occupiedCells = new Set<string>();

  while (indexedItems.length > 0) {
    const nextOpenCell = findFirstOpenCell(occupiedCells, columnCount);
    const candidateIndex = getBestLocalCandidateIndex(
      indexedItems,
      columnCount,
      occupiedCells,
      nextOpenCell,
    );
    const selectedIndex = candidateIndex === -1 ? 0 : candidateIndex;
    const [selectedItem] = indexedItems.splice(selectedIndex, 1);
    const selectedPlacement = itemFitsAt(
      selectedItem.item,
      nextOpenCell.row,
      nextOpenCell.column,
      columnCount,
      occupiedCells,
    )
      ? nextOpenCell
      : findFirstPlacement(selectedItem.item, columnCount, occupiedCells);

    occupyCells(
      selectedItem.item,
      selectedPlacement,
      columnCount,
      occupiedCells,
    );
    packedItems.push(selectedItem.item);
  }

  return packedItems;
}

function getPackedSignature(
  ids: string[],
  mediaById: Map<string, MediaItem>,
  columnCount?: number | null,
) {
  return packItemsForDenseGrid(
    ids
      .map((id) => mediaById.get(id))
      .filter((item): item is MediaItem => Boolean(item)),
    columnCount,
  )
    .slice(0, 18)
    .map((item) => item.id)
    .join("|");
}

function shuffleIdsForNewPackedOrder(
  ids: string[],
  mediaById: Map<string, MediaItem>,
  columnCount?: number | null,
) {
  const currentSignature = getPackedSignature(ids, mediaById, columnCount);
  let bestIds = ids;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidateIds = shuffleIds(ids);

    if (
      getPackedSignature(candidateIds, mediaById, columnCount) !==
      currentSignature
    ) {
      return candidateIds;
    }

    bestIds = candidateIds;
  }

  return bestIds;
}

function MediaTile({
  item,
  imageFailed,
  onImageError,
  onPreview,
  onClearPreview,
}: {
  item: MediaItem;
  imageFailed: boolean;
  onImageError: (id: string) => void;
  onPreview: (item: MediaItem) => void;
  onClearPreview: () => void;
}) {
  const variant = getTileVariant(item);
  const typeLabel = getMediaTypeLabel(item.type);

  return (
    <a
      href={item.links.primary}
      target="_blank"
      rel="noreferrer"
      aria-label={`${item.title}${item.creator ? ` by ${item.creator}` : ""} (${typeLabel})`}
      className={`group relative block overflow-hidden rounded-sm border border-black/20 bg-white shadow-sm outline-none transition duration-200 hover:z-10 hover:-translate-y-0.5 hover:border-black hover:shadow-xl focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#ddd8d4] ${tileVariantClassNames[variant]}`}
      onMouseEnter={() => onPreview(item)}
      onMouseLeave={onClearPreview}
      onFocus={() => onPreview(item)}
      onBlur={onClearPreview}
    >
      {imageFailed ? (
        <div className="flex h-full min-h-24 flex-col justify-between bg-[#f5f2ee] p-3">
          <span className="w-fit border border-black/20 bg-white px-2 py-1 text-[10px] font-bold uppercase leading-none text-black/70">
            {typeLabel}
          </span>
          <span className="line-clamp-4 text-sm font-bold leading-tight text-black">
            {item.title}
          </span>
        </div>
      ) : (
        <>
          <img
            src={item.image.url}
            alt={item.image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={() => onImageError(item.id)}
          />
          <span className="absolute left-2 top-2 border border-black/20 bg-[#ddd8d4]/90 px-2 py-1 text-[10px] font-black uppercase leading-none text-black opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {typeLabel}
          </span>
        </>
      )}
    </a>
  );
}

function PreviewPanel({ item }: { item: MediaItem | null }) {
  if (!item) {
    return null;
  }

  return (
    <aside className="fixed bottom-5 right-5 z-30 hidden w-[min(24rem,calc(100vw-2.5rem))] rounded-sm border border-black bg-[#ddd8d4] p-4 text-black shadow-2xl md:block">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-black/55">
            {getMediaTypeLabel(item.type)}
            {item.year ? ` / ${item.year}` : ""}
          </p>
          <h2 className="mt-1 text-xl font-black leading-tight">
            {item.title}
          </h2>
        </div>
      </div>
      {item.creator ? (
        <p className="mt-2 text-sm font-semibold text-black/70">
          {item.creator}
        </p>
      ) : null}
      {item.description ? (
        <p className="mt-3 text-sm leading-snug text-black/75">
          {item.description}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.tags.slice(0, 5).map((tag) => (
          <span
            key={tag}
            className="border border-black/15 bg-white/70 px-2 py-1 text-[10px] font-bold uppercase text-black/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </aside>
  );
}

export default function MediaWall() {
  const [query, setQuery] = useState("");
  const [orderedIds, setOrderedIds] = useState(() =>
    mediaItems.map((item) => item.id),
  );
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [gridColumnCount, setGridColumnCount] = useState<number | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const gridRef = useRef<HTMLDivElement>(null);

  const mediaById = useMemo(
    () => new Map(mediaItems.map((item) => [item.id, item])),
    [],
  );

  useEffect(() => {
    const gridElement = gridRef.current;

    if (!gridElement) {
      return;
    }

    const observedGridElement = gridElement;

    function updateGridColumnCount() {
      const nextColumnCount = window
        .getComputedStyle(observedGridElement)
        .gridTemplateColumns.split(" ")
        .filter(Boolean).length;

      setGridColumnCount((currentColumnCount) =>
        currentColumnCount === nextColumnCount
          ? currentColumnCount
          : nextColumnCount,
      );
    }

    updateGridColumnCount();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateGridColumnCount);

      return () => window.removeEventListener("resize", updateGridColumnCount);
    }

    const resizeObserver = new ResizeObserver(updateGridColumnCount);
    resizeObserver.observe(observedGridElement);

    return () => resizeObserver.disconnect();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = useMemo(
    () => {
      const matchingItems = orderedIds
        .map((id) => mediaById.get(id))
        .filter((item): item is MediaItem => Boolean(item))
        .filter((item) =>
          normalizedQuery
            ? getSearchableText(item).includes(normalizedQuery)
            : true,
        );

      return packItemsForDenseGrid(matchingItems, gridColumnCount);
    },
    [gridColumnCount, mediaById, normalizedQuery, orderedIds],
  );

  function handleShuffle() {
    setOrderedIds((currentIds) =>
      shuffleIdsForNewPackedOrder(currentIds, mediaById, gridColumnCount),
    );
  }

  function handleImageError(id: string) {
    setFailedImageIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(id);
      return nextIds;
    });
  }

  return (
    <main className="min-h-screen bg-[#ddd8d4] text-black">
      <header className="sticky top-0 z-20 border-b border-black bg-[#ddd8d4]/95 px-3 py-2 backdrop-blur sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/"
              aria-label="Home"
              className="grid size-10 shrink-0 place-items-center rounded-sm border border-black/20 bg-white/70 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <Home size={19} strokeWidth={2.3} />
            </Link>
            <h1 className="truncate text-xl font-normal leading-none sm:text-2xl">
              Nick Crone&rsquo;s Media Wall
            </h1>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end">
            <label className="relative min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">Search media wall</span>
              <Search
                aria-hidden="true"
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded-sm border border-black/25 bg-white/80 pl-9 pr-3 text-sm font-semibold outline-none transition placeholder:text-black/40 focus:border-black focus:bg-white focus:ring-2 focus:ring-black"
              />
            </label>
            <button
              type="button"
              aria-label="Shuffle media"
              title="Shuffle"
              className="grid size-10 shrink-0 place-items-center rounded-sm border border-black/20 bg-white/70 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              onClick={handleShuffle}
            >
              <Shuffle size={18} strokeWidth={2.3} />
            </button>
            <button
              type="button"
              aria-label={`${mediaItems.length} media items. Images are loaded from remote URLs.`}
              title={`${mediaItems.length} items`}
              className="grid size-10 shrink-0 place-items-center rounded-sm border border-black/20 bg-white/70 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <Info size={18} strokeWidth={2.3} />
            </button>
            <a
              href="https://github.com/ncrone3"
              target="_blank"
              rel="noreferrer"
              aria-label="Nick Crone on GitHub"
              className="grid size-10 shrink-0 place-items-center rounded-sm border border-black/20 bg-white/70 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <GitHubIcon size={18} />
            </a>
          </div>
        </div>
      </header>

      <section className="px-2 py-2 sm:px-3 sm:py-3">
        {visibleItems.length > 0 ? (
          <div
            ref={gridRef}
            className="grid auto-rows-[3.6rem] grid-cols-[repeat(auto-fill,minmax(3.6rem,3.6rem))] justify-center gap-1 [grid-auto-flow:dense] sm:auto-rows-[4rem] sm:grid-cols-[repeat(auto-fill,minmax(4rem,4rem))] sm:gap-1.5 lg:auto-rows-[4.4rem] lg:grid-cols-[repeat(auto-fill,minmax(4.4rem,4.4rem))]"
          >
            {visibleItems.map((item) => (
              <MediaTile
                key={item.id}
                item={item}
                imageFailed={failedImageIds.has(item.id)}
                onImageError={handleImageError}
                onPreview={setActiveItem}
                onClearPreview={() => setActiveItem(null)}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-[60vh] place-items-center px-5 text-center">
            <div>
              <p className="text-2xl font-black">No matches</p>
              <p className="mt-2 text-sm font-semibold text-black/60">
                Try another title, creator, tag, type, or year.
              </p>
            </div>
          </div>
        )}
      </section>

      <PreviewPanel item={activeItem} />
    </main>
  );
}
