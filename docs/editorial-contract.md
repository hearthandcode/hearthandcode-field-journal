# Field Journal Editorial Contract

This document defines the publishing boundary for the Hearth & Code Field Journal. It governs what may appear in the public journal, how source material is classified, how claims are labeled, how posts move through the lifecycle, and where the human review gate sits. It is a publishing-governance document, not a creative brief or a mission statement.

---

## 1. Relationship: Hearth & Code and the Exocore Research Program

The Field Journal is the public surface of the Hearth & Code (H&C) studio. H&C is a studio and research practice building Exocore, a scaffolded cognitive environment for neurodivergent thinkers. The Exocore research program produces internal artifacts: session logs, research notes, architectural specifications, methodology documents, pilot assessments, and governance records. These artifacts are private by default.

The Field Journal publishes a curated subset of this work. It is a projection of the internal research record, not a mirror of it. Every post in the Field Journal is a deliberately selected, reviewed, and edited public artifact derived from the Exocore research program. The Field Journal is the outward-facing evidence surface; Exocore is the inward-facing research surface. The boundary between them is this contract.

A note on Field Briefs: the Hub produces a daily operational brief and session record; these are private and never automatically published. A Field Journal Field Brief is a separate, human-selected public projection: a deliberately chosen snapshot of a research moment, written or selected by Scott, reviewed, and published. No automated process generates or publishes a Field Brief.

---

## 2. Public Source Classes: Allowed

The following source classes may be drawn upon for Field Journal posts:

| Class | Description | Example |
|---|---|---|
| **Published artifacts** | Content already public via the H&C GitHub organization, the Field Journal itself, or Scott Rallya's public social accounts. | Public repos, prior Field Journal posts, public X threads. |
| **Reviewed internal artifacts** | Exocore research artifacts that have passed a human review gate and been explicitly cleared for public projection. | A reviewed methodology document, a cleared pilot assessment summary. |
| **Public-domain external sources** | Published research, open-access papers, public datasets, and verifiable third-party content. | arXiv papers, public GitHub repos, open datasets. |
| **Synthesized observations** | General observations about the research process, methodology, or cognitive scaffolding that do not reproduce raw private material. | "The pilot surfaced a pattern: initiation tax increases when the feedback loop exceeds 24 hours." |
| **De-identified data** | Aggregated or anonymized findings from internal work where no individual, session, or private artifact can be reconstructed. | Aggregate pilot scores, anonymized workflow patterns. |

All allowed sources must be cited by a publicly visible identifier: a URL, a DOI, a public repository path, or a neutral reviewed-source disclosure statement. Internal artifact identifiers (work item IDs, session references, private file paths) remain in a private editorial ledger and do not appear in the public post. A post that draws on a reviewed internal artifact cites it as \"reviewed internal research artifact\" with a brief description of the source's nature without exposing internal path topology.

---

## 3. Private Source Classes: Prohibited

The following source classes must never appear in the Field Journal, in whole or in part:

| Class | Description |
|---|---|
| **Private Hub sessions** | Raw session transcripts, message logs, or conversation records from the H&C Hub or any Hermes session log. |
| **Raw research material** | Unreviewed research notes, working drafts, internal spec fragments, or methodology documents that have not passed a human review gate. |
| **Credentials and secrets** | API keys, tokens, passwords, internal URLs, port numbers, or any infrastructure access material. |
| **Personal history** | Biographical detail beyond what Scott has already published publicly. This includes family history, personal relationships, and private life events not voluntarily disclosed in a prior public artifact. |
| **Health and diagnostic material** | Any reference to specific diagnoses, medications, treatment history, or clinical records. General discussion of neurodivergence as a research framing is permitted; clinical specifics are not. |
| **Unreviewed claim text** | Any claim, finding, or assertion that has not been reviewed by Scott for accuracy and publication fitness. AI-produced drafts are unreviewed by default (see Section 9). |
| **Third-party private material** | Any private communication, unpublished work, or personal information belonging to another person, unless that person has given explicit written permission for public use. |

The prohibition on raw research material means: a post may describe a finding from an internal artifact, but it may not reproduce the artifact's full text or structure. Summarize, synthesize, cite. Do not copy-paste.

---

## 4. Claim Label System

Every substantive claim in a Field Journal post must carry one of the following labels, either inline or in the post's frontmatter claim map:

| Label | Meaning | Inline convention |
|---|---|---|
| **[evidence]** | The claim is supported by a verifiable source: a published artifact, a reviewed internal artifact, a public dataset, or a reproducible observation. | `[evidence]` following the claim, or `(E)` in running text. |
| **[inference]** | The claim is a reasoned conclusion drawn from evidence, but the logical chain has not been independently verified. | `[inference]` or `(I)`. |
| **[proposal]** | The claim is a design hypothesis, architectural direction, or methodological suggestion. It has not been tested. | `[proposal]` or `(P)`. |
| **[open-question]** | The claim is a question posed for investigation. It is not asserted as a finding. | `[open-question]` or `(Q)`. |

A post's frontmatter may include a `claim_map` field listing each claim, its label, and its supporting source. This is recommended for research-heavy posts and optional for reflective or observational posts.

Claims without an explicit label are treated as **[inference]** by default. The Field Journal never publishes unlabeled assertions as fact.

---

## 5. Post Lifecycle

Every post moves through three stages:

### 5.1 Draft

A post is in draft when its content exists but has not been reviewed by Scott. All AI-produced text is draft until Scott accepts it. A draft may be:

- A markdown file in a private editorial workspace with `status: draft` in its frontmatter.
- Moved into the public repository only after Scott explicitly selects it for public repository inclusion.
- Hidden from the public site while its public-repository source has `status: draft`.
- Subject to revision, restructuring, or rejection at any point.

`status: draft` controls site routing. It does not make prose in a public Git repository private. Unreviewed authorial drafts remain in the private editorial workspace until Scott chooses to expose them as a public-source candidate.

Drafts carry no publication commitment. A draft exists to be reviewed, not to be polished.

### 5.2 Review

A post enters review when Scott has read the full draft and marked it `status: review`. During review:

- Scott may request changes, add corrections, or reject the post.
- The claim label system is audited: every claim must have a label, and every labeled claim must have a defensible basis.
- Source boundaries are verified: no prohibited material, all citations traceable.
- Voice and editorial consistency are checked against this contract.

The review gate is the human review gate. No post passes review without Scott's explicit acceptance. A post that fails review returns to draft or is archived.

### 5.3 Published

A post is published when its frontmatter carries `status: published` and a `published_date`. Published posts are:

- Visible on the public Field Journal site.
- Immutable in substance (corrections use the amendment mechanism, not silent edits).
- Archived in the journal's git history.

The act of publishing is a human decision. No automated process publishes a post.

---

## 6. Privacy Exclusions

Beyond the source class prohibitions in Section 3, the following additional exclusions apply to every post:

- **No contact information** for any individual beyond what is already public and voluntarily disclosed.
- **No internal system identifiers** that could be used to access private infrastructure (internal hostnames, port numbers, container IDs, file paths into the Hub).
- **No reproduction of private correspondence** (email, direct messages, private social posts) without the sender's explicit written permission.
- **No financial or legal details** beyond what is already published in the H&C public record.

---

## 7. Frontmatter Requirements

Every Field Journal post is a Markdown file with YAML frontmatter. The schema maps to an Astro content collection at `src/content/posts/`. Required and optional fields are documented below with two valid examples.

### Example 1: Minimal Required Fields

```yaml
---
title: "Post title in sentence case"
date: 2026-07-13
labels: [evidence, inference, proposal, open-question]
sources:
  - "Public repo: github.com/hearthandcode/hearthandcode-field-journal"
  - "Reviewed internal research artifact: architecture deep-dive"
status: draft
pilot: false
reviewGate: false
---
```

### Example 2: Complete Post (All Fields)

```yaml
---
title: "Initiation Tax and Feedback Latency in Cognitive Scaffolding"
date: 2026-07-13
labels: [evidence, inference]
sources:
  - "Reviewed internal research artifact: pilot assessment"
  - "arXiv:2507.13334"
status: published
pilot: false
reviewGate: true
slug: "initiation-tax-feedback-latency"
description: "Pilot data suggests initiation tax increases when the cognitive scaffold's feedback loop exceeds 24 hours."
author: "Scott Rallya"
tags: [scaffolding, feedback, pilot-data]
published_date: 2026-07-13
published_order: 2
claim_map:
  - claim: "Initiation tax increases when feedback exceeds 24 hours."
    label: evidence
    source: "Reviewed internal research artifact: pilot assessment"
  - claim: "The Field Journal is a projection, not a mirror."
    label: proposal
    source: "editorial-contract.md, Section 1"
reading_time_minutes: 8
featured_image: "/images/posts/initiation-tax-hero.png"
featured_image_alt: "A descriptive alternative text string for the editorial illustration."
---
```

### Field Reference and Astro Collection Mapping

Every Field Journal post uses YAML frontmatter. The schema maps to an Astro content collection at `src/content/posts/`.

**Required fields:**

| Field | Type | Description |
|---|---|---|
| `title` | string | Post title in sentence case. |
| `date` | date (YYYY-MM-DD) | Publication or creation date. |
| `labels` | array of strings | Claim labels present in the post. Values: `evidence`, `inference`, `proposal`, `open-question`. |
| `sources` | array of strings or objects | Public or reviewed-internal sources. Each entry is a URL, DOI, public repo path, or neutral reviewed-source disclosure. |
| `status` | enum | One of `draft`, `review`, `published`. Only `published` posts appear in production builds. |
| `pilot` | boolean | Whether the post is part of the three-post pilot set. |
| `reviewGate` | boolean | Whether the human review gate has been passed. |

**Optional fields:**

| Field | Type | Description |
|---|---|---|
| `slug` | string | URL-safe slug. If omitted, derived from title. |
| `description` | string | One to two sentence summary for SEO and RSS. |
| `author` | string | Byline. Defaults to `Scott Rallya`. |
| `tags` | array of strings | Topic tags for collection filtering. |
| `published_date` | date | Sort key for post listings. If omitted, uses `date`. |
| `published_order` | positive integer | Deterministic newest-first tie-breaker for entries sharing a `published_date`; higher values appear first. |
| `claim_map` | array of objects | Structured claim-label-source triples. Rendered as an evidence appendix. |
| `reading_time_minutes` | integer | Estimated reading time. Displayed in post header. |
| `featured_image` | string | Path to social card and post header image. |
| `featured_image_alt` | string | Authored alternative text for a featured image. Required whenever the image conveys editorial meaning. |

The Astro collection schema (`src/content.config.ts`) must mirror these fields. The editorial contract is the source of truth for the schema; the collection config implements it.

---

## 8. Three-Post Pilot Selection

The Field Journal will launch with three posts, selected to demonstrate the editorial boundary in practice. The selection method:

1. **Candidate pool**: Scott identifies 5 to 8 internal artifacts that have passed human review and are candidates for public projection. Each candidate is a complete or near-complete piece of work (a methodology document, a research finding, a reflective essay, a pilot summary).

2. **Selection criteria**: Each candidate is scored against three axes:
   - **Public value**: Would a reader outside H&C learn something useful? (1 to 5)
   - **Source safety**: Can the post be written without drawing on any prohibited source class? (pass/fail; fail disqualifies)
   - **Range**: Does the candidate represent a distinct category from the other two selected posts? (methodology, finding, reflection, design, observation)

3. **Selection**: Scott selects the three highest-scoring candidates that together cover the broadest range of categories. The three posts must collectively demonstrate the public-source classes, the claim label system, and the draft-to-published lifecycle.

The pilot posts are published together. They establish the editorial voice and boundary by example. After the pilot, the journal publishes on a schedule determined by post readiness, not by a fixed calendar.

---

## 9. AI Authorship and the Human Review Gate

The Field Journal uses AI as a drafting tool. AI may produce text, structure, and analysis. All AI-produced text is a draft until Scott accepts it. The acceptance is explicit: Scott reads the draft, verifies the claims, checks the source boundaries, and marks the post as reviewed.

The Field Journal does not publish:

- AI-produced text that has not been read by Scott.
- AI-produced claims that have not been verified against their sources.
- AI-produced text where Scott cannot trace the reasoning from source to claim.

The Field Journal's position on AI authorship is: the human is the author. AI is a drafting surface. The byline is Scott Rallya. The review gate is the mechanism that enforces this.

---

## 10. Amendments and Corrections

Published posts may be amended but not silently rewritten. An amendment is a dated addition to the post body, marked with an `## Amendment` heading and the amendment date. The original text remains visible.

Corrections to factual errors are made in place with a `**Correction (YYYY-MM-DD):**` note at the correction site. The original error is not preserved; the correction and its date are.

---

## 11. Governance

This contract is maintained in the Field Journal repository at `docs/editorial-contract.md`. Amendments to the contract follow the same lifecycle as posts: propose, review, publish. Scott is the sole reviewer for contract amendments.

The contract is public. Anyone may read it. It is the first document a new Field Journal contributor should read.

---

## 12. References

The Field Journal editorial contract is maintained in the public Field Journal repository (`github.com/hearthandcode/hearthandcode-field-journal`, path `docs/editorial-contract.md`). The internal Exocore research program maintains its own private documentation surface: research artifacts, work items, session records, and governance documents. These internal references are tracked in a private editorial ledger and are not exposed in public posts. The boundary between public and private reference surfaces is governed by this contract's source-class and privacy-exclusion rules (Sections 2, 3, and 6).