import React, { useState } from 'react'
import { SBtn, SBadge } from '../ui'
import { FiBookOpen, FiDownload, FiChevronRight, FiPlayCircle, FiEye } from 'react-icons/fi'

const CLASS_5_BOOKS = [
  { 
    id: 1, 
    title: "Basic Maths Playground", 
    category: "Maths", 
    desc: "A fun way to learn numbers and shapes through pictures.",
    url: "https://example.com/books/maths5.pdf",
    pages: 42,
    thumb: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60" 
  },
  { 
    id: 2, 
    title: "Science Experiments for Home", 
    category: "Science", 
    desc: "Learn through 10 easy experiments with household items.",
    url: "https://example.com/books/science5.pdf",
    pages: 28,
    thumb: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&auto=format&fit=crop&q=60"
  },
  { 
    id: 3, 
    title: "English Storytelling Guide", 
    category: "English", 
    desc: "How to tell amazing stories and build vocabulary.",
    url: "https://example.com/books/english5.pdf",
    pages: 35,
    thumb: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60"
  },
  { 
    id: 4, 
    title: "The Great Inventor's Diary", 
    category: "Curiosity", 
    desc: "Stories of young children who invented amazing things.",
    url: "https://example.com/books/inventions5.pdf",
    pages: 56,
    thumb: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60"
  },
]

export default function BookReader({ onAction }) {
  const [active, setActive] = useState(null)

  const handleAction = (book, action) => {
    // For download or bookmarking, trigger a popup if not logged in
    onAction && onAction(book, action)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
      {CLASS_5_BOOKS.map(book => (
        <div key={book.id} style={{ 
          background: '#fff', borderRadius: 24, padding: 24, border: '1px solid var(--s-border)', 
          display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.2s ease', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--s-border)' }}>
            <img src={book.thumb} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <SBadge color="purple" style={{ marginBottom: 8 }}>{book.category}</SBadge>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 8px' }}>{book.title}</h4>
            <p style={{ fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.6, margin: 0 }}>{book.desc}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
             <SBtn variant="outline" size="sm" onClick={() => handleAction(book, 'view')}>
                <FiEye size={14} /> Read Now
             </SBtn>
             <SBtn variant="ghost" size="sm" onClick={() => handleAction(book, 'save')}>
                <FiDownload size={14} /> Save Book
             </SBtn>
          </div>
        </div>
      ))}
    </div>
  )
}
