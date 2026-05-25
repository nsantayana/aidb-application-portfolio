import fs from "node:fs/promises";
import path from "node:path";
import { isValidElement, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function PeerCard({ value }: { value: string }) {
  const lines = value.trim().split("\n");

  return (
    <figure className="peer-card my-10">
      <p className="peer-card-kicker">{lines[1]}</p>
      <h3>{lines[0]}</h3>
      <div className="peer-card-questions">
        <div>
          <span>The wrong question:</span>
          <strong>&quot;Can AI do the task?&quot;</strong>
        </div>
        <div>
          <span>The right question:</span>
          <strong>&quot;Does AI-only delivery satisfy the demand?&quot;</strong>
        </div>
      </div>
      <div className="peer-card-list">
        <span>Seven things AI cannot underprice:</span>
        <p>Relationship · Embodied Presence · Trust</p>
        <p>Accountability · Translation · Behavior Change · Provenance</p>
      </div>
      <figcaption>
        If your work delivers two or more, your premium is real.
        <br />
        If your work delivers none, redesign or get repriced.
      </figcaption>
      <a href="https://youtu.be/WhAAKxPlMhw">Listen → episode link</a>
    </figure>
  );
}

function TeamForward({ value }: { value: string }) {
  const subject = value.match(/^Subject: (.*)$/m)?.[1] ?? "";

  return (
    <div className="email-mockup my-10">
      <div className="email-header">
        <p>
          <span>From</span>
          Noel Santayana
        </p>
        <p>
          <span>Subject</span>
          {subject}
        </p>
      </div>
      <div className="email-body">
        <p>Team —</p>
        <p>
          I&apos;d like everyone to listen to this before our offsite. NLW makes
          the most useful argument I&apos;ve heard for what our work becomes as
          AI does more of it.
        </p>
        <p>The short version:</p>
        <ul>
          <li>
            AI does not shrink demand. It expands it through six elasticities:
            price, access, complexity, continuity, personalization, and
            relational.
          </li>
          <li>
            Where capacity opens up, new roles emerge: Navigators, Continuous
            Support Workers, AI-Augmented Service Operators, Data & Operations
            Specialists, QA & Safety, Escalation Specialists.
          </li>
          <li>
            The human premium isn&apos;t going away. It&apos;s going up. In seven
            specific categories: relationship, embodied presence, trust,
            accountability, translation, behavior change, provenance.
          </li>
        </ul>
        <p>I want us to come ready to discuss two questions:</p>
        <ol>
          <li>Where in our current work are we underpricing the human premium?</li>
          <li>Where are we still selling things AI can do for free?</li>
        </ol>
        <p>
          Episode: <a href="https://youtu.be/WhAAKxPlMhw">link</a>
          <br />
          Time: ~30 min
        </p>
      </div>
    </div>
  );
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
          pre: ({ children }) => {
            if (isValidElement<{ children?: unknown }>(children)) {
              const value = String(children.props.children ?? "").trim();

              if (value.startsWith("THE NEW JOBS AI WILL CREATE")) {
                return <PeerCard value={value} />;
              }

              if (value.startsWith("Subject:")) {
                return <TeamForward value={value} />;
              }
            }

            return <pre>{children}</pre>;
          },
          code: ({
            children,
            className,
            ...props
          }: ComponentPropsWithoutRef<"code">) => {
            const value = String(children).trim();

            if (value.startsWith("THE NEW JOBS AI WILL CREATE")) {
              return <PeerCard value={value} />;
            }

            if (value.startsWith("Subject:")) {
              return <TeamForward value={value} />;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default async function Home() {
  const [rubricMarkdown, packagingMarkdown] = await Promise.all([
    readContent("aidb-episode-share-leverage-rubric.md"),
    readContent("aidb-new-jobs-packaging-prototype.md"),
  ]);
  const rubric = splitScoringReceipt(rubricMarkdown);

  return (
    <main>
      <header className="site-header">
        <p>Noel Santayana · AIDB Growth Engineer Application Pre-Work</p>
      </header>

      <nav className="sticky-nav" aria-label="Sections">
        <a href="#intro">Intro</a>
        <a href="#rubric">Rubric</a>
        <a href="#packaging">Packaging</a>
      </nav>

      <section id="intro" className="page-section intro-section">
        <div className="prose-shell">
          <p className="eyebrow">Application portfolio</p>
          <h1>
            AIDB Growth Engineer <span aria-hidden="true">—</span> Pre-Work
          </h1>
          <p className="subhead">Two shipped artifacts referenced from my application.</p>
          <p>
            Most applicants describe what they&apos;d build. This is the build.
            The rubric below is the selection layer that decides which AIDB
            episodes are worth packaging. The packaging prototype shows what
            shipping against one looks like.
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
          <MarkdownContent>{packagingMarkdown}</MarkdownContent>
        </div>
      </section>

      <footer className="site-footer">
        Built for the AIDB Growth Engineer application · May 2026 ·{" "}
        <a href="#">LinkedIn TODO</a>
      </footer>
    </main>
  );
}
