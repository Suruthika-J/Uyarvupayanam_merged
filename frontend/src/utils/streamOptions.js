/**
 * Single source of truth for the stream list used on the admin mapping page
 * ("Step 1: Filter by stream") AND the student Colleges filter chips.
 *
 * A stream added here automatically shows up as a filter chip on the student
 * Class 12 Colleges page — never hardcode a shorter student-only list.
 */
export const STREAMS = [
  "Engineering",
  "Medical",
  "Arts & Science",
  "Law",
  "Diploma",
  "Media & Journalism",
  "Polytechnic",
  "Agriculture",
  "Others",
]