// Buraq AI Website JavaScript
(function() {
    'use strict';

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeNavigation();
        initializeScrollEffects();
        initializeHeroSlider();
        initializeCommandPalette();
        initializeExtensions();
        initializeRevealAnimations();
        initializeContactForm();
        initializeScrollProgress();
    });

    // Navigation functionality
    function initializeNavigation() {
        const navToggle = document.querySelector('.site-nav__toggle');
        const mobileMenu = document.querySelector('#mobileMenu');
        const navLinks = document.querySelectorAll('.site-nav__links a, .mobile-menu a');

        // Toggle mobile menu
        if (navToggle) {
            navToggle.addEventListener('click', function() {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                mobileMenu.setAttribute('aria-hidden', isExpanded);
                
                // Animate hamburger menu
                const spans = navToggle.querySelectorAll('span');
                if (isExpanded) {
                    spans[0].style.transform = 'rotate(0deg)';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'rotate(0deg)';
                } else {
                    spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
                }
            });
        }

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // Scroll effects
    function initializeScrollEffects() {
        const siteNav = document.querySelector('.site-nav');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            
            // Hide/show navigation on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                siteNav.style.transform = 'translateY(-100%)';
            } else {
                siteNav.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    // Hero slider functionality
    function initializeHeroSlider() {
        const slides = document.querySelectorAll('.device-slide');
        const prevBtn = document.querySelector('.device-frame__control[data-prev]');
        const nextBtn = document.querySelector('.device-frame__control[data-next]');
        const dotsContainer = document.querySelector('.device-frame__dots');
        let currentSlide = 0;

        if (slides.length === 0) return;

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('button');

        function goToSlide(slideIndex) {
            slides[currentSlide].classList.remove('is-active');
            dots[currentSlide].classList.remove('is-active');
            
            currentSlide = (slideIndex + slides.length) % slides.length;
            
            slides[currentSlide].classList.add('is-active');
            dots[currentSlide].classList.add('is-active');
        }

        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        function prevSlide() {
            goToSlide(currentSlide - 1);
        }

        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Auto-advance slides
        setInterval(nextSlide, 5000);

        // Initialize first slide
        goToSlide(0);
    }

    // Command palette functionality
    function initializeCommandPalette() {
        const commandItems = document.querySelectorAll('.command-palette__item');
        const previewTarget = document.querySelector('[data-spotlight-preview-target]');

        commandItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all items
                commandItems.forEach(i => i.classList.remove('is-active'));
                
                // Add active class to clicked item
                this.classList.add('is-active');
                
                // Update preview
                const previewSrc = this.getAttribute('data-preview-src');
                const previewAlt = this.getAttribute('data-preview-alt');
                
                if (previewTarget && previewSrc) {
                    previewTarget.innerHTML = `<img src="${previewSrc}" alt="${previewAlt || ''}" />`;
                }
            });
        });
    }

    // Extensions filter functionality
    function initializeExtensions() {
        const filterButtons = document.querySelectorAll('.pill-group .pill');
        const extensionCards = document.querySelectorAll('.extension-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('is-active'));
                this.classList.add('is-active');
                
                // Filter cards
                extensionCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Reveal animations on scroll
    function initializeRevealAnimations() {
        const revealElements = document.querySelectorAll('[data-reveal]');
        
        function checkReveal() {
            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight * 0.8) {
                    element.classList.add('is-revealed');
                }
            });
        }

        // Initial check
        checkReveal();
        
        // Check on scroll
        window.addEventListener('scroll', checkReveal);
        
        // Check on resize
        window.addEventListener('resize', checkReveal);
    }

    // Contact form functionality
    function initializeContactForm() {
        const form = document.getElementById('inqForm');
        const formMsg = document.getElementById('formMsg');

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simple form validation
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                    } else {
                        field.classList.remove('error');
                    }
                });
                
                if (isValid) {
                    // Show success message
                    formMsg.textContent = 'Thank you for your inquiry. We will get back to you soon.';
                    formMsg.style.color = '#10b981';
                    
                    // Reset form
                    form.reset();
                    
                    // Hide message after 5 seconds
                    setTimeout(() => {
                        formMsg.textContent = '';
                    }, 5000);
                } else {
                    // Show error message
                    formMsg.textContent = 'Please fill in all required fields.';
                    formMsg.style.color = '#ef4444';
                }
            });
        }
    }

    // Scroll progress bar
    function initializeScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress span');
        
        function updateProgress() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            
            if (progressBar) {
                progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
        }

        window.addEventListener('scroll', updateProgress);
        updateProgress(); // Initial update
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add parallax effect to hero background
    function initializeParallax() {
        const heroBackground = document.querySelector('.hero__background');
        
        window.addEventListener('scroll', debounce(function() {
            const scrolled = window.pageYOffset;
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        }, 10));
    }

    // Initialize parallax after other setup
    setTimeout(initializeParallax, 100);

    // Add hover effects to cards
    function initializeCardEffects() {
        const cards = document.querySelectorAll('.extension-card, .automation-card, .blueprint');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Initialize card effects
    initializeCardEffects();

    // Add typing effect to hero title
    function initializeTypingEffect() {
        const heroTitle = document.querySelector('.hero__content h1');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.textContent = '';
            heroTitle.style.opacity = '1';
            
            let index = 0;
            const typeSpeed = 100;
            
            function typeChar() {
                if (index < text.length) {
                    heroTitle.textContent += text.charAt(index);
                    index++;
                    setTimeout(typeChar, typeSpeed);
                }
            }
            
            setTimeout(typeChar, 500);
        }
    }

    // Initialize typing effect
    setTimeout(initializeTypingEffect, 1000);

    // Add glow effect to buttons on hover
    function initializeButtonEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.5)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.boxShadow = 'none';
            });
        });
    }

    // Initialize button effects
    initializeButtonEffects();

    // Performance optimization: Intersection Observer for lazy loading
    function initializeIntersectionObserver() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Initialize intersection observer
    initializeIntersectionObserver();

    // Add smooth reveal for stats
    function animateStats() {
        const stats = document.querySelectorAll('.hero__meta div');
        
        stats.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.opacity = '0';
                stat.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    stat.style.transition = 'all 0.6s ease';
                    stat.style.opacity = '1';
                    stat.style.transform = 'translateY(0)';
                }, 100);
            }, index * 200);
        });
    }

    // Initialize stats animation
    setTimeout(animateStats, 2000);

    // Console Easter egg
    console.log('%c🚀 Buraq AI - ISR Platform for Human Rights Defense', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
    console.log('%cBuilt with passion for protecting civilians and promoting accountability.', 'color: #06b6d4; font-size: 14px;');

})();