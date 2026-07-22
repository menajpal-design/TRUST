import api from '../config/api';

export const fetchReceipts = async (params = {}) => {
  const response = await api.get('/receipts', { params });
  return response.data;
};

export const fetchReceiptDetails = async (id) => {
  const response = await api.get(`/receipts/${id}`);
  return response.data;
};

export const createReceipt = async (data) => {
  const response = await api.post('/receipts', data);
  return response.data;
};

export const sendReceiptEmail = async (id, target_email) => {
  const response = await api.post(`/receipts/${id}/email`, { target_email });
  return response.data;
};

export const verifyPublicReceiptToken = async (token) => {
  const response = await api.get('/receipts/verify-public', { params: { token } });
  return response.data;
};

export const verifyReceiptToken = verifyPublicReceiptToken;

export const getReceiptPDFUrl = (id) => {
  return `/api/v1/receipts/${id}/pdf`;
};

export const getWhatsAppShareUrl = (receipt, orgName) => {
  const text = `Official Payment Receipt from ${orgName}\nReceipt No: ${receipt.receipt_no}\nPayer: ${receipt.payer_name}\nAmount: $${receipt.amount.toFixed(2)} USD\nVerification Link: ${window.location.origin}/verify-receipt?token=${receipt.verification_token}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};
