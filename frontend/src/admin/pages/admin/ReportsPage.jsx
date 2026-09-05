import React, { useEffect, useState } from 'react'
import { Card, CardHeader, ActionBtn } from '../../components/UI'
import { adminService } from '../../../services/adminService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [popularData, setPopularData] = useState(null);
  const [scholarshipData, setScholarshipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const [regData, popData, scholData] = await Promise.all([
          adminService.getRegistrationReport(),
          adminService.getPopularCoursesReport(),
          adminService.getScholarshipsReport()
        ]);
        setReportData(regData);
        setPopularData(popData);
        setScholarshipData(scholData);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleExportPDF = () => {
    if (!reportData || !reportData.students) return;

    const doc = new jsPDF();
    doc.text("Student Registration Report", 14, 15);

    const tableColumn = ["Name", "Email", "Course Interest", "State", "Date Joined"];
    const tableRows = [];

    reportData.students.forEach(student => {
      const studentData = [
        student.name,
        student.email,
        student.courseInterest,
        student.state,
        student.createdAt
      ];
      tableRows.push(studentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Student_Registration_Report.pdf");
  };

  const handleExportExcel = () => {
    if (!reportData || !reportData.students) return;

    const worksheet = XLSX.utils.json_to_sheet(reportData.students.map(s => ({
      Name: s.name,
      Email: s.email,
      "Course Interest": s.courseInterest,
      State: s.state,
      "Date Joined": s.createdAt
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    XLSX.writeFile(workbook, "Student_Registration_Report.xlsx");
  };

  const handlePopularExportPDF = () => {
    if (!popularData || !popularData.popularCourses) return;

    const doc = new jsPDF();
    doc.text("Popular Courses Report", 14, 15);

    const tableColumn = ["Course", "Students"];
    const tableRows = popularData.popularCourses.map(c => [c.course, c.students]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Popular_Courses_Report.pdf");
  };

  const handlePopularExportExcel = () => {
    if (!popularData || !popularData.popularCourses) return;

    const worksheet = XLSX.utils.json_to_sheet(popularData.popularCourses.map(c => ({
      Course: c.course,
      Students: c.students
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Popular Courses");

    XLSX.writeFile(workbook, "Popular_Courses_Report.xlsx");
  };

  const handleScholarshipExportPDF = () => {
    if (!scholarshipData || !scholarshipData.scholarships) return;

    const doc = new jsPDF();
    doc.text("Scholarship Trends Report", 14, 15);

    const tableColumn = ["Scholarship", "Applications"];
    const tableRows = scholarshipData.scholarships.map(s => [s.scholarship, s.applications]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Scholarship_Trends_Report.pdf");
  };

  const handleScholarshipExportExcel = () => {
    if (!scholarshipData || !scholarshipData.scholarships) return;

    const worksheet = XLSX.utils.json_to_sheet(scholarshipData.scholarships.map(s => ({
      Scholarship: s.scholarship,
      Applications: s.applications
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scholarships");

    XLSX.writeFile(workbook, "Scholarship_Trends_Report.xlsx");
  };


  if (loading) {
    return <div style={{ padding: 20 }}>Loading report data...</div>;
  }

  // Format chart data for Recharts
  const chartData = reportData ? Object.keys(reportData.monthlyRegistrations).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    registrations: reportData.monthlyRegistrations[key]
  })) : [];
  
  const popularChartData = popularData && popularData.popularCourses ? popularData.popularCourses.slice(0, 10) : [];

  const scholarshipList = scholarshipData && scholarshipData.scholarships ? scholarshipData.scholarships : [];

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { icon:'👨‍🎓', title:'Registration Report',  desc:'All students by level & date',       color:'var(--primary)' },
          { icon:'📘', title:'Popular Courses',       desc:'Most selected courses this month',    color:'var(--accent3)' },
          { icon:'🎓', title:'Scholarship Trends',    desc:'Application & deadline tracking',     color:'var(--accent)' },
        ].map((r,i) => (
          <Card key={i} style={{ cursor: 'default', borderTop:`3px solid ${r.color}` }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{r.icon}</div>
            <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:15, marginBottom:5, color:'var(--text)' }}>
              {r.title}
              {i === 0 && reportData && (
                <span style={{float: 'right', fontSize: 13, background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '10px'}}>
                  Total: {reportData.totalRegistrations}
                </span>
              )}
              {i === 2 && scholarshipData && (
                <span style={{float: 'right', fontSize: 13, background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '10px'}}>
                  Total: {scholarshipData.totalApplications}
                </span>
              )}
            </div>
            <div style={{ fontSize:12.5, color:'var(--text3)', marginBottom:18, lineHeight:1.6 }}>{r.desc}</div>
            <div style={{ display:'flex', gap:8 }}>
              {i === 0 ? (
                <>
                  <ActionBtn onClick={handleExportPDF} style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📄 PDF</ActionBtn>
                  <ActionBtn onClick={handleExportExcel} style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📊 Excel</ActionBtn>
                </>
              ) : i === 1 ? (
                <>
                  <ActionBtn onClick={handlePopularExportPDF} style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📄 PDF</ActionBtn>
                  <ActionBtn onClick={handlePopularExportExcel} style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📊 Excel</ActionBtn>
                </>
              ) : i === 2 ? (
                 <>
                  <ActionBtn onClick={handleScholarshipExportPDF} style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📄 PDF</ActionBtn>
                  <ActionBtn onClick={handleScholarshipExportExcel} style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📊 Excel</ActionBtn>
                </>               
              ) : (
                <>
                  <ActionBtn style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📄 PDF</ActionBtn>
                  <ActionBtn style={{ flex:1, justifyContent:'center', textAlign:'center' }}>📊 Excel</ActionBtn>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <CardHeader title="📈 6-Month Registration Analytics" />
          <div style={{ width: '100%', height: 280, marginTop: 20 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{fill: 'var(--text3)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: 'var(--text3)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="registrations" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text3)' }}>No data available</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <CardHeader title="🎯 Popular Courses Chart" />
          <div style={{ width: '100%', height: 280, marginTop: 20 }}>
            {popularChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="course" tick={{fill: 'var(--text3)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: 'var(--text3)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text3)' }}>No data available</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="🎓 Scholarship Applications" />
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scholarshipList.slice(0, 5).map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {stat.scholarship}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>
                  {stat.applications}
                </span>
              </div>
            ))}
            {scholarshipList.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: 20 }}>
                Not enough data
              </div>
            )}
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Card>
          <CardHeader title="👥 Recent Registrations List" />
          <div style={{ marginTop: 20, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1.5px solid var(--border)' }}>
                  <th style={{ padding: '12px 14px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>Name</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>Email</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>Interest</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>District</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.students?.slice(0, 10).map((student, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text)' }}>{student.name}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text2)' }}>{student.email}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 20, background: 'var(--primary-l)', color: 'var(--primary)', fontWeight: 700, fontSize: 11 }}>
                        {student.courseInterest}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text3)' }}>{student.state}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text3)' }}>{student.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!reportData?.students || reportData.students.length === 0) && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text4)' }}>No student records found</div>
            )}
          </div>
        </Card>
      </div>
      
    </div>
  )
}
