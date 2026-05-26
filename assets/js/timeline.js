document.addEventListener('DOMContentLoaded', function() {
    var elements = document.querySelectorAll('.each-event, .title');
    
    function checkForFade() {
        var windowHeight = window.innerHeight;
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        elements.forEach(function(element) {
            var rect = element.getBoundingClientRect();
            var elementTop = rect.top + scrollTop;
            var elementHeight = element.offsetHeight;
            
            // Calculate space from bottom of window
            // The original logic: space = window_height - (element_height + element_offset - scrollTop);
            // This simplifes to: space = window_height - rect.bottom (relative to viewport) roughly?
            
            // Let's implement robust "is in viewport center" logic
            // Or stick to the original logic ported to vanilla JS
            
            // Original: space = window_height - (element_height + element_offset - scrollTop)
            // rect.top is (element_offset - scrollTop)
            // So: space = windowHeight - (elementHeight + rect.top)
            
            var space = windowHeight - (elementHeight + rect.top);
            
            // If space < 60, add non-focus. 
            // This means if the element is too low (near the bottom or below), it fades out?
            // Actually the original logic might be fading out items as they scroll UP out of view?
            // "space" calculation seems to measure distance from bottom of viewport to bottom of element.
            
            // Let's tweak for better UX: 
            // 1. Fade out if too close to top
            // 2. Fade out if too close to bottom
            
            var centerPosition = rect.top + (elementHeight / 2);
            var distanceFromCenter = Math.abs((windowHeight / 2) - centerPosition);
            
            // If element is far from center, fade it
            // Adjust threshold as needed
            if (distanceFromCenter > (windowHeight * 0.4)) {
               element.classList.add('non-focus'); 
            } else {
               element.classList.remove('non-focus');
            }
        });
    }
    
    window.addEventListener('scroll', checkForFade);
    window.addEventListener('resize', checkForFade);
    
    // Trigger once on load
    checkForFade();
});
