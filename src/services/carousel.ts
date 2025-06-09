
export function carousel(): void {
    const carouselContainer = document.querySelector<HTMLElement>(".carousel-container");
    const carouselGallery = document.querySelector<HTMLElement>(".carousel-gallery")!;
    const carouselItems = document.querySelectorAll<HTMLElement>(".carousel-content-item");
    const carouselPreviousBtn = document.getElementById("carousel-prev-btn")!;
    const carouselNextBtn = document.getElementById("carousel-next-btn")!;
    const carouselIndicators = document.querySelectorAll<HTMLLIElement>(".carousel-indicators li");

    let activeIndex = 0;
    const itemCount = carouselItems.length;
    let sliderInterval: ReturnType<typeof setInterval> | null = null;

    function updateSlider(): void {
        const offset = -activeIndex * (carouselItems[0]?.offsetWidth || 0);
        carouselGallery.style.transform = `translateX(${offset}px)`;

        const activeIndicator = document.querySelector<HTMLLIElement>(".carousel-indicators li.active");
        activeIndicator?.classList.remove("active");
        carouselIndicators[activeIndex]?.classList.add("active");

        resetSliderInterval();
    }

    function nextSlide() {
        if (activeIndex + 1 >= itemCount) {
            activeIndex = 0;
        } else {
            activeIndex += 1;
        }
        updateSlider();
    }

    function previouSlide() {
        if (activeIndex - 1 < 0) {
            activeIndex = itemCount - 1;
        } else {
            activeIndex -= 1;
        }
        updateSlider();
    }

    function resetSliderInterval(): void {
        if(sliderInterval){
            clearInterval(sliderInterval);
        }
        sliderInterval = setInterval(nextSlide, 4000);
    }

    function startSlider() {
        if (!sliderInterval) {
            sliderInterval = setInterval(nextSlide, 4000);
        }
    }

    function stopSlider() {
        if(sliderInterval){
            clearInterval(sliderInterval);
            sliderInterval = null;
        }
    }

    const observer = new IntersectionObserver(
        (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                startSlider();
            } else {
                stopSlider();
            }
        },
        { threshold: 0.1 }
    );

    if(carouselContainer){
        observer.observe(carouselContainer);
    }

    carouselPreviousBtn.addEventListener("click", previouSlide);
    carouselNextBtn.addEventListener("click", nextSlide);

    carouselIndicators.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            activeIndex = index;
            updateSlider();
        });
    });

    updateSlider();
    startSlider();
}

