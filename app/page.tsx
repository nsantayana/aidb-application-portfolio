import fs from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SevenPremiumsDiagnostic from "./SevenPremiumsDiagnostic";

const contentDirectory = path.join(process.cwd(), "content");

async function readContent(fileName: string) {
  return fs.readFile(path.join(contentDirectory, fileName), "utf8");
}

function splitScoringReceipt(markdown: string) {
  const scoringStart = markdown.indexOf("## Scoring receipt");
  const rolloutStart = markdown.indexOf("## Rollout plan after hiring");

  if (scoringStart === -1 || rolloutStart === -1) {
    return { before: markdown, scoring: "", after: "" };
  }

  return {
    before: markdown.slice(0, scoringStart),
    scoring: markdown.slice(scoringStart, rolloutStart),
    after: markdown.slice(rolloutStart),
  };
}

function MarkdownContent({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`prose-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default async function Home() {
  const rubricMarkdown = await readContent("aidb-episode-share-leverage-rubric.md");
  const rubric = splitScoringReceipt(rubricMarkdown);
  const channelMarkdown = await readContent("aidb-channel-distribution-observation.md");

  return (
    <main>
      <header className="site-header">
        <p>Noel Santayana · AIDB Growth Engineer Application Pre-Work</p>
      </header>

      <nav className="sticky-nav" aria-label="Sections">
        <a href="#intro">Intro</a>
        <a href="#rubric">Rubric</a>
        <a href="#packaging">Packaging</a>
        <a href="#channel">Channel</a>
      </nav>

      <section id="intro" className="page-section intro-section">
        <div className="prose-shell">
          <p className="eyebrow">Application portfolio</p>
          <h1>
            AIDB Growth Engineer <span aria-hidden="true">—</span> Pre-Work
          </h1>
          <p className="subhead">
            The artifacts below are referenced from my application. The rubric is
            the selection layer. The self-diagnostic is the kind of asset that
            actually spreads. The channel observation is the kind of cross-platform
            read I would want to validate with internal data on day one.
          </p>
          <p>
            Most applicants describe what they&apos;d build. This is the build.
            The rubric is the selection layer that decides which AIDB episodes
            are worth packaging. The packaging prototype shows what shipping
            against one looks like. The channel observation is what I noticed
            about distribution while putting this application together.
          </p>
          <p className="attribution">Author: Noel Santayana · Built May 2026</p>
        </div>
      </section>

      <section id="rubric" className="page-section">
        <div className="prose-shell">
          <MarkdownContent>{rubric.before}</MarkdownContent>
          {rubric.scoring ? (
            <div className="scoring-receipt">
              <MarkdownContent>{rubric.scoring}</MarkdownContent>
            </div>
          ) : null}
          <MarkdownContent>{rubric.after}</MarkdownContent>
        </div>
      </section>

      <section id="packaging" className="page-section">
        <div className="prose-shell">
          <div className="prose-content diagnostic-intro">
            <h1>Packaging Prototype — The Seven Premiums Self-Diagnostic</h1>
            <p>
              An example of what a growth-engineering artifact for this episode
              actually looks like — a working interactive tool, not a static
              card. Built in a few hours.
            </p>
            <p>
              Answer 7 questions to see where your service stands against the
              seven categories of human premium AI cannot underprice.
            </p>
          </div>
          <SevenPremiumsDiagnostic />
        </div>
      </section>

      <section id="open-question" className="page-section">
        <div className="prose-shell">
          <MarkdownContent>{channelMarkdown}</MarkdownContent>
        </div>
      </section>

      <footer className="site-footer">
        Built for the AIDB Growth Engineer application · May 2026 ·{" "}
        <a href="#">LinkedIn TODO</a>
      </footer>
    </main>
  );
}
