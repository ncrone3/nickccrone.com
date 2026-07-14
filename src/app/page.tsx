"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type SVGProps } from "react";

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

const highlightFilters = [
  "Work Exp.",
  "Projects",
  "Leadership",
  "Other",
] as const;
const showHighlightCardAction = false;

type HighlightFilter = (typeof highlightFilters)[number];

type Highlight = {
  role: string;
  category: HighlightFilter;
  detail: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  badge?: string;
  href?: string;
};

const highlights: Highlight[] = [
  {
    role: "AWS Internship",
    category: "Work Exp.",
    badge: "Currently",
    detail:
      "Enabling downstream analytics and future developement by building custom data connector.",
    image: "/photos/aws-first-day.jpg",
    imageAlt: "Nick on his first day at AWS",
  },
  {
    role: "Amway Internship",
    category: "Work Exp.",
    detail:
      "Led a department wide data modernization initiative by building cloud-based data pipeline.",
    image: "/photos/amway-internship.jpg",
    imageAlt: "Nick at Amway during his internship",
  },
  {
    role: "ChatGPT Feature Design",
    category: "Projects",
    detail:
      "Improved ChatGPT by designing and validating a potential new feature.",
    image: "/photos/chatgpt-feature-design.jpg",
    imageAlt: "ChatGPT feature design mockup",
  },
  {
    role: "Live Music Dashboard",
    category: "Projects",
    detail:
      "A real-time music dashboard for sharing what I am listening to and the stats behind it.",
    image: "/livemusic/dashboard-preview.jpg",
    imageAlt: "Live music dashboard with listening stats and currently playing card",
    imagePosition: "top center",
    href: "/livemusic",
  },
  {
    role: "Georgia Tech VIP",
    category: "Work Exp.",
    detail:
      "Built a LinkedIn-esque networking platform to connect researchers at the Georgia Tech Research Institute.",
    image: "/photos/georgia-tech-vip-header.jpg",
    imageAlt: "Georgia Tech VIP project header",
  },
  {
    role: "Pop the Balloon Dating Show",
    category: "Leadership",
    detail:
      "Launched a live dating show at Georgia Tech to raise money for the American Red Cross.",
    image: "/photos/ptb-stage.jpg",
    imageAlt: "Pop the Balloon dating show team",
  },
  {
    role: "Teaching Assistant",
    category: "Leadership",
    detail:
      "Taught ISyE students core topics like probability and optimization.\n\nISyE 2027: Probability with Applications\nISyE 3133: Engineering Optimization.",
    image: "/photos/teaching-assistant-placeholder.jpg",
    imageAlt: "Teaching assistant at work",
  },
  {
    role: "Lead Resident Assistant",
    category: "Leadership",
    detail:
      "Led team of RAs to give students an amazing first-year community at Georgia Tech.",
    image: "/photos/ra-birthday.jpg",
    imageAlt: "Resident assistant birthday celebration",
  },
  {
    role: "Fuddy Award Show",
    category: "Other",
    detail:
      "Led a end of year superlative event for my first year dorm floor.",
    image: "/photos/fuddies.jpg",
    imageAlt: "Fuddy Award Show",
  },
  {
    role: "Senior Class President",
    category: "Other",
    detail:
      "Led a novel campaign for my high school's senior class president seat...lost unfortunately :(.",
    image: "/photos/vote-for-nick-header.jpg",
    imageAlt: "Vote for Nick campaign graphic",
  },
];

const links = [
  {
    label: "Email",
    href: "mailto:nick.c.crone@gmail.com",
    icon: Mail,
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

const heroImage = "/hero/interlaken-hero.jpg";
const tileRotations = ["-7deg", "0deg", "-9deg", "0deg", "-8deg", "3deg"];
type CarouselPhoto = {
  src: string;
  variant?: "landscape" | "portrait";
};

const topCarouselPhotos: CarouselPhoto[] = [
  { src: "/photos/carousel-extra-4.jpg" },
  { src: "/photos/ncc-1st-bday.jpg", variant: "portrait" },
  { src: "/photos/carousel-2.jpg" },
  { src: "/photos/carousel-extra-1.jpg" },
  { src: "/photos/ncc-new-england-kids-triathlon.jpg" },
  { src: "/photos/carousel-8.jpg", variant: "portrait" },
  { src: "/photos/carousel-extra-6.jpg" },
  { src: "/photos/carousel-5.jpg" },
  { src: "/photos/ncc-our-street-photo.jpg" },
  { src: "/photos/carousel-extra-3.jpg" },
  { src: "/photos/carousel-1.jpg" },
  { src: "/photos/ncc-1st-marathon-atl-official.jpg" },
  { src: "/photos/carousel-7.jpg" },
  { src: "/photos/carousel-extra-5.jpg" },
  { src: "/photos/carousel-3.jpg" },
  { src: "/photos/ncc-v-hockey.jpg" },
  { src: "/photos/carousel-extra-2.jpg", variant: "portrait" },
  { src: "/photos/carousel-6.jpg" },
  { src: "/photos/carousel-4.jpg" },
];
const bottomCarouselPhotos: CarouselPhoto[] = [
  { src: "/photos/bottom-mindfulness.jpg" },
  { src: "/photos/bottom-david-laid.jpg", variant: "portrait" },
  { src: "/photos/bottom-eren-free.jpg" },
  { src: "/photos/bottom-wait-im-goated.jpg", variant: "portrait" },
  { src: "/photos/bottom-zyzz.jpg" },
  { src: "/photos/bottom-kanye-west-ambition.jpg", variant: "portrait" },
  { src: "/photos/bottom-great-wave.jpg" },
  { src: "/photos/bottom-let-that-shi-go.jpg", variant: "portrait" },
  { src: "/photos/bottom-connor-mcgregor-dc.avif" },
  { src: "/photos/bottom-tige.jpg", variant: "portrait" },
  { src: "/photos/bottom-eye-of-a-fallen-angel.jpg" },
  { src: "/photos/bottom-justin-gaethje-backflip.jpg", variant: "portrait" },
  { src: "/photos/bottom-arnold.jpg" },
  { src: "/photos/bottom-sisyphus.jpg", variant: "portrait" },
  { src: "/photos/bottom-what-if-you-fly.jpg", variant: "portrait" },
];

function PhotoCarouselBand({
  placement = "top",
  photos,
  reverse = false,
  tileClassName = "size-16 sm:size-20 md:size-24",
}: {
  placement?: "top" | "bottom" | "static";
  photos: CarouselPhoto[];
  reverse?: boolean;
  tileClassName?: string;
}) {
  const carouselPhotos = [...photos, ...photos];
  const placementClass =
    placement === "static"
      ? "relative overflow-hidden px-3 py-5"
      : `absolute inset-x-0 overflow-hidden px-3 ${
          placement === "bottom" ? "bottom-5" : "top-5"
        }`;

  return (
    <div className={placementClass}>
      <div
        className={`flex w-max items-center gap-3 sm:gap-4 ${
          reverse ? "photo-carousel-track-reverse" : "photo-carousel-track"
        }`}
      >
        {carouselPhotos.map((photo, index) => {
          const isPortrait = photo.variant === "portrait";

          return (
            <div
              key={`${reverse ? "bottom" : "top"}-${photo.src}-${index}`}
              className={`${
                isPortrait
                  ? "h-28 w-20 sm:h-36 sm:w-28 md:h-40 md:w-28"
                  : tileClassName
              } shrink-0 bg-cover bg-center shadow-sm`}
              style={{
                backgroundImage: `url('${photo.src}')`,
                rotate: isPortrait
                  ? "0deg"
                  : tileRotations[index % tileRotations.length],
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [selectedHighlightFilter, setSelectedHighlightFilter] =
    useState<HighlightFilter | null>(null);
  const filteredHighlights = selectedHighlightFilter
    ? highlights.filter((item) => item.category === selectedHighlightFilter)
    : highlights;
  const visibleHighlights = showAllHighlights
    ? filteredHighlights
    : filteredHighlights.slice(0, 3);
  const canToggleHighlights = filteredHighlights.length > 3;

  function toggleHighlightFilter(filter: HighlightFilter) {
    setSelectedHighlightFilter((currentFilter) =>
      currentFilter === filter ? null : filter,
    );
    setShowAllHighlights(false);
  }

  function renderHighlightCard(item: Highlight, isLinked = false) {
    return (
      <article
        className={`flex h-full min-h-64 flex-col overflow-hidden bg-white shadow-sm transition duration-200 hover:shadow-xl ${
          isLinked ? "cursor-pointer hover:-translate-y-0.5" : ""
        }`}
      >
        {item.image ? (
          <div
            aria-label={item.imageAlt}
            className="h-44 bg-cover bg-center sm:h-48"
            role="img"
            style={{
              backgroundImage: `url('${item.image}')`,
              backgroundPosition: item.imagePosition ?? "center",
            }}
          />
        ) : null}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold sm:text-2xl">{item.role}</h3>
              {item.badge ? (
                <span className="rounded-full border border-black/20 bg-[#ddd8d4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black/75">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-3 whitespace-pre-line text-base leading-snug text-zinc-700 sm:mt-4 sm:text-lg">
              {item.detail}
            </p>
          </div>
          {showHighlightCardAction && isLinked ? (
            <span className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wide">
              Learn more
              <ArrowUpRight size={16} />
            </span>
          ) : null}
          {showHighlightCardAction && !isLinked ? (
            <a
              href="#contact"
              className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wide"
            >
              Learn more
              <ArrowUpRight size={16} />
            </a>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-[#ddd8d4] text-black">
      <section className="relative flex min-h-screen overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/10" />
        <div className="relative z-10 flex min-h-screen w-full flex-col px-5 py-5 text-white sm:px-10 lg:px-14">
          <header className="flex items-center justify-end text-sm font-medium tracking-wide">
            <nav aria-label="Social links" className="flex items-center gap-3">
              {links.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-sm bg-black/45 text-white transition hover:bg-white hover:text-black"
                >
                  <Icon size={22} strokeWidth={2.4} />
                </a>
              ))}
            </nav>
          </header>

          <div className="flex flex-1 items-center">
            <div className="max-w-full border-l-2 border-white pl-4 sm:pl-6">
              <p className="mb-4 text-3xl font-light uppercase leading-none sm:mb-6 sm:text-6xl">
                Hi, I&apos;m
              </p>
              <h1 className="max-w-full whitespace-nowrap text-[clamp(2.75rem,13.1vw,11rem)] font-black uppercase leading-[0.84] tracking-normal">
                Nick Crone!
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#ddd8d4] px-5 pb-10 pt-32 sm:px-10 sm:pb-12 sm:pt-40 lg:px-14">
        <PhotoCarouselBand
          placement="top"
          photos={topCarouselPhotos}
          tileClassName="h-20 w-28 sm:h-28 sm:w-40 md:h-32 md:w-44"
        />
        <div className="relative mx-auto flex min-h-[30vh] max-w-6xl items-center sm:min-h-[38vh]">
          <div className="w-full max-w-6xl border-l-2 border-black pl-4 sm:pl-7">
            <h2 className="text-4xl font-bold leading-none sm:text-6xl">About Me</h2>
            <p className="mt-4 text-xl leading-tight sm:text-3xl lg:max-w-[72rem]">
              ISyE, ECON + CS @ Georgia Tech. I love building things, making videos, and writing occasionally.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#ddd8d4] px-5 pb-14 sm:px-10 sm:pb-16 lg:px-14">
        <div className="mx-auto max-w-6xl border-t border-black/30 pt-8 sm:pt-10">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Highlights</h2>
          <div
            aria-label="Highlight filters"
            className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-5"
          >
            {highlightFilters.map((filter) => {
              const isSelected = selectedHighlightFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={isSelected}
                  className={`inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-bold uppercase tracking-wide shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-40 sm:text-base ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-black/15 bg-white/70 text-black hover:bg-white"
                  }`}
                  onClick={() => toggleHighlightFilter(filter)}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          <div className="mt-8 grid auto-rows-fr gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleHighlights.map((item) =>
              item.href ? (
                <Link
                  key={item.role}
                  href={item.href}
                  className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-[#ddd8d4]"
                >
                  {renderHighlightCard(item, true)}
                </Link>
              ) : (
                <div key={item.role} className="h-full">
                  {renderHighlightCard(item)}
                </div>
              ),
            )}
          </div>
          {canToggleHighlights ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-sm border border-black/25 bg-white/70 px-6 text-sm font-bold uppercase tracking-wide shadow-sm transition hover:bg-white hover:shadow-md"
                onClick={() =>
                  setShowAllHighlights((currentValue) => !currentValue)
                }
              >
                {showAllHighlights ? "See Less" : "See All"}
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section id="contact" className="bg-[#ddd8d4] px-5 pb-14 sm:px-10 sm:pb-16 lg:px-14">
        <div className="mx-auto max-w-6xl border-t border-black/40 pt-7">
          <h2 className="text-3xl font-bold sm:text-4xl">Contact Me</h2>
          <p className="mt-3 text-xl leading-tight text-black/75 sm:text-2xl">
            I&apos;m always down to chat!
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-5">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="inline-flex h-14 w-full items-center justify-center gap-4 rounded-2xl border border-black/15 bg-white/70 px-7 text-lg font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:h-16 sm:w-auto sm:min-w-44 sm:text-xl"
              >
                <Icon size={28} strokeWidth={2.4} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Photo carousel"
        className="overflow-hidden bg-[#ddd8d4] pb-6"
      >
        <PhotoCarouselBand
          placement="static"
          photos={bottomCarouselPhotos}
          reverse
          tileClassName="h-20 w-32 sm:h-28 sm:w-44 md:h-32 md:w-52"
        />
      </section>
    </main>
  );
}
