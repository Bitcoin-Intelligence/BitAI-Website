
// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Video autoplay on hover (desktop only)
const videoWrappers = document.querySelectorAll('.video-wrapper');

videoWrappers.forEach(wrapper => {
    const iframe = wrapper.querySelector('iframe');
    const overlay = wrapper.querySelector('.play-overlay');
    const originalSrc = iframe.src;
    
    // Check if device supports hover (desktop)
    const isDesktop = window.matchMedia('(hover: hover)').matches;
    
    if (isDesktop) {
        wrapper.addEventListener('mouseenter', () => {
            // Add autoplay parameter to YouTube URL
            const autoplaySrc = originalSrc.includes('?') 
                ? originalSrc + '&autoplay=1' 
                : originalSrc + '?autoplay=1';
            
            iframe.src = autoplaySrc;
            overlay.style.opacity = '0';
        });
        
        wrapper.addEventListener('mouseleave', () => {
            // Reset to original URL to stop autoplay
            iframe.src = originalSrc;
            overlay.style.opacity = '1';
        });
    } else {
        // Mobile: show overlay on tap
        overlay.addEventListener('click', () => {
            const autoplaySrc = originalSrc.includes('?') 
                ? originalSrc + '&autoplay=1' 
                : originalSrc + '?autoplay=1';
            
            iframe.src = autoplaySrc;
            overlay.style.opacity = '0';
        });
    }
});

// Form submission handling
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Simulate form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
    this.reset();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe video items for scroll animations
document.querySelectorAll('.video-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
});

// Accessibility: Pause videos when they lose focus
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        videoWrappers.forEach(wrapper => {
            const iframe = wrapper.querySelector('iframe');
            const originalSrc = iframe.src.split('?')[0];
            iframe.src = originalSrc;
        });
    }
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Add keyboard navigation styles
const style = document.createElement('style');
style.textContent = `
    .keyboard-navigation *:focus {
        outline: 2px solid #667eea !important;
        outline-offset: 2px !important;
    }
`;
document.head.appendChild(style);