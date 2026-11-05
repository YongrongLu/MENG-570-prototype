# Head Hunters — Integrated Two-Phase Recruiter Prototype (1–5)

This folder combines the teammate's candidate application / interview portal with the updated recruiter-controlled, two-phase screening workspace. The original candidate-flow JavaScript is retained, while the old lightweight recruiter list has been replaced with the two-phase screen.

## How to run

1. Keep every file in this folder together.
2. If you have Python 3, open a Terminal inside this folder and run `python3 server.py`.
3. Open `http://localhost:8002` and select **Recruiter view** in the top navigation.

You can also try opening `index.html` directly, but localhost is recommended for browser speech recognition, camera permissions, and PDF uploads. PDF parsing and some browser speech functionality may need network access. There is no API key, login, or database required.

## Demo — the two stages

- Open **Recruiter view** and click **Load 100 fictional profiles**. There are 50 Senior Frontend Engineer applicants and 50 Data Engineer applicants.
- **Phase 1: Initial Screening.** The grades are 1 = Strong No, 2 = No, 3 = Needs Review, 4 = Yes, and 5 = Strong Yes. Filter by job requirements with a configurable 1–5 minimum rating, and mark rules Required or Preferred. Choose Match all / Match any, sort applicants, and inspect interview evidence before shortlisting them.
- Click **+ Shortlist** beside candidates you want to compare.
- **Phase 2: Compare shortlist.** Review shortlisted people side by side in one requirement-by-candidate rating table. Click a name to open the linked interview answers, edit recruiter ratings, add notes, or remove that candidate from the shortlist.
- Try changing the job selector to Data Engineer. The competency list and fictional candidates change with the selected role.

## Auto-suggested ratings (new)

Every candidate now gets a **rule-based suggested 1–5 rating (≈)** per requirement, computed in `auto-score.js` from:

| Signal | Effect |
|---|---|
| Answer says "no experience / never used" | → 1 Strong No |
| Answer describes only a course / tutorial / side project | → 2 No |
| Answer describes a supporting role ("helped with", "another teammate owned") | → 3 Needs Review |
| Otherwise: base 2, +1 skill named (answer or résumé), +1 first-person ownership, +1 quantified outcome | → up to 5 |
| Answer under 12 words | capped at 3, low confidence |
| Topic not covered in interview | résumé keyword only → 3 (low confidence), else no suggestion |

Answers are read clause by clause: "never used Vue, but I built a React app…" only counts the React clause for React, and "read about it, later shipped it to production" counts the hands-on part. Negative statements about another tool or another requirement are ignored. Contradictory statements about the same skill lower the confidence.

Flags: **⚠ résumé gap** = résumé claims a skill but interview evidence scores ≤ 2; **★ beyond résumé** = interview evidence scores ≥ 4 for a skill missing from the résumé.

Filters and sorting use the suggestion until a recruiter confirms. In **Evidence ↗** the recruiter can confirm/override each rating (✓) or click **Accept all suggestions**. Confirmed ratings always win. Suggestions are transparent heuristics, not validated predictors of job performance, and no hiring decision is automated.

## Fictional demo data (new)

`demo-fixtures.js` generates 100 seeded fictional candidates (50 per role) from eight archetypes: well-rounded senior (7), specialist (9), junior (8), career changer (5), polished résumé / thin interview (6), hidden gem with a sparse résumé (5), incomplete interview (5), and weak fit (5). Each has a headline, a fictional résumé and interview answers whose wording drives the auto-suggestions. The same 100 people appear on every load.

Also fixed: the REST keyword no longer matches phrases like "the rest of the team".

## Candidate-to-recruiter integration

- From **Home**, apply to a posted job with a name and résumé.
- Continue through **Candidate portal** and finish the interview using typed answers or browser speech recognition.
- Return to **Recruiter view**. The candidate now appears in the same browser tab with their interview notes / transcript.
- Real candidate entries receive the same auto-suggested ratings from their résumé and interview answers. Topics they skipped or never reached show "Not assessed" unless the résumé mentions the skill. A recruiter confirms or overrides each one in **Evidence ↗**.
- The 100 loaded sample candidates are **entirely fictional**, including their résumés and interview evidence. They are provided only for showcasing interaction in class.

## Important constraints

- All application data and manual recruiter decisions are stored in the browser tab's **sessionStorage**; they are not shared between tabs, browsers, or machines. Closing the tab or clicking **Reset demo** clears it.
- The interview simulates follow-up questions based on keywords; it is not connected to an LLM. Camera access is preview-only; no video recording. Browser speech recognition may rely on a third-party browser service.
- Applicant scores and labels are not validated predictors of job performance. This is a human-in-the-loop interaction prototype, **not an automated hiring system**.

## Project files

- `index.html`, `styles.css`, `app.js`, `portal.js`, `browser-interview.js`, `logo.png`, `server.py`: existing teammate portal with minor routing updates for recruiter integration.
- `auto-score.js`: rule-based suggested ratings. `demo-fixtures.js`: archetype-based fictional candidates.
- `recruiter-workspace.js`, `recruiter-workspace.css`: 1–5 rating, phase navigation, filtering, human review, and shortlist comparison UI.
- `README-original.md`: teammate's original instructions.

## Validation

The JavaScript syntax and the 100-profile loading flow were checked. The shortlist comparison layout and two-candidate selection were also exercised in a local browser. Rehearse on your laptop before presenting, especially if you plan to demonstrate browser speech recognition.

## Recorded interviewer voice

Four bundled recordings in `audio/` play for specific Data Engineer ETL and cloud warehouse questions. Other interview questions continue to use browser speech. Repeat question replays the matching recording; leaving or ending the interview stops playback. If the browser blocks autoplay, use the audio player's Play control. No live voice API or key is required.
