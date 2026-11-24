// ==================== 1. FIREBASE KONFIGURATION ====================
const firebaseConfig = {
    apiKey: "AIzaSyC13VT3XZ0FycilSOg_OvU883pSjAQvPE8",
    authDomain: "neon-slots-c7e4a.firebaseapp.com",
    databaseURL: "https://neon-slots-c7e4a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "neon-slots-c7e4a",
    storageBucket: "neon-slots-c7e4a.firebasestorage.app",
    messagingSenderId: "581546428803",
    appId: "1:581546428803:web:cace7eded782a92b9d8eb6",
    measurementId: "G-SP3PEH98L2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==================== 1B. CASINO SOUND ENGINE (GITHUB PAGES KOMPATIBEL) ====================
let audioCtx = null;
let isMuted = localStorage.getItem('aureliaMuted') === 'true';

function initOrUnlockAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

// Entsperrt Audio sofort beim ersten Klick/Touch/Tastendruck auf GitHub Pages
['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
        initOrUnlockAudio();
    }, { passive: true });
});

async function withReadyAudio(callback) {
    if (isMuted) return;
    const ctx = initOrUnlockAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (e) {
            return;
        }
    }
    callback(ctx);
}

const muteBtn = document.getElementById('mute-btn');
if (muteBtn) {
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('aureliaMuted', isMuted);
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        if (!isMuted) {
            playReelStopSound(1);
        }
    });
}

// 1. Klassischer Hebel- & Slot-Maschinen-Sound
function playLeverPullSound() {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;

        const leverOsc = ctx.createOscillator();
        const leverGain = ctx.createGain();
        leverOsc.type = 'sawtooth';
        leverOsc.frequency.setValueAtTime(190, now);
        leverOsc.frequency.exponentialRampToValueAtTime(75, now + 0.16);
        leverGain.gain.setValueAtTime(0.18, now);
        leverGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        leverOsc.connect(leverGain);
        leverGain.connect(ctx.destination);
        leverOsc.start(now);
        leverOsc.stop(now + 0.18);

        for (let i = 0; i < 11; i++) {
            const tickTime = now + 0.14 + i * 0.065;
            const tickOsc = ctx.createOscillator();
            const tickGain = ctx.createGain();
            tickOsc.type = 'triangle';
            tickOsc.frequency.setValueAtTime(680 + (i % 2) * 140, tickTime);
            tickOsc.frequency.exponentialRampToValueAtTime(220, tickTime + 0.035);
            tickGain.gain.setValueAtTime(0.08, tickTime);
            tickGain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.04);
            tickOsc.connect(tickGain);
            tickGain.connect(ctx.destination);
            tickOsc.start(tickTime);
            tickOsc.stop(tickTime + 0.045);
        }
    });
}

// Walzen-Einrast-Klick beim Stoppen
function playReelStopSound(reelIndex) {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240 + reelIndex * 35, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.09);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    });
}

// 2. Niederlagen-Sound (sanft abfallender Zwei-Ton-Klang)
function playLoseSound() {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;

        const notes = [293.66, 220.00];
        notes.forEach((freq, idx) => {
            const start = now + idx * 0.22;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.linearRampToValueAtTime(freq * 0.92, start + 0.24);
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.26);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.28);
        });
    });
}

// Kleiner Gewinn (2 Gleiche oder 2x-5x)
function playSmallWinSound() {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;

        [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const start = now + idx * 0.08;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.14, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.24);
        });
    });
}

// 3. Hauptgewinn-Sound (Royal Jackpot Fanfare + Münzregen-Glitzern ab 15x)
function playJackpotFanfareSound() {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;

        const fanfare = [
            { freq: 523.25, time: 0.00, dur: 0.16 },
            { freq: 659.25, time: 0.12, dur: 0.16 },
            { freq: 783.99, time: 0.24, dur: 0.16 },
            { freq: 1046.50, time: 0.38, dur: 0.45 },
            { freq: 987.77, time: 0.56, dur: 0.14 },
            { freq: 1046.50, time: 0.70, dur: 0.65 }
        ];

        fanfare.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, now + note.time);
            gain.gain.setValueAtTime(0.22, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + note.dur + 0.02);
        });

        for (let i = 0; i < 10; i++) {
            const t = now + 0.45 + i * 0.09;
            const coinOsc = ctx.createOscillator();
            const coinGain = ctx.createGain();
            coinOsc.type = 'sine';
            coinOsc.frequency.setValueAtTime(1760 + (i % 3) * 330, t);
            coinGain.gain.setValueAtTime(0.09, t);
            coinGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
            coinOsc.connect(coinGain);
            coinGain.connect(ctx.destination);
            coinOsc.start(t);
            coinOsc.stop(t + 0.15);
        }
    });
}

// 4. Server-Broadcast-Sound (Edler Club-Gong / Chime)
function playBroadcastSound() {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;

        const chimeNotes = [880, 1108.73, 1318.51];
        chimeNotes.forEach((freq, idx) => {
            const start = now + idx * 0.11;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.16, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.48);
        });
    });
}

// ==================== 2. PASSWORT-HASHING (SHA-256) ====================
async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==================== 3. SPIEL-KONFIGURATION, RECHTE & SHOP ====================
const SUPER_ADMIN_ID = 'ID1';
const AUTO_SPIN_MIN_COINS = 500;
const PASSIVE_REWARD_COINS = 10;
const PASSIVE_INTERVAL_SEC = 300; // 5 Minuten

const RANKS = {
    member:  { label: '👤 Member',            bonus: 1.00, cssClass: 'rank-member' },
    bronze:  { label: '🥉 Bronze Club',       bonus: 1.05, cssClass: 'rank-bronze' },
    silver:  { label: '🥈 Silver Lounge',     bonus: 1.10, cssClass: 'rank-silver' },
    gold:    { label: '🥇 Gold Reserve',      bonus: 1.15, cssClass: 'rank-gold' },
    diamond: { label: '💎 Diamond Elite',     bonus: 1.25, cssClass: 'rank-diamond' },
    royal:   { label: '👑 Royal High-Roller', bonus: 1.40, cssClass: 'rank-royal' },
    emperor: { label: '⚡ Aurelia Emperor',   bonus: 1.50, cssClass: 'rank-emperor' }
};

const SHOP_ITEMS = [
    {
        id: 'feature_autospin',
        type: 'feature',
        name: '🤖 Auto-Spin Modul',
        price: 1500,
        desc: `Schaltet Auto-Spin frei (aktivierbar ab ${AUTO_SPIN_MIN_COINS} 🪙 Guthaben).`
    },
    {
        id: 'feature_turbo',
        type: 'feature',
        name: '⚡ Turbo-Walzen',
        price: 3000,
        desc: 'Doppelt so schnelle Drehungen für maximale Action.'
    },
    {
        id: 'title_gambler',
        type: 'title',
        badge: '🎲 High-Stakes Gambler',
        name: 'Titel: High-Stakes Gambler',
        price: 1000,
        desc: 'Rein kosmetischer Titel im Profil & Leaderboard.'
    },
    {
        id: 'title_vip',
        type: 'title',
        badge: '👑 Royal VIP',
        name: 'Titel: Royal VIP',
        price: 5000,
        desc: 'Rein kosmetischer VIP-Status für dein Profil.'
    },
    {
        id: 'title_shark',
        type: 'title',
        badge: '🦈 Golden Shark',
        name: 'Titel: Golden Shark',
        price: 15000,
        desc: 'Zeige allen im Leaderboard, wer den Tisch dominiert.'
    },
    {
        id: 'title_whale',
        type: 'title',
        badge: '🏆 Sovereign Whale',
        name: 'Titel: Sovereign Whale',
        price: 50000,
        desc: 'Der ultimative kosmetische Prestige-Titel.'
    }
];

const symbols = [
    { key: 'cherry',  icon: '🍒', multiplier: 2,    weight: 42 },
    { key: 'lemon',   icon: '🍋', multiplier: 3,    weight: 32 },
    { key: 'bell',    icon: '🔔', multiplier: 5,    weight: 16 },
    { key: 'diamond', icon: '💎', multiplier: 15,   weight: 7 },
    { key: 'seven',   icon: '7️⃣', multiplier: 50,   weight: 2.2 },
    { key: 'crown',   icon: '👑', multiplier: 250,  weight: 0.6 },
    { key: 'cosmic',  icon: '🌌', multiplier: 1000, weight: 0.2 }
];

// ==================== 4. LIVE CLOUD-SYNCHRONISATION ====================
let usersMap = {};
let userRigQueue = {};
let currentUserId = localStorage.getItem('neonSlotsCurrentUser') || null;
let lastBroadcastTimestamp = 0;

let currentBet = 50;
let isSpinning = false;
let isAutoSpinning = false;
let passiveSecondsLeft = PASSIVE_INTERVAL_SEC;

db.ref('users').on('value', (snapshot) => {
    usersMap = snapshot.val() || {};
    updateUI();
    renderLeaderboard();
    renderAdminPlayers();
    renderShop();
});

db.ref('rigs').on('value', (snapshot) => {
    userRigQueue = snapshot.val() || {};
    renderActiveRigs();
});

db.ref('broadcast').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.timestamp > lastBroadcastTimestamp) {
        const isFirstLoad = lastBroadcastTimestamp === 0;
        lastBroadcastTimestamp = data.timestamp;
        showGlobalBanner(data.text, data.isWinner);
        if (!isFirstLoad || (Date.now() - data.timestamp < 10000)) {
            playBroadcastSound();
        }
    }
});

db.ref('logs').limitToLast(40).on('value', (snapshot) => {
    const logsContainer = document.getElementById('admin-logs');
    if (!logsContainer) return;
    logsContainer.innerHTML = '';
    const logsObj = snapshot.val() || {};
    const entries = Object.values(logsObj).reverse();
    entries.forEach(line => {
        const div = document.createElement('div');
        div.textContent = line;
        logsContainer.appendChild(div);
    });
});

function getUsersArray() {
    return Object.values(usersMap);
}

function getCurrentUser() {
    return currentUserId ? (usersMap[currentUserId] || null) : null;
}

function userOwnsItem(user, itemId) {
    return Boolean(user && user.ownedItems && user.ownedItems[itemId] === true);
}

function isSuperAdmin(user) {
    return Boolean(user && user.id === SUPER_ADMIN_ID);
}

function hasAdminAccess(user) {
    return Boolean(user && (user.id === SUPER_ADMIN_ID || user.isAdmin === true));
}

function getRankInfo(rankKey) {
    return RANKS[rankKey] || RANKS.member;
}

function addCloudLog(message) {
    const time = new Date().toLocaleTimeString('de-DE');
    db.ref('logs').push(`[${time}] ${message}`);
}

function pushGlobalBroadcast(text, isWinner = false) {
    db.ref('broadcast').set({
        text: text,
        isWinner: isWinner,
        timestamp: Date.now()
    });
}

// ==================== 4B. 5-MINUTEN GRATIS-COINS TIMER ====================
setInterval(() => {
    const user = getCurrentUser();
    const timerTextEl = document.getElementById('passive-timer-text');
    if (!user || user.banned) {
        if (timerTextEl) timerTextEl.textContent = '05:00';
        return;
    }

    passiveSecondsLeft--;
    if (passiveSecondsLeft <= 0) {
        passiveSecondsLeft = PASSIVE_INTERVAL_SEC;
        const updatedCoins = (user.coins || 0) + PASSIVE_REWARD_COINS;
        db.ref(`users/${user.id}/coins`).set(updatedCoins);
        addCloudLog(`🎁 Treuebonus: ${user.id} (${user.username}) erhielt +${PASSIVE_REWARD_COINS} 🪙.`);
    }

    if (timerTextEl) {
        const mins = String(Math.floor(passiveSecondsLeft / 60)).padStart(2, '0');
        const secs = String(passiveSecondsLeft % 60).padStart(2, '0');
        timerTextEl.textContent = `${mins}:${secs}`;
    }
}, 1000);

// ==================== 5. AUTHENTIFIZIERUNG (CLOUD LOGIN & REGISTER) ====================
let authMode = 'login';

const authModal = document.getElementById('auth-modal');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authUsernameInput = document.getElementById('auth-username');
const authPasswordInput = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');

tabLogin.addEventListener('click', () => {
    authMode = 'login';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authTitle.textContent = 'Willkommen im Club';
    authSubtitle.textContent = 'Melden Sie sich mit Ihrem Usernamen und Passwort an.';
    authSubmitBtn.textContent = 'EINLOGGEN';
    authError.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
    authMode = 'register';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    authTitle.textContent = 'Mitgliedschaft erstellen';
    authSubtitle.textContent = 'Sie erhalten automatisch eine feste ID & 2.500 🪙 Startguthaben.';
    authSubmitBtn.textContent = 'REGISTRIEREN';
    authError.classList.add('hidden');
});

async function handleAuthSubmit() {
    initOrUnlockAudio();
    const username = authUsernameInput.value.trim();
    const password = authPasswordInput.value.trim();

    if (username.length < 2 || password.length < 3) {
        authError.textContent = '❌ Username (min. 2 Zeichen) & Passwort (min. 3 Zeichen) eingeben!';
        authError.classList.remove('hidden');
        return;
    }

    authSubmitBtn.disabled = true;

    try {
        const hashedPassword = await sha256(password);

        const snapshot = await db.ref('users').once('value');
        const allUsers = snapshot.val() || {};
        const userList = Object.values(allUsers);

        if (authMode === 'register') {
            const exists = userList.some(u => u.username.toLowerCase() === username.toLowerCase());
            if (exists) {
                authError.textContent = '❌ Dieser Username ist bereits vergeben!';
                authError.classList.remove('hidden');
                authSubmitBtn.disabled = false;
                return;
            }

            let maxNum = 0;
            userList.forEach(u => {
                if (u.idNumber && u.idNumber > maxNum) maxNum = u.idNumber;
            });
            const nextNumber = maxNum + 1;
            const newId = `ID${nextNumber}`;

            const newUser = {
                idNumber: nextNumber,
                id: newId,
                username: username,
                password: hashedPassword,
                coins: 2500,
                rank: 'member',
                banned: false,
                isAdmin: newId === SUPER_ADMIN_ID,
                ownedItems: {},
                equippedTitle: ''
            };

            await db.ref(`users/${newId}`).set(newUser);
            currentUserId = newId;
            localStorage.setItem('neonSlotsCurrentUser', currentUserId);

            authModal.classList.add('hidden');
            addCloudLog(`🆕 Neues Mitglied registriert: ${newId} (${username})`);
        } else {
            const foundUser = userList.find(
                u => u.username.toLowerCase() === username.toLowerCase() && u.password === hashedPassword
            );

            if (!foundUser) {
                authError.textContent = '❌ Falscher Username oder falsches Passwort!';
                authError.classList.remove('hidden');
                authSubmitBtn.disabled = false;
                return;
            }

            currentUserId = foundUser.id;
            localStorage.setItem('neonSlotsCurrentUser', currentUserId);
            updateUI();
            renderLeaderboard();
            authModal.classList.add('hidden');
            addCloudLog(`🔑 Login: ${foundUser.id} (${foundUser.username})`);
        }

        authUsernameInput.value = '';
        authPasswordInput.value = '';
        authError.classList.add('hidden');
    } catch (err) {
        authError.textContent = '❌ Verbindungsfehler zur Cloud-Datenbank!';
        authError.classList.remove('hidden');
        console.error(err);
    }

    authSubmitBtn.disabled = false;
}

authSubmitBtn.addEventListener('click', handleAuthSubmit);
authPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAuthSubmit();
});

document.getElementById('logout-btn').addEventListener('click', () => {
    stopAutoSpin();
    const user = getCurrentUser();
    if (user) addCloudLog(`🚪 Logout: ${user.id} (${user.username})`);
    currentUserId = null;
    localStorage.removeItem('neonSlotsCurrentUser');
    updateUI();
    authModal.classList.remove('hidden');
});

// ==================== 6. UI, SHOP & LIVE LEADERBOARD ====================
const balanceEl = document.getElementById('balance');
const lastWinEl = document.getElementById('last-win');
const lastWinBox = document.querySelector('.last-win-box');
const betInputEl = document.getElementById('bet-input');
const statusEl = document.getElementById('status-text');
const spinBtn = document.getElementById('spin-btn');
const autoSpinBtn = document.getElementById('auto-spin-btn');
const slotCard = document.getElementById('slot-card');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateAutoSpinButtonUI(user) {
    if (!autoSpinBtn) return;
    if (!user || !userOwnsItem(user, 'feature_autospin')) {
        autoSpinBtn.textContent = '🤖 Auto-Spin (🔒 1.500 🪙)';
        autoSpinBtn.classList.remove('auto-active');
        return;
    }
    if (user.coins < AUTO_SPIN_MIN_COINS && !isAutoSpinning) {
        autoSpinBtn.textContent = `🤖 Auto-Spin (ab ${AUTO_SPIN_MIN_COINS} 🪙)`;
        autoSpinBtn.classList.remove('auto-active');
        return;
    }
    if (isAutoSpinning) {
        autoSpinBtn.textContent = '⏹️ Auto-Spin: AN';
        autoSpinBtn.classList.add('auto-active');
    } else {
        autoSpinBtn.textContent = '🤖 Auto-Spin: AUS';
        autoSpinBtn.classList.remove('auto-active');
    }
}

function updateUI() {
    const user = getCurrentUser();
    const profileBadge = document.getElementById('user-profile-badge');
    const cornerBadge = document.getElementById('corner-id-badge');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('open-admin-btn');

    if (user) {
        authModal.classList.add('hidden');
        profileBadge.classList.remove('hidden');
        cornerBadge.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');

        if (adminBtn) {
            if (hasAdminAccess(user)) adminBtn.classList.remove('hidden');
            else adminBtn.classList.add('hidden');
        }

        if (!hasAdminAccess(user) && !dashboardModal.classList.contains('hidden')) {
            dashboardModal.classList.add('hidden');
        }

        const rankInfo = getRankInfo(user.rank);
        const rankBadgeEl = document.getElementById('display-rank-badge');
        rankBadgeEl.textContent = user.equippedTitle ? `${rankInfo.label} • ${user.equippedTitle}` : rankInfo.label;
        rankBadgeEl.className = `rank-pill ${rankInfo.cssClass}`;

        document.getElementById('display-user-id').textContent = user.id;
        document.getElementById('display-username').textContent = user.username;
        document.getElementById('corner-id-text').textContent = `${user.id} (${user.username})`;
        balanceEl.textContent = user.coins.toLocaleString('de-DE');

        const shopBal = document.getElementById('shop-balance-display');
        if (shopBal) shopBal.textContent = user.coins.toLocaleString('de-DE');
    } else {
        profileBadge.classList.add('hidden');
        cornerBadge.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        if (adminBtn) adminBtn.classList.add('hidden');
        if (dashboardModal) dashboardModal.classList.add('hidden');
        balanceEl.textContent = '0';
        authModal.classList.remove('hidden');
    }

    updateAutoSpinButtonUI(user);
}

// ==================== 6B. COIN SHOP LOGIK ====================
const shopModal = document.getElementById('shop-modal');
function openShopModal() {
    renderShop();
    shopModal.classList.remove('hidden');
}

document.getElementById('open-shop-btn').addEventListener('click', openShopModal);
const openShopCabBtn = document.getElementById('open-shop-cabinet-btn');
if (openShopCabBtn) openShopCabBtn.addEventListener('click', openShopModal);

document.getElementById('close-shop-btn').addEventListener('click', () => {
    shopModal.classList.add('hidden');
});

function renderShop() {
    const container = document.getElementById('shop-items-container');
    const user = getCurrentUser();
    if (!container || !user) return;

    container.innerHTML = '';

    SHOP_ITEMS.forEach(item => {
        const owned = userOwnsItem(user, item.id);
        const isEquipped = item.type === 'title' && user.equippedTitle === item.badge;

        let btnHtml = '';
        if (!owned) {
            const canAfford = user.coins >= item.price;
            btnHtml = `<button class="mini-btn" style="width:100%; margin-top:10px; padding:8px; background:${canAfford ? 'var(--gold-btn-gradient)' : 'rgba(255,255,255,0.08)'}; color:${canAfford ? '#080705' : '#888'}; font-weight:800;" onclick="buyShopItem('${item.id}')">Kaufen (${item.price.toLocaleString('de-DE')} 🪙)</button>`;
        } else if (item.type === 'title') {
            btnHtml = `<button class="mini-btn" style="width:100%; margin-top:10px; padding:8px; background:${isEquipped ? 'rgba(212,175,55,0.28)' : 'rgba(212,175,55,0.12)'}; color:var(--gold-light); border-color:var(--gold-main);" onclick="equipShopItem('${item.id}')">${isEquipped ? '✅ Aktiv (Ablegen)' : '✨ Titel anlegen'}</button>`;
        } else {
            btnHtml = `<button class="mini-btn" disabled style="width:100%; margin-top:10px; padding:8px; background:rgba(16,185,129,0.18); color:#34d399; border-color:var(--green-lux);">✅ Freigeschaltet</button>`;
        }

        const card = document.createElement('div');
        card.style.cssText = 'background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;';
        card.innerHTML = `
            <div>
                <div style="font-weight: 800; font-size: 0.96rem; color: var(--gold-light); margin-bottom: 4px;">${item.name}</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.35;">${item.desc}</div>
            </div>
            ${btnHtml}
        `;
        container.appendChild(card);
    });
}

window.buyShopItem = function(itemId) {
    const user = getCurrentUser();
    if (!user) return;
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || userOwnsItem(user, itemId)) return;

    if (user.coins < item.price) {
        alert(`❌ Nicht genug Coins! Du brauchst ${item.price.toLocaleString('de-DE')} 🪙.`);
        return;
    }

    const newCoins = user.coins - item.price;
    db.ref(`users/${user.id}/coins`).set(newCoins);
    db.ref(`users/${user.id}/ownedItems/${itemId}`).set(true);

    if (item.type === 'title') {
        db.ref(`users/${user.id}/equippedTitle`).set(item.badge);
    }

    playSmallWinSound();
    addCloudLog(`🛒 ${user.id} (${user.username}) kaufte "${item.name}" für ${item.price} 🪙.`);
};

window.equipShopItem = function(itemId) {
    const user = getCurrentUser();
    if (!user || !userOwnsItem(user, itemId)) return;
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'title') {
        const nextVal = user.equippedTitle === item.badge ? '' : item.badge;
        db.ref(`users/${user.id}/equippedTitle`).set(nextVal);
    }
};

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    const sortedPlayers = getUsersArray()
        .filter(u => !u.banned)
        .sort((a, b) => b.coins - a.coins);

    if (sortedPlayers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 20px;">Noch keine Spieler registriert.</td></tr>`;
        return;
    }

    sortedPlayers.forEach((player, index) => {
        const place = index + 1;
        const rankInfo = getRankInfo(player.rank);
        const isMe = player.id === currentUserId;

        let placeDisplay = `#${place}`;
        let rowClass = '';
        if (place === 1) { placeDisplay = '🥇 #1'; rowClass = 'top-1'; }
        else if (place === 2) { placeDisplay = '🥈 #2'; rowClass = 'top-2'; }
        else if (place === 3) { placeDisplay = '🥉 #3'; rowClass = 'top-3'; }

        const titleBadge = player.equippedTitle ? ` <span class="cosmetic-tag">${player.equippedTitle}</span>` : '';

        const tr = document.createElement('tr');
        tr.className = `${rowClass} ${isMe ? 'is-me' : ''}`;
        tr.innerHTML = `
            <td class="place-badge">${placeDisplay}</td>
            <td><span class="id-tag">${player.id}</span></td>
            <td><strong>${player.username}</strong>${titleBadge} ${isMe ? '<span style="color:var(--gold-main); font-size:0.78rem;">(Du)</span>' : ''}</td>
            <td><span class="rank-pill ${rankInfo.cssClass}">${rankInfo.label}</span></td>
            <td class="lb-coins">${player.coins.toLocaleString('de-DE')} 🪙</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== 7. RUNDUNG & EINSATZ (MIN. 1 COIN) ====================
function roundBetAmount(value) {
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return 1;

    if (num < 10) return num;
    if (num < 100) return Math.round(num / 10) * 10;
    if (num < 1000) return Math.round(num / 100) * 100;
    if (num < 10000) return Math.round(num / 1000) * 1000;
    return Math.round(num / 10000) * 10000;
}

function applyRoundedBet() {
    const rounded = roundBetAmount(betInputEl.value);
    currentBet = rounded;
    betInputEl.value = rounded;
}

betInputEl.addEventListener('blur', applyRoundedBet);
betInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        applyRoundedBet();
        betInputEl.blur();
    }
});

// ==================== 8. SLOT LOGIK, AUTO-SPIN & HEBEL ====================
const leverAssembly = document.getElementById('lever-assembly');
const leverArm = document.getElementById('lever-arm');

function pullLeverAnimation() {
    if (!leverArm) return;
    leverArm.classList.add('pulled');
    setTimeout(() => leverArm.classList.remove('pulled'), 450);
}

if (leverAssembly) {
    leverAssembly.addEventListener('click', () => {
        if (!spinBtn.disabled) spinBtn.click();
    });
}

function stopAutoSpin() {
    isAutoSpinning = false;
    updateAutoSpinButtonUI(getCurrentUser());
}

autoSpinBtn.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
        authModal.classList.remove('hidden');
        return;
    }
    if (!userOwnsItem(user, 'feature_autospin')) {
        openShopModal();
        return;
    }
    if (!isAutoSpinning && user.coins < AUTO_SPIN_MIN_COINS) {
        alert(`❌ Auto-Spin kann erst ab mindestens ${AUTO_SPIN_MIN_COINS} 🪙 Guthaben aktiviert werden!`);
        return;
    }

    isAutoSpinning = !isAutoSpinning;
    updateAutoSpinButtonUI(user);

    if (isAutoSpinning && !isSpinning) {
        spinBtn.click();
    }
});

function getWeightedRandomSymbol() {
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const sym of symbols) {
        if (random < sym.weight) return sym;
        random -= sym.weight;
    }
    return symbols[0];
}

function generateSpinResults(user) {
    if (userRigQueue[user.id]) {
        const riggedOutcome = userRigQueue[user.id];
        db.ref(`rigs/${user.id}`).remove();

        if (riggedOutcome === 'lose') {
            addCloudLog(`💀 Programmierte Niete für ${user.id} (${user.username}) ausgeführt.`);
            return [symbols[0], symbols[1], symbols[2]];
        }

        const targetSym = symbols.find(s => s.key === riggedOutcome);
        if (targetSym) {
            addCloudLog(`⚡ Programmierter Hit (${targetSym.icon} ${targetSym.multiplier}x) für ${user.id} ausgelöst!`);
            return [targetSym, targetSym, targetSym];
        }
    }

    return [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()];
}

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;

    const user = getCurrentUser();
    if (!user) {
        stopAutoSpin();
        authModal.classList.remove('hidden');
        return;
    }

    if (user.banned) {
        stopAutoSpin();
        statusEl.classList.remove('status-win');
        statusEl.textContent = '🚫 Ihr Account wurde gesperrt!';
        return;
    }

    applyRoundedBet();

    if (user.coins < currentBet) {
        stopAutoSpin();
        statusEl.classList.remove('status-win');
        statusEl.textContent = '❌ Nicht genug Guthaben für diesen Einsatz!';
        return;
    }

    playLeverPullSound();
    pullLeverAnimation();

    isSpinning = true;
    spinBtn.disabled = true;
    betInputEl.disabled = true;

    const newBalanceAfterBet = user.coins - currentBet;
    db.ref(`users/${user.id}/coins`).set(newBalanceAfterBet);

    slotCard.classList.remove('shake');
    statusEl.classList.remove('status-win');
    statusEl.textContent = 'Walzen drehen...';
    addCloudLog(`🎰 ${user.id} (${user.username}) setzt ${currentBet} 🪙`);

    reels.forEach(reel => {
        reel.classList.remove('landed', 'win-glow');
        reel.classList.add('spinning');
    });

    const hasTurbo = userOwnsItem(user, 'feature_turbo');
    const baseDelay = hasTurbo ? 450 : 1000;
    const stepDelay = hasTurbo ? 220 : 500;

    const spinIntervals = reels.map(reel => {
        const symSpan = reel.querySelector('.reel-symbol');
        return setInterval(() => {
            const randSym = symbols[Math.floor(Math.random() * symbols.length)];
            symSpan.textContent = randSym.icon;
        }, 70);
    });

    const results = generateSpinResults(user);

    results.forEach((result, index) => {
        setTimeout(() => {
            clearInterval(spinIntervals[index]);
            const reel = reels[index];
            const symSpan = reel.querySelector('.reel-symbol');

            reel.classList.remove('spinning');
            symSpan.textContent = result.icon;
            playReelStopSound(index);

            void reel.offsetWidth;
            reel.classList.add('landed');

            if (index === reels.length - 1) {
                checkWin(results);
                isSpinning = false;
                spinBtn.disabled = false;
                betInputEl.disabled = false;

                const freshUser = getCurrentUser();
                if (isAutoSpinning) {
                    if (!freshUser || freshUser.coins < AUTO_SPIN_MIN_COINS || freshUser.coins < currentBet) {
                        stopAutoSpin();
                        statusEl.textContent = `⏹️ Auto-Spin gestoppt (Guthaben unter ${AUTO_SPIN_MIN_COINS} 🪙).`;
                    } else {
                        setTimeout(() => {
                            if (isAutoSpinning && !isSpinning) spinBtn.click();
                        }, hasTurbo ? 350 : 750);
                    }
                }
            }
        }, baseDelay + index * stepDelay);
    });
});

function updateLastWin(amount) {
    lastWinEl.textContent = amount.toLocaleString('de-DE');
    if (amount > 0) lastWinBox.classList.add('highlight-win');
    else lastWinBox.classList.remove('highlight-win');
}

function checkWin(results) {
    const [r1, r2, r3] = results;
    const user = getCurrentUser();
    if (!user) return;

    const rankInfo = getRankInfo(user.rank);
    const rankBonus = rankInfo.bonus;
    const bonusPercent = Math.round((rankBonus - 1) * 100);

    if (r1.icon === r2.icon && r2.icon === r3.icon) {
        const winAmount = Math.round(currentBet * r1.multiplier * rankBonus);
        db.ref(`users/${user.id}/coins`).set(user.coins + winAmount);
        updateLastWin(winAmount);

        reels.forEach(r => r.classList.add('win-glow'));
        slotCard.classList.add('shake');

        statusEl.classList.add('status-win');
        statusEl.textContent = `🎉 ${r1.multiplier}x TREFFER! ${bonusPercent > 0 ? `(+${bonusPercent}% Rang-Bonus) ` : ''}Gewinn: ${winAmount.toLocaleString('de-DE')} 🪙!`;
        addCloudLog(`🎉 ${r1.multiplier}x GEWINN für ${user.id} (${user.username}): +${winAmount} 🪙 (${r1.icon}${r2.icon}${r3.icon})`);

        if (r1.multiplier >= 15) {
            playJackpotFanfareSound();
            triggerMegaWinAnimation(user, r1, winAmount);
            pushGlobalBroadcast(
                `🏆 MEGA-GEWINNER: [${rankInfo.label}] ${user.username} (${user.id}) hat ${r1.icon}${r2.icon}${r3.icon} (${r1.multiplier}x) gehittet und ${winAmount.toLocaleString('de-DE')} 🪙 gewonnen!`,
                true
            );
        } else {
            playSmallWinSound();
        }
    } else if (r1.icon === r2.icon || r2.icon === r3.icon || r1.icon === r3.icon) {
        const smallWin = Math.floor(currentBet * 0.5 * rankBonus);
        db.ref(`users/${user.id}/coins`).set(user.coins + smallWin);
        updateLastWin(smallWin);
        playSmallWinSound();
        statusEl.classList.add('status-win');
        statusEl.textContent = `✨ 2 Gleiche! Sie erhalten ${smallWin.toLocaleString('de-DE')} 🪙 zurück.`;
    } else {
        playLoseSound();
        updateLastWin(0);
        statusEl.classList.remove('status-win');
        statusEl.textContent = 'Kein Treffer. Versuchen Sie es erneut.';
    }
}

function triggerMegaWinAnimation(user, symbolObj, winAmount) {
    const overlay = document.getElementById('mega-win-overlay');
    const badge = document.getElementById('mega-win-badge');
    const icons = document.getElementById('mega-win-icons');
    const title = document.getElementById('mega-win-title');
    const counterEl = document.getElementById('mega-win-counter');
    const confettiContainer = document.getElementById('confetti-container');

    icons.textContent = `${symbolObj.icon} ${symbolObj.icon} ${symbolObj.icon}`;

    if (symbolObj.key === 'cosmic') {
        badge.textContent = '🌌 MYTHIC COSMIC DRAGON 1000x 🌌';
        title.textContent = 'UNFASSBARER JACKPOT!';
    } else if (symbolObj.key === 'crown') {
        badge.textContent = '👑 ULTRA-RARE GOD CROWN 250x 👑';
        title.textContent = 'LEGENDÄRER GEWINN!';
    } else if (symbolObj.key === 'seven') {
        badge.textContent = '7️⃣ TRIPLE SEVEN JACKPOT 50x 7️⃣';
        title.textContent = 'MEGA JACKPOT!';
    } else {
        badge.textContent = '💎 DIAMOND SUPER HIT 15x 💎';
        title.textContent = 'BIG WIN!';
    }

    confettiContainer.innerHTML = '';
    const rainIcons = ['🪙', '💰', symbolObj.icon, '✨', '👑'];
    for (let i = 0; i < 55; i++) {
        const drop = document.createElement('div');
        drop.className = 'falling-coin';
        drop.textContent = rainIcons[Math.floor(Math.random() * rainIcons.length)];
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.animationDuration = (1.8 + Math.random() * 2.2) + 's';
        drop.style.animationDelay = (Math.random() * 0.8) + 's';
        confettiContainer.appendChild(drop);
    }

    overlay.classList.remove('hidden');

    let currentDisplay = 0;
    const steps = 35;
    const increment = Math.ceil(winAmount / steps);
    const countInterval = setInterval(() => {
        currentDisplay += increment;
        if (currentDisplay >= winAmount) {
            currentDisplay = winAmount;
            clearInterval(countInterval);
        }
        counterEl.textContent = currentDisplay.toLocaleString('de-DE');
    }, 35);
}

document.getElementById('close-mega-win').addEventListener('click', () => {
    document.getElementById('mega-win-overlay').classList.add('hidden');
});

function showGlobalBanner(text, isWinnerBanner = false) {
    const banner = document.getElementById('broadcast-banner');
    const bannerText = document.getElementById('broadcast-text');
    bannerText.textContent = text;

    if (isWinnerBanner) banner.classList.add('winner-announce');
    else banner.classList.remove('winner-announce');

    banner.classList.remove('hidden');
}

document.getElementById('close-broadcast').addEventListener('click', () => {
    document.getElementById('broadcast-banner').classList.add('hidden');
});

// ==================== 9. EXECUTIVE ADMIN KONSOLE (ROLLEN-BASIERT & ID1 OWNER) ====================
const dashboardModal = document.getElementById('admin-dashboard-modal');

function openExecutiveConsole() {
    const user = getCurrentUser();
    if (!hasAdminAccess(user)) {
        alert('🚫 Zugriff verweigert! Sie besitzen keine Admin-Berechtigung.');
        return;
    }

    dashboardModal.classList.remove('hidden');
    renderAdminPlayers();
    renderActiveRigs();
    addCloudLog(`🔓 Executive Admin Konsole durch ${user.id} (${user.username}) geöffnet.`);
}

document.getElementById('open-admin-btn').addEventListener('click', openExecutiveConsole);

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openExecutiveConsole();
    }
});

document.getElementById('close-dashboard-modal').addEventListener('click', () => dashboardModal.classList.add('hidden'));

function findPlayerByIdInput(rawInput) {
    const cleaned = rawInput.trim().toUpperCase();
    const formattedId = cleaned.startsWith('ID') ? cleaned : `ID${cleaned}`;
    return usersMap[formattedId] || null;
}

function modifyCoinsById(action) {
    if (!hasAdminAccess(getCurrentUser())) return;

    const rawId = document.getElementById('target-id-input').value;
    const amount = parseInt(document.getElementById('admin-coin-amount').value, 10);

    if (!rawId || isNaN(amount) || amount < 0) {
        alert('Bitte gültige ID (z. B. ID1) und Betrag eingeben!');
        return;
    }

    const targetUser = findPlayerByIdInput(rawId);
    if (!targetUser) {
        alert(`Kein Account mit der ID "${rawId}" gefunden!`);
        return;
    }

    let updatedCoins = targetUser.coins;
    if (action === 'give') {
        updatedCoins += amount;
        addCloudLog(`💰 Admin gab ${targetUser.id} (${targetUser.username}) +${amount} 🪙.`);
    } else if (action === 'remove') {
        updatedCoins = Math.max(0, updatedCoins - amount);
        addCloudLog(`💸 Admin zog ${targetUser.id} (${targetUser.username}) -${amount} 🪙 ab.`);
    } else if (action === 'set') {
        updatedCoins = amount;
        addCloudLog(`⚖️ Admin setzte ${targetUser.id} (${targetUser.username}) auf ${amount} 🪙.`);
    }

    db.ref(`users/${targetUser.id}/coins`).set(updatedCoins);
}

document.getElementById('admin-give-coins').addEventListener('click', () => modifyCoinsById('give'));
document.getElementById('admin-remove-coins').addEventListener('click', () => modifyCoinsById('remove'));
document.getElementById('admin-set-coins').addEventListener('click', () => modifyCoinsById('set'));

document.getElementById('admin-set-rank-btn').addEventListener('click', () => {
    if (!hasAdminAccess(getCurrentUser())) return;

    const rawId = document.getElementById('target-id-input').value;
    const selectedRank = document.getElementById('admin-rank-select').value;

    if (!rawId) {
        alert('Bitte oben eine Ziel-ID eingeben (z. B. ID1)!');
        return;
    }

    const targetUser = findPlayerByIdInput(rawId);
    if (!targetUser) {
        alert(`Kein Account mit der ID "${rawId}" gefunden!`);
        return;
    }

    const rankInfo = getRankInfo(selectedRank);
    db.ref(`users/${targetUser.id}/rank`).set(selectedRank);
    addCloudLog(`🎖️ Rang von ${targetUser.id} (${targetUser.username}) geändert auf: ${rankInfo.label}`);
});

document.getElementById('admin-rain-btn').addEventListener('click', () => {
    if (!hasAdminAccess(getCurrentUser())) return;

    const amount = parseInt(document.getElementById('rain-amount-input').value, 10);
    const userList = getUsersArray();
    if (isNaN(amount) || amount <= 0 || userList.length === 0) return;

    userList.forEach(u => {
        if (!u.banned) {
            db.ref(`users/${u.id}/coins`).set(u.coins + amount);
        }
    });
    addCloudLog(`🌧️ COIN-RAIN! Alle (${userList.length}) Spieler erhielten +${amount} 🪙!`);
    pushGlobalBroadcast(`🌧️ ADMIN COIN-RAIN! Alle Spieler haben soeben +${amount.toLocaleString('de-DE')} 🪙 geschenkt bekommen!`, true);
});

document.getElementById('trigger-user-spin-btn').addEventListener('click', () => {
    if (!hasAdminAccess(getCurrentUser())) return;

    const rawId = document.getElementById('rig-user-id-input').value;
    const outcome = document.getElementById('rig-outcome-select').value;

    if (!rawId) {
        alert('Bitte eine Ziel-ID eingeben (z. B. ID1)!');
        return;
    }

    const targetUser = findPlayerByIdInput(rawId);
    if (!targetUser) {
        alert(`Kein Account mit der ID "${rawId}" gefunden!`);
        return;
    }

    db.ref(`rigs/${targetUser.id}`).set(outcome);
    addCloudLog(`🎯 Nächster Spin für ${targetUser.id} (${targetUser.username}) auf [${outcome.toUpperCase()}] programmiert!`);
});

function renderActiveRigs() {
    const container = document.getElementById('active-rigs-list');
    if (!container) return;
    container.innerHTML = '';
    const entries = Object.entries(userRigQueue);

    if (entries.length === 0) {
        container.innerHTML = '<span style="color: var(--text-muted);">Keine aktiven Spin-Trigger in der Warteschlange.</span>';
        return;
    }

    entries.forEach(([uid, outcome]) => {
        const div = document.createElement('div');
        div.innerHTML = `⏳ Aktiv für <strong>${uid}</strong>: Nächster Spin = <strong>${outcome.toUpperCase()}</strong>`;
        container.appendChild(div);
    });
}

function renderAdminPlayers() {
    const listContainer = document.getElementById('player-list-container');
    if (!listContainer) return;

    const currentUser = getCurrentUser();
    const canManageAdmins = isSuperAdmin(currentUser);
    const userList = getUsersArray();

    document.getElementById('total-users-count').textContent = userList.length;
    listContainer.innerHTML = '';

    userList.forEach(user => {
        const rankInfo = getRankInfo(user.rank);
        const targetIsOwner = user.id === SUPER_ADMIN_ID;
        const targetIsAdmin = user.isAdmin === true;

        let roleTag = '';
        if (targetIsOwner) {
            roleTag = `<span style="background: rgba(212,175,55,0.2); color: var(--gold-light); border: 1px solid var(--gold-main); padding: 2px 6px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">👑 OWNER</span>`;
        } else if (targetIsAdmin) {
            roleTag = `<span style="background: rgba(212,175,55,0.12); color: var(--gold-main); border: 1px solid rgba(212,175,55,0.35); padding: 2px 6px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">🛡️ ADMIN</span>`;
        }

        let adminToggleBtn = '';
        if (canManageAdmins && !targetIsOwner) {
            adminToggleBtn = `
                <button class="mini-btn mini-select" onclick="toggleAdminRole('${user.id}')">
                    ${targetIsAdmin ? '- Admin' : '+ Admin'}
                </button>
            `;
        }

        const banBtn = targetIsOwner ? '' : `
            <button class="mini-btn mini-ban" onclick="toggleBan('${user.id}')">${user.banned ? 'Entbannen' : 'Bannen'}</button>
        `;

        const item = document.createElement('div');
        item.className = `player-item ${user.banned ? 'banned' : ''}`;
        item.innerHTML = `
            <div>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                    <span class="id-tag">${user.id}</span>
                    <strong>${user.username}</strong>
                    ${roleTag}
                    <span class="rank-pill ${rankInfo.cssClass}">${rankInfo.label}</span>
                </div>
                <span style="color: var(--gold-light); font-size: 0.85rem; font-weight:700;">${user.coins.toLocaleString('de-DE')} 🪙</span>
            </div>
            <div class="player-actions">
                <button class="mini-btn mini-select" onclick="selectIdForAdmin('${user.id}')">ID wählen</button>
                ${adminToggleBtn}
                ${banBtn}
            </div>
        `;
        listContainer.appendChild(item);
    });
}

window.selectIdForAdmin = function(id) {
    document.getElementById('target-id-input').value = id;
    document.getElementById('rig-user-id-input').value = id;
};

window.toggleAdminRole = function(id) {
    const currentUser = getCurrentUser();
    if (!isSuperAdmin(currentUser)) {
        alert('🚫 Nur ID1 darf Admin-Rechte vergeben oder entziehen!');
        return;
    }
    if (id === SUPER_ADMIN_ID) return;

    const targetUser = usersMap[id];
    if (targetUser) {
        const newAdminStatus = !targetUser.isAdmin;
        db.ref(`users/${id}/isAdmin`).set(newAdminStatus);
        addCloudLog(`${newAdminStatus ? '🛡️' : '🔻'} Super-Admin ${currentUser.id} hat ${targetUser.id} (${targetUser.username}) Admin-Rechte ${newAdminStatus ? 'gegeben' : 'entzogen'}.`);
    }
};

window.toggleBan = function(id) {
    if (!hasAdminAccess(getCurrentUser())) return;
    if (id === SUPER_ADMIN_ID) {
        alert('🚫 Der Owner-Account ID1 kann nicht gebannt werden!');
        return;
    }

    const user = usersMap[id];
    if (user) {
        const newStatus = !user.banned;
        db.ref(`users/${id}/banned`).set(newStatus);
        addCloudLog(`${newStatus ? '🚫' : '✅'} Account ${user.id} (${user.username}) wurde ${newStatus ? 'gesperrt' : 'entsperrt'}.`);
    }
};

document.getElementById('send-broadcast-btn').addEventListener('click', () => {
    if (!hasAdminAccess(getCurrentUser())) return;

    const text = document.getElementById('admin-broadcast-input').value.trim();
    if (!text) return;
    pushGlobalBroadcast(`📢 ADMIN NACHRICHT: ${text}`, false);
    addCloudLog(`📢 Broadcast gesendet: "${text}"`);
});

document.getElementById('clear-logs-btn').addEventListener('click', () => {
    if (!isSuperAdmin(getCurrentUser())) {
        alert('🚫 Nur ID1 darf das System-Protokoll komplett löschen!');
        return;
    }
    db.ref('logs').remove();
});
