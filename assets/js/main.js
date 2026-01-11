// assets/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize Typed.js if translation manager hasn't done it yet
    if (!window.typedInstance) {
        // Get initial language from localStorage or default to English
        const savedLang = localStorage.getItem('preferred-language') || 'en';
        const typedStrings = getTypedStrings(savedLang);
        
        if (typedStrings.length > 0) {
            window.typedInstance = new Typed('.typedText', {
                strings: typedStrings,
                typeSpeed: 70,
                backSpeed: 60,
                loop: true,
                startDelay: 500,
                backDelay: 1500
            });
        }
    }
    
    // Helper function to get typed strings
    function getTypedStrings(lang) {
        // Fallback strings in case translations aren't loaded yet
        const fallbackStrings = [
            "Software Engineer",
            "Data Engineer", 
            "Financial Engineer",
            "AI Researcher"
        ];
        
        // Try to get from translations if available
        if (window.translations && window.translations[lang]) {
            const t = window.translations[lang];
            return [
                t['typed_1'] || fallbackStrings[0],
                t['typed_2'] || fallbackStrings[1],
                t['typed_3'] || fallbackStrings[2],
                t['typed_4'] || fallbackStrings[3]
            ].filter(Boolean);
        }
        
        return fallbackStrings;
    }
    
    // Mobile menu toggle (keep your existing code)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-wrap') && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Smooth scroll & active nav (keep your existing code)
    document.querySelectorAll('nav a').forEach(a => {
        a.addEventListener('click', e => {
            if (a.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
                a.classList.add('active');
                document.querySelector(a.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });
});
