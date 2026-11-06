import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, Play, Quote } from "lucide-react";
import data from "@/lib/abroad/data/study-abroad.json";
import { ABROAD_PACKAGES } from "@/lib/abroad/packages";
import { DESTINATIONS, FAQS, FUNDING, JOURNEY, RESOURCES, SERVICES, TESTIMONIALS, VERIFIED_STATS, WHY } from "@/lib/home/content";
import { photo } from "@/lib/home/images";
import { SITE_URL } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Icon from "@/components/home/Icon";
import Reveal from "@/components/home/Reveal";
import Counter from "@/components/home/Counter";
import GlobeHero from "@/components/home/GlobeHero";
import Discovery, { type UniLite } from "@/components/home/Discovery";
import EnquiryForm from "@/components/home/EnquiryForm";

export const metadata: Metadata = {
  title: "Yugty Overseas Education: Your Global Education Journey Starts Here",
  description:
    "Discover world-class universities, explore international opportunities and turn your academic ambitions into a global future. Compare ten study destinations, plan costs in rupees and get expert help from shortlist to visa.",
  alternates: { canonical: SITE_URL },
};

type CatCountry = { key: string; tuition: { mid: number; low: number }; currency: string; living: { low: number } };
const fx = data.fx as Record<string, number>;
const CAT = new Map((data.countries as unknown as CatCountry[]).map((c) => [c.key, c]));
const lakh = (inr: number) => `₹${(inr / 1_00_000).toFixed(inr >= 10_00_000 ? 0 : 1)} lakh`;

const UNIS: UniLite[] = (data.universities as unknown as Array<{ slug: string; name: string; country: string; levels: string[]; fields: string[]; cost: string }>).map((u) => ({
  slug: u.slug, name: u.name, country: u.country, levels: u.levels, fields: u.fields, cost: u.cost,
}));

export default function Home() {
  const heroPhoto = photo("hero");
  const stats: Array<{ value: number; suffix?: string; label: string }> = [
    { value: data.countries.length, label: "Destinations in our catalogue" },
    { value: data.universities.length, label: "Universities compared" },
    { value: ABROAD_PACKAGES.length, label: "Levels of expert support" },
    { value: JOURNEY.length, label: "Steps from ambition to admission" },
    ...VERIFIED_STATS,
  ];

  return (
    <div className="yg">
      <Navbar overlay />

      {/* 2. HERO */}
      <section className="yg-hero" id="top">
        <div className="yg-hero-bg" aria-hidden style={heroPhoto ? { backgroundImage: `linear-gradient(180deg, rgba(5,12,32,.78), rgba(5,12,32,.92)), url(${heroPhoto})` } : undefined} />
        <div className="yg-wrap yg-hero-in">
          <div className="yg-hero-copy">
            <p className="yg-pill"><span /> Counsellor-led study abroad, from shortlist to arrival</p>
            <h1>Your Global Education Journey <em>Starts Here.</em></h1>
            <p className="yg-lead">Discover world-class universities, explore international opportunities, and turn your academic ambitions into a global future.</p>
            <Discovery unis={UNIS} compact />
            <div className="yg-cta-row">
              <a href="#destinations" className="yg-btn yg-btn-primary yg-btn-lg">Explore Study Destinations <ArrowRight size={18} aria-hidden /></a>
              <Link href="/study-abroad" className="yg-btn yg-btn-ghost yg-btn-lg">Find Your University</Link>
            </div>
            <div className="yg-trust">
              <b><Counter to={data.universities.length} />+</b>
              <span>universities and <b><Counter to={data.countries.length} /></b> destinations compared in rupees, with guidance at every step.</span>
            </div>
          </div>
          <GlobeHero />
        </div>
      </section>

      {/* 3. DISCOVERY */}
      <section className="yg-sec yg-sec-light" id="discover">
        <div className="yg-wrap">
          <Reveal className="yg-head">
            <p className="yg-kicker">Discover</p>
            <h2>Find the right university and programme, <em>faster.</em></h2>
            <p>Filter by country, level, subject, budget and intake. See matching universities instantly.</p>
          </Reveal>
          <Reveal className="yg-discover"><Discovery unis={UNIS} /></Reveal>
        </div>
      </section>

      {/* 4. DESTINATIONS */}
      <section className="yg-sec yg-sec-off" id="destinations">
        <div className="yg-wrap">
          <Reveal className="yg-head">
            <p className="yg-kicker">Study destinations</p>
            <h2>Ten countries. <em>One trusted guide.</em></h2>
            <p>Explore where your ambition could take you, with real costs and honest comparisons.</p>
          </Reveal>
          <ul className="yg-dest-grid">
            {DESTINATIONS.map((d, i) => {
              const c = CAT.get(d.key);
              const img = photo(`destinations/${d.key}`);
              const href = d.catalogue ? `/study-abroad/${d.key}` : `/#enquire?dest=${encodeURIComponent(d.name)}`;
              return (
                <Reveal as="li" key={d.key} delay={(i % 5) * 60}>
                  <Link href={href} className="yg-dest">
                    <span className="yg-dest-art" style={{ background: img ? `url(${img}) center/cover` : `linear-gradient(135deg, ${d.hue[0]}, ${d.hue[1]})` }}>
                      {!img && <span className="yg-dest-code" aria-hidden>{d.code}</span>}
                      <span className="yg-dest-name">{d.name}</span>
                    </span>
                    <span className="yg-dest-body">
                      <span className="yg-dest-blurb">{d.blurb}</span>
                      <span className="yg-dest-tags">{d.programmes.map((p) => <i key={p}>{p}</i>)}</span>
                      <span className="yg-dest-foot">
                        <span>{c ? <>Tuition from <b>{lakh(c.tuition.mid * (fx[c.currency] ?? 1))}</b>/yr</> : "Ask us about costs"}</span>
                        <span className="yg-dest-go">Explore Destination <ArrowUpRight size={15} aria-hidden /></span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="yg-band" aria-label="Germany public universities programme">
        <div className="yg-wrap yg-band-in">
          <div><p className="yg-kicker">Studying in Germany?</p><h2>TestAS, German and IELTS prep with an admission assurance.</h2><p>One programme for Germany&apos;s public universities, from preparation to your visa. See the fee, what is included and the terms.</p></div>
          <Link href="/germany-public-universities" className="yg-btn yg-btn-primary yg-btn-lg">See the Germany programme <ArrowRight size={18} aria-hidden /></Link>
        </div>
      </section>

      {/* 5. SERVICES */}
      <section className="yg-sec yg-sec-light" id="services">
        <div className="yg-wrap">
          <Reveal className="yg-head">
            <p className="yg-kicker">Our services</p>
            <h2>Complete support, <em>start to settled.</em></h2>
            <p>Eleven services that cover everything between your first question and your first month abroad.</p>
          </Reveal>
          <ul className="yg-svc-grid">
            {SERVICES.map((s, i) => (
              <Reveal as="li" key={s.title} delay={(i % 4) * 50}>
                <Link href={s.href} className="yg-svc">
                  <span className="yg-ico"><Icon name={s.icon} size={24} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <span className="yg-svc-cta">{s.cta} <ArrowRight size={15} aria-hidden /></span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="yg-sec yg-dark" id="why">
        <div className="yg-wrap yg-why">
          <Reveal className="yg-why-intro">
            <p className="yg-kicker yg-kicker-light">Why choose us</p>
            <h2>A global education platform built on <em>clarity and care.</em></h2>
            <p>We combine real data, personal guidance and a transparent process, so you always know where you stand and what happens next.</p>
            <dl className="yg-stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt><Counter to={s.value} suffix={s.suffix} /></dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <ul className="yg-why-grid">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.title} delay={(i % 3) * 60} className="yg-why-card">
                <span className="yg-ico yg-ico-light"><Icon name={w.icon} size={22} /></span>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. JOURNEY */}
      <section className="yg-sec yg-sec-off" id="journey">
        <div className="yg-wrap">
          <Reveal className="yg-head yg-head-center">
            <p className="yg-kicker">Your journey</p>
            <h2>From ambition to <em>admission.</em></h2>
            <p>Seven clear steps, each with a guide beside you.</p>
          </Reveal>
          <ol className="yg-timeline">
            {JOURNEY.map((s, i) => (
              <Reveal as="li" key={s.no} delay={i * 90}>
                <span className="yg-node">{s.no}</span>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="yg-center"><a href="#enquire" className="yg-btn yg-btn-primary yg-btn-lg">Start your journey <ArrowRight size={18} aria-hidden /></a></Reveal>
        </div>
      </section>

      {/* 8. SCHOLARSHIPS & FINANCE */}
      <section className="yg-sec yg-sec-light" id="scholarships">
        <div className="yg-wrap yg-fund">
          <Reveal className="yg-fund-intro">
            <p className="yg-kicker">Scholarships &amp; financial guidance</p>
            <h2>Make studying abroad <em>affordable.</em></h2>
            <p>Know the full cost up front, find funding you qualify for, and plan your finances before you commit.</p>
            <div className="yg-cta-row yg-cta-left">
              <a href="#enquire?service=Scholarship%20guidance" className="yg-btn yg-btn-primary">Get scholarship guidance</a>
              <Link href="/study-abroad" className="yg-btn yg-btn-ghost-dark">Compare costs</Link>
              <Link href="/loan-help" className="yg-btn yg-btn-ghost-dark">Education loan help</Link>
            </div>
          </Reveal>
          <ul className="yg-fund-grid">
            {FUNDING.map((f, i) => (
              <Reveal as="li" key={f.title} delay={(i % 2) * 70} className="yg-fund-card">
                <span className="yg-ico"><Icon name={f.icon} size={22} /></span>
                <div><h3>{f.title}</h3><p>{f.text}</p></div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. SUCCESS STORIES */}
      <section className="yg-sec yg-sec-off" id="stories">
        <div className="yg-wrap">
          <Reveal className="yg-head">
            <p className="yg-kicker">Student success stories</p>
            <h2>Real students. <em>Real journeys.</em></h2>
            <p>Hear from students who took the step. These cards are samples until verified stories are added.</p>
          </Reveal>
          <ul className="yg-story-grid">
            {TESTIMONIALS.map((t, i) => {
              const img = photo(`students/${i + 1}`);
              return (
                <Reveal as="li" key={i} delay={i * 80} className="yg-story">
                  <div className="yg-story-media" style={img ? { background: `url(${img}) center/cover` } : undefined}>
                    {!img && <span aria-hidden>{(t.name[0] ?? "S").toUpperCase()}</span>}
                    <button type="button" className="yg-play" disabled aria-label="Video testimonial coming soon"><Play size={20} aria-hidden /></button>
                    <em>Video coming soon</em>
                  </div>
                  <Quote size={22} className="yg-quote" aria-hidden />
                  <p>{t.quote}</p>
                  <footer>
                    <b>{t.name}</b>
                    <span>{t.programme}</span>
                    <span>{t.university}, {t.country}</span>
                    {t.placeholder && <i className="yg-sample">Sample story</i>}
                  </footer>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 10. RESOURCES */}
      <section className="yg-sec yg-sec-light" id="resources">
        <div className="yg-wrap">
          <Reveal className="yg-head yg-head-row">
            <div>
              <p className="yg-kicker">Knowledge centre</p>
              <h2>Guides, tools and <em>answers.</em></h2>
            </div>
            <Link href="/study-abroad" className="yg-btn yg-btn-ghost-dark">Visit Knowledge Centre <ArrowRight size={16} aria-hidden /></Link>
          </Reveal>
          <ul className="yg-res-grid">
            {RESOURCES.map((r, i) => (
              <Reveal as="li" key={r.title} delay={(i % 4) * 50}>
                <Link href={r.href} className="yg-res">
                  <i>{r.tag}</i>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                  <span>Read more <ArrowRight size={14} aria-hidden /></span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 11. LEAD GENERATION */}
      <section className="yg-sec yg-lead-sec" id="enquire">
        <div className="yg-wrap yg-enq-wrap">
          <Reveal className="yg-enq-copy">
            <p className="yg-kicker yg-kicker-light">Free counselling</p>
            <h2>Let&apos;s Turn Your Global Ambitions into <em>Reality.</em></h2>
            <p>Connect with our education experts and discover the right international study opportunities for your future.</p>
            <ul className="yg-checks">
              <li>Personal advice on country, programme and budget</li>
              <li>A clear plan with deadlines and next steps</li>
              <li>No obligation, and no pressure</li>
            </ul>
          </Reveal>
          <Reveal className="yg-enq-card"><EnquiryForm /></Reveal>
        </div>
      </section>

      {/* 12. FAQ */}
      <section className="yg-sec yg-sec-off" id="faq">
        <div className="yg-wrap yg-faq">
          <Reveal className="yg-head">
            <p className="yg-kicker">FAQ</p>
            <h2>Straight answers to <em>common questions.</em></h2>
          </Reveal>
          <div className="yg-faq-list">
            {FAQS.map(([q, a]) => (
              <details key={q} name="faq">
                <summary>{q}<ChevronDown size={20} aria-hidden /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }) }} />
    </div>
  );
}
