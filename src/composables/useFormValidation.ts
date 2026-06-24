/**
 * useFormValidation
 * Pure, named validator functions — import only what you need.
 * Each returns an error string or '' when valid.
 *
 * Also re-exports the composable factory (useFormValidation()) so any
 * existing callers that rely on the rule-based API continue to work.
 */

import { useCnicConfig } from './useCnicConfig';

// ── Named pure validators ─────────────────────────────────────────
const LETTERS_ONLY = /^[A-Za-z\s]+$/;
const PHONE_10_DIGITS = /^\d{10}$/;

export function validateRequired(value: string | number | null | undefined, fieldLabel = 'This field'): string {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${fieldLabel} is required.`;
  }
  return '';
}

export function validateLettersOnly(value: string, fieldLabel = 'This field'): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return `${fieldLabel} is required.`;
  if (!LETTERS_ONLY.test(trimmed)) {
    return `${fieldLabel} should only contain letters and spaces.`;
  }
  return '';
}

export function validateLabTestName(value: string, fieldLabel = 'This field'): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return `${fieldLabel} is required.`;
  if (!/^[A-Za-z0-9\s()/]+$/.test(trimmed)) {
    return `${fieldLabel} should only contain letters, numbers, spaces, parentheses, hyphens, and slashes.`;
  }
  return '';
}

export function validatePositiveNumber(value: string | number, fieldLabel = 'This field'): string {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${fieldLabel} is required.`;
  }
  if (Number(value) < 1) {
    return `${fieldLabel} must be greater than 0.`;
  }
  return '';
}

export function validatePhoneNumber(value: string): string {
  const phone = value?.toString().trim();
  if (!phone) return 'Phone number is required.';
  if (!PHONE_10_DIGITS.test(phone)) return 'Phone number must be exactly 10 digits.';
  return '';
}

export function validateCNIC(value: string): string {
  const trimmed = value?.trim() ?? '';

  // Use dynamic validation from system configuration
  const { validateCnicFormat, cnicConfig } = useCnicConfig();

  if (!trimmed) return `${cnicConfig.value.fieldName} is required.`;

  return validateCnicFormat(trimmed);
}

// ── Composable factory (backward-compat with existing code) ───────
import { ref } from 'vue';

export interface ValidationRule {
  validate: (value: any) => boolean | string;
}

export const useFormValidation = () => {
  const errors = ref<Record<string, string>>({});

  const rules = {
    required: (message = 'This field is required'): ValidationRule => ({
      validate: (v) => (v !== undefined && v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)) || message,
    }),
    email: (message = 'Invalid email address'): ValidationRule => ({ validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || message }),
    phone: (message = 'Select country code and enter 10 digits'): ValidationRule => ({
      validate: (v) => {
        if (!v) return true;
        const str = String(v).trim();
        const match = str.match(/^(\+\d+)\s*(.*)$/);
        if (!match) return message;
        const numPart = match[2].replace(/\D/g, '');
        return numPart.length === 10 || message;
      },
    }),
    /** For forms with separate countryCode and phoneNumber fields. Pass { countryCode, phoneNumber }. */
    phoneWithCountryCode: (message = 'Select country code and enter 10 digits'): ValidationRule => ({
      validate: (v) => {
        const obj = v && typeof v === 'object' && 'countryCode' in v && 'phoneNumber' in v ? v : null;
        if (!obj) return true;
        const countryCode = String(obj.countryCode ?? '').trim();
        const phoneNumber = String(obj.phoneNumber ?? '').replace(/\D/g, '');
        if (!countryCode) return message;
        if (phoneNumber.length !== 10) return message;
        return true;
      },
    }),
    name: (message = 'Only letters and spaces allowed'): ValidationRule => ({ validate: (v) => !v || LETTERS_ONLY.test(v) || message }),
    labTestName: (message = 'Only letters, numbers, spaces, parentheses, hyphens, and slashes allowed'): ValidationRule => ({
      validate: (v) => !v || /^[A-Za-z0-9\s()/]+$/.test(v) || message,
    }),
    age: (message = 'Age must be 1-120'): ValidationRule => ({ validate: (v) => !v || (Number(v) > 0 && Number(v) <= 120) || message }),
    cnic: (): ValidationRule => ({
      validate: (v) => {
        if (!v) return true;
        const { validateCnicFormat } = useCnicConfig();
        const error = validateCnicFormat(v);
        return error === '' || error;
      },
    }),
    nonNegativeNumber: (message = 'Value cannot be negative'): ValidationRule => ({
      validate: (v) => v === undefined || v === null || v === '' || Number(v) >= 0 || message,
    }),
    requiredPositiveId: (message = 'A valid ID is required'): ValidationRule => ({
      validate: (v) => (v !== undefined && v !== null && v !== '' && Number(v) > 0) || message,
    }),
    minValue: (min: number, message = `Value must be at least ${min}`): ValidationRule => ({
      validate: (v) => v === undefined || v === null || v === '' || Number(v) >= min || message,
    }),
  };

  const validateField = (name: string, value: any, fieldRules: ValidationRule[]) => {
    errors.value[name] = '';
    for (const rule of fieldRules) {
      const result = rule.validate(value);
      if (typeof result === 'string') {
        errors.value[name] = result;
        return false;
      }
    }
    return true;
  };

  const validateForm = (data: Record<string, any>, formRules: Record<string, ValidationRule[]>) => {
    let isValid = true;
    errors.value = {};
    for (const [field, fieldRules] of Object.entries(formRules)) {
      if (!validateField(field, data[field], fieldRules)) {
        isValid = false;
      }
    }
    return isValid;
  };

  const validate = (field: string, value: any, fieldRules: ValidationRule[]) => {
    return validateField(field, value, fieldRules);
  };

  const clearError = (field: string) => {
    if (errors.value[field]) {
      delete errors.value[field];
    }
  };

  return { errors, rules, validateField, validateForm, validate, clearError };
};
