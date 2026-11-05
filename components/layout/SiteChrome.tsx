import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/** The main site's navigation bar and footer around a portal page. The bar (announcement line plus floating bar) is fixed, so the page starts below it. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
      <Footer />
    </>
  );
}
