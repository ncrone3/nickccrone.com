import { ArrowUpRight, Mail } from "lucide-react";
import type { SVGProps } from "react";

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

const experience = [
  {
    role: "Product Builder",
    detail: "Turning early ideas into scoped, testable products.",
  },
  {
    role: "Software Engineering",
    detail: "Learning by shipping useful interfaces and systems.",
  },
  {
    role: "Data & Strategy",
    detail: "Finding signal in messy problems, markets, and behavior.",
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

const tileRotations = ["-7deg", "0deg", "-9deg", "0deg", "-8deg", "3deg"];
type CarouselPhoto = {
  src: string;
  variant?: "landscape" | "portrait";
};

const placeholderCarouselPhotos = Array.from(
  { length: 6 },
  (): CarouselPhoto => ({ src: "/forest-hero.png" }),
);
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

function PhotoCarouselBand({
  placement = "top",
  photos = placeholderCarouselPhotos,
  reverse = false,
  tileClassName = "size-16 sm:size-20 md:size-24",
}: {
  placement?: "top" | "bottom" | "static";
  photos?: CarouselPhoto[];
  reverse?: boolean;
  tileClassName?: string;
}) {
  const carouselPhotos = [...photos, ...photos];
  const placementClass =
    placement === "static"
      ? "relative overflow-hidden px-3 py-5"
      : `pointer-events-none absolute inset-x-0 overflow-hidden px-3 ${
          placement === "bottom" ? "bottom-5" : "top-5"
        }`;

  return (
    <div className={placementClass}>
      <div
        className={`flex w-max items-center gap-7 ${
          reverse ? "photo-carousel-track-reverse" : "photo-carousel-track"
        }`}
      >
        {carouselPhotos.map((photo, index) => {
          const isPortrait = photo.variant === "portrait";

          return (
            <div
              key={`${reverse ? "bottom" : "top"}-${photo.src}-${index}`}
              className={`${
                isPortrait ? "h-32 w-24 sm:h-36 sm:w-28 md:h-40 md:w-28" : tileClassName
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
  return (
    <main className="min-h-screen bg-[#ddd8d4] text-black">
      <section className="relative flex min-h-screen overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/forest-hero.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/10" />
        <div className="relative z-10 flex min-h-screen w-full flex-col px-6 py-5 text-white sm:px-10 lg:px-14">
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
            <div className="border-l-2 border-white pl-4 sm:pl-6">
              <p className="mb-6 text-4xl font-light uppercase leading-none sm:text-6xl">
                Hi, I&apos;m
              </p>
              <h1 className="max-w-none whitespace-nowrap text-[clamp(4.2rem,13.1vw,11rem)] font-black uppercase leading-[0.84] tracking-normal">
                Nick Crone!
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#ddd8d4] px-6 pb-12 pt-40 sm:px-10 lg:px-14">
        <PhotoCarouselBand
          placement="top"
          photos={topCarouselPhotos}
          tileClassName="h-24 w-32 sm:h-28 sm:w-40 md:h-32 md:w-44"
        />
        <div className="relative mx-auto flex min-h-[38vh] max-w-7xl items-center">
          <div className="w-full max-w-6xl border-l-2 border-black pl-5 sm:pl-7">
            <h2 className="text-5xl leading-none sm:text-6xl">About Me</h2>
            <p className="mt-4 text-2xl leading-tight sm:text-3xl lg:max-w-[72rem]">
              I am a 4th year ISyE, ECON + CS student at Georgia Tech. I love
              building cool things and solving hard problems across product,
              software engineering, and data.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#ddd8d4] px-6 pb-16 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl border-t border-black/30 pt-10">
          <h2 className="text-center text-4xl font-bold">Experience</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {experience.map((item) => (
              <article
                key={item.role}
                className="flex min-h-64 flex-col justify-between bg-white p-6 shadow-sm"
              >
                <div>
                  <h3 className="text-2xl font-semibold">{item.role}</h3>
                  <p className="mt-4 text-lg leading-snug text-zinc-700">
                    {item.detail}
                  </p>
                </div>
                <a
                  href="#contact"
                  className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wide"
                >
                  See more
                  <ArrowUpRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#ddd8d4] px-6 pb-16 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl border-t border-black/40 pt-7">
          <h2 className="text-4xl font-bold">Contact Me</h2>
          <p className="mt-3 text-2xl leading-tight text-black/75">
            I&apos;m always down to chat!
          </p>
          <div className="mt-8 flex flex-wrap gap-5">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="inline-flex h-16 min-w-44 items-center justify-center gap-4 rounded-2xl border border-black/15 bg-white/70 px-7 text-xl font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
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
        <PhotoCarouselBand placement="static" reverse />
      </section>
    </main>
  );
}
