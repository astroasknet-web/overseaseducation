import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-[14px] text-ink-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-ink">Yugty Overseas Education</p>
          <p className="mt-1 max-w-md text-[13px]">Information on this site is for guidance. Admission, scholarship and visa decisions rest with universities and governments.</p>
          <p className="mt-3 text-[12px] text-ink-4">© {new Date().getFullYear()} Yugty. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          <Link href="/study-abroad" className="hover:text-orange">Universities</Link>
          <Link href="/overseas-packages" className="hover:text-orange">Packages</Link>
          <Link href="/ielts" className="hover:text-orange">IELTS</Link>
          <Link href="/support" className="hover:text-orange">Support</Link>
          <Link href="/privacy-policy" className="hover:text-orange">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-orange">Refunds</Link>
        </nav>
      </div>
    </footer>
  );
}
