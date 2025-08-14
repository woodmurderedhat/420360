let comicData = null;
let pageIndex = 0;
let storyPath = []; // stores chosen alt indexes for each panel across all pages

async function loadComic(issueFile) {
  const response = await fetch(`comics/${issueFile}`);
  comicData = await response.json();
  
  // Initialize random story path
  storyPath = comicData.pages.map(page => 
    page.panels.map(panel => Math.floor(Math.random() * panel.alternates.length))
  );

  pageIndex = 0;
  renderPage();
}

function renderPage() {
  const container = document.getElementById("comic-container");
  container.innerHTML = "";

  const page = comicData.pages[pageIndex];
  
  page.panels.forEach((panel, panelIndex) => {
  const altIndex = storyPath[pageIndex][panelIndex];
  const alt = panel.alternates[altIndex];

    const panelEl = document.createElement("div");
    panelEl.classList.add("panel");
    if (alt.effect) panelEl.classList.add(alt.effect);

    const img = document.createElement("img");
    img.src = `img/${alt.image}`;
    img.alt = alt.text || "";

    const textBox = document.createElement("div");
    textBox.classList.add("text-box");
    textBox.textContent = alt.text;

    panelEl.appendChild(img);
    panelEl.appendChild(textBox);
    container.appendChild(panelEl);
  });

  renderNavButtons();
}

function renderNavButtons() {
  document.querySelectorAll(".nav-btn").forEach(btn => btn.remove());

  if (pageIndex > 0) {
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("nav-btn");
    prevBtn.style.left = "20px";
    prevBtn.style.bottom = "20px";
    prevBtn.textContent = "◀ Previous";
    prevBtn.addEventListener("click", () => prevPage(true));
    document.body.appendChild(prevBtn);
  }

  if (pageIndex < comicData.pages.length - 1) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("nav-btn");
    nextBtn.style.right = "20px";
    nextBtn.style.bottom = "20px";
    nextBtn.textContent = "Next ▶";
    nextBtn.addEventListener("click", nextPage);
    document.body.appendChild(nextBtn);
  }
}

function nextPage() {
  glitchTransition(() => {
    pageIndex++;
    renderPage();
  });
}

function prevPage(randomize) {
  glitchTransition(() => {
    pageIndex--;
    if (randomize) {
      // Reroll from this page onward
      for (let p = pageIndex; p < comicData.pages.length; p++) {
        for (let pn = 0; pn < comicData.pages[p].panels.length; pn++) {
          const panel = comicData.pages[p].panels[pn];
          let newAlt = Math.floor(Math.random() * panel.alternates.length);
          storyPath[p][pn] = newAlt;
        }
      }
    }
    renderPage();
  });
}

function glitchTransition(callback) {
  const container = document.getElementById("comic-container");
  container.classList.add("glitch-out");

  setTimeout(() => {
    callback();
    container.classList.remove("glitch-out");
    container.classList.add("glitch-in");
    setTimeout(() => container.classList.remove("glitch-in"), 700);
  }, 700);
}

loadComic("issue1.json");
