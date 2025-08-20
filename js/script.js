// Smooth scrolling and navigation
document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.getElementById('mainNav');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }

            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Intersection Observer for active nav links
    const sections = document.querySelectorAll('section[id]');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                const correspondingNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                // Remove active class from all nav links
                navLinks.forEach(navLink => navLink.classList.remove('active'));

                // Add active class to current nav link
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.skill-card, .project-card, .education-card, .contact-card');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Initial setup for animation elements
    const animationElements = document.querySelectorAll('.skill-card, .project-card, .education-card, .contact-card');
    animationElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });

    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);

    // Initial check for elements in view
    animateOnScroll();

    // Typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        heroTitle.style.opacity = '1';

        let i = 0;
        const typeWriter = function() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    // Skip HTML tags
                    const tagEnd = text.indexOf('>', i);
                    const tag = text.substring(i, tagEnd + 1);
                    heroTitle.innerHTML += tag;
                    i = tagEnd + 1;
                } else {
                    heroTitle.innerHTML += text.charAt(i);
                    i++;
                }
                setTimeout(typeWriter, 50);
            }
        };

        setTimeout(typeWriter, 1000);
    }

    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-section');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Skill card hover effects
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0deg)';
        });
    });

    // Project card tilt effect
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Add loading animation
    const addLoadingStates = function() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                img.classList.add('shimmer');
                img.addEventListener('load', function() {
                    this.classList.remove('shimmer');
                });
            }
        });
    };

    addLoadingStates();

    // Performance optimization: throttle scroll events
    const throttle = function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Apply throttling to scroll events
    const throttledScrollHandler = throttle(function() {
        animateOnScroll();
    }, 100);

    window.removeEventListener('scroll', animateOnScroll);
    window.addEventListener('scroll', throttledScrollHandler);

    // Contact form functionality (if added later)
    const contactForms = document.querySelectorAll('form');
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Add your form submission logic here
            console.log('Form submitted');

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success mt-3';
            successMessage.textContent = 'Message sent successfully!';

            this.appendChild(successMessage);

            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    });

    // Easter egg: Konami code
    let konamiCode = [];
    const correctCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A

    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        konamiCode = konamiCode.slice(-correctCode.length);

        if (JSON.stringify(konamiCode) === JSON.stringify(correctCode)) {
            // Easter egg activated
            document.body.style.animation = 'rainbow 2s infinite';

            setTimeout(() => {
                document.body.style.animation = '';
            }, 10000);
        }
    });

    // Add rainbow animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});

// Utility functions
const utils = {
    // Debounce function
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    scrollToElement: function(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
};

// Export utils for use in other scripts
window.portfolioUtils = utils;