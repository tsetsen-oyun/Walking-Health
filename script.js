const track = document.querySelector(".track");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

// 1. Setup Clones
const originalCards = Array.from(track.querySelectorAll(".card"));
if (track.querySelectorAll(".card").length === originalCards.length) {
    const firstClone = originalCards[0].cloneNode(true);
    const lastClone = originalCards[originalCards.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalCards[0]);
}

const allCards = Array.from(track.querySelectorAll(".card"));
let index = 1;

// 2. The Move Function (Now calculates width on the fly)
function updateCarousel(animate = true) {
    const card = allCards[0];
    const cardWidth = card.offsetWidth;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const containerWidth = document.querySelector(".carousel").offsetWidth;

    const offset = (index * (cardWidth + gap)) - (containerWidth / 2) + (cardWidth / 2);

    track.style.transition = animate ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "none";
    track.style.transform = `translateX(-${offset}px)`;
}

// 3. The "Silent Jump" (Logic moved here to avoid the flag issue)
track.addEventListener("transitionend", () => {
    if (index === allCards.length - 1) {
        index = 1;
        updateCarousel(false);
    }
    if (index === 0) {
        index = allCards.length - 2;
        updateCarousel(false);
    }
});

// 4. Eager Buttons
nextBtn.addEventListener("click", () => {
    index++;
    updateCarousel(true);
});

prevBtn.addEventListener("click", () => {
    index--;
    updateCarousel(true);
});

// 5. Immediate Init
// Don't wait for "load" (images), just wait for "DOMContentLoaded" (HTML structure)
document.addEventListener("DOMContentLoaded", () => updateCarousel(false));
// Backup for window load
window.addEventListener("load", () => updateCarousel(false));
window.addEventListener("resize", () => updateCarousel(false));