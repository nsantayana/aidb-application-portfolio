"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  key: "r" | "e" | "t" | "a" | "tr" | "b" | "p";
  name: string;
  question: string;
};

type Answers = Partial<Record<Category["key"], number>>;

const categories: Category[] = [
  {
    key: "r",
    name: "Relationship",
    question:
      "Do clients pay for continuity, memory, and accumulated trust with you specifically - not just the deliverable?",
  },
  {
    key: "e",
    name: "Embodied Presence",
    question:
      "Does your work require someone physically being there - hands on, in the room, on the site?",
  },
  {
    key: "t",
    name: "Trust",
    question:
      "Do clients hire you because they need a person they can verify, check on, and feel confident about before high-stakes decisions?",
  },
  {
    key: "a",
    name: "Accountability",
    question:
      "Do clients need you to sign off, carry the legal responsibility, or be the one to blame when things go wrong?",
  },
  {
    key: "tr",
    name: "Translation",
    question:
      "Do clients pay you to turn their messy needs and constraints into something AI or tools can actually execute?",
  },
  {
    key: "b",
    name: "Behavior Change",
    question:
      "Do clients need human accountability to follow through on hard things - rehab, fitness, financial discipline, learning?",
  },
  {
    key: "p",
    name: "Provenance",
    question:
      "Do clients pay a premium because your name, signature, or craftsmanship is on the work?",
  },
];

const options = [
  { label: "Not at all", value: 0 },
  { label: "Slightly", value: 1 },
  { label: "Somewhat", value: 2 },
  { label: "Core to what I sell", value: 3 },
];

const bands = [
  {
    min: 17,
    max: 21,
    label: "Strong human-premium service.",
    shareLabel: "Strong human-premium service",
    interpretation:
      "Your pricing power is real. AI substitutes will not erode the categories you score 3 on. Defend and double down on those. Audit any 0-1 categories for redesign opportunities.",
  },
  {
    min: 12,
    max: 16,
    label: "Mixed.",
    shareLabel: "Mixed",
    interpretation:
      "You have moats and exposure. The categories you scored 3 on are defensible. The categories you scored 0-1 on are where AI pricing pressure will land first. Redesign those before the floor moves.",
  },
  {
    min: 6,
    max: 11,
    label: "Significant commodity exposure.",
    shareLabel: "Significant commodity exposure",
    interpretation:
      "Most of what you sell sits in categories AI can substitute. Pricing pressure is coming. Identify which 1-2 premiums you can credibly build up and redesign your offer around them.",
  },
  {
    min: 0,
    max: 5,
    label: "You are selling what AI already does for free.",
    shareLabel: "AI-commodity exposed",
    interpretation:
      "Either redesign the service to deliver one of the seven premiums, or pivot. Continuing to compete on the current dimensions means racing the AI floor to the bottom.",
  },
];

function getBand(score: number) {
  return bands.find((band) => score >= band.min && score <= band.max) ?? bands[3];
}

function answersFromSearchParams(params: URLSearchParams): Answers {
  return categories.reduce<Answers>((acc, category) => {
    const raw = params.get(category.key);
    const value = raw === null ? Number.NaN : Number(raw);

    if (Number.isInteger(value) && value >= 0 && value <= 3) {
      acc[category.key] = value;
    }

    return acc;
  }, {});
}

function buildResultUrl(answers: Answers) {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);
  categories.forEach((category) => {
    const value = answers[category.key];
    if (typeof value === "number") {
      url.searchParams.set(category.key, String(value));
    }
  });
  url.hash = "packaging";

  return url.toString();
}

export default function SevenPremiumsDiagnostic() {
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seededAnswers = answersFromSearchParams(params);
    const isComplete = categories.every(
      (category) => typeof seededAnswers[category.key] === "number",
    );

    if (isComplete) {
      setAnswers(seededAnswers);
      setShowResult(true);
    }
  }, []);

  const answeredCount = categories.filter(
    (category) => typeof answers[category.key] === "number",
  ).length;
  const isComplete = answeredCount === categories.length;
  const score = useMemo(
    () =>
      categories.reduce((total, category) => total + (answers[category.key] ?? 0), 0),
    [answers],
  );
  const band = getBand(score);
  const resultUrl = showResult ? buildResultUrl(answers) : "";
  const shareText = `I scored ${score}/21 on the Seven Premiums self-diagnostic - based on @nlw's recent episode on the new jobs AI will create. Where does your service sit?`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(resultUrl)}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    resultUrl,
  )}`;

  function setAnswer(key: Category["key"], value: number) {
    setCopied(false);
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function requestResult() {
    if (!isComplete) {
      setAttemptedSubmit(true);
      return;
    }

    setShowResult(true);
    window.history.replaceState(null, "", buildResultUrl(answers));
  }

  async function copyResultLink() {
    await navigator.clipboard.writeText(resultUrl);
    setCopied(true);
  }

  function retake() {
    const url = new URL(window.location.href);
    categories.forEach((category) => url.searchParams.delete(category.key));
    window.history.replaceState(null, "", `${url.pathname}${url.hash || "#packaging"}`);
    setAnswers({});
    setShowResult(false);
    setCopied(false);
    setAttemptedSubmit(false);
  }

  if (showResult) {
    return (
      <div className="diagnostic-result" aria-live="polite">
        <div className="result-card">
          <p className="result-kicker">Seven Premiums score</p>
          <h3>
            {score} <span>/ 21</span>
          </h3>
          <p className="result-band">{band.label}</p>
          <p>{band.interpretation}</p>

          <div className="score-bars" aria-label="Category score breakdown">
            {categories.map((category) => {
              const value = answers[category.key] ?? 0;

              return (
                <div className="score-row" key={category.key}>
                  <div className="score-row-label">
                    <span>{category.name}</span>
                    <strong>{value}/3</strong>
                  </div>
                  <div className="score-track" aria-hidden="true">
                    <span style={{ width: `${(value / 3) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <blockquote>
            &quot;Can AI do the task&quot; vs &quot;Does AI-only delivery satisfy
            the demand?&quot;
            <cite>NLW, The AI Daily Brief, May 11, 2026</cite>
          </blockquote>

          <a
            className="diagnostic-button primary"
            href="https://youtu.be/WhAAKxPlMhw"
            target="_blank"
            rel="noreferrer"
          >
            Listen to the episode
          </a>
        </div>

        <div className="share-panel">
          <h3>Share your result</h3>
          <div className="share-actions">
            <button className="diagnostic-button" type="button" onClick={copyResultLink}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <a className="diagnostic-button" href={xShareUrl} target="_blank" rel="noreferrer">
              Share to X
            </a>
            <a
              className="diagnostic-button"
              href={linkedInShareUrl}
              target="_blank"
              rel="noreferrer"
            >
              Share to LinkedIn
            </a>
          </div>
          <button className="retake-button" type="button" onClick={retake}>
            Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="diagnostic-form"
      onSubmit={(event) => {
        event.preventDefault();
        requestResult();
      }}
    >
      <div className="diagnostic-progress" id="diagnostic-progress">
        <span>{answeredCount} of 7 answered</span>
      </div>

      {categories.map((category, index) => (
        <fieldset
          aria-describedby={`diagnostic-progress ${
            attemptedSubmit && typeof answers[category.key] !== "number"
              ? `missing-${category.key}`
              : ""
          }`}
          aria-invalid={
            attemptedSubmit && typeof answers[category.key] !== "number"
              ? "true"
              : undefined
          }
          className="question-card"
          key={category.key}
        >
          <legend className="sr-only" id={`question-${category.key}`}>
            {index + 1}. {category.name}. {category.question}
          </legend>
          <div className="question-prompt" aria-hidden="true">
            <span>{index + 1}. {category.name}</span>
            <p>{category.question}</p>
          </div>

          <div className="option-grid">
            {options.map((option) => (
              <label key={option.value}>
                <input
                  checked={answers[category.key] === option.value}
                  name={category.key}
                  onChange={() => setAnswer(category.key, option.value)}
                  required
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {attemptedSubmit && typeof answers[category.key] !== "number" ? (
            <p className="field-required" id={`missing-${category.key}`}>
              Required before results.
            </p>
          ) : null}
        </fieldset>
      ))}

      <div
        className="submit-area"
        onPointerDown={() => {
          if (!isComplete) {
            setAttemptedSubmit(true);
          }
        }}
      >
        {attemptedSubmit && !isComplete ? (
          <p className="submit-guidance" id="diagnostic-required-message" role="status">
            Answer all 7 questions to see your result.
          </p>
        ) : null}
        <button
          aria-describedby={
            attemptedSubmit && !isComplete ? "diagnostic-required-message" : undefined
          }
          className="diagnostic-button primary submit-result"
          disabled={!isComplete}
          type="submit"
        >
          See my result
        </button>
      </div>
    </form>
  );
}
