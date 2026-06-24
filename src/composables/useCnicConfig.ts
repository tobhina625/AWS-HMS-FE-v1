import { ref, computed } from 'vue';
import SystemConfigurationService, { type SystemConfigurationDto } from '@/services/SystemConfiguration/SystemConfiguration.services';

interface CnicConfig {
  fieldName: string;
  format: string;
  formatPattern: string;
  placeholder: string;
  maxLength: number;
  helpText: string;
}

interface ApiResponse {
  isSuccess: boolean;
  data?: SystemConfigurationDto;
  error?: string;
}

const cnicConfig = ref<CnicConfig>({
  fieldName: 'CNIC',
  format: '13-digit',
  formatPattern: '5-7-1',
  placeholder: '12345-1234567-8',
  maxLength: 15,
  helpText: 'Format: 12345-1234567-8 (auto-formatted)',
});

const isConfigLoaded = ref(false);
const isLoading = ref(false);

export function useCnicConfig() {
  const loadCnicConfig = async () => {
    if (isConfigLoaded.value || isLoading.value) return;

    isLoading.value = true;
    try {
      const [fieldNameRes, formatRes, patternRes] = await Promise.all([
        SystemConfigurationService.getByKey('CnicFieldName') as Promise<ApiResponse>,
        SystemConfigurationService.getByKey('CnicFormat') as Promise<ApiResponse>,
        SystemConfigurationService.getByKey('CnicFormatPattern') as Promise<ApiResponse>,
      ]);

      if (fieldNameRes.isSuccess && fieldNameRes.data?.value) {
        cnicConfig.value.fieldName = fieldNameRes.data.value;
      }

      if (formatRes.isSuccess && formatRes.data?.value) {
        cnicConfig.value.format = formatRes.data.value;
      }

      if (patternRes.isSuccess && patternRes.data?.value) {
        cnicConfig.value.formatPattern = patternRes.data.value;
        updateFormatDetails(patternRes.data.value);
      }

      isConfigLoaded.value = true;
    } catch (error) {
      console.warn('Failed to load CNIC configuration, using defaults:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const updateFormatDetails = (pattern: string) => {
    const parts = pattern.split('-').map(Number);
    const totalDigits = parts.reduce((sum, part) => sum + part, 0);

    cnicConfig.value.maxLength = totalDigits + parts.length - 1;

    const placeholderParts = parts.map((count) => '0'.repeat(count));
    cnicConfig.value.placeholder = placeholderParts.join('-');

    cnicConfig.value.helpText = `Format: ${cnicConfig.value.placeholder} (auto-formatted)`;
  };

  const formatCnic = (value: string): string => {
    if (!value) return '';

    const digits = value.replace(/\D/g, '');
    const pattern = cnicConfig.value.formatPattern.split('-').map(Number);
    const totalDigits = pattern.reduce((sum, part) => sum + part, 0);
    const limited = digits.slice(0, totalDigits);

    let formatted = '';
    let position = 0;

    for (let i = 0; i < pattern.length; i++) {
      const partLength = pattern[i];
      const part = limited.slice(position, position + partLength);

      if (part.length > 0) {
        formatted += part;
        if (i < pattern.length - 1 && part.length === partLength) {
          formatted += '-';
        }
      }

      position += partLength;
    }

    return formatted;
  };

  const validateCnic = (value: string): boolean => {
    if (!value) return false;

    const digits = value.replace(/\D/g, '');
    const pattern = cnicConfig.value.formatPattern.split('-').map(Number);
    const totalDigits = pattern.reduce((sum, part) => sum + part, 0);

    return digits.length === totalDigits;
  };

  const getValidationRegex = (): RegExp => {
    const pattern = cnicConfig.value.formatPattern.split('-').map(Number);
    const regexParts = pattern.map((count) => `\\d{${count}}`);
    const regexString = `^${regexParts.join('-')}$`;
    return new RegExp(regexString);
  };

  const validateCnicFormat = (value: string): string => {
    if (!value || !value.trim()) {
      return `${cnicConfig.value.fieldName} is required`;
    }

    const regex = getValidationRegex();
    if (!regex.test(value.trim())) {
      return `${cnicConfig.value.fieldName} must be in format: ${cnicConfig.value.placeholder}`;
    }

    return '';
  };

  const getErrorMessage = computed(() => {
    return `${cnicConfig.value.fieldName} must be in format: ${cnicConfig.value.placeholder}`;
  });

  return {
    cnicConfig: computed(() => cnicConfig.value),
    isConfigLoaded: computed(() => isConfigLoaded.value),
    loadCnicConfig,
    formatCnic,
    validateCnic,
    validateCnicFormat,
    getValidationRegex,
    getErrorMessage,
  };
}
