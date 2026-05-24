import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div
        className="text-[12px]"
        style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
      >
        © 2025 ATP-Go. All rights reserved.
      </div>

      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo_new.png" alt="ATP-Go" width={28} height={28} className="rounded-md" />
        <span
          className="font-bold text-[14px]"
          style={{ fontFamily: "var(--font-syne)", color: "var(--charcoal)" }}
        >
          ATP<span style={{ color: "var(--accent)" }}>-Go</span>
        </span>
      </Link>

      <div
        className="text-[12px]"
        style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
      >
        Built with <span style={{ color: "var(--accent)" }}>♥</span> for Nigerian institutions
      </div>
    </footer>
  );
}
