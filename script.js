// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Animate elements on scroll
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    animateOnScrollElements.forEach(element => observer.observe(element));

    // Show/hide "Contact" link in header
    const heroSection = document.getElementById('hero');
    const contactNavLink = document.getElementById('contact-nav-link');
    const contactMobileNavLink = document.getElementById('contact-mobile-nav-link');
    if (heroSection && contactNavLink && contactMobileNavLink) {
        const heroSectionObserver = new IntersectionObserver((entries) => {
            const isIntersecting = entries[0].isIntersecting;
            contactNavLink.classList.toggle('opacity-0', !isIntersecting);
            contactNavLink.classList.toggle('pointer-events-none', !isIntersecting);
            contactMobileNavLink.classList.toggle('opacity-0', !isIntersecting);
            contactMobileNavLink.classList.toggle('pointer-events-none', !isIntersecting);
        }, { threshold: 0.1, rootMargin: "-100px 0px 0px 0px" });
        heroSectionObserver.observe(heroSection);
    }
    
    // Set current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Services Carousel Logic (New & Improved) ---
    const carouselWrapper = document.getElementById('services-carousel-wrapper');
    if (carouselWrapper) {
        const carousel = document.getElementById('carousel');
        const inner = document.getElementById('carousel-inner');
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        let touchStartX = 0;
        let touchEndX = 0;

        if (carousel && inner && prevBtn && nextBtn) {
            let cards = [...inner.children];
            let currentIndex = 0;

            const updateCarousel = () => {
                if (cards.length === 0) return;
                const cardWidth = cards[0].offsetWidth;
                const gap = parseFloat(window.getComputedStyle(inner).gap) || 0;
                const totalCardWidth = cardWidth + gap;
                
                // Calculate the offset to center the cards in mobile view
                const containerPadding = parseFloat(window.getComputedStyle(carousel.parentElement).paddingLeft) || 0;
                const carouselOffset = (carousel.offsetWidth - cardWidth) / 2 - containerPadding;


                if (window.innerWidth < 640) { // Mobile view specific centering
                    inner.style.transform = `translateX(${-currentIndex * totalCardWidth + carouselOffset}px)`;
                } else { // Desktop view
                    inner.style.transform = `translateX(-${currentIndex * totalCardWidth}px)`;
                }
                
                // Update button visibility/state
                prevBtn.disabled = currentIndex === 0;
                
                const visibleAreaWidth = carousel.offsetWidth;
                const remainingWidth = (inner.scrollWidth - (currentIndex * totalCardWidth)) - visibleAreaWidth;
                nextBtn.disabled = remainingWidth <= cardWidth/2; // Disable if less than half a card is left
            };

            const slideNext = () => {
                currentIndex++;
                updateCarousel();
            };

            const slidePrev = () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            };
            
            const handleSwipe = () => {
                if (touchStartX - touchEndX > 75) { // Swiped left
                    slideNext();
                } else if (touchEndX - touchStartX > 75) { // Swiped right
                   slidePrev();
                }
            }

            nextBtn.addEventListener('click', slideNext);
            prevBtn.addEventListener('click', slidePrev);
            
            carousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
            carousel.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });

            // Re-calculate on resize and load
            window.addEventListener('resize', () => {
                // Reset to first slide on resize to avoid weird positioning
                currentIndex = 0;
                updateCarousel();
            });
            window.addEventListener('load', updateCarousel); // Initial calculation
        }
    }


    // Hotspot Image Gallery Logic
    const hotspotGallery = document.getElementById('hotspot-image-gallery');
    if (hotspotGallery) {
        const images = Array.from(hotspotGallery.querySelectorAll('.hotspot-gallery-img'));
        let currentHotspotImageIndex = 0;
        let hotspotInterval;

        const showNextHotspotImage = () => {
            if (images.length === 0) return;
            images.forEach((img, index) => {
                img.classList.remove('active', 'exiting');
                if (index === currentHotspotImageIndex) {
                    img.classList.add('active');
                } else if ( (index === currentHotspotImageIndex - 1) || (currentHotspotImageIndex === 0 && index === images.length - 1) ) {
                    img.classList.add('exiting');
                }
            });
            currentHotspotImageIndex = (currentHotspotImageIndex + 1) % images.length;
        };
        
        const hotspotObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!hotspotInterval) {
                    showNextHotspotImage(); // Show one immediately
                    hotspotInterval = setInterval(showNextHotspotImage, 5000);
                }
            } else {
                clearInterval(hotspotInterval);
                hotspotInterval = null;
            }
        }, { threshold: 0.2 });
        hotspotObserver.observe(hotspotGallery);
    }

    // Chart.js for Focus Section
    const focusChartCanvas = document.getElementById('focusChart');
    if (focusChartCanvas) {
        let focusChartInstance = null;
        const chartObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !focusChartInstance) {
                focusChartInstance = new Chart(focusChartCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: ['Empresas Zonas Remotas', 'PYMES Urbanas', 'Particulares Alta Demanda'],
                        datasets: [{
                            data: [45, 35, 20],
                            backgroundColor: ['#8e22bb', '#a855f7', '#c084fc'],
                            hoverOffset: 10,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { font: { size: 14, family: 'Open Sans' }, color: '#a1a1aa' } // zinc-400
                            },
                            tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed}%` } }
                        },
                        cutout: '70%',
                    }
                });
            }
        }, { threshold: 0.5 });
        chartObserver.observe(focusChartCanvas.parentElement);
    }

    // Floating Contact Button Logic
    const floatingContactButton = document.getElementById('floating-contact-button');
    const contactSection = document.getElementById('contact');
    if (floatingContactButton && heroSection && contactSection) {
        const handleFloatingButtonVisibility = () => {
            const heroRect = heroSection.getBoundingClientRect();
            const contactRect = contactSection.getBoundingClientRect();
            const scrolledPastHero = heroRect.bottom < 100; // User scrolled down a bit
            const beforeContact = contactRect.top > window.innerHeight - contactRect.height / 2;
            
            if (window.innerWidth < 768 && scrolledPastHero && beforeContact) {
                floatingContactButton.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                floatingContactButton.classList.add('opacity-0', 'pointer-events-none');
            }
        };
        window.addEventListener('scroll', handleFloatingButtonVisibility);
        window.addEventListener('resize', handleFloatingButtonVisibility);
        handleFloatingButtonVisibility(); // Initial check
    }
});
