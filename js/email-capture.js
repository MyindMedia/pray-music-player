/* ===========================
   Email Capture Controller
   =========================== */

class EmailCapture {
    constructor() {
        this.modal = document.getElementById('emailModal');
        this.form = document.getElementById('emailCaptureForm');
        this.nameInput = document.getElementById('nameInput');
        this.emailInput = document.getElementById('emailInput');
        this.phoneInput = document.getElementById('phoneInput');
        this.countryCodeSelect = document.getElementById('countryCode');
        this.optInCheckbox = document.getElementById('optInCheckbox');
        this.successMessage = document.getElementById('successMessage');

        // Configuration - API URL (works for both local and production)
        // When deployed to Netlify, /api/* redirects to /.netlify/functions/*
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
        this.nameInput.focus();

        // Prevent body scroll
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

        const name = this.nameInput.value.trim();
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        const countryCode = this.countryCodeSelect.value;
        const optIn = this.optInCheckbox.checked;

        // Validation
        if (!name) {
            this.showError('Please enter your name');
            return;
        }

        // Must have either email or phone
        if (!email && !phone) {
            this.showError('Please provide either an email address or phone number');
            return;
        }

        // Validate email if provided
        if (email && !this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Validate phone if provided
        if (phone && !this.isValidPhone(phone)) {
            this.showError('Please enter a valid phone number');
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
            const fullPhone = phone ? `${countryCode}${phone}` : '';

            // Submit to Go High Level
            const success = await this.submitToBackend(name, email, fullPhone, optIn);

            if (success) {
                // Store email captured status
                localStorage.setItem('email_captured', 'true');

                // Show success message
                this.showSuccess();

                // Auto-close and start playing after 2 seconds
                setTimeout(() => {
                    this.closeModal();

                    // Start playing music
                    if (window.audioPlayer) {
                        window.audioPlayer.play();
                    }

                    // Show Thank You section after music starts
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

    async submitToBackend(name, email, phone, optIn) {
        // Submit to backend API which calls Go High Level
        const payload = {
            name: name,
            email: email || null,
            phone: phone || null,
            optIn: optIn
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
                console.error('API Error:', data);
                throw new Error(data.error || 'Failed to create contact');
            }

            console.log('✅ Contact created successfully:', data.contactId);
            return true;

        } catch (error) {
            console.error('Error creating contact:', error);
            console.error('Error message:', error.message);

            // Return false to show error to user
            return false;
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
