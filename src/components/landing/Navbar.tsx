"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const sectionHref = (label: string) => {
    const id = label.toLowerCase().replace(/\s+/g, "-");
    return pathname === "/" ? `#${id}` : `/#${id}`;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[72px] transition-all duration-300 ${
          scrolled || menuOpen ? "bg-paper/[0.96] backdrop-blur-xl" : "bg-transparent backdrop-blur-none"
        } ${scrolled ? "border-b border-line-color" : "border-b border-transparent"}`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ATP-Go" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-[15px] tracking-tight font-display text-charcoal">
            ATP<span className="text-[var(--accent)]">-Go</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {["Features", "How It Works", "Pricing", "Contact"].map((item) => (
            <li key={item}>
              <a
                href={sectionHref(item)}
                className="text-[12px] uppercase tracking-[0.1em] transition-colors duration-200 hover:text-[var(--charcoal)] font-mono text-muted"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/school/login"
            className="text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 transition-all duration-200 border font-mono text-charcoal border-[var(--line)]"
          >
            Sign In
          </Link>
          <Link
            href="/waitlist/demo"
            className="text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 text-white transition-all duration-200 font-mono bg-charcoal"
          >
            <span className="flex items-center gap-1.5">Get Demo <ArrowRight size={13} /></span>
          </Link>
        </div>

        {/* Hamburger — animates to ✕ when open */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block w-6 h-[1.5px] transition-all duration-300 origin-center bg-charcoal ${
                menuOpen && i === 1 ? "opacity-0" : "opacity-100"
              } ${
                menuOpen
                  ? i === 0
                    ? "translate-y-[6.5px] rotate-45"
                    : i === 2
                    ? "-translate-y-[6.5px] -rotate-45"
                    : ""
                  : ""
              }`}
            />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed top-[72px] left-0 right-0 z-40 flex flex-col border-b md:hidden transition-all duration-300 overflow-hidden bg-paper border-line-color ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-0 px-6 py-4">
          {["Features", "How It Works", "Pricing", "Contact"].map((item) => (
            <a
              key={item}
              href={sectionHref(item)}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] uppercase tracking-[0.1em] py-3 border-b font-mono text-charcoal border-line-color"
            >
              {item}
            </a>
          ))}
          <Link
            href="/school/login"
            onClick={() => setMenuOpen(false)}
            className="text-[13px] uppercase tracking-[0.1em] py-3 font-mono text-[var(--accent)]"
          >
            <span className="flex items-center gap-1.5">Sign In <ArrowRight size={13} /></span>
          </Link>
        </div>
      </div>
    </>
  );
}
