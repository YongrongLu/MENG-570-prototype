# Head Hunters — candidate and recruiter portal demo

No API key, login, or API billing required. Requires Python 3.10+.

## Start

Extract the ZIP, open Terminal in the extracted folder, and run:

    python3 server.py

Open http://localhost:8002. This version uses port 8002 to avoid the earlier demo server.

## Walkthrough

1. On Home, open a role in Job Postings.
2. Enter a candidate name and upload or paste a résumé. Submit application.
3. See Application received, then Continue to candidate portal.
4. Open “Invitation to do a Resume Review Interview”.
5. Enable camera for an optional live self-preview. No video recording or camera audio capture occurs.
6. Agree to browser speech recognition and begin. Click Speak answer, then Finish answer. Typed answers also work.
7. After all topics, or End interview, the portal displays “Your profile is awaiting review by a human recruiter”. Early endings are marked incomplete in the recruiter notes.
8. Return Home and open Recruiter view. Open the candidate profile for résumé comparison, submitted résumé, notes, transcript, and download.
9. Reset demo clears all applications and stops the camera and microphone.

Session data is stored in sessionStorage so refreshing the same tab preserves it. Reset demo or closing the tab clears it. No server database, accounts, emails, or real recruiter notifications are involved. Candidate and recruiter profiles are switchable demo views, not access-controlled accounts.

The résumé keyword comparison and question selection run in browser JavaScript and are hidden from the candidate interface. Prepared follow-up questions react to phrases, with one follow-up per topic. This is a scripted simulation, not semantic assessment. Edit role questions in app.js and follow-up branches in browser-interview.js.

For rehearsal: “We built it as a team” triggers a contribution follow-up; “The pipeline failed” triggers troubleshooting; “It was slow” triggers performance; “I have no experience” triggers a learning-plan question.

Browser speech recognition support varies and may use the browser provider's servers. Try Chrome. Internet may be needed for recognition, fonts, and PDF reading. Camera permission can be declined without blocking the interview. Notes are candidate-reported, automatic transcription may contain errors, and no hiring score is generated.
