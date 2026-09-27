import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ChainMark } from "@/components/chain-mark";
import { ContactForm } from "@/components/contact-form";
import { PopChip } from "@/components/pop-chip";
import { RouteTrace } from "@/components/route-trace";
import { SectionRail } from "@/components/section-rail";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { SectionLabel, SectionMarker } from "@/components/ui/section";
import {
  capabilityGroups,
  impactItems,
  profileLinks,
  proofPoints,
} from "@/content/home";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "impact", label: "Work" },
  { id: "capabilities", label: "Stack" },
  { id: "approach", label: "Approach" },
  { id: "contact", label: "Contact" },
];

const SOURCE_URL = "https://github.com/j-cadena-g/cadena-sh";

// A single shared focus-ring treatment for plain anchor links so keyboard
// users get the same visual affordance the form controls already have.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const sectionScrollOffset = "scroll-mt-24";

// Gutter and max width shared by every band, so sections can run full-bleed
// backgrounds while their content stays on the same grid.
const shell = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";

const sectionHeading =
  "font-heading text-4xl font-medium tracking-[-0.045em] text-balance text-foreground sm:text-5xl";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

// Section numbers follow the nav order, so the two can never drift apart.
function sectionIndex(id: string) {
  return pad(navItems.findIndex((item) => item.id === id) + 1);
}

export default function Home() {
  return (
    // `overflow-x-clip`, not `-hidden`: hidden turns this wrapper into a scroll
    // container, which pins the sticky header to it instead of the viewport.
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>

      {/* Blueprint backdrop: a fading grid and an amber glow behind the hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[62rem] overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_35%,transparent_100%)]" />
        <div className="absolute -top-80 left-1/2 h-[48rem] w-[min(84rem,150vw)] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
      </div>

      {/* Sticky on phones. From md up it scrolls away and the section rail
          docks the same links on the right edge. */}
      <header
        id="site-header"
        className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/55 md:static"
      >
        <div
          className={cn(
            shell,
            "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3",
          )}
        >
          <a
            href="#top"
            className={`group inline-flex items-center gap-2 rounded-sm font-mono text-[0.82rem] font-medium tracking-tight text-foreground ${focusRing}`}
          >
            <ChainMark className="size-5 motion-safe:transition-transform motion-safe:duration-300 group-hover:-rotate-12" />
            <span>
              cadena<span className="text-primary">.sh</span>
            </span>
          </a>
          <div className="flex items-center gap-x-3 sm:gap-x-6">
            <nav
              aria-label="Primary"
              className="flex items-center gap-x-4 text-xs text-muted-foreground sm:gap-x-6 sm:text-sm"
            >
              {navItems.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`group inline-flex items-baseline gap-1.5 rounded-sm transition-colors hover:text-foreground ${focusRing}`}
                >
                  <span
                    aria-hidden="true"
                    className="hidden font-mono text-[0.62rem] text-primary/70 transition-colors group-hover:text-primary md:inline"
                  >
                    {pad(index + 1)}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <SectionRail headerId="site-header" items={navItems} />

      <main id="main" className="flex-1">
        <section id="top" className={sectionScrollOffset}>
          <div className={cn(shell, "pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24")}>
            <p className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.16em] uppercase text-muted-foreground motion-safe:animate-rise">
              <span aria-hidden="true" className="h-px w-8 bg-primary" />
              IT Infrastructure Analyst
            </p>
            {/* Phones get the name on two larger lines; from sm up it fits on one. */}
            <h1 className="mt-6 font-heading text-[17vw] leading-[0.85] font-medium tracking-[-0.055em] text-foreground sm:text-[clamp(3.4rem,11.2vw,10.5rem)] motion-safe:animate-rise motion-safe:[animation-delay:80ms]">
              James{" "}
              <span className="whitespace-nowrap">
                Cadena
                {/* An underscore cursor, so it can't be misread as a letter,
                    and bound to the last word so it never wraps on its own. */}
                <span
                  aria-hidden="true"
                  className="ml-[0.08em] inline-block h-[0.065em] w-[0.42em] bg-primary align-baseline motion-safe:animate-caret"
                />
              </span>
            </h1>

            <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end lg:gap-16">
              <div className="flex flex-col gap-7 motion-safe:animate-rise motion-safe:[animation-delay:160ms]">
                <p className="max-w-2xl font-heading text-2xl leading-[1.2] tracking-[-0.03em] text-foreground sm:text-[2rem]">
                  Enterprise networks, datacenters, and the security around
                  them.
                </p>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  I design and run the core network, firewalls, and datacenter
                  infrastructure a business depends on, and keep them secure,
                  reliable, and current without adding avoidable failure modes.
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-5 pt-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      asChild
                      variant="brand"
                      size="lg"
                      className="h-11 rounded-full px-6 text-[0.95rem]"
                    >
                      <a href="#impact">
                        View work
                        <ArrowRight
                          data-icon="inline-end"
                          aria-hidden="true"
                          className="motion-safe:transition-transform group-hover/button:translate-x-0.5"
                        />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="subtle"
                      size="lg"
                      className="h-11 rounded-full px-6 text-[0.95rem]"
                    >
                      <a href="#contact">Get in touch</a>
                    </Button>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden h-6 w-px bg-border sm:block"
                  />
                  <ul
                    aria-label="Profiles"
                    className="flex items-center gap-1.5"
                  >
                    {profileLinks.map(({ id, label, href, Icon }) => (
                      <li key={id}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          title={label}
                          className={`inline-flex size-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground ${focusRing}`}
                        >
                          <Icon className="size-4 text-current" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <RouteTrace className="motion-safe:animate-rise motion-safe:[animation-delay:240ms]" />
            </div>
          </div>
        </section>

        <section aria-label="Focus areas">
          <div className={shell}>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
              {proofPoints.map(
                ({ id, value, label, description, Icon }, index) => (
                  <li
                    key={id}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 bg-background p-5 sm:flex sm:flex-col sm:gap-5 sm:p-7"
                  >
                    <div className="flex items-start justify-between sm:items-center">
                      <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-primary">
                        <Icon className="size-[1.1rem]" aria-hidden="true" />
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden font-mono text-[0.68rem] text-muted-foreground/70 tabular-nums sm:inline"
                      >
                        {pad(index + 1)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 sm:gap-5">
                      <div className="flex flex-col gap-1 sm:gap-1.5">
                        <p className="font-heading text-xl font-medium tracking-[-0.04em] text-foreground sm:text-2xl">
                          {value}
                        </p>
                        <p className="text-sm font-medium text-foreground/85">
                          {label}
                        </p>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>

        <section
          id="impact"
          className={cn(sectionScrollOffset, "pt-24 sm:pt-32")}
        >
          <div className={shell}>
            <SectionMarker index={sectionIndex("impact")}>Work</SectionMarker>
            <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
              <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
                <h2 className={sectionHeading}>Selected work</h2>
                <p className="max-w-sm text-base leading-7 text-muted-foreground">
                  A few areas where I have had direct responsibility in
                  production.
                </p>
              </div>

              <ol className="divide-y divide-border border-y border-border">
                {impactItems.map((item, index) => (
                  <li key={item.id} className="py-8 sm:py-10">
                    <article className="grid gap-4 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
                      <span
                        aria-hidden="true"
                        className="hidden font-mono text-sm text-primary tabular-nums sm:block sm:pt-0.5"
                      >
                        {pad(index + 1)}
                      </span>
                      <div className="flex flex-col gap-3">
                        <SectionLabel
                          index={pad(index + 1)}
                          indexClassName="sm:hidden"
                        >
                          {item.label}
                        </SectionLabel>
                        <h3 className="font-heading text-2xl font-medium tracking-[-0.035em] text-balance text-foreground sm:text-[1.9rem] sm:leading-tight">
                          {item.title}
                        </h3>
                        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className={cn(sectionScrollOffset, "pt-24 sm:pt-32")}
        >
          <div className={shell}>
            <SectionMarker index={sectionIndex("capabilities")}>
              Stack
            </SectionMarker>
            <div className="mt-10 grid gap-x-16 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
              <h2 className={cn(sectionHeading, "max-w-3xl")}>
                Networks, security, systems, and cloud.
              </h2>
              <p className="max-w-sm text-base leading-7 text-muted-foreground">
                New tools when they fit the environment. Older ones when they
                still earn their place.
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {capabilityGroups.map((group) => (
                <section
                  key={group.id}
                  aria-label={group.title}
                  className="flex flex-col gap-5 bg-background p-6 sm:p-7"
                >
                  <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                    <h3 className="font-heading text-xl font-medium tracking-[-0.03em] text-foreground">
                      {group.title}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="font-mono text-[0.68rem] text-muted-foreground/70 tabular-nums"
                    >
                      {pad(group.items.length)}
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-border bg-muted/50 px-2.5 py-1 font-mono text-[0.75rem] text-foreground/85"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section
          id="approach"
          className={cn(
            sectionScrollOffset,
            "mt-24 border-y border-border bg-card/40 sm:mt-32",
          )}
        >
          <div className={cn(shell, "py-20 sm:py-28")}>
            <SectionMarker index={sectionIndex("approach")}>
              Approach
            </SectionMarker>
            <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
              <div className="flex flex-col gap-6">
                <h2 className="font-heading text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.05em] text-balance text-foreground">
                  Practical infrastructure work.
                </h2>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  Network architecture is where I am strongest, and security is
                  where I am heading. Systems, storage, and identity work fill
                  in the rest, with small tools built where they make the core
                  work easier.
                </p>
              </div>

              <ol className="flex flex-col gap-10 self-end pl-9">
                <li className="relative">
                  {/* Link to the next node: from this node's bottom edge,
                      across the gap-10, to the next node's top edge. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-3 -bottom-[2.625rem] -left-[1.9375rem] w-px -translate-x-1/2 bg-linear-to-b from-muted-foreground/40 to-primary/80"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 -left-9 size-2.5 rounded-full border-[1.5px] border-muted-foreground/60 bg-background"
                  />
                  <SectionLabel>Path</SectionLabel>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">
                    I started on the service desk and moved into infrastructure,
                    security, and systems work. Same thread throughout: better
                    access, tighter controls, systems that stay out of the way.
                  </p>
                </li>
                <li className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-3 -bottom-[2.625rem] -left-[1.9375rem] w-px -translate-x-1/2 bg-linear-to-b from-primary/80 to-muted-foreground/30"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 -left-9 size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_var(--glow)]"
                  />
                  <SectionLabel className="text-primary">Current</SectionLabel>
                  <p className="mt-3 text-base leading-7 text-foreground/90">
                    Focused on enterprise network architecture: the core
                    network, Palo Alto firewalls, and the datacenter behind
                    them.
                  </p>
                </li>
                <li className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 -left-9 size-2.5 rounded-full border-[1.5px] border-dashed border-primary/70 bg-background"
                  />
                  <SectionLabel>Next</SectionLabel>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">
                    Moving deeper into security: architecture, governance, and
                    risk.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className={cn(sectionScrollOffset, "py-24 sm:py-32")}
        >
          <div className={shell}>
            <SectionMarker index={sectionIndex("contact")}>
              Contact
            </SectionMarker>
            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
              <div className="flex flex-col gap-5">
                <h2 className="font-heading text-[clamp(2.75rem,6vw,5rem)] leading-[0.95] font-medium tracking-[-0.05em] text-foreground">
                  Get in touch
                </h2>
                <p className="max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  If you are hiring for network, security, or infrastructure
                  roles, feel free to get in touch — happy to share my resume
                  and references on request. Not hiring? Still happy to talk
                  tech and AI.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className={cn(shell, "flex flex-col gap-10 pt-14 pb-8")}>
          <p
            aria-hidden="true"
            className="pb-[0.06em] font-heading text-[clamp(3.5rem,15vw,13rem)] leading-[0.8] font-medium tracking-[-0.06em] text-transparent select-none *:bg-clip-text"
          >
            <span className="bg-linear-to-b from-foreground/[0.14] to-foreground/0">
              cadena
            </span>
            <span className="bg-linear-to-b from-primary/40 to-primary/0">
              .sh
            </span>
          </p>
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p>&copy; {new Date().getFullYear()} James Cadena</p>
            <PopChip />
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-foreground ${focusRing}`}
            >
              Source
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
