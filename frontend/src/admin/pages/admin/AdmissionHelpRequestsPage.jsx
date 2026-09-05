import React, { useState, useEffect } from 'react';
import axios from '../../../config/axios';
import { 
  SCard, SLoader, SEmpty, SBtn, DataTable, TR, TD, 
  SBadge, FiltersRow, SearchInput, FilterSelect, ActionBtn 
} from '../../components/UI';

export default function AdmissionHelpRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filter.status]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filter.status) query.append('status', filter.status);
      
      const res = await axios.get(`/admission-help/admin?${query.toString()}`);
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await axios.patch(`/admission-help/admin/${id}`, { status: newStatus });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'gold';
      case 'Contacted': return 'blue';
      case 'Closed': return 'green';
      default: return 'gray';
    }
  };

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(filter.search.toLowerCase()) ||
    r.collegeId?.collegeName.toLowerCase().includes(filter.search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <FiltersRow>
        <SearchInput 
          placeholder="🔍 Search by student name or college..." 
          value={filter.search} 
          onChange={e => setFilter({ ...filter, search: e.target.value })} 
        />
        <FilterSelect 
          value={filter.status} 
          onChange={e => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Contacted">Contacted</option>
          <option value="Closed">Closed</option>
        </FilterSelect>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text3)' }}>
          Showing <strong style={{ color: 'var(--primary)' }}>{filteredRequests.length}</strong> requests
        </span>
      </FiltersRow>

      <SCard>
        {loading ? (
          <SLoader />
        ) : filteredRequests.length === 0 ? (
          <SEmpty title="No admission requests found" />
        ) : (
          <DataTable
            columns={['Student Details', 'Academic Info', 'College & Course', 'Status', 'Actions']}
            data={filteredRequests}
            renderRow={(req) => (
              <TR key={req._id}>
                <TD>
                  <div style={{ fontWeight: 800, color: 'var(--text)' }}>{req.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>📞 {req.phone}</div>
                  {req.email && <div style={{ fontSize: 12, color: 'var(--text3)' }}>📧 {req.email}</div>}
                </TD>
                <TD>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Cutoff: {req.cutoff}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>📍 {req.preferredLocation || 'Any'}</div>
                </TD>
                <TD>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{req.collegeId?.collegeName || 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>{req.preferredCourse}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Code: {req.collegeId?.collegeCode}</div>
                </TD>
                <TD>
                  <SBadge color={getStatusColor(req.status)}>{req.status}</SBadge>
                </TD>
                <TD>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {req.status === 'Pending' && (
                      <ActionBtn onClick={() => updateStatus(req._id, 'Contacted')}>
                        Mark Contacted
                      </ActionBtn>
                    )}
                    {req.status !== 'Closed' && (
                      <ActionBtn danger onClick={() => updateStatus(req._id, 'Closed')}>
                        Close Request
                      </ActionBtn>
                    )}
                    {req.status === 'Closed' && (
                      <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Completed</span>
                    )}
                  </div>
                </TD>
              </TR>
            )}
          />
        )}
      </SCard>
    </div>
  );
}
