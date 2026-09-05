import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../../config/axios';
import { 
  FiSearch, FiPlus, FiUpload, FiEdit2, FiTrash2, FiExternalLink, 
  FiFilter, FiLayers, FiInfo, FiCheckCircle 
} from 'react-icons/fi';
import { 
  Card, DataTable, TR, TD, ActionBtn, FiltersRow, SearchInput, 
  SBtn, Modal, FormGrid, FormGroup, FormInput, FormActions, 
  FilterSelect, SBadge, SLoader 
} from '../../components/UI';

// Base route string
const API_ROUTE = "/scholarships";

export const formatGrade = (grade) => {
  if (!grade) return '';
  const numMatches = String(grade).match(/\d+/);
  if (!numMatches) return grade; // Return original if no digits found

  const num = parseInt(numMatches[0], 10);
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return num + "st";
  if (j === 2 && k !== 12) return num + "nd";
  if (j === 3 && k !== 13) return num + "rd";
  return num + "th";
};

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, isEdit: false, data: null });
  const [uploadMessage, setUploadMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  const initialFormState = {
    scholarshipName: '',
    provider: '',
    benefit: '',
    eligibility: '',
    applicationLink: '',
    grades: ["10th"], // Default to 10th
    category: 'Government',
    description: '',
    deadline: '',
    status: 'published'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_ROUTE);
      // Assuming res.data is the array or { data: [] }
      setScholarships(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error("Error fetching scholarships", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        ...item,
        grades: item.grades || ["10th"]
      });
      setModal({ open: true, isEdit: true, data: item });
    } else {
      setFormData(initialFormState);
      setModal({ open: true, isEdit: false, data: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassToggle = (cls) => {
    setFormData(prev => {
      const current = prev.grades || [];
      if (current.includes(cls)) {
        return { ...prev, grades: current.filter(c => c !== cls) };
      } else {
        return { ...prev, grades: [...current, cls] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Synchronize grades and targetClass for full compatibility
      const targetClass = formData.grades.map(g => g.replace('th', ''));
      const submissionData = { ...formData, targetClass };

      if (modal.isEdit) {
        await axiosInstance.put(`${API_ROUTE}/${modal.data._id}`, submissionData);
      } else {
        await axiosInstance.post(`${API_ROUTE}/add-scholarship`, submissionData);
      }
      setModal({ open: false, isEdit: false, data: null });
      fetchScholarships();
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scholarship?")) return;
    try {
      await axiosInstance.delete(`${API_ROUTE}/${id}`);
      fetchScholarships();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);

    try {
      setLoading(true);
      setUploadMessage("Uploading...");
      const res = await axiosInstance.post(`${API_ROUTE}/upload`, body, { 
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadMessage(`Success: ${res.data.inserted} added.`);
      fetchScholarships();
    } catch (err) {
      setUploadMessage("Upload failed.");
    } finally {
      e.target.value = ""; 
      setTimeout(() => setUploadMessage(""), 5000);
    }
  };

  const filteredData = useMemo(() => {
    return scholarships.filter(s => {
      const matchesSearch = (s.scholarshipName || "").toLowerCase().includes(search.toLowerCase()) ||
                            (s.provider || "").toLowerCase().includes(search.toLowerCase());
      const matchesClass = filterClass === "all" || (s.grades || []).includes(filterClass);
      return matchesSearch && matchesClass;
    });
  }, [scholarships, search, filterClass]);

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <FiltersRow>
        <SearchInput 
          placeholder="Search scholarship name or provider..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FilterSelect value={filterClass} onChange={e => setFilterClass(e.target.value)}>
           <option value="all">All Grades</option>
           <option value="5th">Class 5th</option>
           <option value="8th">Class 8th</option>
           <option value="10th">Class 10th</option>
           <option value="12th">Class 12th</option>
        </FilterSelect>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          {uploadMessage && <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '14px' }}>{uploadMessage}</span>}
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            id="csv-upload" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
          />
          <SBtn variant="outline" onClick={() => document.getElementById('csv-upload').click()}>
            <FiUpload style={{ marginRight:8 }} /> Import CSV
          </SBtn>
          <SBtn variant="primary" onClick={() => handleOpenModal()}>
            <FiPlus style={{ marginRight:8 }} /> Add Scholarship
          </SBtn>
        </div>
      </FiltersRow>

      <Card>
        {loading ? (
          <SLoader />
        ) : (
          <DataTable
            columns={['Scholarship Name', 'Grades', 'Provider', 'Benefit', 'Action']}
            data={filteredData}
            renderRow={(s) => (
              <TR key={s._id}>
                <TD style={{ fontWeight: 800, color: 'var(--text)', fontSize:15 }}>
                  {(s.scholarshipName || '').toUpperCase()}
                </TD>
                  <TD>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {(s.targetClass || s.grades || []).map(c => (
                        <SBadge key={c} color="blue">{formatGrade(c)}</SBadge>
                      ))}
                    </div>
                  </TD>
                <TD>{s.provider || 'N/A'}</TD>
                <TD style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.benefit || 'N/A'}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <ActionBtn onClick={() => handleOpenModal(s)} title="Edit"><FiEdit2 size={16} /></ActionBtn>
                    <ActionBtn onClick={() => handleDelete(s._id)} title="Delete" style={{ color:'#ef4444' }}><FiTrash2 size={16} /></ActionBtn>
                    {s.applicationLink && (
                       <ActionBtn onClick={() => window.open(s.applicationLink, '_blank')} title="Link"><FiExternalLink size={16} /></ActionBtn>
                    )}
                  </div>
                </TD>
              </TR>
            )}
          />
        )}
      </Card>

      {modal.open && (
        <Modal title={modal.isEdit ? "Edit Scholarship" : "Add Scholarship"} onClose={() => setModal({open:false, isEdit:false, data:null})}>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup label="Scholarship Name" full>
                <FormInput name="scholarshipName" value={formData.scholarshipName} onChange={handleInputChange} required />
              </FormGroup>
              <FormGroup label="Provider">
                <FormInput name="provider" value={formData.provider} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup label="Benefit Amount">
                <FormInput name="benefit" value={formData.benefit} onChange={handleInputChange} placeholder="e.g. ₹10,000" />
              </FormGroup>
              <FormGroup label="Category">
                <select name="category" value={formData.category} onChange={handleInputChange} style={{ width:'100%', padding:12, borderRadius:12, border:'1.5px solid var(--border)' }}>
                   <option value="Government">Government</option>
                   <option value="Private">Private</option>
                   <option value="Merit">Merit Based</option>
                </select>
              </FormGroup>
              <FormGroup label="Eligibility">
                <FormInput name="eligibility" value={formData.eligibility} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup label="Target Grades (Select Multi)" full>
                 <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {["5th", "8th", "10th", "12th"].map(cls => (
                      <button 
                         type="button" 
                         key={cls}
                         onClick={() => handleClassToggle(cls)}
                         style={{ 
                            padding:'10px 24px', borderRadius:14, border: formData.grades.includes(cls) ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            background: formData.grades.includes(cls) ? '#eff6ff' : '#fff',
                            color: formData.grades.includes(cls) ? '#3b82f6' : '#64748b',
                            fontWeight: 800, cursor:'pointer', transition:'0.2s'
                         }}
                      >Class {formatGrade(cls)}</button>
                    ))}
                 </div>
              </FormGroup>
              <FormGroup label="Application Link">
                <FormInput name="applicationLink" value={formData.applicationLink} onChange={handleInputChange} placeholder="https://..." />
              </FormGroup>
              <FormGroup label="Deadline">
                <FormInput name="deadline" value={formData.deadline} onChange={handleInputChange} placeholder="e.g. 30th April 2026" />
              </FormGroup>
              <FormGroup label="Visibility Status">
                <select name="status" value={formData.status} onChange={handleInputChange} style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'1.5px solid #e2e8f0', fontWeight:700 }}>
                   <option value="published">Published (Visible to Students)</option>
                   <option value="active">Active (Internal Use)</option>
                   <option value="inactive">Inactive (Hidden)</option>
                </select>
              </FormGroup>
              <FormGroup label="Description" full>
                <FormInput as="textarea" name="description" value={formData.description} onChange={handleInputChange} style={{ minHeight:120, borderRadius:16 }} placeholder="Describe the scholarship in detail..." />
              </FormGroup>
            </FormGrid>
            <FormActions onClose={() => setModal({open:false, isEdit:false, data:null})} onSave={handleSubmit} />
          </form>
        </Modal>
      )}
    </div>
  );
}
