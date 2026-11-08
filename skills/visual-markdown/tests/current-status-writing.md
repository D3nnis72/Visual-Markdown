# Current-status writing check

Checked 2026-11-08 with the same running-fix scenario before and after the skill change.

The baseline placed “ticket assigned; code fix and retest pending” in the description and the ticket under `see`. That text became “Why” when expanded, while the link was hidden when collapsed.

With the revised guidance, the entry put the working state and direct ticket link in `status`, the problem in the description and the next action in `next`. Ticket assignment was not described as implementation progress.

Renderer tests cover the visible status link, separate Why content, computed-state fallback and German/English labels. A check test covers the warning for running steps without a concrete status. Browser inspection covered light expanded rows and dark collapsed rows at a narrow width. This is a targeted writing and rendering check, not a reliability estimate across all authors or a live ticket-status integration.
