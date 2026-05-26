document.addEventListener('DOMContentLoaded', function () {
    var elements = document.querySelectorAll('.each-event, .expertise-card, .project-card');

    if (!('IntersectionObserver' in window)) {
        elements.forEach(function (element) {
            element.classList.add('is-visible');
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                entry.target.classList.remove('non-focus');
            } else if (entry.boundingClientRect.top > 0) {
                entry.target.classList.add('non-focus');
            }
        });
    }, {
        rootMargin: '-8% 0px -12% 0px',
        threshold: 0.2
    });

    elements.forEach(function (element) {
        element.classList.add('non-focus');
        observer.observe(element);
    });
});
