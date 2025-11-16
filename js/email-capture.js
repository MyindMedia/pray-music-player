/* ===========================
   Email Capture Controller
   =========================== */

class EmailCapture {
    constructor() {
        this.modal = document.getElementById('emailModal');
        this.form = document.getElementById('emailCaptureForm');
        this.emailInput = document.getElementById('emailInput');
        this.phoneInput = document.getElementById('phoneInput');
        this.countryCodeSelect = document.getElementById('countryCode');
        this.commPrefSelect = document.getElementById('commPref');
        this.optInCheckbox = document.getElementById('optInCheckbox');
        this.successMessage = document.getElementById('successMessage');

        this.apiURL = '/api/create-contact';

        this.init();
    }

    init() {
        // Check if email was already captured
        this.checkEmailStatus();

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Close modal on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });
    }

    checkEmailStatus() {
        const emailCaptured = localStorage.getItem('email_captured');
        if (emailCaptured) {
            // Email already captured, don't show modal
            return true;
        }
        return false;
    }

    showModal() {
        this.modal.style.display = 'flex';
        this.modal.setAttribute('aria-hidden', 'false');
        this.emailInput.focus();

        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.modal.setAttribute('aria-hidden', 'true');

        // Restore body scroll
        document.body.style.overflow = '';
    }

    isModalOpen() {
        return this.modal.style.display === 'flex';
    }

    async handleSubmit(e) {
        e.preventDefault();
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        const countryCode = this.countryCodeSelect.value;
        const preference = this.commPrefSelect ? this.commPrefSelect.value : '';
        const optIn = this.optInCheckbox.checked;

        if (!email) {
            this.showError('Please enter your email address');
            return;
        }

        if (!preference) {
            this.showError('Please select your communication preference');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        if (phone && !this.isValidPhone(phone)) {
            this.showError('Please enter a valid phone number');
            return;
        }

        if ((preference === 'sms' || preference === 'both') && !phone) {
            this.showError('Please add your phone number for SMS updates');
            return;
        }

        if (!optIn) {
            this.showError('Please agree to receive updates from Myind Sound');
            return;
        }

        // Disable submit button
        const submitBtn = this.form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Format phone with country code if provided
            let fullPhone = '';
            if (phone) {
                let cleanPhone = phone.replace(/^\+?\d{1,3}/, '').replace(/\D/g, '');
                fullPhone = `${countryCode}${cleanPhone}`;
            }

            const result = await this.submitToBackend(email, fullPhone, optIn, preference);

            if (result && result.success) {
                localStorage.setItem('email_captured', 'true');
                if (result.contactId) {
                    localStorage.setItem('ms_contact_id', String(result.contactId));
                }
                if (!document.cookie.includes('ms_uid=')) {
                    const uid = result.contactId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
                    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
                    document.cookie = `ms_uid=${uid}; expires=${expires}; path=/; SameSite=Lax`;
                }

                this.showSuccess();

                setTimeout(() => {
                    this.closeModal();
                    if (window.audioPlayer) {
                        window.audioPlayer.play();
                    }
                    setTimeout(() => {
                        this.showThankYouSection();
                    }, 1000);
                }, 2000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Email submission error:', error);
            this.showError('Could not submit. Check console for details.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async submitToBackend(email, phone, optIn, preference) {
        // Submit to backend API which calls Go High Level
        const payload = {
            email: email || null,
            phone: phone || null,
            optIn: optIn,
            preference: preference || null
        };

        console.log('Submitting to backend API:', payload);
        console.log('API URL:', this.apiURL);

        try {
            const response = await fetch(this.apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log('Response status:', response.status);
            console.log('Response data:', data);

            if (!response.ok) {
                const parts = [
                    data && data.message,
                    data && data.error,
                    data && data.details && data.details.message,
                    data && data.details && data.details.error
                ].filter(Boolean);
                const msg = parts.join(' ');
                const isDupStatus = response.status === 400 || response.status === 409;
                const looksDuplicate = /already exists|duplicate|exists/i.test(msg);
                if (isDupStatus && looksDuplicate) {
                    return { success: true, contactId: data.contactId || (data.contact && data.contact.id) || null, action: 'duplicate_bypass' };
                }
                const isAuthError = response.status === 401 || response.status === 403;
                const looksAuthIssue = /invalid jwt|unauthorized|jwt/i.test(msg);
                const isLocalHost = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
                if (isAuthError && isLocalHost) {
                    return { success: true, contactId: null, action: 'auth_bypass_local' };
                }
                console.error('API Error:', data);
                console.error('Error details:', JSON.stringify(data.details, null, 2));
                throw new Error(data.error || 'Failed to create contact');
            }

            return { success: true, contactId: data.contactId || (data.contact && data.contact.id) || null, action: 'created_or_updated' };

        } catch (error) {
            console.error('Error creating contact:', error);
            console.error('Error message:', error.message);

            return { success: false }
        }
    }

    isValidEmail(email) {
        // RFC 5322 compliant email regex (simplified)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Remove all non-digit characters for validation
        const cleaned = phone.replace(/\D/g, '');
        // Check if it's 7-15 digits (covers US and international formats)
        // More lenient to accommodate various formats
        return cleaned.length >= 7 && cleaned.length <= 15;
    }

    showSuccess() {
        // Hide form, show success message
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';
    }

    showError(message) {
        // Create or update error message element
        let errorEl = this.form.querySelector('.error-message');

        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.style.cssText = `
                color: #ff4d6d;
                font-size: 0.875rem;
                margin-top: 8px;
                text-align: center;
            `;
            this.form.appendChild(errorEl);
        }

        errorEl.textContent = message;

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.remove();
            }
        }, 5000);
    }

    showThankYouSection() {
        const thankYouSection = document.getElementById('thankYouSection');

        if (thankYouSection) {
            // Show the section with fade-in animation
            thankYouSection.style.display = 'block';

            // Trigger animation after display is set
            setTimeout(() => {
                thankYouSection.style.opacity = '1';
                thankYouSection.style.transform = 'translateY(0)';
            }, 50);

            // Smooth scroll to the section
            setTimeout(() => {
                thankYouSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);

            // Initialize copy button functionality
            this.initCopyButton();
        }
    }

    initCopyButton() {
        const copyBtn = document.getElementById('copyCodeBtn');
        const copyText = document.getElementById('copyText');
        const discountCode = document.getElementById('discountCode').textContent;

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                // Copy to clipboard
                navigator.clipboard.writeText(discountCode).then(() => {
                    // Show success feedback
                    const originalText = copyText.textContent;
                    copyText.textContent = 'Copied!';
                    copyBtn.classList.add('copied');

                    // Reset after 2 seconds
                    setTimeout(() => {
                        copyText.textContent = originalText;
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    copyText.textContent = 'Failed to copy';
                    setTimeout(() => {
                        copyText.textContent = 'Copy Code';
                    }, 2000);
                });
            });
        }
    }

    // Public method to trigger modal from external code
    static showEmailModal() {
        const emailCapture = window.emailCapture;
        if (emailCapture && !emailCapture.checkEmailStatus()) {
            emailCapture.showModal();
        }
    }
}

// Initialize email capture when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.emailCapture = new EmailCapture();
});
