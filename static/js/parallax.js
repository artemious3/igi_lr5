document.addEventListener("catalogUpdated", () => {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse x position within the card
      const y = e.clientY - rect.top; // Mouse y position within the card

      const centerX = card.offsetWidth / 2;
      const centerY = card.offsetHeight / 2;

      const deltaX = x - centerX;
      const deltaY = y - centerY;

      // Adjust the divisor for more or less intensity
      const maxRotation = 15;
      const rotateX = (deltaY / centerY) * -maxRotation;
      const rotateY = (deltaX / centerX) * maxRotation;

      // Apply the 3D transformation
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseenter", () => {
      // Make the card react quickly when the mouse enters
      card.style.transition = "transform 0.1s ease";
    });

    card.addEventListener("mouseleave", () => {
      // Smoothly transition the card back to its original state
      card.style.transition = "transform 0.5s ease-out";
      card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
    });
  });
});
