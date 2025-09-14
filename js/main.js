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
    console.log('=== Starting lightbox initialization ===');
    
    // Don't remove existing lightbox if it exists and is working
    let lightbox = document.querySelector('.lightbox');
    const isReinit = !!lightbox;
    
    if (isReinit) {
      console.log('Lightbox already exists, updating existing one');
    } else {
      console.log('Creating new lightbox');
    }
    
    const allGalleryItems = $$('.gallery__image');
    
    if (!allGalleryItems.length) {
      console.log('No gallery images found for lightbox initialization');
      return;
    }

    console.log(`Initializing lightbox for ${allGalleryItems.length} images`);

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
    
    // Set up global event delegation for gallery images (backup method) - only once
    if (!globalClickHandlerAdded) {
      setupGlobalImageClickHandler();
    }

    // Create lightbox elements if it doesn't exist
    if (!lightbox) {
      lightbox = document.createElement('div');
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
      console.log('Created new lightbox element');
    } else {
      console.log('Using existing lightbox element');
    }
    
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
    
    // Open lightbox - Only add event listeners to uninitialized images
    const galleryImages = $$('.gallery__image');
    const uninitializedImages = Array.from(galleryImages).filter(img => 
      !img.hasAttribute('data-lightbox-initialized')
    );
    
    console.log(`Found ${uninitializedImages.length} uninitialized images out of ${galleryImages.length} total`);
    
    if (uninitializedImages.length === 0 && !isReinit) {
      console.log('All images already initialized, skipping individual listeners');
    } else {
        uninitializedImages.forEach(function(img, index) {
        // Mark as initialized to prevent duplicate listeners
        img.setAttribute('data-lightbox-initialized', 'true');
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `View larger image: ${img.alt}`);
        img.style.cursor = 'pointer';
        
        // Ensure the image is not being blocked by other elements
        img.style.position = 'relative';
        img.style.zIndex = '1';
        img.style.pointerEvents = 'auto';
        
        console.log(`Adding click listener to uninitialized image ${index + 1}:`, img.src);        // Add click event listener with enhanced error handling
        function handleImageClick(e) {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Image clicked via individual handler (desktop/mobile):', img.src);
          console.log('Event type:', e.type, 'Is touch event:', e.type === 'touchend');
          
          try {
            const visibleImages = getVisibleImages();
            const clickedIndex = visibleImages.indexOf(img);
            
            if (clickedIndex === -1) {
              console.log('Image not visible, not opening lightbox');
              return;
            }
            
            console.log(`Opening lightbox for image ${clickedIndex + 1} of ${visibleImages.length}`);
            
            currentImageIndex = clickedIndex;
            updateLightbox();
            lightbox.classList.add('is-open');
            closeButton.focus();
            document.body.style.overflow = 'hidden';
            
            // Trap focus within lightbox
            trapFocus(lightbox);
          } catch (error) {
            console.error('Error opening lightbox:', error);
          }
        }
        
        // Add click event listener (primary for desktop)
        img.addEventListener('click', handleImageClick);
        
        // Add touchend event listener (for mobile devices)
        img.addEventListener('touchend', function(e) {
          // Prevent the click event from firing after touchend on mobile
          e.preventDefault();
          console.log('Touch event detected, handling via touchend');
          handleImageClick(e);
        });
        
        // Add mousedown event as additional fallback for desktop
        img.addEventListener('mousedown', function(e) {
          // Only handle left mouse button
          if (e.button === 0) {
            console.log('Mouse down event detected (desktop fallback)');
            // Store that we're handling this via mousedown
            img.setAttribute('data-mousedown-handled', 'true');
            setTimeout(() => img.removeAttribute('data-mousedown-handled'), 100);
          }
        });

        // Keyboard support for gallery items
        img.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Image activated via keyboard:', img.src);
            handleImageClick(e);
          }
        });
      });
    }
    
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
    
    // Set up lightbox event listeners (only if not already set up)
    if (!lightbox.hasAttribute('data-listeners-initialized')) {
      console.log('Setting up lightbox event listeners');
      
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
      
      lightbox.setAttribute('data-listeners-initialized', 'true');
      console.log('Lightbox event listeners initialized');
    } else {
      console.log('Lightbox event listeners already initialized');
    }
    
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
    console.log('Initializing Plan6ix website functionality...');
    
    initMobileMenu();
    initFAQ();
    initGalleryFilters();
    initSmoothScroll();
    initPhoneLinks();
    initFormEnhancement();
    
    // Initialize lightbox with retries for better reliability
    initGalleryLightboxWithRetry();
    
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

    console.log('Plan6ix Buildtrade Inc website initialized');
  }
  
  // Enhanced gallery lightbox initialization with retry mechanism
  function initGalleryLightboxWithRetry() {
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 200;
    
    function tryInit() {
      attempts++;
      console.log(`Lightbox initialization attempt ${attempts}/${maxAttempts}`);
      
      const galleryImages = $$('.gallery__image');
      
      if (galleryImages.length > 0) {
        console.log(`Found ${galleryImages.length} gallery images, initializing lightbox`);
        initGalleryLightbox();
        
        // Also set up a mutation observer to handle dynamically added images
        setupImageMutationObserver();
        return true;
      } else if (attempts < maxAttempts) {
        console.log(`No gallery images found yet, retrying in ${retryDelay}ms...`);
        setTimeout(tryInit, retryDelay);
        return false;
      } else {
        console.log('Max lightbox initialization attempts reached, no gallery images found');
        return false;
      }
    }
    
    tryInit();
  }
  
  // Set up mutation observer to handle dynamically added images
  function setupImageMutationObserver() {
    if (typeof MutationObserver === 'undefined') return;
    
    const observer = new MutationObserver(function(mutations) {
      let newImagesAdded = false;
      
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            const newImages = node.querySelectorAll ? node.querySelectorAll('.gallery__image') : [];
            if (newImages.length > 0) {
              newImagesAdded = true;
            }
          }
        });
      });
      
      if (newImagesAdded) {
        console.log('New gallery images detected, reinitializing lightbox...');
        setTimeout(function() {
          initGalleryLightbox();
        }, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Global click handler using event delegation
  let globalClickHandlerAdded = false;
  function setupGlobalImageClickHandler() {
    if (globalClickHandlerAdded) {
      console.log('Global click handler already added, skipping');
      return;
    }
    globalClickHandlerAdded = true;
    
    console.log('Setting up global gallery image click handler');
    
    document.addEventListener('click', function(e) {
      // Check if clicked element is a gallery image
      if (e.target.classList && e.target.classList.contains('gallery__image')) {
        console.log('Gallery image clicked via global handler (desktop/mobile):', e.target.src);
        console.log('Event details:', {
          type: e.type,
          button: e.button,
          pointerType: e.pointerType,
          isTrusted: e.isTrusted,
          target: e.target.tagName
        });
        
        // Check if the image already has individual handlers
        if (e.target.hasAttribute('data-lightbox-initialized')) {
          console.log('Image has individual handlers, but they may not be working - proceeding with global handler');
          // Don't return early - let global handler take over as backup
        }
        
        // Prevent default and stop propagation
        e.preventDefault();
        e.stopPropagation();
        
        // Find the lightbox
        const lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
          console.log('Lightbox not found, cannot open');
          return;
        }
        
        // Get all gallery images and find the clicked one
        const allImages = Array.from(document.querySelectorAll('.gallery__image'));
        const visibleImages = allImages.filter(img => {
          const item = img.closest('.gallery__item');
          return !item || item.style.display !== 'none';
        });
        
        const clickedIndex = visibleImages.indexOf(e.target);
        if (clickedIndex === -1) {
          console.log('Clicked image not found in visible images');
          return;
        }
        
        console.log(`Opening lightbox via global handler for image ${clickedIndex + 1} of ${visibleImages.length}`);
        
        // Update lightbox content
        const lightboxImage = lightbox.querySelector('.lightbox__image');
        const lightboxCaption = lightbox.querySelector('.lightbox__caption');
        const lightboxCounter = lightbox.querySelector('.lightbox__counter');
        
        if (lightboxImage && lightboxCaption && lightboxCounter) {
          lightboxImage.src = e.target.src;
          lightboxImage.alt = e.target.alt;
          lightboxCaption.textContent = e.target.getAttribute('data-caption') || e.target.alt;
          lightboxCounter.textContent = `${clickedIndex + 1} of ${visibleImages.length}`;
          
          // Show lightbox
          lightbox.classList.add('is-open');
          document.body.style.overflow = 'hidden';
          
          // Focus close button
          const closeButton = lightbox.querySelector('.lightbox__close');
          if (closeButton) {
            closeButton.focus();
          }
          
          console.log('Lightbox opened successfully via global handler');
        } else {
          console.error('Missing lightbox elements:', {
            image: !!lightboxImage,
            caption: !!lightboxCaption,
            counter: !!lightboxCounter
          });
        }
      }
    });
    
    // Expose the flag globally for debugging
    window.globalClickHandlerAdded = globalClickHandlerAdded;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also initialize lightbox on window load as a fallback for late-loading images
  window.addEventListener('load', function() {
    console.log('Window loaded, performing final lightbox check...');
    setTimeout(function() {
      const galleryImages = $$('.gallery__image');
      if (galleryImages.length > 0) {
        const uninitializedImages = Array.from(galleryImages).filter(img => 
          !img.hasAttribute('data-lightbox-initialized')
        );
        if (uninitializedImages.length > 0) {
          console.log(`Found ${uninitializedImages.length} uninitialized images, re-initializing lightbox`);
          initGalleryLightbox();
        } else {
          console.log('All gallery images already initialized');
        }
      }
    }, 100);
  });
  
  // Also listen for image load events specifically
  document.addEventListener('load', function(e) {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('gallery__image')) {
      console.log('Gallery image loaded:', e.target.src);
      if (!e.target.hasAttribute('data-lightbox-initialized')) {
        console.log('Newly loaded image needs lightbox initialization');
        setTimeout(function() {
          initGalleryLightbox();
        }, 50);
      }
    }
  }, true); // Use capture phase to catch all image load events

  // Error handling
  window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error to analytics here
  });

  // Expose functions for debugging
  window.initGalleryLightbox = initGalleryLightbox;
  window.initGalleryLightboxWithRetry = initGalleryLightboxWithRetry;
  window.globalClickHandlerAdded = globalClickHandlerAdded;
  
  // Force re-initialization function for testing
  window.forceReinitLightbox = function() {
    console.log('=== Forcing complete lightbox re-initialization ===');
    
    // Remove all initialization markers
    const allImages = document.querySelectorAll('.gallery__image');
    allImages.forEach(img => {
      img.removeAttribute('data-lightbox-initialized');
    });
    
    // Remove existing lightbox
    const existingLightbox = document.querySelector('.lightbox');
    if (existingLightbox) {
      existingLightbox.remove();
    }
    
    // Reset global handler flag
    globalClickHandlerAdded = false;
    window.globalClickHandlerAdded = false;
    
    // Re-initialize
    setTimeout(function() {
      initGalleryLightbox();
    }, 100);
  };

})();