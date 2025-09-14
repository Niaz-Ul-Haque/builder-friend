/**
 * Plan6ix Buildtrade Inc - Main JavaScript
 * Minimal, accessible interactivity
 */

(function() {
  'use strict';

  // DOM utility functions
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  // Mobile menu toggle
  function initMobileMenu() {
    const menuToggle = $('.header__menu-toggle');
    const nav = $('.header__nav');
    
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isOpen = nav.classList.contains('is-open');
      
      if (isOpen) {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'Open menu');
      } else {
        nav.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.innerHTML = '✕';
        menuToggle.setAttribute('aria-label', 'Close menu');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'Open menu');
        menuToggle.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.header__nav') && !e.target.closest('.header__menu-toggle')) {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  // FAQ accordion
  function initFAQ() {
    const faqButtons = $$('.faq__question');
    
    faqButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        const answer = button.nextElementSibling;
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        
        // Close all other FAQs
        faqButtons.forEach(function(otherButton) {
          if (otherButton !== button) {
            otherButton.setAttribute('aria-expanded', 'false');
            const otherAnswer = otherButton.nextElementSibling;
            if (otherAnswer) {
              otherAnswer.classList.remove('is-open');
            }
          }
        });
        
        // Toggle current FAQ
        if (isOpen) {
          button.setAttribute('aria-expanded', 'false');
          answer.classList.remove('is-open');
        } else {
          button.setAttribute('aria-expanded', 'true');
          answer.classList.add('is-open');
        }
      });

      // Keyboard support
      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });
  }

  // Gallery filters
  function initGalleryFilters() {
    const filters = $$('.gallery__filter');
    const items = $$('.gallery__item');
    
    if (!filters.length || !items.length) return;

    filters.forEach(function(filter) {
      filter.addEventListener('click', function() {
        const filterValue = filter.getAttribute('data-filter');
        
        // Update active state
        filters.forEach(f => f.classList.remove('is-active'));
        filter.classList.add('is-active');
        
        // Filter items
        items.forEach(function(item) {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
        
        // Announce to screen readers
        const visibleCount = Array.from(items).filter(item => 
          item.style.display !== 'none'
        ).length;
        
        announceToScreenReader(`Showing ${visibleCount} items`);
        
        // If lightbox is open, update it to reflect new visible images
        if (document.querySelector('.lightbox.is-open')) {
          // Close lightbox when filter changes for better UX
          const lightbox = document.querySelector('.lightbox');
          lightbox.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Enhanced gallery lightbox
  function initGalleryLightbox() {
    const allGalleryItems = $$('.gallery__image');
    
    if (!allGalleryItems.length) return;

    let currentImageIndex = 0;
    let currentVisibleImages = [];
    
    // Function to get currently visible images
    function getVisibleImages() {
      return Array.from(allGalleryItems).filter(img => {
        const item = img.closest('.gallery__item');
        return !item || item.style.display !== 'none';
      });
    }
    
    // Function to update image data based on visible images
    function updateImageData() {
      const visibleImages = getVisibleImages();
      currentVisibleImages = visibleImages.map(img => ({
        element: img,
        src: img.src,
        alt: img.alt,
        caption: img.getAttribute('data-caption') || img.alt
      }));
      return currentVisibleImages;
    }

    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-labelledby', 'lightbox-title');
    lightbox.innerHTML = `
      <div class="lightbox__overlay">
        <div class="lightbox__container">
          <button class="lightbox__close" aria-label="Close lightbox" title="Close (Esc)">&times;</button>
          <div class="lightbox__counter" aria-live="polite"></div>
          <button class="lightbox__navigation lightbox__prev" aria-label="Previous image" title="Previous (←)">‹</button>
          <button class="lightbox__navigation lightbox__next" aria-label="Next image" title="Next (→)">›</button>
          <img class="lightbox__image" src="" alt="" id="lightbox-title">
          <div class="lightbox__caption"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxCaption = lightbox.querySelector('.lightbox__caption');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const closeButton = lightbox.querySelector('.lightbox__close');
    const prevButton = lightbox.querySelector('.lightbox__prev');
    const nextButton = lightbox.querySelector('.lightbox__next');
    
    // Update lightbox content
    function updateLightbox() {
      const imageData = updateImageData(); // Get current visible images
      const currentImage = imageData[currentImageIndex];
      lightboxImage.src = currentImage.src;
      lightboxImage.alt = currentImage.alt;
      lightboxCaption.textContent = currentImage.caption;
      lightboxCounter.textContent = `${currentImageIndex + 1} of ${imageData.length}`;
      
      // Update navigation button states
      prevButton.disabled = currentImageIndex === 0;
      nextButton.disabled = currentImageIndex === imageData.length - 1;
      
      if (imageData.length <= 1) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
      } else {
        prevButton.style.display = 'flex';
        nextButton.style.display = 'flex';
      }
    }
    
    // Open lightbox
    allGalleryItems.forEach(function(img) {
      img.setAttribute('data-lightbox-ready', 'true');
      img.addEventListener('click', function() {
        const visibleImages = getVisibleImages();
        const clickedIndex = visibleImages.indexOf(img);
        
        if (clickedIndex === -1) return; // Image not visible, don't open lightbox
        
        currentImageIndex = clickedIndex;
        updateLightbox();
        lightbox.classList.add('is-open');
        closeButton.focus();
        document.body.style.overflow = 'hidden';
        
        // Trap focus within lightbox
        trapFocus(lightbox);
      });

      // Keyboard support for gallery items
      img.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          img.click();
        }
      });
    });
    
    // Close lightbox
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      releaseFocus();
    }
    
    // Navigation functions
    function showPrevImage() {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateLightbox();
        const imageData = updateImageData();
        announceToScreenReader(`Image ${currentImageIndex + 1} of ${imageData.length}`);
      }
    }
    
    function showNextImage() {
      const imageData = updateImageData();
      if (currentImageIndex < imageData.length - 1) {
        currentImageIndex++;
        updateLightbox();
        announceToScreenReader(`Image ${currentImageIndex + 1} of ${imageData.length}`);
      }
    }
    
    // Event listeners
    closeButton.addEventListener('click', closeLightbox);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox__overlay')) {
        closeLightbox();
      }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('is-open')) return;
      
      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          showPrevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          showNextImage();
          break;
        case 'Home':
          e.preventDefault();
          currentImageIndex = 0;
          updateLightbox();
          break;
        case 'End':
          e.preventDefault();
          const imageData = updateImageData();
          currentImageIndex = imageData.length - 1;
          updateLightbox();
          break;
      }
    });
    
    // Focus management
    let focusedElementBeforeLightbox;
    
    function trapFocus(element) {
      focusedElementBeforeLightbox = document.activeElement;
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      
      element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              e.preventDefault();
            }
          }
        }
      });
    }
    
    function releaseFocus() {
      if (focusedElementBeforeLightbox) {
        focusedElementBeforeLightbox.focus();
      }
    }
  }

  // Smooth scroll for skip link and anchor links
  function initSmoothScroll() {
    const skipLink = $('.skip-link');
    
    if (skipLink) {
      skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = $(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Smooth scroll for all anchor links
    $$('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = link.getAttribute('href');
        if (href === '#') return;
        
        const target = $(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          
          // Update focus for accessibility
          if (target.getAttribute('tabindex') === '-1') {
            target.focus();
          }
        }
      });
    });
  }

  // Phone number click-to-call formatting
  function initPhoneLinks() {
    const phoneLinks = $$('a[href^="tel:"]');
    
    phoneLinks.forEach(function(link) {
      // Ensure proper tel: format
      let href = link.getAttribute('href');
      if (!href.startsWith('tel:+1')) {
        // Assume North American number and format
        const digits = href.replace(/\D/g, '');
        if (digits.length === 10) {
          link.setAttribute('href', `tel:+1${digits}`);
        }
      }
    });
  }

  // Form enhancement (for contact page iframe fallback)
  function initFormEnhancement() {
    const forms = $$('form');
    
    forms.forEach(function(form) {
      // Add loading state to submit buttons
      form.addEventListener('submit', function() {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.textContent || submitBtn.value;
          submitBtn.textContent = 'Sending...';
          submitBtn.value = 'Sending...';
          
          // Re-enable after 5 seconds as fallback
          setTimeout(function() {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.value = originalText;
          }, 5000);
        }
      });
    });
  }

  // Screen reader announcements
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(function() {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Initialize all functionality when DOM is ready
  function init() {
    initMobileMenu();
    initFAQ();
    initGalleryFilters();
    initGalleryLightbox();
    initSmoothScroll();
    initPhoneLinks();
    initFormEnhancement();
    
    // Set up ARIA attributes for FAQ
    $$('.faq__question').forEach(function(button, index) {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', `faq-answer-${index}`);
      
      const answer = button.nextElementSibling;
      if (answer) {
        answer.setAttribute('id', `faq-answer-${index}`);
        answer.setAttribute('role', 'region');
      }
    });
    
    // Set up mobile menu ARIA
    const menuToggle = $('.header__menu-toggle');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-controls', 'main-nav');
      menuToggle.setAttribute('aria-label', 'Open menu');
      
      const nav = $('.header__nav');
      if (nav) {
        nav.setAttribute('id', 'main-nav');
      }
    }

    // Make gallery images keyboard focusable
    $$('.gallery__image').forEach(function(img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `View larger image: ${img.alt}`);
      img.style.cursor = 'pointer';
    });

    console.log('Plan6ix Buildtrade Inc website initialized');
    
    // Double-check gallery initialization after a brief delay
    setTimeout(function() {
      const galleryImages = $$('.gallery__image');
      if (galleryImages.length > 0 && !galleryImages[0].hasAttribute('data-lightbox-ready')) {
        initGalleryLightbox();
      }
    }, 100);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also try initializing after a small delay to ensure all elements are loaded
  window.addEventListener('load', function() {
    initGalleryLightbox();
  });

  // Error handling
  window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error to analytics here
  });

})();