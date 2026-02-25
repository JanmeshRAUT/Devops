import React, { useState, useMemo } from 'react';
import { FaHistory, FaSync, FaSearch, FaFilter } from 'react-icons/fa';
import PatientAccessLogCard from './PatientAccessLogCard';

const PatientLogsSection = ({ logs, loading, error, fetchLogs, onReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 4;

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.doctor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.justification?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'Granted') matchesStatus = log.status.includes('Grant') || log.status.includes('Success');
      else if (statusFilter === 'Denied') matchesStatus = log.status.includes('Deny') || log.status.includes('Denied');
      else if (statusFilter === 'Flagged') matchesStatus = log.status === 'Flagged';

      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, statusFilter]);

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <section className="logs-section">
      <div className="section-header">
        <div className="section-title">
          <FaHistory className="section-icon" />
          <span style={{ whiteSpace: 'nowrap' }}>Access History</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', width: '100%', justifyContent: 'flex-end', paddingLeft: '2rem' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', flex: '1', maxWidth: '400px' }}>
            <FaSearch style={{ color: '#94a3b8', marginRight: '6px' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem' }}
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: 'white', color: '#475569', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            <option value="All">All</option>
            <option value="Granted">Granted</option>
            <option value="Denied">Denied</option>
            <option value="Flagged">Flagged</option>
          </select>

          <button 
            className="refresh-button" 
            onClick={fetchLogs}
            disabled={loading}
            title="Refresh access logs"
            style={{ width: '36px', height: '36px', flexShrink: 0 }}
          >
            <FaSync className={loading ? "spinning" : ""} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="fallback-container" style={{ minHeight: "40vh" }}>
          <div className="loader">
            <div className="spinner"></div>
          </div>
          <p className="fallback-message">Loading your secure logs...</p>
        </div>
      )}

      {error && (
        <div className="fallback-container error-state" style={{ minHeight: "40vh" }}>
          <div className="fallback-icon" style={{ fontSize: "3rem" }}>⚠️</div>
          <p className="fallback-message" style={{ color: "#ef4444" }}>
            {error}
          </p>
          <button className="fallback-btn retry-btn" onClick={fetchLogs}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="access-log-container">
            {currentLogs.length > 0 ? (
              currentLogs.map((log, idx) => (
                <PatientAccessLogCard key={log.id || idx} log={log} onReport={onReport} />
              ))
            ) : (
              <div className="fallback-container empty-state" style={{ minHeight: "30vh", gridColumn: "1/-1" }}>
                <div className="fallback-icon" style={{ fontSize: "3rem", filter: "grayscale(100%) opacity(0.5)" }}>📭</div>
                <p className="fallback-message">No matching access logs found</p>
                {searchTerm || statusFilter !== 'All' ? (
                  <button className="fallback-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => {setSearchTerm(''); setStatusFilter('All');}}>Clear Filters</button>
                ) : (
                  <p style={{ color: "#64748b", marginTop: "10px" }}>
                    Your medical data hasn't been accessed yet. Your privacy is protected! 🔒
                  </p>
                )}
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '8px' }}>
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    background: currentPage === i + 1 ? '#3b82f6' : 'white', 
                    color: currentPage === i + 1 ? 'white' : '#475569',
                    cursor: 'pointer',
                    fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PatientLogsSection;
