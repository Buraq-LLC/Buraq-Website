    // --- 1. Custom Cursor Logic ---
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });

    const hoverTriggers = document.querySelectorAll('.hover-trigger, a, button');
    hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
        trigger.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
    });

    // --- 2. Navbar Scroll Effect ---
    const nav = document.querySelector('.site-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    // --- 3. Intersection Observer (Unified Animation System) ---
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // For Buraq's classes
                entry.target.classList.add('active');  // For Aether's classes
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll, .reveal').forEach(el => observer.observe(el));

    // --- 4. Typewriter Effect (Customized for Buraq) ---
    const textElement = document.getElementById('typewriter-text');
    const phrases = [
        "Scanning conflict zones...",
        "Verifying humanitarian aid...",
        "Detecting active threats...",
        "Protecting civilian data...",
        "Analyzing satellite imagery..."
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 50;

    function typeWriter() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 30;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 50;
        }
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(typeWriter, typeSpeed);
    }
    setTimeout(typeWriter, 1000);

    // --- 5. Dynamic Footer Year ---
    document.querySelector('[data-year]').textContent = new Date().getFullYear();

    // --- 6. Firebase Form Submission with reCAPTCHA ---
    const form = document.getElementById('inqForm');
    const formMsg = document.getElementById('formMsg');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        formMsg.textContent = '';
        formMsg.className = 'contact__msg';
        
        // Validate reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            formMsg.textContent = 'Please complete the reCAPTCHA verification.';
            formMsg.style.color = '#ff3b30';
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const payload = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            organization: formData.get('org'),
            jobTitle: formData.get('title') || '',
            country: formData.get('country'),
            message: formData.get('notes'),
            recaptchaToken: recaptchaResponse
        };
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            // Save to Firebase
            const result = await window.saveInquiry(payload);
            
            if (result.ok) {
                formMsg.textContent = 'Thank you! Your inquiry has been received. We will contact you shortly.';
                formMsg.style.color = '#4cd964';
                form.reset();
                grecaptcha.reset();
            } else {
                formMsg.textContent = result.error || 'An error occurred. Please try again.';
                formMsg.style.color = '#ff3b30';
            }
        } catch (error) {
            console.error('Form submission error:', error);
            formMsg.textContent = 'Failed to submit inquiry. Please try again or contact us directly.';
            formMsg.style.color = '#ff3b30';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

