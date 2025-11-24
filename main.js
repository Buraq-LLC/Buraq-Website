// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded');
  
  // Hero animation functionality
  const heroContent = document.querySelector('.hero__content');
  const introAnimation = document.querySelector('.hero__intro-animation');
  const siteNav = document.querySelector('.site-nav');
  
  // Debug: Check if elements are found
  console.log('Hero content element:', heroContent);
  console.log('Intro animation element:', introAnimation);
  console.log('Nav element:', siteNav);
  

  // Show the navigation immediately on load
  if (siteNav) {
    siteNav.classList.add('visible');
    console.log('Navigation visible (immediate)');
  }

  // Make the video play once
  if (introAnimation) {
    introAnimation.loop = false;
    introAnimation.removeAttribute('loop');
    // Fade in the animation when it starts
    setTimeout(() => {
      introAnimation.classList.add('loaded');
      console.log('Animation loaded and visible');
    }, 100);
  }
  
  // After 5.5 seconds, fade out animation
  setTimeout(() => {
    console.log('5.5 seconds passed, fading out animation');
    // Fade out the animation
    if (introAnimation) {
      introAnimation.classList.add('fade-out');
      console.log('Animation fading out');
    }
    // (Navigation is now shown immediately on load)
    // After the fade-out transition (1.5s), show the hero content
    setTimeout(() => {
      if (heroContent) {
        heroContent.classList.add('visible');
        console.log('Hero content visible');
      }
    }, 1500); // match CSS transition duration for fade-out
  }, 5500); // 5.5 seconds
  
  // Set current year in footer
  const yearElement = document.querySelector('[data-year]');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  // Enhanced scroll progress indicator with debugging
  const scrollProgress = document.querySelector('.scroll-progress');
  const scrollProgressSpan = document.querySelector('.scroll-progress span');
  
  console.log('Scroll progress element:', scrollProgress);
  console.log('Scroll progress span element:', scrollProgressSpan);
  
  if (!scrollProgress || !scrollProgressSpan) {
    console.error('Scroll progress elements not found!');
    return;
  }
  
  // Set initial state to make it visible
  scrollProgressSpan.style.width = '0%';
  scrollProgress.style.display = 'block';
  scrollProgress.style.visibility = 'visible';
  
  // Scroll event listener with immediate update
  const updateScrollProgress = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    // Ensure the progress bar is visible and update width
    scrollProgress.style.display = 'block';
    scrollProgress.style.visibility = 'visible';
    scrollProgressSpan.style.width = `${Math.max(0, Math.min(100, scrollPercentage))}%`;
    
    // Debug log
    if (Math.random() < 0.01) { // Only log occasionally to avoid spam
      console.log('Scroll percentage:', scrollPercentage.toFixed(2) + '%');
    }
  };
  
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  
  // Initial check
  updateScrollProgress();
  
  // Reveal animation on scroll
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealOnScroll = () => {
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll(); // Initial check
  
  // Command palette functionality
  const commandItems = document.querySelectorAll('.command-palette__item');
  const previewImg = document.querySelector('.spotlight__preview img');
  
  commandItems.forEach(item => {
    item.addEventListener('click', () => {
      commandItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      
      // In a real implementation, this would change the preview image
      // For demo purposes, we'll just log the action
      console.log('Selected command:', item.querySelector('strong').textContent);
    });
  });
  
  // Mobile menu toggle
  const navToggle = document.querySelector('.site-nav__toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    mobileMenu.setAttribute('aria-hidden', expanded);
  });
  
  // Form submission
  const contactForm = document.getElementById('inqForm');
  const formMsg = document.getElementById('formMsg');
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // In a real implementation, this would submit the form data to a server
    // For demo purposes, we'll just show a success message
    formMsg.textContent = 'Thank you for your inquiry. We will be in touch shortly.';
    formMsg.style.color = '#10b981';
    contactForm.reset();
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Account for fixed header
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navToggle.getAttribute('aria-expanded') === 'true') {
          navToggle.setAttribute('aria-expanded', false);
          mobileMenu.setAttribute('aria-hidden', true);
        }
      }
    });
  });
});