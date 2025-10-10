// Validation utility functions for KIMU Transport & Multiservices

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Rwandan format)
 */
export function validatePhone(phone: string): boolean {
  // Rwandan phone number format: +250 7XX XXX XXX or 07XX XXX XXX
  const phoneRegex = /^(\+250|0)?7[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate Rwandan license plate format
 */
export function validateLicensePlate(plate: string): boolean {
  // Format: RA + Alphabet + 3 digits + Alphabet
  const plateRegex = /^RA[A-Z]\s?\d{3}\s?[A-Z]$/;
  return plateRegex.test(plate.toUpperCase());
}

/**
 * Validate vehicle price format
 */
export function validatePrice(price: string): boolean {
  // Price should be a positive number with optional currency
  const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
  const numericPrice = price.replace(/[^0-9.]/g, '');
  return priceRegex.test(numericPrice) && parseFloat(numericPrice) > 0;
}

/**
 * Validate year (must be reasonable for vehicles)
 */
export function validateYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
}

/**
 * Validate vehicle mileage
 */
export function validateMileage(mileage: string): boolean {
  // Mileage should be a positive number
  const mileageRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
  return mileageRegex.test(mileage) && parseFloat(mileage) >= 0;
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return null;
}

/**
 * Validate numeric range
 */
export function validateRange(
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): string | null {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date, 
  endDate: Date, 
  fieldName: string
): string | null {
  if (startDate >= endDate) {
    return `${fieldName} start date must be before end date`;
  }
  return null;
}

/**
 * Validate booking dates
 */
export function validateBookingDates(
  pickupDate: string,
  returnDate: string,
  pickupTime: string,
  returnTime: string
): string | null {
  const pickup = new Date(`${pickupDate}T${pickupTime}`);
  const return_ = new Date(`${returnDate}T${returnTime}`);
  
  if (pickup >= return_) {
    return 'Pickup date and time must be before return date and time';
  }
  
  const now = new Date();
  if (pickup < now) {
    return 'Pickup date and time cannot be in the past';
  }
  
  return null;
}

/**
 * Validate vehicle form data
 */
export function validateVehicleForm(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Required fields
  const requiredFields = ['name', 'type', 'category', 'price', 'year', 'transmission', 'fuel'];
  requiredFields.forEach(field => {
    const error = validateRequired(data[field], field.charAt(0).toUpperCase() + field.slice(1));
    if (error) errors[field] = error;
  });
  
  // Email validation
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  // License plate validation
  if (data.licensePlate && !validateLicensePlate(data.licensePlate)) {
    errors.licensePlate = 'Invalid license plate format (RA + Alphabet + 3 digits + Alphabet)';
  }
  
  // Price validation
  if (data.price && !validatePrice(data.price)) {
    errors.price = 'Invalid price format';
  }
  
  // Year validation
  if (data.year && !validateYear(data.year)) {
    errors.year = 'Invalid year';
  }
  
  // Mileage validation
  if (data.mileage && !validateMileage(data.mileage)) {
    errors.mileage = 'Invalid mileage format';
  }
  
  // Quantity validation
  if (data.quantity !== undefined) {
    const quantityError = validateRange(data.quantity, 1, 100, 'Quantity');
    if (quantityError) errors.quantity = quantityError;
  }
  
  // Doors validation
  if (data.doors !== undefined) {
    const doorsError = validateRange(data.doors, 2, 8, 'Doors');
    if (doorsError) errors.doors = doorsError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate booking form data
 */
export function validateBookingForm(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Required fields
  const requiredFields = ['type', 'name', 'email', 'phone', 'pickupDate', 'pickupTime'];
  requiredFields.forEach(field => {
    const error = validateRequired(data[field], field.charAt(0).toUpperCase() + field.slice(1));
    if (error) errors[field] = error;
  });
  
  // Email validation
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  // Date validation
  if (data.pickupDate && data.returnDate && data.pickupTime && data.returnTime) {
    const dateError = validateBookingDates(
      data.pickupDate,
      data.returnDate,
      data.pickupTime,
      data.returnTime
    );
    if (dateError) errors.dates = dateError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate user form data
 */
export function validateUserForm(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Required fields
  const requiredFields = ['username', 'fullName', 'role'];
  requiredFields.forEach(field => {
    const error = validateRequired(data[field], field.charAt(0).toUpperCase() + field.slice(1));
    if (error) errors[field] = error;
  });
  
  // Username validation
  if (data.username) {
    if (data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }
  }
  
  // Email validation
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  // Password validation (for new users)
  if (data.password) {
    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize form data
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim();
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
}
