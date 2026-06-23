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
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[72px] transition-all duration-300"
        style={{
          background: scrolled || menuOpen ? "rgba(250,247,242,0.96)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(26,24,20,0.1)" : "none",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo_new.png" alt="ATP-Go" width={36} height={36} className="rounded-lg" />
          <span
            className="font-bold text-[15px] tracking-tight"
            style={{ fontFamily: "var(--font-syne)", color: "var(--charcoal)" }}
          >
            ATP<span style={{ color: "var(--accent)" }}>-Go</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {["Features", "How It Works", "Pricing", "Contact"].map((item) => (
            <li key={item}>
              <a
                href={sectionHref(item)}
                className="text-[12px] uppercase tracking-[0.1em] transition-colors duration-200 hover:text-[var(--charcoal)]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
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
            className="text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 transition-all duration-200 border"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--charcoal)",
              borderColor: "var(--line)",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/waitlist/demo"
            className="text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 text-white transition-all duration-200"
            style={{ fontFamily: "var(--font-dm-mono)", background: "var(--charcoal)" }}
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
              className="block w-6 h-[1.5px] transition-all duration-300 origin-center"
              style={{
                background: "var(--charcoal)",
                opacity: menuOpen && i === 1 ? 0 : 1,
                transform: menuOpen
                  ? i === 0
                    ? "translateY(6.5px) rotate(45deg)"
                    : i === 2
                    ? "translateY(-6.5px) rotate(-45deg)"
                    : "none"
                  : "none",
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed top-[72px] left-0 right-0 z-40 flex flex-col border-b md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <div className="flex flex-col gap-0 px-6 py-4">
          {["Features", "How It Works", "Pricing", "Contact"].map((item) => (
            <a
              key={item}
              href={sectionHref(item)}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] uppercase tracking-[0.1em] py-3 border-b"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--charcoal)", borderColor: "var(--line)" }}
            >
              {item}
            </a>
          ))}
          <Link
            href="/school/login"
            onClick={() => setMenuOpen(false)}
            className="text-[13px] uppercase tracking-[0.1em] py-3"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--accent)" }}
          >
            <span className="flex items-center gap-1.5">Sign In <ArrowRight size={13} /></span>
          </Link>
        </div>
      </div>
    </>
  );
}
