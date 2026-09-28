import React, { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi'

/**
 * Sticky filter/search TOOLBAR for the student Colleges directory.
 *
 * The "All Degrees" control is the SINGLE authoritative degree/course-type
 * filter (the old contradictory stream pill row + native <select> are gone).
 * It is rendered as a custom pill picker in the same Step-1 style as the admin
 * mapping page. The panel is anchored INSIDE this toolbar (below the bar), so
 * it opens downward over the college list and can NEVER float over / cover the
 * hero banner or its CTA.
 *
 * The bar itself is `position: sticky` (CSS .ccc-filters, top below the fixed
 * 64px site nav) so students can change filters while scrolling the list.
 *
 * Search mirrors the admin mapping page: bordered input with a live dropdown of
 * matching colleges, each with a green course-count badge on the right.
 */
export default function FilterBar({
  degrees = [],
  districts = [],
  searchCandidates = [],
  search = '',
  degree = 'All',
  district = 'All',
  sort = 'alpha',
  onSearch,
  onDegree,
  onDistrict,
  onSort,
  onClearFilters,
  showClear = false,
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [degreeOpen, setDegreeOpen] = useState(false)
  const ddRef = useRef(null)
  const q = search.trim().toLowerCase()

  useEffect(() => {
    const onDown = e => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDegreeOpen(false)
    }
    const onKey = e => {
      if (e.key === 'Escape') setDegreeOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const results = q && searchCandidates.length
    ? searchCandidates
        .filter(c =>
          (c.collegeName || '').toLowerCase().includes(q) ||
          (c.location || '').toLowerCase().includes(q) ||
          (c.district || '').toLowerCase().includes(q)
        )
        .slice(0, 8)
    : []

  const selectDegree = v => {
    onDegree(v)
    setDegreeOpen(false)
  }

  return (
    <div className="ccc-filters">
      <div className="ccc-filter-row">
        <div className="ccc-search">
          <FiSearch className="ccc-search-icon" />
          <input
            type="text"
            placeholder="Search college name, location, or course..."
            value={search}
            onChange={e => { onSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            aria-label="Search colleges or courses"
          />
          {search && (
            <button className="ccc-search-clear" onClick={() => onSearch('')} aria-label="Clear search">
              ×
            </button>
          )}

          {showDropdown && q && (
            <div className="ccc-search-drop">
              {results.length === 0 ? (
                <div className="ccc-search-empty">No colleges found</div>
              ) : (
                results.map(c => (
                  <div
                    key={c._id}
                    className="ccc-search-row dropdown-item-hover"
                    onMouseDown={e => {
                      e.preventDefault()
                      onSearch(c.collegeName)
                      setShowDropdown(false)
                    }}
                  >
                    <span className="ccc-search-row-name">{c.collegeName}</span>
                    <span className="ccc-search-row-sub">{c.district || c.location || ''}</span>
                    <span className="ccc-search-row-count">
                      {c._courses.length} {c._courses.length === 1 ? 'course' : 'courses'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="ccc-ddm" ref={ddRef}>
          <button
            type="button"
            className={`ccc-ddm-btn${degree !== 'All' ? ' has-value' : ''}`}
            onClick={() => setDegreeOpen(o => !o)}
            aria-haspopup="listbox"
            aria-expanded={degreeOpen}
            aria-label="Filter by degree type"
          >
            <span className="ccc-ddm-emoji">🎓</span>
            <span className="ccc-ddm-label">{degree === 'All' ? 'All Degrees' : degree}</span>
            <FiChevronDown className={`ccc-ddm-caret${degreeOpen ? ' open' : ''}`} />
          </button>

          {degreeOpen && (
            <div className="ccc-ddm-panel" role="listbox">
              <button
                type="button"
                className={`ccc-ddm-opt${degree === 'All' ? ' active' : ''}`}
                onClick={() => selectDegree('All')}
              >
                All Degrees
              </button>
              {degrees.length === 0 && (
                <div className="ccc-ddm-empty">No confirmed degree types yet</div>
              )}
              {degrees.map(d => (
                <button
                  type="button"
                  key={d}
                  className={`ccc-ddm-opt${degree === d ? ' active' : ''}`}
                  onClick={() => selectDegree(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <select className="ccc-select" value={district} onChange={e => onDistrict(e.target.value)} aria-label="Filter by district">
          <option value="All">📍 All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="ccc-select" value={sort} onChange={e => onSort(e.target.value)} aria-label="Sort colleges">
          <option value="alpha">↕️ Alphabetical</option>
          <option value="courses">🎓 Most courses</option>
        </select>

        {showClear && (
          <button className="ccc-clear-btn" onClick={onClearFilters}>
            <FiX size={14} /> Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}