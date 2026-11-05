import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import NewsletterForm from "@/components/home/NewsletterForm";
import { CONTACT, SOCIAL } from "@/lib/home/content";

const COLS: Array<{ title: string; links: Array<[string, string]> }> = [
  { title: "Company", links: [["About Us", "/#why"], ["Our Team", "/contact"], ["Contact Us", "/contact"], ["Careers", "/contact"]] },
  { title: "Study Destinations", links: [["Study in USA", "/study-abroad/usa"], ["Study in UK", "/study-abroad/uk"], ["Study in Canada", "/study-abroad/canada"], ["Study in Australia", "/study-abroad/australia"], ["Study in Europe", "/study-abroad/germany"]] },
  { title: "Student Services", links: [["University Admissions", "/study-abroad"], ["Scholarships", "/#scholarships"], ["Visa Guidance", "/#enquire?service=Visa%20guidance"], ["IELTS Preparation", "/ielts"], ["Education Loans", "/#scholarships"]] },
  { title: "Resources", links: [["Blogs", "/#resources"], ["Study Guides", "/study-abroad"], ["FAQs", "/#faq"], ["Student Resources", "/support"]] },
];

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "x", label: "X", Icon: FaXTwitter },
] as const;

export default function Footer() {
  const socials = SOCIALS.filter((s) => SOCIAL[s.key]);
  return (
    <footer className="yg-footer">
      <div className="yg-wrap">
        <div className="yg-foot-top">
          <div className="yg-foot-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/yugty-logo-light.svg" alt="Yugty" className="yg-logo" />
            <p>Yugty Overseas Education helps students compare universities, plan costs and manage every step from shortlist to arrival.</p>
            <ul className="yg-contact">
              <li>
                <Mail size={16} aria-hidden /> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                <Phone size={16} aria-hidden /> <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
              </li>
              <li>
                <MapPin size={16} aria-hidden /> <span>{CONTACT.address}</span>
              </li>
            </ul>
            {socials.length > 0 && (
              <ul className="yg-social" aria-label="Social media">
                {socials.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <a href={SOCIAL[key]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title} className="yg-foot-col">
              <h3>{c.title}</h3>
              <ul>
                {c.links.map(([l, h]) => (
                  <li key={l}>
                    <Link href={h}>{l}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="yg-foot-news">
          <div>
            <h3>Study abroad updates, in your inbox</h3>
            <p>Deadlines, scholarship news and country guides. No spam.</p>
          </div>
          <NewsletterForm />
        </div>
        <div className="yg-foot-bottom">
          <p>© {new Date().getFullYear()} Yugty Overseas Education. All rights reserved.</p>
          <p className="yg-foot-disc">Admission, scholarship and visa decisions are made by universities and governments. No service can guarantee an outcome.</p>
          <ul>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/refund-policy">Terms &amp; Refund Policy</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
