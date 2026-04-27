import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { PopChip } from "@/components/pop-chip";
import { Button } from "@/components/ui/button";
import { SectionLabel, SectionRule } from "@/components/ui/section";
import {
  capabilityGroups,
  impactItems,
  profileLinks,
  proofPoints,
} from "@/content/home";

const navItems = [
  { id: "impact", label: "Work" },
  { id: "capabilities", label: "Stack" },
  { id: "approach", label: "Approach" },
  { id: "contact", label: "Contact" },
];

// A single shared focus-ring treatment for plain anchor links so keyboard
// users get the same visual affordance the form controls already have.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const sectionScrollOffset = "scroll-mt-24";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 sm:px-8 sm:py-4 lg:px-12">
          <a
            href="#top"
            className={`rounded-sm font-heading text-[0.72rem] tracking-[0.32em] uppercase text-foreground transition-colors hover:text-primary sm:text-[0.74rem] sm:tracking-[0.34em] ${focusRing}`}
          >
            cadena.sh
          </a>
          <nav
            aria-label="Primary"
            className="flex items-center gap-x-4 text-xs text-muted-foreground sm:gap-x-5 sm:text-sm"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`rounded-sm transition-colors hover:text-foreground ${focusRing}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-10 sm:gap-14 sm:px-8 sm:py-14 lg:px-12">
          <section
            id="top"
            className={`grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] md:items-end ${sectionScrollOffset}`}
          >
            <div className="flex flex-col gap-8">
              <SectionLabel>Network &amp; Security Engineer</SectionLabel>
              <div className="flex max-w-4xl flex-col gap-5">
                <h1 className="font-heading text-5xl leading-none tracking-[-0.08em] text-balance text-foreground sm:text-6xl lg:text-8xl">
                  James Cadena
                </h1>
                <p className="max-w-2xl text-xl leading-8 tracking-[-0.03em] text-zinc-200 sm:text-2xl">
                  Infrastructure across networks, systems, and security.
                </p>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                I build and run infrastructure that has to stay secure,
                reliable, and usable in production. I keep the stack current
                without adding avoidable failure modes.
              </p>
              <ul
                aria-label="Profiles"
                className="flex flex-wrap items-center gap-2"
              >
                {profileLinks.map(({ id, label, href, Icon }) => (
                  <li key={id}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className={`inline-flex items-center justify-center rounded-full border border-border/80 p-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground ${focusRing}`}
                    >
                      <Icon className="size-4 text-current" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <Button
                  asChild
                  variant="brand"
                  size="lg"
                  className="rounded-full px-5"
                >
                  <a href="#impact">
                    View work
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="subtle"
                  size="lg"
                  className="rounded-full px-5"
                >
                  <a href="#contact">Get in touch</a>
                </Button>
              </div>
            </div>

            <aside className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 border-t border-border/70 pt-5">
                <SectionLabel>Path</SectionLabel>
                <p className="text-sm leading-7 text-muted-foreground">
                  I started on the service desk and moved into infrastructure,
                  security, and systems work. Same thread throughout: better
                  access, tighter controls, systems that stay out of the way.
                </p>
              </div>
              <div className="flex flex-col gap-3 border-t border-border/70 pt-5">
                <SectionLabel>Source</SectionLabel>
                <div className="flex items-center justify-between gap-4">
                  <p className="max-w-[14rem] text-sm leading-6 text-muted-foreground">
                    How this site is built.
                  </p>
                  <a
                    href="https://github.com/j-cadena-g/cadena-sh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-sm text-sm text-foreground transition-colors hover:text-primary ${focusRing}`}
                  >
                    <span>Source</span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </aside>
          </section>

          <section aria-label="Focus areas">
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {proofPoints.map((point) => (
                <li
                  key={point.id}
                  className="flex flex-col gap-3 border-t border-border/70 pt-5"
                >
                  <p className="font-heading text-2xl tracking-[-0.06em] text-foreground">
                    {point.value}
                  </p>
                  <p className="text-sm font-medium text-zinc-200">
                    {point.label}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {point.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <SectionRule />

          <section
            id="impact"
            className={`grid gap-x-10 gap-y-8 lg:grid-cols-[14rem_minmax(0,1fr)] ${sectionScrollOffset}`}
          >
            <div className="flex flex-col gap-4">
              <SectionLabel>Work</SectionLabel>
              <h2 className="font-heading text-3xl tracking-[-0.06em] text-foreground sm:text-4xl">
                Selected work
              </h2>
              <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                A few areas where I have had direct responsibility in
                production.
              </p>
            </div>

            <ul className="flex flex-col gap-8">
              {impactItems.map((item) => (
                <li key={item.id} className="border-t border-border/70 pt-6">
                  <article className="grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8">
                    <SectionLabel>{item.label}</SectionLabel>
                    <div className="flex flex-col gap-3">
                      <h3 className="font-heading text-2xl tracking-[-0.05em] text-balance text-foreground">
                        {item.title}
                      </h3>
                      <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                        {item.description}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          <SectionRule />

          <section
            id="capabilities"
            className={`grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] ${sectionScrollOffset}`}
          >
            <div className="flex max-w-xl flex-col gap-4">
              <SectionLabel>Stack</SectionLabel>
              <h2 className="font-heading text-3xl tracking-[-0.06em] text-foreground sm:text-4xl">
                Networks, systems, security, and delivery.
              </h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                New tools when they fit the environment. Older ones when they
                still earn their place.
              </p>
            </div>

            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {capabilityGroups.map((group) => (
                <section
                  key={group.id}
                  aria-label={group.title}
                  className="border-t border-border/70 pt-5"
                >
                  <h3 className="font-heading text-xl tracking-[-0.05em] text-foreground">
                    {group.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>

          <SectionRule />

          <section
            id="approach"
            className={`grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] ${sectionScrollOffset}`}
          >
            <div className="flex max-w-3xl flex-col gap-4">
              <SectionLabel>Approach</SectionLabel>
              <h2 className="font-heading text-3xl tracking-[-0.06em] text-foreground sm:text-4xl">
                Practical infrastructure work.
              </h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                My background is in networks, systems, and security. I also
                build small APIs and deployment tooling where it makes the core
                work easier.
              </p>
            </div>
            <div className="flex flex-col gap-3 border-t border-border/70 pt-5">
              <SectionLabel>Current</SectionLabel>
              <p className="text-sm leading-7 text-muted-foreground">
                Running production infrastructure and building the tooling that
                supports it.
              </p>
            </div>
          </section>

          <SectionRule />

          <section
            id="contact"
            className={`grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] ${sectionScrollOffset}`}
          >
            <div className="flex flex-col gap-4">
              <SectionLabel>Contact</SectionLabel>
              <h2 className="font-heading text-3xl tracking-[-0.06em] text-foreground sm:text-4xl">
                Get in touch
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                If you are hiring for infrastructure, security, systems, or
                technical operations, feel free to get in touch — happy to share
                my resume and references on request. Not hiring? Still happy to
                talk tech and AI.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-border/70 bg-white/[0.015] p-5 sm:p-7">
              <ContactForm />
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <p>&copy; {new Date().getFullYear()} James Cadena</p>
          <PopChip />
          <a
            href="https://github.com/j-cadena-g/cadena-sh"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-foreground ${focusRing}`}
          >
            Source
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
