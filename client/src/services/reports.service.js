import api from '../config/api';

export const fetchIncomeReport = async (params = {}) => {
  const response = await api.get('/reports/income', { params });
  return response.data;
};

export const fetchIncomeStatementReport = async (startDate, endDate) => {
  return fetchIncomeReport({ startDate, endDate });
};

export const fetchExpenseReport = async (params = {}) => {
  const response = await api.get('/reports/expense', { params });
  return response.data;
};

export const fetchExpenseStatementReport = async (startDate, endDate) => {
  return fetchExpenseReport({ startDate, endDate });
};

export const fetchBudgetReport = async (params = {}) => {
  const response = await api.get('/reports/budget', { params });
  return response.data;
};

export const fetchBudgetUtilizationReport = fetchBudgetReport;

export const fetchCommitteeReport = async () => {
  const response = await api.get('/reports/committee');
  return response.data;
};

export const fetchCommitteeHierarchyReport = fetchCommitteeReport;

export const fetchMemberReport = async (params = {}) => {
  const response = await api.get('/reports/member', { params });
  return response.data;
};

export const fetchAttendanceReport = async () => {
  const response = await api.get('/reports/attendance');
  return response.data;
};

export const downloadPDFReport = async (type, startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(`/reports/export/pdf/${type}`, { params, responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${type}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download PDF report:', err);
    alert(err.response?.data?.message || 'Failed to download PDF report');
  }
};

export const downloadReportPDF = downloadPDFReport;

export const downloadExcelReport = async (type, startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(`/reports/export/excel/${type}`, { params, responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${type}_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export Excel report:', err);
    alert(err.response?.data?.message || 'Failed to export Excel report');
  }
};

export const exportReportExcel = downloadExcelReport;
