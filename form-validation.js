// Form Validation and Google Sheets Integration for S Shobana Enterprises
// Version: 2.0 - Full CORS Support with Enhanced Features

class FormValidator {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        
        // REPLACE WITH YOUR ACTUAL GOOGLE APPS SCRIPT WEB APP URL
        this.scriptURL = 'https://script.google.com/macros/s/AKfycbyoq0nbqknADvl0E2SD77anPCTnLuCiO0GddiaVxZiKaqZXFBeI52sB4c7DkTG7me3bbA/exec';
        
        // Configuration
        this.config = {
            retryAttempts: 3,
            retryDelay: 1000,
            notificationDuration: 6000,
            debugMode: false // Set to true for detailed logging
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing S Shobana Enterprises FormValidator v2.0...');
        this.setupValidators();
        this.initializeForms();
        this.setupRealTimeValidation();
        this.enhanceFormUI();
        this.addFormAnimations();
        this.testConnection();
    }

    async testConnection() {
        if (this.config.debugMode) {
            console.log('🔄 Testing connection to form handler...');
        }
        
        try {
            const response = await fetch(this.scriptURL, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Connection test successful:', result.message);
                this.showSystemNotification('success', 'Form system connected successfully!', 3000);
            } else {
                console.warn('⚠️ Connection test failed:', response.status);
                this.showSystemNotification('warning', 'Form system connection warning - please check if issues persist', 4000);
            }
        } catch (error) {
            console.warn('⚠️ Connection test error:', error.message);
            if (this.config.debugMode) {
                this.showSystemNotification('error', 'Connection test failed - forms may still work', 4000);
            }
        }
    }

    setupValidators() {
        // Email validation
        this.validators.set('email', {
            pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            message: 'Please enter a valid email address'
        });

        // Indian phone number validation
        this.validators.set('phone', {
            pattern: /^(\+91[\s-]?)?[6789]\d{9}$/,
            message: 'Please enter a valid Indian phone number (e.g., +91-9876543210)'
        });

        // Name validation
        this.validators.set('name', {
            pattern: /^[a-zA-Z\s.'-]{2,50}$/,
            message: 'Name must be 2-50 characters and contain only letters, spaces, dots, hyphens, and apostrophes'
        });

        // Required field validation
        this.validators.set('required', {
            validate: (value) => value && value.toString().trim().length > 0,
            message: 'This field is required'
        });

        // Message validation
        this.validators.set('message', {
            validate: (value) => value && value.toString().trim().length >= 10,
            message: 'Message must be at least 10 characters long'
        });

        // Service selection validation
        this.validators.set('service', {
            validate: (value) => value && value !== '' && value !== 'Select a service',
            message: 'Please select a service from the dropdown'
        });

        if (this.config.debugMode) {
            console.log('✅ Validators setup complete');
        }
    }

    initializeForms() {
        console.log('📝 Initializing forms...');
        
        // Contact Form Setup
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            console.log('✅ Contact form found');
            this.forms.set('contact', {
                element: contactForm,
                fields: {
                    name: ['required', 'name'],
                    email: ['required', 'email'],
                    phone: ['phone'],
                    service: ['required', 'service'],
                    message: ['required', 'message']
                },
                onSubmit: this.handleContactSubmit.bind(this)
            });
        } else {
            console.warn('❌ Contact form not found - make sure element has id="contactForm"');
        }

        // Newsletter Form Setup
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            console.log('✅ Newsletter form found');
            this.forms.set('newsletter', {
                element: newsletterForm,
                fields: {
                    email: ['required', 'email']
                },
                onSubmit: this.handleNewsletterSubmit.bind(this)
            });
        } else {
            console.warn('❌ Newsletter form not found - make sure element has id="newsletterForm"');
        }

        // Add event listeners to forms
        this.forms.forEach((formData, formName) => {
            formData.element.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.config.debugMode) {
                    console.log(`📤 Form ${formName} submitted`);
                }
                this.validateAndSubmitForm(formName);
            });

            // Add form identifier for debugging
            formData.element.setAttribute('data-form-name', formName);
            
            // Add loading state class capability
            formData.element.classList.add('form-validator-managed');
        });

        if (this.forms.size === 0) {
            console.warn('⚠️ No forms found - check that forms have correct IDs');
        }
    }

    setupRealTimeValidation() {
        this.forms.forEach((formData, formName) => {
            Object.keys(formData.fields).forEach(fieldName => {
                const field = formData.element.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    // Input validation with debounce
                    field.addEventListener('input', this.debounce(() => {
                        if (field.value.trim().length > 0) {
                            this.validateField(field, formData.fields[fieldName]);
                        }
                    }, 500));

                    // Blur validation (when user leaves field)
                    field.addEventListener('blur', () => {
                        this.validateField(field, formData.fields[fieldName]);
                    });

                    // Focus - clear previous errors
                    field.addEventListener('focus', () => {
                        this.clearFieldError(field);
                    });

                    // Change event for select elements
                    if (field.tagName.toLowerCase() === 'select') {
                        field.addEventListener('change', () => {
                            this.validateField(field, formData.fields[fieldName]);
                        });
                    }
                }
            });
        });
    }

    validateField(field, validators) {
        const value = field.value.toString().trim();
        
        // Clear previous states
        this.clearFieldError(field);

        // Skip validation for empty optional fields
        if (value === '' && !validators.includes('required')) {
            return true;
        }

        // Run each validator
        for (const validatorName of validators) {
            const validator = this.validators.get(validatorName);
            let isValid = false;

            if (validator.pattern) {
                isValid = validator.pattern.test(value);
            } else if (validator.validate) {
                isValid = validator.validate(value);
            }

            if (!isValid) {
                this.showFieldError(field, validator.message);
                return false;
            }
        }

        this.showFieldSuccess(field);
        return true;
    }

    validateForm(formName) {
        const formData = this.forms.get(formName);
        if (!formData) {
            console.error(`❌ Form ${formName} not found in forms map`);
            return false;
        }

        let isFormValid = true;
        const invalidFields = [];

        Object.keys(formData.fields).forEach(fieldName => {
            const field = formData.element.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const isFieldValid = this.validateField(field, formData.fields[fieldName]);
                if (!isFieldValid) {
                    isFormValid = false;
                    invalidFields.push(fieldName);
                }
            } else {
                console.warn(`⚠️ Field ${fieldName} not found in form ${formName}`);
            }
        });

        if (!isFormValid && this.config.debugMode) {
            console.log('❌ Form validation failed for fields:', invalidFields);
        } else if (isFormValid) {
            console.log('✅ Form validation passed');
        }

        return isFormValid;
    }

    validateAndSubmitForm(formName) {
        const isValid = this.validateForm(formName);
        
        if (isValid) {
            const formData = this.forms.get(formName);
            if (formData && formData.onSubmit) {
                formData.onSubmit(formData.element);
            }
        } else {
            // Focus on first error field and scroll to it
            const firstErrorField = document.querySelector('.form-input.error, .form-textarea.error, .form-select.error');
            if (firstErrorField) {
                firstErrorField.focus();
                firstErrorField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }

            // Add shake animation to form
            const form = this.forms.get(formName).element;
            this.addShakeAnimation(form);
            
            this.showNotification('error', 'Please fix the errors in the form before submitting.', 5000);
        }
    }

    async handleContactSubmit(form) {
        console.log('🚀 Processing contact form submission...');
        
        const submitButton = form.querySelector('.form-submit');
        const btnText = submitButton.querySelector('.btn-text');
        const btnLoader = submitButton.querySelector('.btn-loader');

        // Show loading state
        this.showLoadingState(submitButton, btnText, btnLoader);

        // Collect form data
        const formData = new FormData(form);
        const submissionData = {
            formType: 'contact',
            name: formData.get('name')?.trim(),
            email: formData.get('email')?.trim(),
            phone: formData.get('phone')?.trim(),
            service: formData.get('service'),
            message: formData.get('message')?.trim(),
            ipAddress: await this.getClientIP(),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            source: 'website',
            formVersion: '2.0'
        };

        if (this.config.debugMode) {
            console.log('📤 Submitting contact ', { 
                ...submissionData, 
                userAgent: 'hidden',
                message: 'hidden' 
            });
        }

        try {
            const response = await this.submitWithRetry(submissionData);
            
            if (response.success) {
                console.log('✅ Contact form submitted successfully');
                
                this.showNotification('success', 
                    `Thank you, ${submissionData.name}! Your message has been sent successfully. We have received your inquiry about ${submissionData.service} and will contact you within 24 hours. Please check your email for confirmation.`,
                    8000
                );
                
                this.resetForm(form);
                this.trackFormSubmission('contact', true);
                
                // Update progress if exists
                this.updateFormProgress(form, 100);
                
            } else {
                throw new Error(response.message || 'Form submission failed');
            }
        } catch (error) {
            console.error('❌ Contact form submission error:', error);
            this.handleSubmissionError(error, 'contact');
        } finally {
            this.hideLoadingState(submitButton, btnText, btnLoader);
        }
    }

    async handleNewsletterSubmit(form) {
        console.log('📧 Processing newsletter form submission...');
        
        const submitButton = form.querySelector('.newsletter-btn');
        const originalText = submitButton.textContent;

        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';
        submitButton.classList.add('loading');

        // Collect form data
        const formData = new FormData(form);
        const submissionData = {
            formType: 'newsletter',
            email: formData.get('email')?.trim(),
            ipAddress: await this.getClientIP(),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            source: 'website',
            formVersion: '2.0'
        };

        if (this.config.debugMode) {
            console.log('📤 Submitting newsletter ', { 
                email: submissionData.email,
                source: submissionData.source 
            });
        }

        try {
            const response = await this.submitWithRetry(submissionData);
            
            if (response.success) {
                console.log('✅ Newsletter subscription successful');
                
                this.showNotification('success', 
                    `Welcome to our newsletter! Thank you for subscribing with ${submissionData.email}. You will receive updates about our latest projects, construction insights, and special offers. Check your email for a welcome message!`,
                    8000
                );
                
                this.resetForm(form);
                this.trackFormSubmission('newsletter', true);
                
            } else {
                throw new Error(response.message || 'Newsletter subscription failed');
            }
        } catch (error) {
            console.error('❌ Newsletter submission error:', error);
            this.handleSubmissionError(error, 'newsletter');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.classList.remove('loading');
        }
    }

    async submitWithRetry(data, attempt = 1) {
        try {
            if (this.config.debugMode) {
                console.log(`📡 Submission attempt ${attempt}/${this.config.retryAttempts}`);
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(this.scriptURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'cors',
                cache: 'no-cache',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (this.config.debugMode) {
                console.log(`📊 Response status: ${response.status}`);
                console.log(`📊 Response ok: ${response.ok}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            
            if (this.config.debugMode) {
                console.log('📥 Response result:', result);
            }

            return result;
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            // Don't retry for certain errors
            const noRetryErrors = [
                'already subscribed',
                'invalid email',
                'missing required',
                'HTTP 400',
                'HTTP 401',
                'HTTP 403'
            ];
            
            const shouldNotRetry = noRetryErrors.some(errorType => 
                error.message.toLowerCase().includes(errorType.toLowerCase())
            );
            
            if (attempt < this.config.retryAttempts && !shouldNotRetry) {
                const delay = this.config.retryDelay * attempt;
                console.log(`🔄 Retrying in ${delay}ms...`);
                await this.delay(delay);
                return this.submitWithRetry(data, attempt + 1);
            }
            
            throw error;
        }
    }

    handleSubmissionError(error, formType) {
        let errorMessage = 'Sorry, there was an error processing your request. ';
        let errorType = 'general';
        
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('already subscribed')) {
            errorMessage = 'This email address is already subscribed to our newsletter. Thank you for your continued interest!';
            errorType = 'duplicate';
        } else if (errorMsg.includes('invalid email')) {
            errorMessage = 'Please check your email address and try again.';
            errorType = 'validation';
        } else if (errorMsg.includes('cors') || errorMsg.includes('access-control')) {
            errorMessage += 'There\'s a technical issue with our form system. Please contact us directly at info@sshobanaenterprises.com or call us.';
            errorType = 'cors';
        } else if (errorMsg.includes('failed to fetch') || errorMsg.includes('network')) {
            errorMessage += 'Please check your internet connection and try again.';
            errorType = 'network';
        } else if (errorMsg.includes('timeout') || errorMsg.includes('aborted')) {
            errorMessage += 'The request timed out. Please try again.';
            errorType = 'timeout';
        } else if (errorMsg.includes('http 5')) {
            errorMessage += 'Our server is temporarily unavailable. Please try again in a few minutes.';
            errorType = 'server';
        } else {
            errorMessage += 'Please try again or contact us directly at info@sshobanaenterprises.com';
        }
        
        this.showNotification('error', errorMessage, 8000);
        this.trackFormSubmission(formType, false, { error: errorMsg, type: errorType });
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json', {
                timeout: 5000
            });
            const data = await response.json();
            return data.ip;
        } catch (error) {
            if (this.config.debugMode) {
                console.log('⚠️ Could not get IP address:', error.message);
            }
            return 'Unknown';
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('success');
        
        const errorElement = document.getElementById(`${field.name}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        // Add shake animation to field
        this.addShakeAnimation(field);
        
        // Add ARIA attributes for accessibility
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${field.name}Error`);
    }

    showFieldSuccess(field) {
        field.classList.remove('error');
        field.classList.add('success');
        
        const errorElement = document.getElementById(`${field.name}Error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        // Update ARIA attributes
        field.setAttribute('aria-invalid', 'false');
        field.removeAttribute('aria-describedby');
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const errorElement = document.getElementById(`${field.name}Error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        // Clear ARIA attributes
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }

    addShakeAnimation(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    showLoadingState(button, textElement, loaderElement) {
        button.disabled = true;
        button.classList.add('loading');
        
        if (textElement) {
            textElement.style.display = 'none';
        }
        if (loaderElement) {
            loaderElement.style.display = 'inline-block';
        }
        
        // Add loading cursor to button
        button.style.cursor = 'wait';
    }

    hideLoadingState(button, textElement, loaderElement) {
        button.disabled = false;
        button.classList.remove('loading');
        
        if (textElement) {
            textElement.style.display = 'inline';
        }
        if (loaderElement) {
            loaderElement.style.display = 'none';
        }
        
        // Reset cursor
        button.style.cursor = '';
    }

    showNotification(type, message, duration = this.config.notificationDuration) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.form-notification');
        existingNotifications.forEach(notification => {
            this.hideNotification(notification);
        });

        const notification = document.createElement('div');
        notification.className = `form-notification notification-${type}`;
        
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${iconMap[type] || 'ℹ️'}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" aria-label="Close notification">
                    ×
                </button>
            </div>
        `;

        // Apply styles directly for compatibility
        const styles = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: type === 'success' ? '#d4edda' : 
                            type === 'error' ? '#f8d7da' : 
                            type === 'warning' ? '#fff3cd' : '#d1ecf1',
            color: type === 'success' ? '#155724' : 
                   type === 'error' ? '#721c24' : 
                   type === 'warning' ? '#856404' : '#0c5460',
            border: `1px solid ${type === 'success' ? '#c3e6cb' : 
                                type === 'error' ? '#f5c6cb' : 
                                type === 'warning' ? '#ffeaa7' : '#bee5eb'}`,
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '400px',
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            fontFamily: 'Moret, Georgia, serif',
            fontSize: '14px',
            lineHeight: '1.5'
        };

        Object.assign(notification.style, styles);
        document.body.appendChild(notification);

        // Show notification with animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        const autoRemove = setTimeout(() => {
            this.hideNotification(notification);
        }, duration);

        // Manual close
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.hideNotification(notification);
        });

        // Click outside to close
        const outsideClickHandler = (e) => {
            if (!notification.contains(e.target)) {
                clearTimeout(autoRemove);
                this.hideNotification(notification);
                document.removeEventListener('click', outsideClickHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler);
        }, 1000);

        // Accessibility
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
    }

    showSystemNotification(type, message, duration = 3000) {
        // Only show system notifications in debug mode or for critical issues
        if (!this.config.debugMode && type !== 'error') {
            return;
        }
        
        this.showNotification(type, message, duration);
    }

    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    resetForm(form) {
        form.reset();
        
        // Clear all field states
        const fields = form.querySelectorAll('.form-input, .form-textarea, .form-select');
        fields.forEach(field => {
            this.clearFieldError(field);
        });
        
        // Reset form classes
        form.classList.remove('submitted', 'error');
        
        // Reset progress if exists
        this.updateFormProgress(form, 0);
        
        // Reset floating labels
        this.updateFloatingLabels(form);
    }

    enhanceFormUI() {
        this.addFloatingLabels();
        this.addFormProgress();
        this.addCharacterCounters();
        this.improveAccessibility();
    }

    addFloatingLabels() {
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const input = group.querySelector('.form-input, .form-textarea, .form-select');
            const label = group.querySelector('.form-label');
            
            if (input && label) {
                const updateLabel = () => {
                    if (input.value.trim() !== '' || input === document.activeElement) {
                        label.classList.add('floating');
                    } else {
                        label.classList.remove('floating');
                    }
                };

                input.addEventListener('focus', updateLabel);
                input.addEventListener('blur', updateLabel);
                input.addEventListener('input', updateLabel);
                input.addEventListener('change', updateLabel);
                
                // Initial state
                updateLabel();
            }
        });
    }

    updateFloatingLabels(form) {
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const input = group.querySelector('.form-input, .form-textarea, .form-select');
            const label = group.querySelector('.form-label');
            
            if (input && label) {
                if (input.value.trim() === '') {
                    label.classList.remove('floating');
                }
            }
        });
    }

    addFormProgress() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm || contactForm.querySelector('.form-progress')) {
            return;
        }

        const progressContainer = document.createElement('div');
        progressContainer.className = 'form-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar-container">
                <div class="progress-label">Form Completion</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0% Complete</div>
            </div>
        `;

        contactForm.insertBefore(progressContainer, contactForm.firstChild);

        const updateProgress = () => {
            this.updateFormProgress(contactForm);
        };

        // Update progress on field changes
        const fields = contactForm.querySelectorAll('.form-input, .form-textarea, .form-select');
        fields.forEach(field => {
            field.addEventListener('input', updateProgress);
            field.addEventListener('change', updateProgress);
            field.addEventListener('blur', updateProgress);
        });
    }

    updateFormProgress(form, overrideProgress = null) {
        const progressContainer = form.querySelector('.form-progress');
        if (!progressContainer) return;

        let progress;
        
        if (overrideProgress !== null) {
            progress = overrideProgress;
        } else {
            const fields = form.querySelectorAll('.form-input, .form-textarea, .form-select');
            const validFields = Array.from(fields).filter(field => {
                const value = field.value.trim();
                return value !== '' && !field.classList.contains('error');
            });
            
            progress = (validFields.length / fields.length) * 100;
        }
        
        const progressFill = progressContainer.querySelector('.progress-fill');
        const progressText = progressContainer.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}% Complete`;
        }
    }

    addCharacterCounters() {
        const textareas = document.querySelectorAll('.form-textarea');
        textareas.forEach(textarea => {
            if (textarea.hasAttribute('maxlength') && 
                !textarea.parentNode.querySelector('.char-counter')) {
                
                const maxLength = parseInt(textarea.getAttribute('maxlength'));
                const counter = document.createElement('div');
                counter.className = 'char-counter';
                counter.style.cssText = `
                    text-align: right; 
                    font-size: 0.875rem; 
                    color: #666; 
                    margin-top: 5px;
                    font-family: inherit;
                `;
                
                textarea.parentNode.appendChild(counter);
                
                const updateCounter = () => {
                    const currentLength = textarea.value.length;
                    counter.textContent = `${currentLength}/${maxLength}`;
                    
                    if (currentLength > maxLength * 0.9) {
                        counter.style.color = '#dc3545';
                    } else if (currentLength > maxLength * 0.75) {
                        counter.style.color = '#ffc107';
                    } else {
                        counter.style.color = '#666';
                    }
                };
                
                textarea.addEventListener('input', updateCounter);
                updateCounter();
            }
        });
    }

    improveAccessibility() {
        // Add ARIA labels and descriptions
        this.forms.forEach((formData) => {
            Object.keys(formData.fields).forEach(fieldName => {
                const field = formData.element.querySelector(`[name="${fieldName}"]`);
                const label = formData.element.querySelector(`label[for="${fieldName}"]`);
                const errorElement = document.getElementById(`${fieldName}Error`);
                
                if (field) {
                    // Ensure proper labeling
                    if (label) {
                        field.setAttribute('aria-labelledby', label.id || `${fieldName}Label`);
                        if (!label.id) {
                            label.id = `${fieldName}Label`;
                        }
                    }
                    
                    // Add required field indicators
                    if (formData.fields[fieldName].includes('required')) {
                        field.setAttribute('aria-required', 'true');
                    }
                    
                    // Setup error messaging
                    if (errorElement) {
                        errorElement.setAttribute('aria-live', 'polite');
                    }
                }
            });
        });
    }

    addFormAnimations() {
        // Add CSS animation styles if not already present
        if (!document.getElementById('form-validator-styles')) {
            const style = document.createElement('style');
            style.id = 'form-validator-styles';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
                    20%, 40%, 60%, 80% { transform: translateX(8px); }
                }
                
                .form-input.error, .form-textarea.error, .form-select.error {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25) !important;
                }
                
                .form-input.success, .form-textarea.success, .form-select.success {
                    border-color: #28a745 !important;
                    box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.25) !important;
                }
                
                .error-message {
                    display: none;
                    color: #dc3545;
                    font-size: 0.875rem;
                    margin-top: 5px;
                    font-weight: 500;
                }
                
                .error-message.show {
                    display: block;
                    animation: fadeIn 0.3s ease-in-out;
                }
                
                .form-label.floating {
                    transform: translateY(-25px) scale(0.85);
                    color: #E7BF8B;
                    transition: all 0.2s ease-in-out;
                }
                
                .btn-loader {
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    display: none;
                    margin-left: 8px;
                }
                
                .form-validator-managed.loading {
                    opacity: 0.8;
                    pointer-events: none;
                }
                
                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .notification-icon {
                    font-size: 1.2rem;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .notification-message {
                    flex: 1;
                    line-height: 1.4;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    font-size: 1.2rem;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    margin-left: 12px;
                    flex-shrink: 0;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                .progress-bar-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #E7BF8B;
                }
                
                .progress-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #333;
                    min-width: 120px;
                }
                
                .progress-bar {
                    flex: 1;
                    height: 6px;
                    background: #e0e0e0;
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #E7BF8B, #B8860B);
                    transition: width 0.3s ease;
                    width: 0%;
                }
                
                .progress-text {
                    font-size: 0.85rem;
                    color: #666;
                    font-weight: 500;
                    min-width: 80px;
                    text-align: right;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    trackFormSubmission(formType, success, additionalData = {}) {
        // Google Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'Form',
                'event_label': formType,
                'success': success,
                'value': success ? 1 : 0
            });
        }

        // Console logging for debugging
        console.log(`📊 Form tracking: ${formType} - ${success ? 'Success' : 'Failed'}`, additionalData);
        
        // Store in localStorage for analytics
        try {
            const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
            submissions.push({
                type: formType,
                success: success,
                timestamp: new Date().toISOString(),
                ...additionalData
            });
            
            // Keep only last 50 submissions
            const recent = submissions.slice(-50);
            localStorage.setItem('formSubmissions', JSON.stringify(recent));
        } catch (error) {
            console.warn('Could not store form submission ', error);
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public method to get form statistics
    getFormStatistics() {
        try {
            const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
            const stats = {
                total: submissions.length,
                successful: submissions.filter(s => s.success).length,
                failed: submissions.filter(s => !s.success).length,
                byType: {}
            };
            
            // Group by form type
            submissions.forEach(submission => {
                if (!stats.byType[submission.type]) {
                    stats.byType[submission.type] = { total: 0, successful: 0, failed: 0 };
                }
                stats.byType[submission.type].total++;
                if (submission.success) {
                    stats.byType[submission.type].successful++;
                } else {
                    stats.byType[submission.type].failed++;
                }
            });
            
            return stats;
        } catch (error) {
            console.warn('Could not retrieve form statistics:', error);
            return null;
        }
    }

    // Public method to clear form data
    clearFormData() {
        try {
            localStorage.removeItem('formSubmissions');
            console.log('📊 Form submission data cleared');
        } catch (error) {
            console.warn('Could not clear form ', error);
        }
    }

    // Public method to enable debug mode
    enableDebugMode() {
        this.config.debugMode = true;
        console.log('🔍 Debug mode enabled for FormValidator');
    }

    // Public method to disable debug mode
    disableDebugMode() {
        this.config.debugMode = false;
        console.log('🔍 Debug mode disabled for FormValidator');
    }
}

// Initialize form validator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 S Shobana Enterprises website loaded - Initializing form validation system...');
    window.formValidator = new FormValidator();
});

// Export for testing purposes (if running in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}

// Global utility functions for debugging
window.getFormStats = () => {
    if (window.formValidator) {
        return window.formValidator.getFormStatistics();
    }
    return null;
};

window.enableFormDebug = () => {
    if (window.formValidator) {
        window.formValidator.enableDebugMode();
    }
};

window.disableFormDebug = () => {
    if (window.formValidator) {
        window.formValidator.disableDebugMode();
    }
};

window.clearFormStats = () => {
    if (window.formValidator) {
        window.formValidator.clearFormData();
    }
};
