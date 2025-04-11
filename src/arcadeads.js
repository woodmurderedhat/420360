/**
 * Arcade Ad System (modularized)
 * Handles dynamic ad injection and bonus logic for Tarot Tetromino.
 * 
 * Usage:
 *   Call initArcadeAds({ awardScoreBonus, updateScore, getAddTarotCardToHand })
 *   - awardScoreBonus(bonus): function to add bonus to score
 *   - updateScore(): function to update the score UI
 *   - getAddTarotCardToHand(): function that returns the current addTarotCardToHand
 * 
 * This file is safe for static hosting (no CORS/server required).
 */

(function (global) {
    const AD_SLOGANS = [
        "Insert Coin at woodmurderedhat.com",
        "Unleash the Metal—Click for Power-Ups!",
        "Stage Dive into Deals!",
        "Shred High Scores, Shred Prices!",
        "Arcade Legends Shop Here!",
        "Metal Up Your Game—woodmurderedhat.com",
        "Combo Breaker Savings!"
    ];
    const AD_LINK = "https://woodmurderedhat.com";
    const AD_LOCATIONS = [
        { id: "sidebar-ad-container", max: 2 },
        { id: "below-board-ad-container", max: 2 }
    ];

    function createAdElement(slogan, awardScoreBonus, updateScore) {
        const a = document.createElement('a');
        a.href = AD_LINK;
        a.className = "ad-content pixel-font ad-pop";
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("data-slogan", slogan);
        a.innerHTML = `<span>${slogan}</span>`;
        a.addEventListener('click', function (e) {
            e.preventDefault();
            // Award score bonus
            const bonus = 100;
            if (typeof awardScoreBonus === "function") {
                awardScoreBonus(bonus);
            }
            if (typeof updateScore === "function") {
                updateScore();
            }

            // Floating "+100" animation
            const float = document.createElement('div');
            float.textContent = `+${bonus}`;
            float.className = 'ad-bonus-float pixel-font';
            float.style.position = 'absolute';
            float.style.left = (e.clientX - 30) + 'px';
            float.style.top = (e.clientY - 30) + 'px';
            float.style.zIndex = 9999;
            float.style.color = 'var(--neon-yellow)';
            float.style.fontSize = '1.2em';
            float.style.pointerEvents = 'none';
            float.style.textShadow = '0 0 8px var(--neon-yellow), 0 0 2px #000';
            document.body.appendChild(float);

            setTimeout(() => {
                float.style.transition = 'all 0.8s cubic-bezier(.4,2,.6,1)';
                float.style.transform = 'translateY(-60px) scale(1.3)';
                float.style.opacity = '0';
            }, 10);
            setTimeout(() => {
                float.remove();
                window.open(a.href, '_blank', 'noopener');
            }, 900);
        });
        return a;
    }

    function spawnRandomAd(locationId, awardScoreBonus, updateScore) {
        const container = document.getElementById(locationId);
        if (!container) return;
        // Remove old ads if over max
        const max = AD_LOCATIONS.find(l => l.id === locationId)?.max || 1;
        while (container.children.length >= max) {
            container.removeChild(container.firstChild);
        }
        // Pick a random slogan not already shown
        const used = Array.from(container.children).map(c => c.getAttribute('data-slogan'));
        const available = AD_SLOGANS.filter(s => !used.includes(s));
        const slogan = available.length ? available[Math.floor(Math.random() * available.length)] : AD_SLOGANS[Math.floor(Math.random() * AD_SLOGANS.length)];
        // Create and animate in
        const ad = createAdElement(slogan, awardScoreBonus, updateScore);
        ad.style.opacity = "0";
        ad.style.transform = "scale(0.7) translateY(40px)";
        container.appendChild(ad);
        setTimeout(() => {
            ad.style.transition = "all 0.7s cubic-bezier(.4,2,.6,1)";
            ad.style.opacity = "1";
            ad.style.transform = "scale(1) translateY(0)";
        }, 10);
        // Remove after random time (4-8s)
        setTimeout(() => {
            if (ad.parentNode === container) {
                ad.style.transition = "all 0.5s cubic-bezier(.4,2,.6,1)";
                ad.style.opacity = "0";
                ad.style.transform = "scale(0.7) translateY(40px)";
                setTimeout(() => ad.remove(), 500);
            }
        }, 4000 + Math.random() * 4000);
    }

    function spawnAdsRandomly(awardScoreBonus, updateScore) {
        AD_LOCATIONS.forEach(loc => {
            if (Math.random() < 0.7) { // 70% chance to spawn in each location
                spawnRandomAd(loc.id, awardScoreBonus, updateScore);
            }
        });
    }

    /**
     * Initialize the arcade ad system.
     * @param {Object} opts
     * @param {function(number):void} opts.awardScoreBonus - Called with bonus amount when ad is clicked
     * @param {function():void} opts.updateScore - Called to update score UI
     * @param {function():function} [opts.getAddTarotCardToHand] - Returns the current addTarotCardToHand function (optional, for patching)
     */
    function initArcadeAds({ awardScoreBonus, updateScore, getAddTarotCardToHand }) {
        // Patch tarot card draw to also spawn ads, if possible
        if (typeof getAddTarotCardToHand === "function") {
            const _originalAddTarotCardToHand = getAddTarotCardToHand();
            if (typeof _originalAddTarotCardToHand === "function") {
                window.addTarotCardToHand = function () {
                    _originalAddTarotCardToHand.apply(this, arguments);
                    spawnAdsRandomly(awardScoreBonus, updateScore);
                };
            }
        }
        // Initial ad spawn
        window.addEventListener('DOMContentLoaded', () => {
            spawnAdsRandomly(awardScoreBonus, updateScore);
            setInterval(() => spawnAdsRandomly(awardScoreBonus, updateScore), 6000);
        });
    }

    // Expose globally
    global.initArcadeAds = initArcadeAds;
})(window);
