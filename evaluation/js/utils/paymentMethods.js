/**
 * Payment Methods Configuration and Utilities
 * This file contains the configuration and utility functions for handling multiple payment methods
 */

export const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Cash',
    icon: 'mdi-cash',
    requiresValidation: false,
    fields: [
      { key: 'received_amount', label: 'Amount Received', type: 'number', required: true },
      { key: 'change_amount', label: 'Change', type: 'number', readonly: true, computed: true }
    ]
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: 'mdi-cellphone',
    requiresValidation: true,
    fields: [
      { key: 'mobile_number', label: 'Phone Number', type: 'tel', required: true },
      { key: 'transaction_code', label: 'Transaction Code', type: 'text', required: true }
    ]
  },
  {
    id: 'card',
    name: 'Card',
    icon: 'mdi-credit-card',
    requiresValidation: true,
    fields: [
      { key: 'card_number', label: 'Card Number', type: 'text', required: true },
      { key: 'expiry', label: 'Expiry (MM/YY)', type: 'text', required: true },
      { key: 'cvv', label: 'CVV', type: 'password', required: true },
      { key: 'card_holder', label: 'Card Holder Name', type: 'text', required: true }
    ]
  },
  {
    id: 'gift_card',
    name: 'Gift Card',
    icon: 'mdi-gift',
    requiresValidation: true,
    fields: [
      { key: 'code', label: 'Gift Card Code', type: 'text', required: true },
      { key: 'balance', label: 'Available Balance', type: 'number', readonly: true }
    ]
  },
  {
    id: 'voucher',
    name: 'Voucher',
    icon: 'mdi-ticket',
    requiresValidation: true,
    fields: [
      { key: 'code', label: 'Voucher Code', type: 'text', required: true },
      { key: 'balance', label: 'Available Balance', type: 'number', readonly: true }
    ]
  },
  {
    id: 'loyalty',
    name: 'Loyalty Points',
    icon: 'mdi-star',
    requiresValidation: true,
    fields: [
      { key: 'points', label: 'Points to Redeem', type: 'number', required: true },
      { key: 'available_points', label: 'Available Points', type: 'number', readonly: true },
      { key: 'value', label: 'Point Value', type: 'number', readonly: true }
    ]
  },
  {
    id: 'pesapal',
    name: 'Pesapal',
    icon: 'mdi-credit-card-wireless',
    requiresValidation: true,
    fields: [
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone_number', label: 'Phone Number', type: 'tel', required: true }
    ]
  }
];

/**
 * Get payment method configuration by ID
 * @param {string} methodId - The payment method ID
 * @returns {Object} Payment method configuration
 */
export function getPaymentMethodConfig(methodId) {
  return PAYMENT_METHODS.find(method => method.id === methodId) || null;
}

/**
 * Get default data structure for a payment method
 * @param {string} methodId - The payment method ID
 * @returns {Object} Default data structure for the payment method
 */
export function getDefaultPaymentData(methodId) {
  const config = getPaymentMethodConfig(methodId);
  if (!config) return {};
  
  const data = { amount: 0, status: 'pending', validated: false };
  
  // Initialize fields with default values
  config.fields.forEach(field => {
    data[field.key] = field.defaultValue !== undefined ? field.defaultValue : '';
  });
  
  return data;
}

/**
 * Validate payment method data
 * @param {string} methodId - The payment method ID
 * @param {Object} data - The payment data to validate
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export function validatePaymentData(methodId, data) {
  const config = getPaymentMethodConfig(methodId);
  const errors = {};
  let isValid = true;
  
  if (!config) {
    return { valid: false, errors: { general: 'Invalid payment method' } };
  }
  
  // Check required fields
  config.fields.forEach(field => {
    if (field.required && !data[field.key] && data[field.key] !== 0) {
      errors[field.key] = `${field.label} is required`;
      isValid = false;
    }
    
    // Add additional validation for specific field types
    if (field.type === 'email' && data[field.key]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data[field.key])) {
        errors[field.key] = 'Please enter a valid email address';
        isValid = false;
      }
    }
    
    if (field.type === 'tel' && data[field.key]) {
      // Simple phone number validation - adjust as needed
      const phoneRegex = /^[0-9\-\+\(\)\s]{10,20}$/;
      if (!phoneRegex.test(data[field.key])) {
        errors[field.key] = 'Please enter a valid phone number';
        isValid = false;
      }
    }
  });
  
  return { valid: isValid, errors };
}

/**
 * Format payment amount with currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'KSH')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'KSH') {
  if (isNaN(amount)) return `${currency} 0.00`;
  return `${currency} ${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Calculate change for cash payment
 * @param {number} amount - The amount due
 * @param {number} received - The amount received
 * @returns {number} The change amount
 */
export function calculateChange(amount, received) {
  return Math.max(0, parseFloat(received || 0) - parseFloat(amount || 0));
}

export default {
  PAYMENT_METHODS,
  getPaymentMethodConfig,
  getDefaultPaymentData,
  validatePaymentData,
  formatCurrency,
  calculateChange
};
