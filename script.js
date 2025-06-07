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

    // Logic to show/hide the "Contact" link in the header for desktop/mobile
    const heroSection = document.getElementById('hero');
    const contactNavLink = document.getElementById('contact-nav-link'); // Desktop header link
    const contactMobileNavLink = document.getElementById('contact-mobile-nav-link'); // Mobile header link
    if (heroSection && contactNavLink && contactMobileNavLink) {
        const heroSectionObserver = new IntersectionObserver((entries) => {
            const isIntersecting = entries[0].isIntersecting;
            contactNavLink.classList.toggle('opacity-0', isIntersecting);
            contactNavLink.classList.toggle('pointer-events-none', isIntersecting);
            contactMobileNavLink.classList.toggle('opacity-0', isIntersecting);
            contactMobileNavLink.classList.toggle('pointer-events-none', isIntersecting);
        }, { threshold: 0.1, rootMargin: "-100px 0px 0px 0px" });
        heroSectionObserver.observe(heroSection);
    }
    
    // Set current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Services Carousel Logic (REVISED) ---
    const carouselWrapper = document.getElementById('services-carousel-wrapper');
    if (carouselWrapper) {
        const carousel = document.getElementById('carousel');
        const inner = document.getElementById('carousel-inner');
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        let touchStartX = 0;
        let touchEndX = 0;

        if (carousel && inner && prevBtn && nextBtn) {
            const cards = [...inner.children];
            let currentIndex = 0;
            
            const updateCarousel = (isResize = false) => {
                if (cards.length === 0) return;

                // On resize, reset to the first slide to avoid positioning issues.
                if (isResize) {
                    currentIndex = 0;
                }
                
                let offset = 0;

                // --- CENTERING LOGIC ---
                if (window.innerWidth < 768) { // Mobile view: Center the card
                    const targetCard = cards[currentIndex];
                    if (!targetCard) return;

                    const containerCenter = carousel.offsetWidth / 2;
                    const cardCenter = targetCard.offsetLeft + (targetCard.offsetWidth / 2);
                    const gap = parseFloat(window.getComputedStyle(inner).gap) || 0; // Get the gap value
                    
                    // This new calculation directly aligns the center of the card
                    // with the center of the container, taking into account the margin for precise centering.
                    offset = containerCenter - cardCenter + (gap / 2); // Adjustment here for centering

                } else { // Desktop view: Align to left
                    const cardWidth = cards[0].offsetWidth;
                    const gap = parseFloat(window.getComputedStyle(inner).gap) || 0;
                    const totalCardWidth = cardWidth + gap;
                    offset = -currentIndex * totalCardWidth;
                    
                    // On desktop, we must ensure we don't scroll past the last item.
                    const containerWidth = carousel.offsetWidth;
                    const scrollWidth = inner.scrollWidth;
                    const currentScroll = Math.abs(parseFloat(inner.style.transform.split('(')[1])) || 0;
                    
                    // Disable if the remaining scrollable width is less than a pixel.
                    nextBtn.disabled = (scrollWidth - currentScroll) <= containerWidth + 1;
                }

                inner.style.transform = `translateX(${offset}px)`;
                updateButtons();
            };

            const updateButtons = () => {
                if (cards.length === 0) {
                    prevBtn.disabled = true;
                    nextBtn.disabled = true;
                    return;
                }

                // Previous button is simple: disabled at index 0.
                prevBtn.disabled = currentIndex <= 0;
                
                let maxIndex;
                if (window.innerWidth < 768) { // Mobile: One card per view.
                    maxIndex = cards.length - 1;
                    nextBtn.disabled = currentIndex >= maxIndex;
                } else { // Desktop: Check if end of scroll is reached.
                    const containerWidth = carousel.offsetWidth;
                    const scrollWidth = inner.scrollWidth;
                    const currentScroll = Math.abs(parseFloat(inner.style.transform.split('(')[1])) || 0;
                    
                    // Disable if the remaining scrollable width is less than a pixel.
                    nextBtn.disabled = (scrollWidth - currentScroll) <= containerWidth + 1;
                }
            };
            
            const slideNext = () => {
                if (!nextBtn.disabled) {
                    currentIndex++;
                    updateCarousel();
                }
            };

            const slidePrev = () => {
                if (!prevBtn.disabled) {
                    currentIndex--;
                    updateCarousel();
                }
            };
            
            const handleSwipe = () => {
                // Swipe left
                if (touchStartX - touchEndX > 50) {
                    slideNext();
                } 
                // Swipe right
                else if (touchEndX - touchStartX > 50) {
                   slidePrev();
                }
            };

            // Event Listeners
            nextBtn.addEventListener('click', slideNext);
            prevBtn.addEventListener('click', slidePrev);
            
            carousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
            carousel.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });

            // Recalculate on resize.
            window.addEventListener('resize', () => updateCarousel(true));
            
            // Use window.load to ensure images and styles are loaded for correct width calculation.
            window.addEventListener('load', () => {
                setTimeout(() => updateCarousel(false), 100); // Small delay for rendering.
            });
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

    // Floating Contact Button Logic (for mobile view only)
    const floatingContactButton = document.getElementById('floating-contact-button');
    const contactSection = document.getElementById('contact');
    
    if (floatingContactButton && heroSection && contactSection) {
        const handleFloatingButtonVisibility = () => {
            const heroRect = heroSection.getBoundingClientRect();
            const contactRect = contactSection.getBoundingClientRect();
            
            const scrolledPastHero = heroRect.bottom < 0;
            const beforeContact = contactRect.top > window.innerHeight;
            
            if (window.innerWidth < 768 && scrolledPastHero && beforeContact) {
                floatingContactButton.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                floatingContactButton.classList.add('opacity-0', 'pointer-events-none');
            }
        };

        window.addEventListener('scroll', handleFloatingButtonVisibility);
        window.addEventListener('resize', handleFloatingButtonVisibility);
        handleFloatingButtonVisibility();
    }
});
