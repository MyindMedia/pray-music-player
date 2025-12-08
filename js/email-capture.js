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
        this.commPrefSelect = document.getElementById('commPref');
        this.optInCheckbox = document.getElementById('optInCheckbox');
        this.successMessage = document.getElementById('successMessage');

        const isLocal = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
        this.apiURL = isLocal ? 'http://localhost:3001/api/create-contact' : '/api/create-contact';
        this.prayerApiURL = isLocal ? 'http://localhost:3001/api/opt-in-prayer' : '/api/opt-in-prayer';

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
        // Check multiple indicators that user already submitted
        const emailCaptured = localStorage.getItem('email_captured');
        const hasContactId = localStorage.getItem('ms_contact_id');
        const hasDeviceCookie = document.cookie.includes('ms_uid=');

        if (emailCaptured || hasContactId || hasDeviceCookie) {
            // User already captured, don't show modal
            console.log('User already registered:', {
                emailCaptured: !!emailCaptured,
                hasContactId: !!hasContactId,
                hasDeviceCookie: hasDeviceCookie
            });
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
        const name = this.nameInput.value.trim();
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        const countryCode = this.countryCodeSelect.value;
        const preference = this.commPrefSelect ? this.commPrefSelect.value : '';
        const optIn = this.optInCheckbox.checked;

        if (!name) {
            this.showError('Please enter your name');
            return;
        }

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
                // Remove all non-digit characters
                let cleanPhone = phone.replace(/\D/g, '');
                // Remove any existing country code prefix (1-3 digits at start)
                cleanPhone = cleanPhone.replace(/^1?(\d{10})$/, '$1');
                fullPhone = `${countryCode}${cleanPhone}`;
            }

            const result = await this.submitToBackend(name, email, fullPhone, optIn, preference);

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

                        // Show prayer CTA popup 10 seconds after email opt-in completion
                        this.showPrayerCtaAfterEmailOptIn();
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

    async submitToBackend(name, email, phone, optIn, preference) {
        // Submit to backend API which calls Go High Level
        const payload = {
            name: name || null,
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

            this.initPrayerJourney();
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

    initPrayerJourney() {
        const optInEl = document.getElementById('prayerOptIn');
        const phoneGroup = document.getElementById('prayerPhoneGroup');
        const phoneInput = document.getElementById('prayerPhone');
        const countryCodeSelect = document.getElementById('prayerCountryCode');
        const form = document.getElementById('prayerJourneyForm');

        if (!form) return;

        if (optInEl) {
            optInEl.addEventListener('change', () => {
                if (optInEl.checked) {
                    phoneGroup.style.display = 'flex';
                    if (phoneInput) phoneInput.required = true;
                } else {
                    phoneGroup.style.display = 'none';
                    if (phoneInput) phoneInput.required = false;
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const optedIn = optInEl ? optInEl.checked : false;
            const rawPhone = phoneInput ? phoneInput.value.trim() : '';
            const countryCode = countryCodeSelect ? countryCodeSelect.value : '+1';

            if (!optedIn) {
                alert('Please confirm opt-in to receive daily prayers.');
                return;
            }

            if (!rawPhone) {
                alert('Please enter your phone number.');
                return;
            }

            let cleanPhone = rawPhone.replace(/\D/g, '');
            cleanPhone = cleanPhone.replace(/^1?(\d{10})$/, '$1');
            const fullPhone = `${countryCode}${cleanPhone}`;

            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            try {
                const contactId = localStorage.getItem('ms_contact_id');
                const payload = {
                    phone: fullPhone,
                    contactId: contactId || null
                };

                const response = await fetch(this.prayerApiURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data && (data.error || data.message) || 'Submission failed');
                }

                // Mark as opted in so CTA doesn't show again
                localStorage.setItem('prayer_journey_opted_in', 'true');

                // Show the prayer confirmation modal
                this.showPrayerConfirmationModal();

                // Reset form after 3 seconds
                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText || 'Start My Journey';
                    }
                    form.reset();
                    if (phoneGroup) phoneGroup.style.display = 'none';
                }, 3000);

            } catch (err) {
                console.error('Prayer opt-in submission error:', err);
                alert('Could not submit. Please try again later.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText || 'Start My Journey';
                }
            }
        });
    }

    showPrayerConfirmationModal() {
        const modal = document.getElementById('prayerConfirmationModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Auto-hide after 4 seconds
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 4000);
        }
    }

    showPrayerCtaAfterEmailOptIn() {
        // Check if user has already opted in or dismissed the popup
        const hasOptedIn = localStorage.getItem('prayer_journey_opted_in');
        const hasDismissed = localStorage.getItem('prayer_cta_dismissed');

        console.log('Prayer CTA Check:', {
            hasOptedIn,
            hasDismissed,
            willShow: !hasOptedIn && !hasDismissed
        });

        if (hasOptedIn || hasDismissed) {
            console.log('Prayer CTA blocked - user already opted in or dismissed');
            return;
        }

        console.log('Prayer CTA will show in 10 seconds...');

        // Show popup 10 seconds after email opt-in
        setTimeout(() => {
            console.log('Triggering prayer CTA popup now');
            this.initPrayerCtaPopup();
        }, 10000);
    }

    initPrayerCtaPopup() {
        const popup = document.getElementById('prayerCtaPopup');
        const closeBtn = document.getElementById('prayerCtaClose');
        const ctaButton = document.getElementById('prayerCtaButton');

        console.log('initPrayerCtaPopup called', { popup: !!popup });

        if (!popup) {
            console.error('Prayer CTA popup element not found!');
            return;
        }

        // Check if user has already opted in or dismissed the popup
        const hasOptedIn = localStorage.getItem('prayer_journey_opted_in');
        const hasDismissed = localStorage.getItem('prayer_cta_dismissed');

        if (hasOptedIn || hasDismissed) {
            console.log('initPrayerCtaPopup blocked - already opted in or dismissed');
            return;
        }

        console.log('Showing prayer CTA popup!');

        // Show the popup
        popup.style.display = 'block';
        popup.classList.add('scroll-visible');

        // Setup scroll-based hide/show behavior
        let lastScrollY = window.scrollY;
        const thankYouSection = document.getElementById('thankYouSection');

        const handleScroll = () => {
            if (!thankYouSection) return;

            const currentScrollY = window.scrollY;
            const thankYouTop = thankYouSection.offsetTop;
            const windowHeight = window.innerHeight;

            // Calculate how close we are to the Thank You section
            // Start hiding when we're 400px away from the section
            const distanceToThankYou = thankYouTop - currentScrollY - windowHeight;

            if (distanceToThankYou < 400 && currentScrollY > lastScrollY) {
                // Scrolling down and approaching Thank You section - hide popup
                popup.classList.remove('scroll-visible');
                popup.classList.add('scroll-hidden');
            } else if (distanceToThankYou >= 400 || currentScrollY < lastScrollY) {
                // Scrolling up or far from Thank You section - show popup
                popup.classList.remove('scroll-hidden');
                popup.classList.add('scroll-visible');
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);

        // Close button handler
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.removeEventListener('scroll', handleScroll);
                this.closePrayerCta();
            });
        }

        // CTA button handler - scroll to prayer journey form
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                window.removeEventListener('scroll', handleScroll);
                this.closePrayerCta();

                // First, make sure Thank You section is visible
                if (thankYouSection && thankYouSection.style.display === 'none') {
                    this.showThankYouSection();
                }

                // Scroll directly to the prayer journey form section
                setTimeout(() => {
                    const prayerSection = document.querySelector('.prayer-journey-cta');
                    if (prayerSection) {
                        // On mobile, scroll to center the section better
                        const isMobile = window.innerWidth <= 768;
                        prayerSection.scrollIntoView({
                            behavior: 'smooth',
                            block: isMobile ? 'center' : 'start'
                        });

                        // Auto-check the opt-in checkbox after scrolling
                        setTimeout(() => {
                            const optInCheckbox = document.getElementById('prayerOptIn');
                            if (optInCheckbox && !optInCheckbox.checked) {
                                optInCheckbox.click();
                            }

                            // On mobile, also focus the phone input to bring up keyboard
                            if (isMobile) {
                                const phoneInput = document.getElementById('prayerPhone');
                                if (phoneInput && phoneInput.offsetParent !== null) {
                                    phoneInput.focus();
                                }
                            }
                        }, 800);
                    }
                }, 100);
            });
        }
    }

    closePrayerCta() {
        const popup = document.getElementById('prayerCtaPopup');
        if (popup) {
            popup.classList.add('hiding');
            setTimeout(() => {
                popup.style.display = 'none';
                popup.classList.remove('hiding');
            }, 400);

            // Mark as dismissed
            localStorage.setItem('prayer_cta_dismissed', 'true');
        }
    }
}

// Initialize email capture when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.emailCapture = new EmailCapture();
});
