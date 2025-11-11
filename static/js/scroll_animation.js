document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('#scroll-container');
    if (!scrollContainer) return;

    const containerDiv = scrollContainer.querySelector('div');
    const parts = Array.from(containerDiv.querySelectorAll('.sparepart'));
    const smartphone = parts.pop(); // The last image is the assembled smartphone

    // Set a unique identifier for the smartphone for easier selection
    smartphone.id = 'smartphone';

    // Pre-calculate random offsets for the "bunch" effect
    const partOffsets = parts.map(() => ({
        x: (Math.random() - 0.5) * 300, // Random horizontal spread
        y: (Math.random() - 0.5) * 300,  // Reduced vertical spread
        rot: (Math.random() - 0.5) * 90   // Random initial rotation
    }));

    const animateParts = (scrollPercent) => {
        // Animate each part
        parts.forEach((part, index) => {
            const offset = partOffsets[index];

            // 1. Movement from left to center
            const mainTranslateX = -40 + (scrollPercent * 40); // Moves the whole bunch from -30vw to 0vw

            // 2. Convergence of the bunch
            const spreadFactor = 1 - scrollPercent; // Spread decreases as you scroll
            const offsetX = offset.x * spreadFactor;
            const offsetY = offset.y * spreadFactor;
            const offsetRot = offset.rot * spreadFactor;

            // 3. Opacity: Fade in at the start, fade out at the end
            let opacity = 0;
            if (scrollPercent < 0.8) {
                opacity = scrollPercent / 0.2; // Fade in
            } else {
                opacity = (1 - scrollPercent) / 0.2; // Fade out
             }
            opacity = Math.max(0, Math.min(1, opacity));

            part.style.opacity = opacity;
            part.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) translateX(${mainTranslateX}vw) rotate(${offsetRot}deg)`;
        });

        // Fade in the final smartphone at the end of the animation
        if (scrollPercent > 0.8) {
            const finalProgress = (scrollPercent - 0.8) / 0.2;
            smartphone.style.opacity = finalProgress;
            smartphone.style.transform = `translate(-50%, -50%) scale(${0.9 + finalProgress * 0.1})`; // Grow slightly
        } else {
            smartphone.style.opacity = 0;
        }
    };

    const handleScroll = () => {
        const rect = scrollContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Define the start and end points of the animation in terms of the element's top position
        const anim_start_pos = viewportHeight; // Animation starts when the top of the element hits the bottom of the viewport
        const anim_end_pos = viewportHeight * 0.3 - rect.height / 2; // Animation ends when the center of the element is at 60% of the viewport height

        // Calculate the total distance over which the animation should occur
        const totalScrollableDist = anim_start_pos - anim_end_pos;

        // Calculate the current distance scrolled within our defined animation area
        const currentScrollDist = anim_start_pos - rect.top;

        // Calculate the scroll percentage, clamped between 0 and 1
        let scrollPercent = currentScrollDist / totalScrollableDist;
        scrollPercent = Math.max(0, Math.min(1, scrollPercent));

        animateParts(scrollPercent);
    };

    // Use IntersectionObserver to add/remove the scroll listener for performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                window.addEventListener('scroll', handleScroll);
            } else {
                window.removeEventListener('scroll', handleScroll);
            }
        });
    });

    observer.observe(scrollContainer);
    // Initial call to set the state correctly on page load
    handleScroll();
});
