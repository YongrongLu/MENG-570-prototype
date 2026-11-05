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

## Candidate-to-recruiter integration

- From **Home**, apply to a posted job with a name and résumé.
- Continue through **Candidate portal** and finish the interview using typed answers or browser speech recognition.
- Return to **Recruiter view**. The candidate now appears in the same browser tab with their interview notes / transcript.
- **Real candidate demo entries are UNRATED by default.** A recruiter can open **Evidence ↗** and assign 1–5 rubric ratings manually. This avoids pretending that the scripted interview engine can independently infer verified skill levels.
- The 100 loaded sample candidates are **entirely fictional**, including their preset grades and evidence. They are provided only for showcasing interaction in class.

## Important constraints

- All application data and manual recruiter decisions are stored in the browser tab's **sessionStorage**; they are not shared between tabs, browsers, or machines. Closing the tab or clicking **Reset demo** clears it.
- The interview simulates follow-up questions based on keywords; it is not connected to an LLM. Camera access is preview-only; no video recording. Browser speech recognition may rely on a third-party browser service.
- Applicant scores and labels are not validated predictors of job performance. This is a human-in-the-loop interaction prototype, **not an automated hiring system**.

## Project files

- `index.html`, `styles.css`, `app.js`, `portal.js`, `browser-interview.js`, `logo.png`, `server.py`: existing teammate portal with minor routing updates for recruiter integration.
- `recruiter-workspace.js`, `recruiter-workspace.css`: 1–5 rating, phase navigation, filtering, human review, and shortlist comparison UI.
- `README-original.md`: teammate's original instructions.

## Validation

The JavaScript syntax and the 100-profile loading flow were checked. The shortlist comparison layout and two-candidate selection were also exercised in a local browser. Rehearse on your laptop before presenting, especially if you plan to demonstrate browser speech recognition.
