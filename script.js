// ===== Config =====
const SERVER_IP = "play.toxicraft.fun:25569";

// DOM references
const ipTextEl = document.getElementById("ip-text");
const dotEl = document.getElementById("online-dot");
const onlineTextEl = document.getElementById("online-text");
const versionBadgeEl = document.getElementById("version-badge");
const playerCountEl = document.getElementById("player-count");
const playersContentEl = document.getElementById("players-content");
const refreshBtn = document.getElementById("refresh-btn");
const heroOnlineEl = document.getElementById("hero-online");
const yearEl = document.getElementById("year");
const bgImageEl = document.getElementById("bg-image");
const navEl = document.getElementById("nav");

// Set static stuff
yearEl.textContent = new Date().getFullYear();
ipTextEl.textContent = SERVER_IP;

// Copy IP function (used in HTML onclick)
function copyIP() {
  navigator.clipboard
    .writeText(SERVER_IP)
    .then(() => alert("Server IP copied: " + SERVER_IP))
    .catch(() => alert("Could not copy IP"));
}
window.copyIP = copyIP;

// ===== Fetch server status & players =====
async function fetchStatus() {
  try {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "…";

    const res = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`);
    const data = await res.json();

    // Online / offline
    if (data.online) {
      dotEl.classList.add("online");
      onlineTextEl.textContent = "Online";
      heroOnlineEl.textContent = "Server is online ✔";
    } else {
      dotEl.classList.remove("online");
      onlineTextEl.textContent = "Offline";
      heroOnlineEl.textContent = "Server is offline ✖";
    }

    // Version
    versionBadgeEl.textContent = data.version
      ? `Version ${data.version}`
      : "Version Unknown";

    // Players
    const online = data.players?.online ?? 0;
    const max = data.players?.max ?? 0;
    const list = data.players?.list || [];

    playerCountEl.textContent = `${online} / ${max} players`;

    // Player list logic
    if (!data.online || online === 0) {
      playersContentEl.innerHTML = `<p class="muted">No players online.</p>`;
    } else if (!list || list.length === 0) {
      playersContentEl.innerHTML =
        `<p class="muted">Players are online but the server has hidden the player list.</p>`;
    } else {
      const grid = document.createElement("div");
      grid.className = "player-grid";

      list.forEach((p) => {
        const name = typeof p === "string" ? p : p.name;
        const card = document.createElement("div");
        card.className = "player-card";

        const img = document.createElement("img");
        img.className = "player-avatar";
        img.alt = name;
        img.src = `https://mc-heads.net/avatar/${encodeURIComponent(
          name
        )}/64`;

        const label = document.createElement("div");
        label.textContent = name;

        card.appendChild(img);
        card.appendChild(label);
        grid.appendChild(card);
      });

      playersContentEl.innerHTML = "";
      playersContentEl.appendChild(grid);
    }
  } catch (err) {
    console.error(err);
    playersContentEl.innerHTML =
      `<p class="muted">Failed to load server info. Try again later.</p>`;
    heroOnlineEl.textContent = "Failed to fetch status.";
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "⟳";
  }
}

async function loadServer() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const hero = document.getElementById("hero-online");
        const dot = document.getElementById("online-dot");
        const text = document.getElementById("online-text");
        const ver = document.getElementById("version-badge");
        const count = document.getElementById("player-count");
        const listBox = document.getElementById("players-content");

        if (!data.online) {
            hero.innerText = "Server Offline ❌";
            dot.className = "dot offline"; text.innerText="Offline";
            count.innerText="0 / 0 players";
            listBox.innerHTML=`<p class="muted">No players online</p>`;
            updateStaff([]); return;
        }

        hero.innerText="Online ✔";
        dot.className="dot online"; text.innerText="Online";
        ver.innerText=data.version;
        count.innerText = `${data.players.online} / ${data.players.max} players`;

        // 🟡 NEW: Get player names via query endpoint
        let playerNames = [];
        const q = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}:${PORT}`).then(r=>r.json());

        if(q.players && q.players.list){
            playerNames = q.players.list;
            listBox.innerHTML = playerNames.map(p=>`
                <div class="player-item glow">
                    <img src="https://crafatar.com/avatars/${p.uuid}?overlay" class="player-head"/>
                    <span>${p.name}</span>
                </div>
            `).join("");
        } else {
            listBox.innerHTML=`<p class="muted">No players visible</p>`;
        }

        updateStaff(playerNames.map(p=>p.name));  // 🔥 Now detects properly

    } catch(err){ console.log(err); }
}

setInterval(loadServer, 15000);
loadServer();

// STAFF STATUS UPDATE
function updateStaff(onlinePlayers) {
    document.querySelectorAll(".staff-card").forEach(card=>{
        const ign = card.getAttribute("data-ign");
        const badge = card.querySelector(".status-badge");

        if(onlinePlayers.includes(ign)){
            badge.innerText="Online";
            badge.classList.remove("offline");
            badge.classList.add("online");
        } else {
            badge.innerText="Offline";
            badge.classList.add("offline");
            badge.classList.remove("online");
        }
    });
}


// Button click
refreshBtn.addEventListener("click", fetchStatus);

// Initial + interval
fetchStatus();
setInterval(fetchStatus, 60000);

// ===== Scroll reveal animations =====
const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealEls.forEach((el) => observer.observe(el));

// ===== Navbar shrink on scroll =====
window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    navEl.classList.add("nav--shrink");
  } else {
    navEl.classList.remove("nav--shrink");
  }
});

// ===== Parallax background (mouse move) =====
window.addEventListener("mousemove", (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const offsetX = (e.clientX - centerX) / centerX; // -1 to 1
  const offsetY = (e.clientY - centerY) / centerY;

  const maxMove = 12; // pixels
  const x = -offsetX * maxMove;
  const y = -offsetY * maxMove;

  bgImageEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.08)`;
});

// ====== AUTO DETECT OWNER ONLINE STATUS ======
function updateOwnerStatus(list) {
    const ownerIGN = "Karan_JI"; // ← CHANGE IF YOUR IGN DIFFERENT
    const card = document.querySelector(`[data-ign="${ownerIGN}"]`);
    const status = document.getElementById("owner-status");

    if (!card || !status) return console.warn("Owner card not found");

    if (list.includes(ownerIGN)) {
        status.textContent = "Online";
        status.classList.remove("offline");
        status.classList.add("online");
    } else {
        status.textContent = "Offline";
        status.classList.remove("online");
        status.classList.add("offline");
    }
}

