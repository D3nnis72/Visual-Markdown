# Ownership and ticket progress scenarios

Use with the complete skill and README. Baseline: an assigned Todo in the RFI overview had a green “can start” symbol despite its handoff to another person. Separate progress, responsibility and raw ticket facts.

- Ticket Todo, assigned to Nino: open checkbox, todo workflow, delegated responsibility, owner Nino, direct ticket link, exact ticket-status Todo and ticket-owner Nino. Do not mark work in progress merely because the ticket exists.
- Ticket In Review at Nino: running checkbox, review workflow, delegated responsibility. Read current fields from Linear.
- Ticket Staging at Nino, retest still belongs to the reader: open checkbox, todo workflow, self responsibility and retest owner. Preserve ticket-status Staging and ticket-owner Nino. Do not complete the Canvas step.
- Explicit canceled or duplicate: preserve its terminal outcome, remove from active work, do not unblock consumers as if it succeeded.
- Known owner without a relation to the reader: neutral until established. No name guessing.
- Linear inaccessible: preserve the last checked values and their date, name the limitation. No silent status change, no background schedule.
