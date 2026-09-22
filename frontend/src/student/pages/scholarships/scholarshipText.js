const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

const trim = (v) => (v == null ? "" : String(v).trim())

const capitalize = (s) => {
  const t = trim(s)
  if (!t) return ""
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const friendlyDate = (raw) => {
  const m = raw.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/)
  if (m) {
    let [, dd, mm, yyyy] = m
    const d = parseInt(dd, 10), mo = parseInt(mm, 10), y = parseInt(yyyy, 10)
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2100) {
      return `${d} ${MONTHS[mo - 1]} ${y}`
    }
  }
  return null
}

const ELIGIBILITY_RULES = [
  [/^8th pass(?:ed)?\s+with\s+low\s+income$/i, "Students who have passed Class 8 and belong to a low-income family"],
  [/^10th\s+students?\s+with\s+merit$/i, "Class 10 students with good academic merit"],
  [/^class\s+([5-9]|1[0-2])\s*[-–—]\s*([5-9]|1[0-2])\s+sc\s+students?$/i, "SC (Scheduled Caste) students in Classes $1 and $2"],
  [/^class\s+([5-9]|1[0-2])\s*[-–—]\s*([5-9]|1[0-2])\s+st\s+students?$/i, "ST (Scheduled Tribe) students in Classes $1 and $2"],
  [/^class\s+([5-9]|1[0-2])\s*[-–—]\s*([5-9]|1[0-2])\s+obc\s+students?$/i, "OBC students in Classes $1 and $2"],
  [/^(?:post\s+10th|post.?matric)\s+sc\s+students?$/i, "SC (Scheduled Caste) students studying beyond Class 10"],
  [/^(?:post\s+10th|post.?matric)\s+st\s+students?$/i, "ST (Scheduled Tribe) students studying beyond Class 10"],
  [/^(?:post\s+10th|post.?matric)\s+obc\s+students?$/i, "OBC students studying beyond Class 10"],
  [/^obc\s+students?\s+class\s+([5-9]|1[0-2])\s*[-–—]\s*([5-9]|1[0-2])$/i, "OBC students in Classes $1 and $2"],
  [/^obc\s+students?\s+(?:class|in class)\s+1\s*[-–—]\s*10$/i, "OBC students in Classes 1 to 10"],
  [/^class\s+1\s*[-–—]\s*10\s+obc\s+students?$/i, "OBC students in Classes 1 to 10"],
  [/^obc\s+students?\s+after\s+10th$/i, "OBC students studying after Class 10"],
  [/^after\s+10th\s+obc\s+students?$/i, "OBC students studying after Class 10"],
  [/^minority\s+students?\s+with\s+income\s+limit$/i, "Minority community students whose family income is within the scheme's limit"],
  [/^girl\s+students?\s+from\s+minority$/i, "Girl students belonging to a minority community"],
  [/^12th\s+pass(?:ed)?\s+with\s+high\s+marks$/i, "Students who have passed Class 12 with good marks"],
  [/^girl\s+students?\s+in\s+technical\s+education$/i, "Girl students pursuing a technical education course"],
  [/^girls?\s+in\s+technical\s+education$/i, "Girl students pursuing a technical education course"],
  [/^(?:differently\s+abled|disabled)\s+students?$/i, "Students with disabilities"],
  [/^sc\s+students?\s+in\s+top\s+colleges?$/i, "SC students studying in top colleges"],
  [/^st\s+students?\s+in\s+top\s+colleges?$/i, "ST students studying in top colleges"],
  [/^pg\s+students?$/i, "Postgraduate (PG) students"],
  [/^northeast(?:ern)?\s+(?:region\s+)?students?$/i, "Students from the North-Eastern region"],
  [/^girl\s+pg\s+students?$/i, "Girl students pursuing a postgraduate (PG) course"],
  [/^pg\s+sc\/st\s+students?$/i, "SC/ST students pursuing a postgraduate (PG) course"],
  [/^minority\s+pg\s+students?$/i, "Minority community students pursuing a postgraduate (PG) course"],
  [/^(?:children|wards?)\s+of\s+ex[- ]?servicemen$/i, "Children of ex-servicemen"],
  [/^ex[- ]?servicemen\s+(?:children|wards?)$/i, "Children of ex-servicemen"],
  [/^minority\s+students?\s+class\s+1\s*[-–—]\s*10$/i, "Minority students in Classes 1 to 10"],
  [/^minority\s+students?\s+after\s+10th$/i, "Minority students studying after Class 10"],
  [/^economic(?:ally)?\s+backward\s+class\s+students?$/i, "Students from the Economically Backward Classes (EBC)"],
  [/^class\s+11[-–—]12\s+students?$/i, "Students studying in Classes 11 and 12"],
  [/^low\s+income\s+students?$/i, "Students from low-income families"],
  [/^class\s+10\s+pass$/i, "Students who have passed Class 10"],
  [/^80%\s+in\s+12th$/i, "Students who scored 80% or above in Class 12"],
  [/^girls?\s+in\s+stem$/i, "Girl students studying STEM subjects (Science, Technology, Engineering, Maths)"],
  [/^girls?\s+in\s+it$/i, "Girl students studying Information Technology"],
  [/^girls?\s+in\s+(?:tech|engineering)$/i, "Girl students in a technical or engineering course"],
  [/^engineering\/mbbs$/i, "Students studying Engineering or MBBS"],
  [/^merit\s*\+\s*need$/i, "Students with good academic merit and financial need"],
  [/^class\s+11[-–—]12$/i, "Students in Classes 11 and 12"],
  [/^graduates?$/i, "Students who have completed their undergraduate degree"],
  [/^class\s+1\s*[-–—]\s*10$/i, "Students in Classes 1 to 10"],
  [/^class\s+9\s*[-–—]\s*10$/i, "Students in Classes 9 and 10"],
  [/^class\s+5\s+to\s+10$/i, "Students in Classes 5 to 10"],
  [/^class\s+5\s+to\s+8$/i, "Students in Classes 5 to 8"],
  [/^class\s+11\s+in\s+mmr$/i, "Students in Class 11 in the Mumbai Metropolitan Region"],
  [/^for\s+(?:first\s+year\s+)?[a-z/.&\s]+students$/i, null],
  [/^for\s+[a-z/.&\s]+students$/i, null],
  [/^candidates?\s+must\s+have\s+passed\s+class\s+\d+/i, null],
  [/^[a-z]+\s+students?\s+(?:studying|in|of|from|pursuing)/i, null],
  [/^students?\s+(?:studying|in|of|from|pursuing)/i, null],
  [/^(?:sc|st|obc|ebc|dnt|vjnt|sbc|minority|sainik)\s/i, null],
]

const polishEligibility = (raw) => {
  const t = trim(raw)
  if (!t) return ""
  let s = t
  s = s.replace(/^\s*(eligibility|criteria|who\s+can\s+apply)\s*[:.-]\s*/i, "")
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1)
  }
  return s
}

const fmtClassesFromValue = (list) => {
  if (!Array.isArray(list) || !list.length) return "For all classes"
  const keys = { "5": "5", "5th": "5", "8": "8", "8th": "8", "9": "9", "9th": "9", "10": "10", "10th": "10", "11": "11", "11th": "11", "12": "12", "12th": "12", "graduate": "College" }
  const seen = new Set()
  const mapped = []
  for (const item of list) {
    const c = trim(item).toLowerCase()
    const num = keys[c]
    const label = num === "College" ? "College" : `Class ${num}`
    if (num && !seen.has(label)) { seen.add(label); mapped.push(label) }
  }
  if (!mapped.length) return "For all classes"
  if (mapped.length === 1) return mapped[0]
  return mapped.slice(0, -1).join(", ") + " and " + mapped[mapped.length - 1]
}

export const fmtName = (s) => {
  if (!s) return ""
  return trim(s.scholarshipName || s.name || "")
}

export const fmtProvider = (s) => {
  if (!s) return ""
  const raw = trim(s.provider || "")
  if (!raw) return "Government / Trust scheme"
  return raw
}

export const fmtClasses = (s) => {
  if (!s) return "For all classes"
  if (Array.isArray(s)) return fmtClassesFromValue(s)
  const list = s.targetClass || s.grades
  return fmtClassesFromValue(list)
}

export const fmtAmount = (s) => {
  if (!s) return "Financial help (see details)"
  const raw = trim(s.amount || s.benefit || "")
  if (!raw) return "Financial help (see details)"
  let v = raw
  v = v.replace(/(\d),(\d{3})\//g, "$1,$2 per ")
  v = v.replace(/\s*\/\s*yr\b\.?/gi, " per year")
  v = v.replace(/\s*\/\s*year\b/gi, " per year")
  v = v.replace(/\s*\/\s*month\b/gi, " per month")
  v = v.replace(/\bper\s+annum\b/gi, "per year")
  v = v.replace(/\s+/, " ").trim()
  if (/^varies$/i.test(v)) return "Varies by scheme"
  return capitalize(v)
}

export const fmtDeadline = (s) => {
  if (!s) return "Rolling — no fixed deadline"
  const raw = trim(s.deadline || "")
  if (!raw) return "Rolling — no fixed deadline"
  const d = friendlyDate(raw)
  if (d) return d
  if (/^upon\s+college\s+admission/i.test(raw)) return "Rolling — apply any time until you join your college"
  const stripped = raw.replace(/^(deadline|last\s+date|important\s+date)\s*[:.-]\s*/i, "")
  return capitalize(stripped)
}

export const fmtEligibility = (s) => {
  if (!s) return "Check the full criteria on the details page."
  const raw = trim(s.eligibility || "")
  if (!raw) return "Check the full criteria on the details page."
  for (const [pattern, replacement] of ELIGIBILITY_RULES) {
    if (pattern.test(raw)) {
      if (replacement === null) return polishEligibility(raw)
      const applied = raw.replace(pattern, replacement)
      return polishEligibility(applied)
    }
  }
  return polishEligibility(raw)
}

export const fmtEligibilityShort = (s) => {
  const value = fmtEligibility(s)
  if (value.length <= 110) return value
  return value.slice(0, 107).replace(/\s+$/, "") + "..."
}

export const fmtDescription = (s) => {
  if (!s) return "This scholarship helps students cover the cost of their education."
  const raw = trim(s.description || "")
  if (!raw) return "This scholarship helps students cover the cost of their education."
  if (/^support for\b/i.test(raw)) {
    const rest = raw.replace(/^support for\b/i, "").trim()
    return rest ? capitalize(rest) + " — a scholarship to help with educational costs." : "A scholarship to help with educational costs."
  }
  if (/^(?:financial\s+)?assistance$/i.test(raw)) return "Provides financial assistance to eligible students."
  if (/^(?:merit[- ]based|prestigious)\s+(?:support|fellowship|scholarship)?$/i.test(raw)) return "A merit-based scholarship to support your studies."
  return capitalize(raw)
}

export const fmtSteps = (s) => {
  const list = (s && Array.isArray(s.stepsToApply) && s.stepsToApply.filter(Boolean)) || []
  if (list.length) return list
  return [
    "Visit the official application website.",
    "Register and fill in your basic details.",
    "Upload the required documents (income certificate, marksheets, ID proof).",
    "Submit your application and keep checking its status online."
  ]
}
