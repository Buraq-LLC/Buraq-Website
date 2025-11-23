// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  
  // Scroll progress indicator
  const scrollProgress = document.querySelector('.scroll-progress span');
  window.addEventListener('scroll', () => {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.width = `${scrollPercentage}%`;
  });
  
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
  
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Initial check
  
  // Hero slides functionality
  const slides = document.querySelectorAll('.device-slide');
  const dots = document.querySelectorAll('.device-frame__dots span');
  const prevBtn = document.querySelector('.device-frame__control[data-prev]');
  const nextBtn = document.querySelector('.device-frame__control[data-next]');
  let currentSlide = 0;
  
  const showSlide = (index) => {
    slides.forEach(slide => slide.classList.remove('is-active'));
    dots.forEach(dot => dot.classList.remove('is-active'));
    
    slides[index].classList.add('is-active');
    dots[index].classList.add('is-active');
    currentSlide = index;
  };
  
  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % slides.length;
    showSlide(newIndex);
  };
  
  const prevSlide = () => {
    const newIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(newIndex);
  };
  
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);
  
  // Auto-advance slides
  setInterval(nextSlide, 5000);
  
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