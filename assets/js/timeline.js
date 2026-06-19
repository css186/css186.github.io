document.addEventListener('DOMContentLoaded', function () {
    var revealElements = Array.prototype.slice.call(
        document.querySelectorAll('.section-heading, .expertise-card, .project-card, .each-year, .each-event')
    );
    var interactiveElements = Array.prototype.slice.call(
        document.querySelectorAll('.button, .social-icons a, .expertise-card, .project-card, .portfolio-theme-toggle')
    );

    function makeVisible() {
        revealElements.forEach(function (element) {
            element.classList.add('is-visible');
            element.classList.remove('non-focus');
        });
    }

    function fallbackReveal() {
        if (!('IntersectionObserver' in window)) {
            makeVisible();
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.classList.remove('non-focus');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '-8% 0px -12% 0px',
            threshold: 0.18
        });

        revealElements.forEach(function (element) {
            element.classList.add('non-focus');
            observer.observe(element);
        });
    }

    if (!window.gsap) {
        fallbackReveal();
        return;
    }

    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    gsap.defaults({
        duration: 0.72,
        ease: 'power3.out',
        overwrite: 'auto'
    });

    mm.add({
        reduceMotion: '(prefers-reduced-motion: reduce)',
        isDesktop: '(min-width: 901px)'
    }, function (context) {
        var isReduced = context.conditions.reduceMotion;
        var isDesktop = context.conditions.isDesktop;
        var cleanupHandlers = [];

        function addListener(element, eventName, handler) {
            element.addEventListener(eventName, handler);
            cleanupHandlers.push(function () {
                element.removeEventListener(eventName, handler);
            });
        }

        if (isReduced) {
            makeVisible();
            return;
        }

        document.documentElement.classList.add('gsap-ready');

        gsap.set(revealElements, { autoAlpha: 0, y: 24 });
        gsap.set('.each-year:nth-child(odd) .each-event', { x: 28 });
        gsap.set('.each-year:nth-child(even) .each-event', { x: -28 });

        gsap.timeline()
            .from('.navigation', {
                autoAlpha: 0,
                y: -16,
                duration: 0.5,
                ease: 'power2.out'
            })
            .from('.hero-intro, .hero-section h1, .hero-subtitle, .hero-actions, .social-icons', {
                autoAlpha: 0,
                y: 24,
                stagger: 0.08
            }, '-=0.2')
            .from('.hero-card', {
                autoAlpha: 0,
                x: isDesktop ? 44 : 0,
                y: isDesktop ? 0 : 24,
                scale: 0.96
            }, '-=0.45')
            .from('.hero-avatar', {
                scale: 1.08,
                duration: 1.1,
                ease: 'power2.out'
            }, '<');

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var target = entry.target;

                    if (!entry.isIntersecting) {
                        return;
                    }

                    gsap.to(target, {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        duration: target.classList.contains('each-event') ? 0.82 : 0.68,
                        ease: 'power3.out',
                        onComplete: function () {
                            target.classList.add('is-visible');
                            target.classList.remove('non-focus');
                        }
                    });

                    if (target.classList.contains('expertise-card')) {
                        gsap.fromTo(target.querySelectorAll('i, h3, p, .skill-list span'), {
                            autoAlpha: 0,
                            y: 14
                        }, {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.48,
                            stagger: 0.045,
                            ease: 'power2.out'
                        });
                    }

                    observer.unobserve(target);
                });
            }, {
                rootMargin: '-8% 0px -10% 0px',
                threshold: 0.16
            });

            revealElements.forEach(function (element) {
                element.classList.add('non-focus');
                observer.observe(element);
            });
        } else {
            gsap.to(revealElements, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                stagger: 0.06,
                onComplete: makeVisible
            });
        }

        interactiveElements.forEach(function (element) {
            addListener(element, 'mouseenter', function () {
                gsap.to(element, {
                    y: -6,
                    scale: 1.015,
                    duration: 0.28,
                    ease: 'power2.out'
                });
            });

            addListener(element, 'mouseleave', function () {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    duration: 0.36,
                    ease: 'power2.out'
                });
            });
        });

        document.querySelectorAll('.expertise-card i').forEach(function (icon) {
            addListener(icon.parentElement, 'mouseenter', function () {
                gsap.to(icon, {
                    rotation: 6,
                    scale: 1.08,
                    duration: 0.32,
                    ease: 'back.out(1.7)'
                });
            });

            addListener(icon.parentElement, 'mouseleave', function () {
                gsap.to(icon, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.28,
                    ease: 'power2.out'
                });
            });
        });

        var themeToggle = document.querySelector('.portfolio-theme-toggle');
        if (themeToggle) {
            addListener(themeToggle, 'click', function () {
                gsap.fromTo(themeToggle, {
                    rotation: -12,
                    scale: 0.92
                }, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.42,
                    ease: 'back.out(2)'
                });
            });
        }

        if (isDesktop) {
            var hero = document.querySelector('.hero-section');
            var heroCard = document.querySelector('.hero-card');
            var avatar = document.querySelector('.hero-avatar');

            if (hero && heroCard && avatar) {
                var cardX = gsap.quickTo(heroCard, 'x', { duration: 0.45, ease: 'power3.out' });
                var cardY = gsap.quickTo(heroCard, 'y', { duration: 0.45, ease: 'power3.out' });
                var avatarScale = gsap.quickTo(avatar, 'scale', { duration: 0.45, ease: 'power3.out' });

                addListener(hero, 'pointermove', function (event) {
                    var bounds = hero.getBoundingClientRect();
                    var relX = (event.clientX - bounds.left) / bounds.width - 0.5;
                    var relY = (event.clientY - bounds.top) / bounds.height - 0.5;

                    cardX(relX * 18);
                    cardY(relY * 14);
                    avatarScale(1.025);
                });

                addListener(hero, 'pointerleave', function () {
                    cardX(0);
                    cardY(0);
                    avatarScale(1);
                });
            }
        }

        return function () {
            cleanupHandlers.forEach(function (cleanup) {
                cleanup();
            });
            document.documentElement.classList.remove('gsap-ready');
        };
    });
});
