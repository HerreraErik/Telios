// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Animate elements on scroll
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optionally, unobserve once animated if it's a one-time animation
                // observer.unobserve(entry.target);
            } else {
                // Optional: remove is-visible class if you want animation to repeat on scroll out/in
                // entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    animateOnScrollElements.forEach(element => {
        observer.observe(element);
    });

    // Dynamically show/hide "Contact" link in header
    const heroSection = document.getElementById('hero');
    const contactNavLink = document.getElementById('contact-nav-link');
    const contactMobileNavLink = document.getElementById('contact-mobile-nav-link');
    const heroContactButton = document.getElementById('hero-contact-button');

    // Observer for the hero section to toggle contact button in nav
    const heroSectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { // If hero section IS visible (user is at the top)
            // Show hero button, hide nav links
            heroContactButton.classList.remove('opacity-0', 'pointer-events-none');
            contactNavLink.classList.add('opacity-0', 'pointer-events-none');
            contactMobileNavLink.classList.add('opacity-0', 'pointer-events-none');
        } else { // If hero section is NOT visible (user has scrolled past hero)
            // Hide hero button, show nav links as buttons
            heroContactButton.classList.add('opacity-0', 'pointer-events-none');
            contactNavLink.classList.remove('opacity-0', 'pointer-events-none');
            contactMobileNavLink.classList.remove('opacity-0', 'pointer-events-none');
        }
    }, { threshold: 0.1 }); // Trigger when 10% of the hero section is visible

    // Observe the hero section
    if (heroSection) {
        heroSectionObserver.observe(heroSection);
    }

    // Set current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    // Services Carousel Logic
    const servicesCarousel = document.getElementById('services-carousel');
    const slidesTrack = document.getElementById('services-slides-track');
    const prevSlideBtn = document.getElementById('prev-slide');
    const nextSlideBtn = document.getElementById('next-slide');
    const paginationContainer = document.getElementById('carousel-pagination');

    if (servicesCarousel && slidesTrack && prevSlideBtn && nextSlideBtn && paginationContainer) {
        const slides = Array.from(slidesTrack.children);
        const totalSlides = slides.length;
        let currentIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        // Create pagination dots
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('carousel-pagination-dot');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
            paginationContainer.appendChild(dot);
        }
        const paginationDots = Array.from(paginationContainer.children);

        function goToSlide(index) {
            if (index < 0 || index >= totalSlides) return;
            currentIndex = index;
            slidesTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            updatePaginationDots();
        }

        function updatePaginationDots() {
            paginationDots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        prevSlideBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1 >= 0 ? currentIndex - 1 : totalSlides - 1); // Loop back
        });

        nextSlideBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1 < totalSlides ? currentIndex + 1 : 0); // Loop forward
        });

        // Touch swipe for carousel
        servicesCarousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        servicesCarousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleGesture();
        });

        function handleGesture() {
            if (touchEndX < touchStartX - 50) { // Swiped left
                goToSlide(currentIndex + 1 < totalSlides ? currentIndex + 1 : 0);
            }
            if (touchEndX > touchStartX + 50) { // Swiped right
                goToSlide(currentIndex - 1 >= 0 ? currentIndex - 1 : totalSlides - 1);
            }
        }

        goToSlide(0); // Initialize carousel
    }

    // Hotspot Image Gallery Logic
    const hotspotGallery = document.getElementById('hotspot-image-gallery');
    if (hotspotGallery) {
        const images = Array.from(hotspotGallery.querySelectorAll('.hotspot-gallery-img'));
        let currentHotspotImageIndex = 0;

        function showNextHotspotImage() {
            if (images.length === 0) return;

            images.forEach((img, index) => {
                if (index === currentHotspotImageIndex) {
                    img.classList.add('active');
                    img.classList.remove('exiting');
                } else if (img.classList.contains('active')) {
                    img.classList.remove('active');
                    img.classList.add('exiting'); // Add exiting class for transition
                } else {
                    img.classList.remove('exiting'); // Ensure it's clean for next cycle
                }
            });

            currentHotspotImageIndex = (currentHotspotImageIndex + 1) % images.length;
        }

        // Initial display
        showNextHotspotImage();

        // Change image every 5 seconds, but only if the section is in view
        let hotspotInterval;
        const hotspotObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!hotspotInterval) { // Start interval only if not already running
                        hotspotInterval = setInterval(showNextHotspotImage, 5000);
                    }
                } else {
                    if (hotspotInterval) { // Clear interval if section is out of view
                        clearInterval(hotspotInterval);
                        hotspotInterval = null;
                    }
                }
            });
        }, { threshold: 0.2 }); // Trigger when 20% of the section is visible

        hotspotObserver.observe(hotspotGallery);
    }

    // Chart.js for Focus Section
    const focusChartCanvas = document.getElementById('focusChart');
    const focusChartContainerObserver = document.getElementById('focus-chart-container-observer');
    let focusChartInstance = null;

    if (focusChartCanvas && focusChartContainerObserver) {
        const chartData = {
            labels: ['Empresas Zonas Remotas', 'PYMES Urbanas', 'Particulares Alta Demanda'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: [
                    '#cc33cc', 
                    '#660066',
                    '#99cc33'  
                ],
                hoverOffset: 10,
                borderWidth: 0 
            }]
        };

        const chartConfig = {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14,
                                family: 'Open Sans'
                            },
                            color: '#525252' // zinc-700
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed) {
                                    label += context.parsed + '%';
                                }
                                return label;
                            }
                        }
                    }
                },
                cutout: '70%', // Makes it a doughnut chart
            }
        };

        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!focusChartInstance) {
                        focusChartInstance = new Chart(focusChartCanvas, chartConfig);
                    }
                } else {
                    // Optional: Destroy chart when out of view to free memory
                    // if (focusChartInstance) {
                    //     focusChartInstance.destroy();
                    //     focusChartInstance = null;
                    // }
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the chart container is visible

        chartObserver.observe(focusChartContainerObserver);
    }

    // --- Floating Contact Button Logic (Simplified) ---
    const floatingContactButton = document.getElementById('floating-contact-button');
    const contactSection = document.getElementById('contact'); // Ensure this is defined

    function handleFloatingButtonVisibility() {
        const isMobile = window.innerWidth < 768;
        if (!isMobile || !heroSection || !contactSection || !floatingContactButton) {
            // If not mobile, or elements are missing, ensure button is hidden
            if (floatingContactButton) {
                floatingContactButton.classList.add('opacity-0', 'pointer-events-none');
            }
            return;
        }

        const heroRect = heroSection.getBoundingClientRect();
        const contactRect = contactSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Condition to show the button:
        // 1. Scrolled past the hero section (hero's bottom is above or at the top of the viewport)
        // 2. Not yet reached the contact section (contact section's top is below the bottom of the viewport)
        const scrolledPastHero = heroRect.bottom <= 0;
        const beforeContactSection = contactRect.top >= viewportHeight; // Changed to >= to hide when contact section starts entering

        if (scrolledPastHero && beforeContactSection) {
            floatingContactButton.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            floatingContactButton.classList.add('opacity-0', 'pointer-events-none');
        }
    }

    // Attach scroll and resize listeners
    window.addEventListener('scroll', handleFloatingButtonVisibility);
    window.addEventListener('resize', handleFloatingButtonVisibility);

    // Initial check on load
    handleFloatingButtonVisibility();
});
