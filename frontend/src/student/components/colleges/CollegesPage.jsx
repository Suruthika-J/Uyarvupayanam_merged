import React, { useMemo, useState } from 'react'
import { SLoader, SEmpty, SBtn } from '../ui'
import { dedupeCourses } from '../../../utils/courseNormalizer'
import FilterBar from './FilterBar'
import CollegeCard from './CollegeCard'

const PAGE_SIZE = 20

/**
 * Mirrors the admin panel's stream-matching rules. This is used ONLY for the
 * optional `streamScope` data filter (Class 10 → Diploma/Polytechnic). The
 * student UI itself filters by DEGREE (the "All Degrees" dropdown is the single
 * authority); there is no redundant stream pill row to contradict it.
 */
const matchesStream = (college, s) => {
  const sList = college.streamsOffered || []
  if (s === 'Arts & Science') {
    return college.stream === 'Arts & Science' || college.stream === 'Arts' || college.stream === 'Science'
  }
  if (s === 'Diploma') {
    return college.stream === 'Diploma' || college.stream === 'Polytechnic' || college.stream === 'ITI' ||
      sList.some(x => /diploma|polytechnic|iti/i.test(x))
  }
  if (s === 'Polytechnic') {
    return college.stream === 'Polytechnic' || sList.some(x => /polytechnic|diploma in engineering/i.test(x))
  }
  return college.stream === s || sList.includes(s)
}

/**
 * Student-facing "Colleges & Courses" directory — mounted on the Class 12
 * "Colleges" tab and reusable as a standalone page.
 *
 * Reads the SAME confirmed mapping data the admin panel writes (`/college-courses`),
 * normalizes every course name via courseNormalizer, hides anything still
 * flagged `needsReview` (un-prefixed / all-caps), dedupes case-only variants,
 * and renders grouped chips. All filtering is client-side — no page reloads.
 */
export default function CollegesPage({
  colleges = [],
  loading = false,
  streamScope = null,
  defaultDegree = 'All',
  title,
  subtitle,
}) {
  const [search, setSearch] = useState('')
  const [degree, setDegree] = useState(defaultDegree || 'All')
  const [district, setDistrict] = useState('All')
  const [sort, setSort] = useState('alpha')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const scope = Array.isArray(streamScope) && streamScope.length > 0 ? streamScope : null

  // Normalize + hide needsReview courses once. Canonical names only from here on.
  // streamScope (optional) restricts the whole view to a set of streams — used
  // by the Class 10 page to pre-scope results to Diploma / Polytechnic.
  const enriched = useMemo(() => {
    const list = (colleges || [])
      .filter(college => {
        if (!scope) return true
        return scope.some(s => matchesStream(college, s))
      })
      .map(college => {
        const streamOf = college.stream || (college.streamsOffered && college.streamsOffered[0]) || ''
        const confirmed = dedupeCourses(college.coursesOffered || [], { stream: streamOf })
          .filter(c => !c.needsReview)
        return { ...college, _stream: streamOf, _courses: confirmed }
      })
    return list.filter(c => c._courses.length > 0)
  }, [colleges, scope])

  const degreeOptions = useMemo(() => {
    const set = new Set()
    enriched.forEach(c => c._courses.forEach(course => {
      if (course.degreePrefix) set.add(course.degreePrefix)
    }))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [enriched])

  const districtOptions = useMemo(() => {
    const set = new Set()
    enriched.forEach(c => { if (c.district) set.add(c.district) })
    return Array.from(set).sort()
  }, [enriched])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = enriched.filter(c => {
      const districtMatch = district === 'All' || c.district === district
      const degreeMatch = degree === 'All' || c._courses.some(course => course.degreePrefix === degree)
      let searchMatch = true
      if (q) {
        const hay = `${c.collegeName || ''} ${c.location || ''} ${c.district || ''}`.toLowerCase()
        const courseHit = c._courses.some(course => String(course.canonicalName || '').toLowerCase().includes(q))
        searchMatch = hay.includes(q) || courseHit
      }
      return districtMatch && degreeMatch && searchMatch
    })

    if (sort === 'courses') {
      return list.slice().sort((a, b) => b._courses.length - a._courses.length)
    }
    return list.slice().sort((a, b) => (a.collegeName || '').localeCompare(b.collegeName || ''))
  }, [enriched, search, district, degree, sort])

  // Highlight course chips that matched the free-text search.
  const highlightNames = useMemo(() => {
    const q = search.trim().toLowerCase()
    const set = new Set()
    if (!q) return set
    enriched.forEach(c => c._courses.forEach(course => {
      const name = String(course.canonicalName || '').toLowerCase()
      if (name.includes(q)) set.add(name)
    }))
    return set
  }, [enriched, search])

  const resetPage = () => setVisibleCount(PAGE_SIZE)

  const defaultDegreeVal = defaultDegree || 'All'
  const hasFilter = search !== '' || degree !== defaultDegreeVal || district !== 'All'
  const visibleColleges = filtered.slice(0, visibleCount)

  const clearFilters = () => {
    setSearch('')
    setDegree(defaultDegreeVal)
    setDistrict('All')
    resetPage()
  }

  return (
    <div className="ccc" style={{ gridColumn: '1/-1' }}>
      <FilterBar
        degrees={degreeOptions}
        districts={districtOptions}
        searchCandidates={enriched}
        search={search}
        degree={degree}
        district={district}
        sort={sort}
        onSearch={v => { setSearch(v); resetPage() }}
        onDegree={v => { setDegree(v); resetPage() }}
        onDistrict={v => { setDistrict(v); resetPage() }}
        onSort={v => { setSort(v); resetPage() }}
        onClearFilters={clearFilters}
        showClear={hasFilter}
      />

      {title && (
        <div className="ccc-head">
          <h2 className="ccc-head-title">{title}</h2>
          {subtitle && <p className="ccc-head-sub">{subtitle}</p>}
        </div>
      )}

      <div className="ccc-count">
        {loading && enriched.length === 0
          ? 'Loading colleges…'
          : `Showing ${visibleColleges.length} of ${filtered.length} college${filtered.length !== 1 ? 's' : ''}`
            + (hasFilter ? ` (filtered from ${enriched.length})` : '')
            + ` — ${degree === 'All' ? 'all degree types' : `${degree} only`}`}
      </div>

      {loading && enriched.length === 0 ? (
        <SLoader style={{ gridColumn: '1/-1' }} />
      ) : filtered.length === 0 ? (
        <div className="ccc-empty" style={{ gridColumn: '1/-1' }}>
          <SEmpty
            icon="🏫"
            title="No colleges match your filters"
            desc="Try clearing a filter or changing your search term. Un-prefixed courses are hidden until an admin confirms their degree tag."
          />
          {hasFilter && <SBtn variant="outline" onClick={clearFilters}>Clear Filters</SBtn>}
        </div>
      ) : (
        <>
          <div className="ccc-grid">
            {visibleColleges.map(c => (
              <CollegeCard key={c._id} college={c} courses={c._courses} highlightedNames={highlightNames} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="ccc-loadmore" style={{ gridColumn: '1/-1' }}>
              <SBtn variant="outline" onClick={() => setVisibleCount(v => v + PAGE_SIZE)}>
                Load More ({filtered.length - visibleCount} more)
              </SBtn>
            </div>
          )}
        </>
      )}

      <style>{`
        .ccc { display: block; }
        .ccc-filters {
          background: #fff; border: 1px solid var(--s-border); border-radius: 18px;
          padding: 14px 16px; margin-bottom: 18px; box-shadow: 0 6px 18px rgba(0,0,0,0.05);
          position: sticky; top: 76px; z-index: 60;
        }
        .ccc-filter-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .ccc-head { margin: 6px 0 16px; }
        .ccc-head-title {
          margin: 0 0 6px; font-size: 26px; font-weight: 900; letter-spacing: -0.02em;
          font-family: var(--s-font-display); color: var(--s-text);
        }
        .ccc-head-sub { margin: 0; font-size: 14.5px; color: var(--s-text3); }
        .ccc-ddm { position: relative; }
        .ccc-ddm-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: 12px;
          border: 1.5px solid var(--s-border); background: var(--s-surface); font: inherit;
          font-size: 13.5px; font-weight: 700; color: var(--s-text2); cursor: pointer;
          white-space: nowrap; transition: border-color .2s, box-shadow .2s;
        }
        .ccc-ddm-btn:hover { border-color: #6E9F00; }
        .ccc-ddm-btn.has-value { color: var(--s-text); }
        .ccc-ddm-caret { transition: transform .2s; }
        .ccc-ddm-caret.open { transform: rotate(180deg); }
        .ccc-ddm-panel {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0; min-width: 280px;
          background: #fff; border: 1px solid var(--s-border); border-radius: 14px;
          box-shadow: 0 16px 40px rgba(15,23,42,0.16); padding: 10px; z-index: 1200;
          display: flex; flex-wrap: wrap; gap: 8px; max-height: 280px; overflow-y: auto;
        }
        .ccc-ddm-opt {
          padding: 8px 16px; border-radius: 99px; border: 1.5px solid var(--s-border);
          background: #fff; color: #334155; font-size: 13px; font-weight: 600; cursor: pointer;
          white-space: nowrap; transition: all .15s; font-family: inherit;
        }
        .ccc-ddm-opt:hover { border-color: #6E9F00; color: #6E9F00; }
        .ccc-ddm-opt.active { background: #6E9F00; border-color: #6E9F00; color: #fff; }
        .ccc-ddm-empty { flex-basis: 100%; color: var(--s-text3); font-size: 12.5px; padding: 4px 2px; }
        .ccc-search { position: relative; flex: 1 1 260px; min-width: 220px; }
        .ccc-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--s-text3); pointer-events: none; }
        .ccc-search input {
          width: 100%; padding: 11px 38px 11px 38px; border-radius: 12px;
          border: 1.5px solid var(--s-border); background: var(--s-surface);
          font: inherit; font-size: 14px; outline: none; transition: border-color .2s;
        }
        .ccc-search input:focus { border-color: #6E9F00; }
        .ccc-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: var(--s-bg2); border: none; color: var(--s-text3);
          width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 15px; line-height: 1;
        }
        .ccc-search-drop {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          border: 1px solid var(--s-border); overflow-y: auto; max-height: 300px; z-index: 1000;
        }
        .ccc-search-row {
          padding: 12px 16px; cursor: pointer; transition: background .15s;
          border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px;
        }
        .ccc-search-row:hover { background: #f8fafc; }
        .ccc-search-row-name { font-weight: 700; font-size: 13px; color: var(--s-text); min-width: 0; }
        .ccc-search-row-sub { font-size: 10.5px; color: var(--s-text3); margin-left: auto; white-space: nowrap; }
        .ccc-search-row-count {
          flex-shrink: 0; font-size: 10.5px; font-weight: 800; color: #fff;
          background: #6E9F00; border-radius: 99px; padding: 4px 10px; white-space: nowrap;
        }
        .ccc-search-empty { padding: 16px; text-align: center; color: var(--s-text3); font-size: 12.5px; }
        .ccc-select {
          padding: 11px 12px; border-radius: 12px; border: 1.5px solid var(--s-border);
          background: var(--s-surface); font: inherit; font-size: 13.5px; font-weight: 600;
          color: var(--s-text2); cursor: pointer; outline: none; max-width: 100%;
        }
        .ccc-clear-btn {
          display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
          background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;
          border-radius: 12px; padding: 10px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer;
        }
        .ccc-count { font-size: 13.5px; color: var(--s-text3); margin-bottom: 16px; }
        .ccc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 22px; }
        .ccc-card {
          background: var(--s-surface); border: 1px solid var(--s-border); border-radius: 20px;
          padding: 20px; box-shadow: 0 6px 18px rgba(0,0,0,0.04);
          display: flex; flex-direction: column; gap: 16px; transition: transform .2s ease, box-shadow .2s ease;
        }
        .ccc-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(0,0,0,0.08); }
        .ccc-card-top { display: flex; align-items: flex-start; gap: 12px; }
        .ccc-card-icon {
          width: 42px; height: 42px; border-radius: 12px; background: var(--s-primary-l);
          color: var(--s-primary); display: grid; place-items: center; font-size: 18px; flex-shrink: 0;
        }
        .ccc-card-title-wrap { flex: 1; min-width: 0; }
        .ccc-card-title { margin: 0 0 5px; font-size: 16.5px; font-weight: 800; color: var(--s-text); line-height: 1.35; }
        .ccc-card-location { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--s-text3); }
        .ccc-loc-icon { flex-shrink: 0; }
        .ccc-card-count-badge {
          flex-shrink: 0; font-size: 11px; font-weight: 800; color: #6E9F00;
          background: rgba(110,159,0,0.12); border-radius: 99px; padding: 5px 11px; white-space: nowrap;
        }
        .ccc-card-body { flex: 1; background: var(--s-bg2); border-radius: 14px; padding: 14px; }
        .ccc-courses-label {
          font-size: 10.5px; font-weight: 800; color: var(--s-text3);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
        }
        .ccc-groups { display: flex; flex-direction: column; gap: 12px; }
        .ccc-group-label { font-size: 11.5px; font-weight: 800; color: #6E9F00; margin-bottom: 8px; }
        .ccc-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .ccc-chip {
          background: #fff; border: 1px solid var(--s-border); color: #334155;
          font-size: 12px; font-weight: 600; padding: 5px 11px; border-radius: 99px; transition: all .15s;
        }
        .ccc-chip-active { background: #6E9F00; border-color: #6E9F00; color: #fff; }
        .ccc-more-toggle {
          background: none; border: none; color: #6E9F00; font-size: 12.5px; font-weight: 700;
          cursor: pointer; padding: 6px 0 0; margin-top: 10px; font-family: inherit;
        }
        .ccc-no-courses { font-size: 13px; color: var(--s-text3); padding: 6px 0; }
        .ccc-card-footer { display: flex; justify-content: flex-end; padding-top: 6px; }
        .ccc-empty { text-align: center; padding: 30px 0 40px; }
        .ccc-loadmore { text-align: center; padding-top: 26px; }
        @media (max-width: 640px) {
          .ccc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}