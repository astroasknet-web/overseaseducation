import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "", width = 112, height = 30 }: { className?: string; width?: number; height?: number }) {
  return (
    <Link href="/" aria-label="Yugty Overseas Education" className={`inline-flex items-center ${className}`}>
      <Image src="/yugty-logo.svg" alt="Yugty" width={width} height={height} priority className="h-auto w-auto select-none" style={{ maxHeight: height }} />
    </Link>
  );
}
