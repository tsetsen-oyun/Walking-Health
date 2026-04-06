const track = document.querySelector(".track");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

const originalCards = Array.from(track.querySelectorAll(".card"));
const total = originalCards.length;

// Clone the full set before and after
const beforeClones = originalCards.map(c => c.cloneNode(true));
const afterClones = originalCards.map(c => c.cloneNode(true));

beforeClones.reverse().forEach(c => track.insertBefore(c, track.firstChild));
afterClones.forEach(c => track.appendChild(c));

const allCards = Array.from(track.querySelectorAll(".card"));
let index = total; // start at the first real card

function updateCarousel(animate = true) {
    const cardWidth = allCards[0].offsetWidth;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const containerWidth = document.querySelector(".carousel").offsetWidth;
    const offset = (index * (cardWidth + gap)) - (containerWidth / 2) + (cardWidth / 2);

    track.style.transition = animate ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "none";
    track.style.transform = `translateX(-${offset}px)`;
}

track.addEventListener("transitionend", () => {
    // Slid past the end — jump to the matching real card
    if (index >= total * 2) {
        index = index - total;
        updateCarousel(false);
    }
    // Slid past the beginning — jump to the matching real card
    if (index < total) {
        index = index + total;
        updateCarousel(false);
    }
});

nextBtn.addEventListener("click", () => { index++; updateCarousel(true); });
prevBtn.addEventListener("click", () => { index--; updateCarousel(true); });

updateCarousel(false);
window.addEventListener("resize", () => updateCarousel(false));