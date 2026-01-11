// assets/js/main.js - Update this file
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Typed.js with translations
    const initTyped = () => {
        const currentLang = localStorage.getItem('preferred-language') || 'en';
        const typedStrings = [
            window.translations?.[currentLang]?.['typed_1'] || "Software Engineer",
            window.translations?.[currentLang]?.['typed_2'] || "Data Engineer",
            window.translations?.[currentLang]?.['typed_3'] || "Financial Engineer",
            window.translations?.[currentLang]?.['typed_4'] || "AI Researcher"
        ];
        
        if (window.typedInstance) {
            window.typedInstance.destroy();
        }
        
        window.typedInstance = new Typed('.typedText', {
            strings: typedStrings,
            typeSpeed: 70,
            backSpeed: 60,
            loop: true,
            startDelay: 500,
            backDelay: 1500
        });
    };
    
    // Initialize typed on load
    initTyped();
    
    // Update contact form handler for translations
    window.sendMail = function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        const currentLang = localStorage.getItem('preferred-language') || 'en';
        const successMsg = window.translations?.[currentLang]?.['email_success'] || "Thanks! I'll get back to you soon.";
        
        alert(successMsg);
        event.target.reset();
        return false;
    };
});
