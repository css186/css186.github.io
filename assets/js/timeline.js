document.addEventListener('DOMContentLoaded', function () {
    var revealSelector = [
        '.section-heading',
        '.expertise-card',
        '.project-card',
        '.each-event',
        '.content article > h1',
        '.content article > h2',
        '.content article > h3',
        '.content article > h4',
        '.content article > p',
        '.content article > ul',
        '.content article > ol',
        '.content article > hr',
        '.content .container.page > h1',
        '.content .container.page > h2',
        '.content .container.page > p',
        '.content .container.page > ul',
        '.content .container.page > ol'
    ].join(', ');

    var revealElements = Array.prototype.slice.call(document.querySelectorAll(revealSelector));
    var cardElements = Array.prototype.slice.call(
        document.querySelectorAll('.expertise-card, .project-card, .portfolio-entry-link')
    );
    var buttonElements = Array.prototype.slice.call(
        document.querySelectorAll('.button, .social-icons a, .portfolio-theme-toggle')
    );

    function makeVisible(elements) {
        elements.forEach(function (element) {
            element.classList.add('is-visible');
            element.classList.remove('non-focus');
        });
    }

    function createProgressBar() {
        var progress = document.querySelector('.page-progress');

        if (!progress) {
            progress = document.createElement('div');
            progress.className = 'page-progress';
            progress.setAttribute('aria-hidden', 'true');
            document.body.appendChild(progress);
        }

        return progress;
    }

    function shouldShowProgress(link, event) {
        var url;

        if (!link || event.defaultPrevented || event.button !== 0) {
            return false;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return false;
        }
        if (link.target && link.target !== '_self') {
            return false;
        }
        if (link.hasAttribute('download') || link.dataset.noTransition === 'true') {
            return false;
        }

        try {
            url = new URL(link.href, window.location.href);
        } catch (error) {
            return false;
        }

        if (url.origin !== window.location.origin) {
            return false;
        }
        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
            return false;
        }

        return true;
    }

    function fallbackReveal() {
        if (!('IntersectionObserver' in window)) {
            makeVisible(revealElements);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                entry.target.classList.remove('non-focus');
                observer.unobserve(entry.target);
            });
        }, {
            rootMargin: '-8% 0px -12% 0px',
            threshold: 0.16
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
    var ScrollTrigger = window.ScrollTrigger;
    var ScrambleTextPlugin = window.ScrambleTextPlugin;
    var progressBar = createProgressBar();
    var mm = gsap.matchMedia();

    if (ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }
    if (ScrambleTextPlugin) {
        gsap.registerPlugin(ScrambleTextPlugin);
    }

    gsap.defaults({
        duration: 0.62,
        ease: 'power3.out',
        overwrite: 'auto'
    });

    function setProgress(value, options) {
        gsap.killTweensOf(progressBar);
        gsap.to(progressBar, Object.assign({
            autoAlpha: 1,
            scaleX: value,
            duration: 0.32,
            ease: 'power2.out'
        }, options || {}));
    }

    function finishProgress() {
        gsap.killTweensOf(progressBar);
        gsap.timeline()
            .to(progressBar, {
                autoAlpha: 1,
                scaleX: 1,
                duration: 0.24,
                ease: 'power2.out'
            })
            .to(progressBar, {
                autoAlpha: 0,
                duration: 0.18,
                ease: 'power1.out'
            })
            .set(progressBar, { scaleX: 0 });
    }

    function initProgressBar(addListener) {
        gsap.set(progressBar, {
            autoAlpha: 0,
            scaleX: 0,
            transformOrigin: 'left center'
        });

        setProgress(0.72, { duration: 0.38 });
        addListener(window, 'load', finishProgress);

        addListener(document, 'click', function (event) {
            var target = event.target && event.target.nodeType === 1 ? event.target : event.target.parentElement;
            var link = target && target.closest ? target.closest('a[href]') : null;

            if (shouldShowProgress(link, event)) {
                setProgress(0.82, { duration: 0.26 });
            }
        });

        addListener(window, 'pageshow', function () {
            gsap.set(progressBar, { autoAlpha: 0, scaleX: 0 });
        });
    }

    function initElasticNavigation(addListener, isDesktop) {
        var navList = document.querySelector('.navigation-list');
        var links = navList ? Array.prototype.slice.call(navList.querySelectorAll('.navigation-link')) : [];
        var activeLink = null;
        var indicator;

        if (!navList || !links.length) {
            return;
        }

        function normalizePath(pathname) {
            return pathname.replace(/\/+$/, '') || '/';
        }

        function findActiveLink() {
            var currentPath = normalizePath(window.location.pathname);
            var exactMatch = null;
            var sectionMatch = null;

            links.forEach(function (link) {
                var url;
                var linkPath;

                try {
                    url = new URL(link.href, window.location.href);
                } catch (error) {
                    return;
                }

                linkPath = normalizePath(url.pathname);

                if (currentPath === linkPath) {
                    exactMatch = link;
                } else if (linkPath !== '/' && currentPath.indexOf(linkPath + '/') === 0) {
                    sectionMatch = link;
                }
            });

            return exactMatch || sectionMatch;
        }

        activeLink = findActiveLink();
        if (activeLink) {
            activeLink.classList.add('is-active');
        }

        if (!isDesktop) {
            return;
        }

        indicator = navList.querySelector('.nav-elastic-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'nav-elastic-indicator';
            indicator.setAttribute('aria-hidden', 'true');
            navList.appendChild(indicator);
        }

        function moveIndicator(target, isHover) {
            var listRect;
            var targetRect;

            if (!target) {
                gsap.to(indicator, {
                    autoAlpha: 0,
                    duration: 0.18
                });
                return;
            }

            listRect = navList.getBoundingClientRect();
            targetRect = target.getBoundingClientRect();
            indicator.classList.toggle('is-hover', !!isHover);

            gsap.to(indicator, {
                autoAlpha: 1,
                x: targetRect.left - listRect.left,
                y: targetRect.top - listRect.top,
                width: targetRect.width,
                height: targetRect.height,
                duration: isHover ? 0.5 : 0.62,
                ease: 'elastic.out(0.72, 0.58)'
            });
        }

        window.requestAnimationFrame(function () {
            moveIndicator(activeLink, false);
        });

        links.forEach(function (link) {
            addListener(link, 'mouseenter', function () {
                moveIndicator(link, link !== activeLink);
            });

            addListener(link, 'focus', function () {
                moveIndicator(link, link !== activeLink);
            });
        });

        addListener(navList, 'mouseleave', function () {
            moveIndicator(activeLink, false);
        });

        addListener(navList, 'focusout', function () {
            window.setTimeout(function () {
                if (!navList.contains(document.activeElement)) {
                    moveIndicator(activeLink, false);
                }
            }, 0);
        });

        addListener(window, 'resize', function () {
            moveIndicator(activeLink, false);
        });
    }

    function initMobileMenu(addListener, isReduced, isDesktop) {
        var nav = document.querySelector('.navigation');
        var checkbox = document.getElementById('menu-toggle');
        var trigger = document.querySelector('.menu-button');
        var list = document.querySelector('.navigation-list');
        var links = list ? Array.prototype.slice.call(list.querySelectorAll('.navigation-link')) : [];
        var fallbackIcon;
        var bars;
        var barTop;
        var barMid;
        var barBot;
        var tl = null;
        var isOpen = false;
        var svgNamespace = 'http://www.w3.org/2000/svg';
        var closedLines = {
            top: { x1: 5, y1: 7, x2: 19, y2: 7 },
            mid: { x1: 5, y1: 12, x2: 19, y2: 12 },
            bot: { x1: 5, y1: 17, x2: 19, y2: 17 }
        };
        var openLines = {
            top: { x1: 6, y1: 6, x2: 18, y2: 18 },
            mid: { x1: 12, y1: 12, x2: 12, y2: 12 },
            bot: { x1: 18, y1: 6, x2: 6, y2: 18 }
        };

        if (isDesktop || !nav || !checkbox || !trigger || !list || !links.length) {
            return null;
        }

        fallbackIcon = trigger.querySelector('i');
        bars = trigger.querySelector('.menu-button-bars');

        function createLine(className, points) {
            var line = document.createElementNS(svgNamespace, 'line');

            line.setAttribute('class', 'menu-button-bar ' + className);
            Object.keys(points).forEach(function (key) {
                line.setAttribute(key, points[key]);
            });

            return line;
        }

        if (!bars || bars.tagName.toLowerCase() !== 'svg') {
            if (bars && bars.parentElement) {
                bars.parentElement.removeChild(bars);
            }

            bars = document.createElementNS(svgNamespace, 'svg');
            bars.setAttribute('class', 'menu-button-bars');
            bars.setAttribute('viewBox', '0 0 24 24');
            bars.setAttribute('focusable', 'false');
            bars.setAttribute('aria-hidden', 'true');
            bars.appendChild(createLine('menu-button-bar--top', closedLines.top));
            bars.appendChild(createLine('menu-button-bar--mid', closedLines.mid));
            bars.appendChild(createLine('menu-button-bar--bot', closedLines.bot));
            trigger.appendChild(bars);
        }

        barTop = bars.querySelector('.menu-button-bar--top');
        barMid = bars.querySelector('.menu-button-bar--mid');
        barBot = bars.querySelector('.menu-button-bar--bot');

        if (fallbackIcon) {
            fallbackIcon.classList.add('menu-button__icon-fallback');
        }

        if (!list.id) {
            list.id = 'portfolio-navigation-menu';
        }

        document.documentElement.classList.add('gsap-menu-ready');
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-controls', list.id);

        function setLinkTabIndex(open) {
            links.forEach(function (link) {
                link.setAttribute('tabindex', open ? '0' : '-1');
            });
        }

        function syncTrigger(open) {
            trigger.setAttribute('aria-expanded', String(open));
            trigger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        }

        function setClosedState() {
            isOpen = false;
            checkbox.checked = false;
            nav.classList.remove('menu-is-open');
            syncTrigger(false);
            setLinkTabIndex(false);
            gsap.set(list, {
                autoAlpha: 0,
                maxHeight: 0,
                y: -8,
                scale: 0.96,
                pointerEvents: 'none',
                visibility: 'hidden'
            });
            gsap.set(links, { autoAlpha: 0, y: -6 });
            gsap.set(barTop, { attr: closedLines.top, autoAlpha: 1 });
            gsap.set(barMid, { attr: closedLines.mid, autoAlpha: 1 });
            gsap.set(barBot, { attr: closedLines.bot, autoAlpha: 1 });
        }

        function buildTimeline() {
            if (tl) {
                tl.kill();
            }

            tl = gsap.timeline({
                paused: true,
                defaults: {
                    overwrite: 'auto'
                }
            });

            tl.set(list, {
                visibility: 'visible',
                pointerEvents: 'auto'
            })
                .to(list, {
                    autoAlpha: 1,
                    maxHeight: list.scrollHeight,
                    y: 0,
                    scale: 1,
                    duration: isReduced ? 0 : 0.34,
                    ease: 'power3.out'
                }, 0)
                .to(barMid, {
                    attr: openLines.mid,
                    autoAlpha: 0,
                    duration: isReduced ? 0 : 0.13,
                    ease: 'power2.in'
                }, 0)
                .to(barTop, {
                    attr: openLines.top,
                    duration: isReduced ? 0 : 0.24,
                    ease: 'power3.inOut'
                }, 0)
                .to(barBot, {
                    attr: openLines.bot,
                    duration: isReduced ? 0 : 0.24,
                    ease: 'power3.inOut'
                }, 0)
                .to(links, {
                    autoAlpha: 1,
                    y: 0,
                    duration: isReduced ? 0 : 0.22,
                    ease: 'power2.out',
                    stagger: isReduced ? 0 : 0.035
                }, isReduced ? 0 : 0.1);

            return tl;
        }

        function openMenu() {
            if (isOpen) {
                return;
            }

            isOpen = true;
            checkbox.checked = true;
            nav.classList.add('menu-is-open');
            syncTrigger(true);
            setLinkTabIndex(true);
            buildTimeline().timeScale(1).play(0);
        }

        function closeMenu() {
            if (!isOpen) {
                return;
            }

            isOpen = false;
            syncTrigger(false);
            setLinkTabIndex(false);

            if (isReduced || !tl) {
                setClosedState();
                return;
            }

            tl.eventCallback('onReverseComplete', function () {
                setClosedState();
            });
            tl.timeScale(1.25).reverse();
        }

        function toggleMenu() {
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        setClosedState();

        addListener(trigger, 'click', function (event) {
            event.preventDefault();
            toggleMenu();
        });

        addListener(trigger, 'keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            toggleMenu();
        });

        addListener(document, 'keydown', function (event) {
            if (event.key === 'Escape' && isOpen) {
                closeMenu();
                trigger.focus();
            }
        });

        addListener(document, 'click', function (event) {
            if (isOpen && !nav.contains(event.target)) {
                closeMenu();
            }
        });

        links.forEach(function (link) {
            addListener(link, 'click', closeMenu);
        });

        addListener(window, 'resize', function () {
            if (isOpen && tl) {
                gsap.set(list, { maxHeight: list.scrollHeight });
            }
        });

        return function () {
            if (tl) {
                tl.kill();
            }

            document.documentElement.classList.remove('gsap-menu-ready');
            nav.classList.remove('menu-is-open');
            checkbox.checked = false;
            trigger.removeAttribute('role');
            trigger.removeAttribute('tabindex');
            trigger.removeAttribute('aria-controls');
            trigger.removeAttribute('aria-expanded');
            trigger.removeAttribute('aria-label');
            links.forEach(function (link) {
                link.removeAttribute('tabindex');
            });
            gsap.set([list].concat(links), { clearProps: 'all' });
            gsap.set(barTop, { attr: closedLines.top, autoAlpha: 1, clearProps: 'all' });
            gsap.set(barMid, { attr: closedLines.mid, autoAlpha: 1, clearProps: 'all' });
            gsap.set(barBot, { attr: closedLines.bot, autoAlpha: 1, clearProps: 'all' });
        };
    }

    function initPageIntro(isDesktop) {
        var heroWords = document.querySelectorAll('.hero-intro, .hero-section h1, .hero-subtitle, .hero-actions, .social-icons');
        var heroCard = document.querySelector('.hero-card');
        var listHero = document.querySelector('.list-hero');
        var entryCards = document.querySelectorAll('.portfolio-entry-card');
        var intro = gsap.timeline({
            defaults: {
                duration: 0.58,
                ease: 'power3.out'
            }
        });

        intro.from('.navigation', {
            autoAlpha: 0,
            y: -14,
            duration: 0.42,
            ease: 'power2.out'
        });

        if (heroWords.length) {
            intro.from(heroWords, {
                autoAlpha: 0,
                y: 22,
                stagger: 0.075
            }, '-=0.16');
        }

        if (heroCard) {
            intro.from(heroCard, {
                autoAlpha: 0,
                x: isDesktop ? 28 : 0,
                y: isDesktop ? 0 : 22,
                scale: 0.985,
                duration: 0.64
            }, '-=0.38');
            intro.from('.hero-avatar', {
                scale: 1.035,
                duration: 0.7,
                ease: 'power2.out'
            }, '<');
        }

        if (listHero) {
            intro.from(listHero, {
                autoAlpha: 0,
                y: 22,
                duration: 0.52
            }, '-=0.16');
        }

        if (entryCards.length) {
            intro.from(entryCards, {
                autoAlpha: 0,
                y: 24,
                stagger: 0.055,
                duration: 0.58,
                clearProps: 'transform,opacity,visibility'
            }, '-=0.18');
        }
    }

    function initScrambleTitles() {
        var targets;

        if (!ScrambleTextPlugin) {
            return;
        }

        targets = Array.prototype.slice.call(document.querySelectorAll([
            '.hero-intro',
            '.hero-section h1',
            '.list-hero .title-link',
            '.content article h1 .title-link',
            '.content .container.page h1 .title-link'
        ].join(', ')));

        targets.forEach(function (element, index) {
            var finalText = element.textContent.replace(/\s+/g, ' ').trim();

            if (!finalText) {
                return;
            }

            element.setAttribute('aria-label', finalText);
            gsap.to(element, {
              duration: 0.9,
              delay: 0.18 + index * 0.06,
              scrambleText: {
                text: finalText,
                chars: "0x3F",
                revealDelay: 0.18,
                speed: 0.3,
              },
            });
        });
    }

    function initScrollReveals(isDesktop) {
        if (!revealElements.length) {
            return;
        }

        if (!ScrollTrigger) {
            fallbackReveal();
            return;
        }

        gsap.set(revealElements, { autoAlpha: 0, y: 24 });
        gsap.set('.each-year:nth-child(odd) .each-event', { x: isDesktop ? 24 : 0 });
        gsap.set('.each-year:nth-child(even) .each-event', { x: isDesktop ? -24 : 0 });

        ScrollTrigger.batch(revealElements, {
            start: 'top 86%',
            once: true,
            interval: 0.08,
            batchMax: isDesktop ? 5 : 3,
            onEnter: function (batch) {
                gsap.to(batch, {
                    autoAlpha: 1,
                    x: 0,
                    y: 0,
                    duration: 0.62,
                    stagger: 0.055,
                    ease: 'power3.out',
                    clearProps: 'transform,opacity,visibility',
                    onComplete: function () {
                        makeVisible(batch);
                    }
                });
            }
        });

        window.addEventListener('load', function () {
            ScrollTrigger.refresh();
        }, { once: true });
    }

    function initTimelineLine() {
        var timeline = document.querySelector('.timeline-block');

        if (!timeline) {
            return;
        }

        if (!ScrollTrigger) {
            gsap.set(timeline, { '--timeline-progress': 1 });
            return;
        }

        gsap.set(timeline, { '--timeline-progress': 0 });
        gsap.to(timeline, {
            '--timeline-progress': 1,
            ease: 'none',
            scrollTrigger: {
                trigger: timeline,
                start: 'top 82%',
                end: 'bottom 70%',
                scrub: 0.7
            }
        });
    }

    function initHoverInteractions(addListener) {
        cardElements.forEach(function (card) {
            function enter() {
                card.classList.add('is-hovered');
                gsap.to(card, {
                    y: -4,
                    scale: 1.006,
                    duration: 0.22,
                    ease: 'power2.out'
                });
            }

            function leave() {
                card.classList.remove('is-hovered');
                gsap.to(card, {
                    y: 0,
                    scale: 1,
                    duration: 0.28,
                    ease: 'power2.out',
                    clearProps: 'transform'
                });
            }

            addListener(card, 'mouseenter', enter);
            addListener(card, 'mouseleave', leave);
            addListener(card, 'focusin', enter);
            addListener(card, 'focusout', leave);
        });

        buttonElements.forEach(function (element) {
            if (element.dataset.magnetic === 'true') {
                return;
            }

            addListener(element, 'mouseenter', function () {
                gsap.to(element, {
                    y: -3,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });

            addListener(element, 'mouseleave', function () {
                gsap.to(element, {
                    y: 0,
                    duration: 0.24,
                    ease: 'power2.out',
                    clearProps: 'transform'
                });
            });
        });

        document.querySelectorAll('.expertise-card i').forEach(function (icon) {
            var parent = icon.parentElement;

            addListener(parent, 'mouseenter', function () {
                gsap.to(icon, {
                    rotation: 4,
                    scale: 1.05,
                    duration: 0.24,
                    ease: 'power2.out'
                });
            });

            addListener(parent, 'mouseleave', function () {
                gsap.to(icon, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.22,
                    ease: 'power2.out',
                    clearProps: 'transform'
                });
            });
        });
    }

    function initMagneticProjectButton(addListener) {
        var button = document.querySelector('.button[data-magnetic="true"]');
        var label = button ? button.querySelector('.button-label') : null;
        var strength = 0.38;
        var labelStrength = 0.24;
        var bounds = null;

        if (!button || !label) {
            return;
        }

        function updateBounds() {
            bounds = button.getBoundingClientRect();
        }

        addListener(button, 'mouseenter', updateBounds);

        addListener(button, 'mousemove', function (event) {
            var x;
            var y;

            if (!bounds) {
                updateBounds();
            }

            x = gsap.utils.mapRange(bounds.left, bounds.right, -bounds.width / 2, bounds.width / 2, event.clientX);
            y = gsap.utils.mapRange(bounds.top, bounds.bottom, -bounds.height / 2, bounds.height / 2, event.clientY);

            gsap.to(button, {
                x: x * strength,
                y: y * strength,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: true
            });

            gsap.to(label, {
                x: x * labelStrength,
                y: y * labelStrength,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: true
            });
        });

        addListener(button, 'mouseleave', function () {
            bounds = null;

            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.4)',
                overwrite: true,
                clearProps: 'transform'
            });

            gsap.to(label, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.4)',
                overwrite: true,
                clearProps: 'transform'
            });
        });
    }

    function initThemeToggle(addListener) {
        var themeToggle = document.querySelector('.portfolio-theme-toggle');

        if (!themeToggle) {
            return;
        }

        addListener(themeToggle, 'click', function () {
            gsap.fromTo(themeToggle, {
                scale: 0.94
            }, {
                scale: 1,
                duration: 0.32,
                ease: 'back.out(1.8)',
                clearProps: 'transform'
            });
        });
    }

    mm.add({
        reduceMotion: '(prefers-reduced-motion: reduce)',
        isDesktop: '(min-width: 901px)'
    }, function (context) {
        var isReduced = context.conditions.reduceMotion;
        var isDesktop = context.conditions.isDesktop;
        var cleanupHandlers = [];

        function addListener(element, eventName, handler, options) {
            if (!element) {
                return;
            }

            element.addEventListener(eventName, handler, options);
            cleanupHandlers.push(function () {
                element.removeEventListener(eventName, handler, options);
            });
        }

        if (isReduced) {
            var reducedMobileMenuCleanup = initMobileMenu(addListener, true, isDesktop);

            makeVisible(revealElements);
            gsap.set(progressBar, { autoAlpha: 0, scaleX: 0 });
            gsap.set('.timeline-block', { '--timeline-progress': 1 });
            initElasticNavigation(addListener, false);

            if (reducedMobileMenuCleanup) {
                cleanupHandlers.push(reducedMobileMenuCleanup);
            }

            return function () {
                cleanupHandlers.forEach(function (cleanup) {
                    cleanup();
                });
            };
        }

        document.documentElement.classList.add('gsap-ready');

        initProgressBar(addListener);
        initElasticNavigation(addListener, isDesktop);
        var mobileMenuCleanup = initMobileMenu(addListener, false, isDesktop);
        initPageIntro(isDesktop);
        initScrambleTitles();
        initScrollReveals(isDesktop);
        initTimelineLine();
        initHoverInteractions(addListener);
        initMagneticProjectButton(addListener);
        initThemeToggle(addListener);

        if (mobileMenuCleanup) {
            cleanupHandlers.push(mobileMenuCleanup);
        }

        return function () {
            cleanupHandlers.forEach(function (cleanup) {
                cleanup();
            });
            document.documentElement.classList.remove('gsap-ready');
        };
    });
});
