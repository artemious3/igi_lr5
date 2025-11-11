document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('#scroll-container');
    if (!scrollContainer) return;

    const containerDiv = scrollContainer.querySelector("#smartphone-constructing");
    const parts = Array.from(containerDiv.querySelectorAll('.sparepart'));
    const smartphone = parts.pop(); 

    smartphone.id = 'smartphone';

    const partOffsets = parts.map(() => ({
        x: (Math.random() - 0.5) * 300, 
        y: (Math.random() - 0.5) * 300,  
        rot: (Math.random() - 0.5) * 90  
    }));

    const animateParts = (scrollPercent) => {
        parts.forEach((part, index) => {
            const offset = partOffsets[index];

            const mainTranslateX = -40 + (scrollPercent * 40); 

            const spreadFactor = 1 - scrollPercent; /
            const offsetX = offset.x * spreadFactor;
            const offsetY = offset.y * spreadFactor;
            const offsetRot = offset.rot * spreadFactor;

            let opacity = 0;
            if (scrollPercent < 0.8) {
                opacity = scrollPercent / 0.2; /
            } else {
                opacity = (1 - scrollPercent) / 0.2; 
             }
            opacity = Math.max(0, Math.min(1, opacity));

            part.style.opacity = opacity;
            part.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) translateX(${mainTranslateX}vw) rotate(${offsetRot}deg)`;
        });

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

        const anim_start_pos = viewportHeight; 
        const anim_end_pos = viewportHeight * 0.3 - rect.height / 2;

        const totalScrollableDist = anim_start_pos - anim_end_pos;

        const currentScrollDist = anim_start_pos - rect.top;

        let scrollPercent = currentScrollDist / totalScrollableDist;
        scrollPercent = Math.max(0, Math.min(1, scrollPercent));

        animateParts(scrollPercent);
    };

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
    handleScroll();
});
