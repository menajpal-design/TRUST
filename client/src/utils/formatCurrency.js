import useAuthStore from '../store/useAuthStore';

export const getCurrencySymbol = (currencyCode) => {
  const storeCurrency = useAuthStore.getState().activeOrganization?.settings?.currency || 'BDT';
  const code = (currencyCode || storeCurrency).toUpperCase();

  switch (code) {
    case 'BDT':
    case 'TAKA':
    case 'TK':
      return '৳';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'INR':
      return '₹';
    default:
      return '৳';
  }
};

export const formatCurrency = (amount = 0, currencyCode = null) => {
  const symbol = getCurrencySymbol(currencyCode);
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${symbol}${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default formatCurrency;
