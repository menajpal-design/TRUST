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

export const downloadPDFReport = (type) => {
  window.open(`/api/v1/reports/export/pdf/${type}`, '_blank');
};

export const downloadReportPDF = downloadPDFReport;

export const downloadExcelReport = (type) => {
  window.open(`/api/v1/reports/export/excel/${type}`, '_blank');
};

export const exportReportExcel = downloadExcelReport;
