/* ============================================
   AUTOMATE EFFECT — site.js
   Vanilla JS, no frameworks
   ============================================ */

(function () {
  'use strict';

  /* ---------- NAVBAR SCROLL ---------- */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ---------- MOBILE NAV TOGGLE ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- TABS ---------- */
  var tabsNav = document.getElementById('tabsNav');
  if (tabsNav) {
    var tabBtns = tabsNav.querySelectorAll('.tab-btn');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        // deactivate all
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function (el) {
          el.classList.remove('active');
        });
        // activate selected
        btn.classList.add('active');
        var panel = document.getElementById('tab-' + target);
        if (panel) panel.classList.add('active');
        // scroll to top of content
        window.scrollTo({ top: tabsNav.offsetTop - 70, behavior: 'smooth' });
      });
    });
  }

  /* ---------- TAB TRIGGER (CTA buttons that switch tabs) ---------- */
  document.querySelectorAll('.tab-trigger').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var target = el.getAttribute('data-target');
      var btn = document.querySelector('.tab-btn[data-tab="' + target + '"]');
      if (btn) btn.click();
    });
  });

  /* ---------- FAQ ACCORDION ---------- */
  var faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.querySelectorAll('.faq-question').forEach(function (q) {
      q.addEventListener('click', function () {
        var answer  = q.nextElementSibling;
        var isOpen  = q.getAttribute('aria-expanded') === 'true';
        // close all
        faqList.querySelectorAll('.faq-question').forEach(function (other) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.classList.remove('open');
        });
        // toggle clicked
        if (!isOpen) {
          q.setAttribute('aria-expanded', 'true');
          answer.classList.add('open');
        }
      });
    });
  }

  /* ---------- CONTACT FORM ---------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = document.getElementById('formSuccess');
      var errorEl = document.getElementById('formError');
      var submitBtn = contactForm.querySelector('button[type="submit"]');

      // Hide previous messages
      if (success) success.classList.remove('show');
      if (errorEl) {
        errorEl.classList.remove('show');
        errorEl.textContent = '';
      }

      // Gather form data
      var formData = {
        firstName: contactForm.querySelector('#firstName').value,
        lastName: contactForm.querySelector('#lastName').value,
        email: contactForm.querySelector('#email').value,
        phone: contactForm.querySelector('#phone').value,
        service: contactForm.querySelector('#service').value,
        message: contactForm.querySelector('#message').value,
        website: contactForm.querySelector('#website').value // honeypot
      };

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;

          if (result.ok && result.data.success) {
            if (success) success.classList.add('show');
            contactForm.reset();
            setTimeout(function () {
              if (success) success.classList.remove('show');
            }, 5000);
          } else {
            var errorMsg = result.data.error || 'Something went wrong. Please try again.';
            if (errorEl) {
              errorEl.textContent = errorMsg;
              errorEl.classList.add('show');
            }
          }
        })
        .catch(function () {
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;
          if (errorEl) {
            errorEl.textContent = 'Could not connect to the server. Please try again later.';
            errorEl.classList.add('show');
          }
        });
    });
  }

  /* ---------- SCROLL REVEAL DISABLED ---------- */
  // Scroll animations removed for instant content loading
  // All elements now visible immediately without fade-in effects

  /* ---------- ANIMATED COUNTERS ---------- */
  function animateCounter(el, target, suffix) {
    suffix = suffix || '';
    var duration = 1500;
    var start = 0;
    var startTime = null;
    
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }
    
    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      var progress = Math.min((currentTime - startTime) / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var current = Math.floor(easedProgress * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(animate);
  }

  // Observe stat numbers for counter animation
  var statNums = document.querySelectorAll('.stat-num, .big-num');
  if (statNums.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var text = el.textContent.trim();
          var numMatch = text.match(/^(\d+)/);
          if (numMatch) {
            var num = parseInt(numMatch[1], 10);
            var suffix = text.replace(/^\d+/, '');
            el.textContent = '0' + suffix;
            setTimeout(function () {
              animateCounter(el, num, suffix);
            }, 100);
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- SMOOTH PARALLAX ON HERO GRID ---------- */
  var heroGrid = document.querySelector('.hero-bg-grid');
  if (heroGrid && window.innerWidth > 768) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          heroGrid.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- PHONE MOCKUP TILT ON MOUSE (desktop only) ---------- */
  var phoneMockup = document.querySelector('.phone-mockup');
  if (phoneMockup && window.innerWidth > 1024) {
    var heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
      heroVisual.addEventListener('mousemove', function (e) {
        var rect = heroVisual.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        phoneMockup.style.transform = 'perspective(1000px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
        phoneMockup.style.transition = 'transform 0.1s ease';
      });
      heroVisual.addEventListener('mouseleave', function () {
        phoneMockup.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        phoneMockup.style.transition = 'transform 0.4s ease';
      });
    }
  }

  /* ---------- DASHBOARD CAROUSEL ---------- */
  var carousel = document.getElementById('dashboardCarousel');
  if (carousel) {
    var slides = carousel.querySelectorAll('.carousel-slide');
    var dots = carousel.querySelectorAll('.carousel-dot');
    var labels = carousel.querySelectorAll('.carousel-label-overlay');
    var prevBtn = document.getElementById('carouselPrev');
    var nextBtn = document.getElementById('carouselNext');
    var currentSlide = 0;
    var autoPlayInterval = null;

    function showSlide(index) {
      // Wrap around
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentSlide = index;

      // Update slides
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === currentSlide);
      });

      // Update dots
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentSlide);
      });

      // Update labels
      labels.forEach(function (label, i) {
        label.classList.toggle('active', i === currentSlide);
      });
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    // Button events
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Dot events
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
        showSlide(slideIndex);
      });
    });

    // Label events
    labels.forEach(function (label) {
      label.addEventListener('click', function () {
        var slideIndex = parseInt(label.getAttribute('data-slide'), 10);
        showSlide(slideIndex);
      });
    });

    // Auto-play every 4 seconds
    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // Pause auto-play on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Touch swipe support
    var touchStartX = 0;
    var touchEndX = 0;
    var minSwipeDistance = 50;

    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      }
      startAutoPlay();
    }, { passive: true });

    // Start auto-play
    startAutoPlay();
  }

  /* ---------- SMOOTH SCROLL FOR ANCHOR LINKS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId && targetId.length > 1) {
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var navHeight = 70;
          var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  /* ---------- TYPING EFFECT FOR HERO (optional enhancement) ---------- */
  var heroTitle = document.querySelector('.hero-title .text-orange');
  if (heroTitle && heroTitle.textContent === 'Always On.') {
    var phrases = ['Always On.', 'Fully Automated.', 'Never Missed.', 'Always On.'];
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingSpeed = 100;
    var deletingSpeed = 60;
    var pauseTime = 2000;

    function typePhrase() {
      var currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        heroTitle.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        heroTitle.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      var delay = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentPhrase.length) {
        delay = pauseTime;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 300;
      }

      setTimeout(typePhrase, delay);
    }

    // Start typing effect after a short delay
    setTimeout(typePhrase, 2000);
  }

})();
