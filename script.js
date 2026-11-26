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

function playWheelTickSound() {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(860, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.03);
        gain.gain.setValueAtTime(0.075, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
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
const START_COINS_DEFAULT = 2500;
const AUTO_SPIN_MIN_COINS = 500;
const PASSIVE_REWARD_COINS = 10;
const PASSIVE_INTERVAL_SEC = 300; // 5 Minuten
const BROKE_THRESHOLD_COINS = 10;
const BROKE_QUIZ_REWARD = 250;
const WHEEL_SPIN_COST = 1000;

const RANKS = {
    member:  { label: '👤 Member',            bonus: 1.00, cssClass: 'rank-member' },
    bronze:  { label: '🥉 Bronze Club',       bonus: 1.05, cssClass: 'rank-bronze' },
    silver:  { label: '🥈 Silver Lounge',     bonus: 1.10, cssClass: 'rank-silver' },
    gold:    { label: '🥇 Gold Reserve',      bonus: 1.15, cssClass: 'rank-gold' },
    diamond: { label: '💎 Diamond Elite',     bonus: 1.25, cssClass: 'rank-diamond' },
    royal:   { label: '👑 Royal High-Roller', bonus: 1.40, cssClass: 'rank-royal' },
    emperor: { label: '⚡ Aurelia Emperor',   bonus: 1.50, cssClass: 'rank-emperor' }
};

const RANK_ORDER = ['member', 'bronze', 'silver', 'gold', 'diamond', 'royal', 'emperor'];

const BOOSTERS = {
    boost_luck: {
        id: 'boost_luck',
        shortName: '🍀 Fortuna-Elixier',
        name: '🍀 Fortuna-Elixier (3 Min.)',
        durationSec: 180,
        price: 2000,
        desc: 'Erhöht für 3 Minuten deutlich die Chance auf 3er-Treffer.'
    },
    boost_cashback: {
        id: 'boost_cashback',
        shortName: '💸 Cashback-Schild',
        name: '💸 Cashback-Schild (5 Min.)',
        durationSec: 300,
        price: 2500,
        desc: 'Erstattet für 5 Minuten 25% deines Einsatzes bei jeder Niete.'
    },
    boost_mult15: {
        id: 'boost_mult15',
        shortName: '⚡ 1.5x Gold-Rausch',
        name: '⚡ 1.5x Gold-Rausch (4 Min.)',
        durationSec: 240,
        price: 3500,
        desc: 'Erhöht alle Slot-Gewinne für 4 Minuten um +50% (×1,5).'
    },
    boost_mult20: {
        id: 'boost_mult20',
        shortName: '👑 2x Overdrive',
        name: '👑 2x Imperial Overdrive (2 Min.)',
        durationSec: 120,
        price: 6000,
        desc: 'Verdoppelt alle Slot-Gewinne (×2,0) für 2 Minuten!'
    },
    admin_magnet: {
        id: 'admin_magnet',
        shortName: '🧲 Glücks-Magnet',
        name: '🧲 Magnet-Walzen (60s God-Mode)',
        durationSec: 60,
        price: 0,
        desc: 'Admin God-Mode-Buff: Fast jeder Spin wird ein Gewinn!'
    }
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
        id: 'boost_luck',
        type: 'booster',
        boosterId: 'boost_luck',
        name: BOOSTERS.boost_luck.name,
        price: BOOSTERS.boost_luck.price,
        desc: BOOSTERS.boost_luck.desc
    },
    {
        id: 'boost_cashback',
        type: 'booster',
        boosterId: 'boost_cashback',
        name: BOOSTERS.boost_cashback.name,
        price: BOOSTERS.boost_cashback.price,
        desc: BOOSTERS.boost_cashback.desc
    },
    {
        id: 'boost_mult15',
        type: 'booster',
        boosterId: 'boost_mult15',
        name: BOOSTERS.boost_mult15.name,
        price: BOOSTERS.boost_mult15.price,
        desc: BOOSTERS.boost_mult15.desc
    },
    {
        id: 'boost_mult20',
        type: 'booster',
        boosterId: 'boost_mult20',
        name: BOOSTERS.boost_mult20.name,
        price: BOOSTERS.boost_mult20.price,
        desc: BOOSTERS.boost_mult20.desc
    },
    {
        id: 'rank_bronze',
        type: 'rank',
        rankKey: 'bronze',
        name: '🥉 Rang: Bronze Club (+5%)',
        price: 25000,
        desc: 'Dauerhafter +5% Gewinn-Bonus auf alle Treffer.'
    },
    {
        id: 'rank_silver',
        type: 'rank',
        rankKey: 'silver',
        name: '🥈 Rang: Silver Lounge (+10%)',
        price: 75000,
        desc: 'Dauerhafter +10% Gewinn-Bonus auf alle Treffer.'
    },
    {
        id: 'rank_gold',
        type: 'rank',
        rankKey: 'gold',
        name: '🥇 Rang: Gold Reserve (+15%)',
        price: 200000,
        desc: 'Dauerhafter +15% Gewinn-Bonus auf alle Treffer.'
    },
    {
        id: 'rank_diamond',
        type: 'rank',
        rankKey: 'diamond',
        name: '💎 Rang: Diamond Elite (+25%)',
        price: 500000,
        desc: 'Dauerhafter +25% Gewinn-Bonus auf alle Treffer. (Royal & Emperor nur per Admin!)'
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
    { key: 'cherry',  icon: '🍒', multiplier: 2,    weight: 34 },
    { key: 'lemon',   icon: '🍋', multiplier: 3,    weight: 27 },
    { key: 'bell',    icon: '🔔', multiplier: 5,    weight: 18 },
    { key: 'diamond', icon: '💎', multiplier: 15,   weight: 11.5 },
    { key: 'seven',   icon: '7️⃣', multiplier: 50,   weight: 5.8 },
    { key: 'crown',   icon: '👑', multiplier: 250,  weight: 2.5 },
    { key: 'cosmic',  icon: '🌌', multiplier: 1000, weight: 1.2 }
];

const LUCKY_MATCH_WEIGHTS = [45, 30, 16, 6.5, 2.0, 0.4, 0.1];

const WHEEL_SEGMENTS = [
    { id: 'w_lose',      label: '💀 Niete',          short: '💀 0',      type: 'coins',   value: 0,              prob: 28.00, color: '#171411', textColor: '#9c9588' },
    { id: 'w_400',       label: '🪙 400 🪙',         short: '400 🪙',    type: 'coins',   value: 400,            prob: 26.00, color: '#5c0303', textColor: '#fcf6ba' },
    { id: 'w_800',       label: '🪙 800 🪙',         short: '800 🪙',    type: 'coins',   value: 800,            prob: 20.00, color: '#0b1956', textColor: '#fcf6ba' },
    { id: 'w_1500',      label: '💰 1.500 🪙',       short: '1.5K 🪙',   type: 'coins',   value: 1500,           prob: 13.00, color: '#3b0202', textColor: '#fcf6ba' },
    { id: 'w_3000',      label: '💰 3.000 🪙',       short: '3K 🪙',     type: 'coins',   value: 3000,           prob: 6.00,  color: '#152b8c', textColor: '#fcf6ba' },
    { id: 'w_10000',     label: '💎 10.000 🪙',      short: '10K 🪙',    type: 'coins',   value: 10000,          prob: 1.20,  color: '#78551a', textColor: '#fcf6ba' },
    { id: 'w_luck',      label: '🍀 Fortuna (3m)',   short: '🍀 3m',     type: 'booster', value: 'boost_luck',   prob: 2.20,  color: '#064e3b', textColor: '#6ee7b7' },
    { id: 'w_cashback',  label: '💸 Cashback (5m)',  short: '💸 5m',     type: 'booster', value: 'boost_cashback', prob: 1.60, color: '#1e3a8a', textColor: '#93c5fd' },
    { id: 'w_mult15',    label: '⚡ 1.5x Boost (4m)',short: '⚡ 1.5x',   type: 'booster', value: 'boost_mult15', prob: 1.10,  color: '#713f12', textColor: '#fde047' },
    { id: 'w_mult20',    label: '👑 2x Boost (2m)',  short: '👑 2x',     type: 'booster', value: 'boost_mult20', prob: 0.50,  color: '#881337', textColor: '#fda4af' },
    { id: 'w_bronze',    label: '🥉 Bronze Club',    short: '🥉 Bronze',  type: 'rank',    value: 'bronze',       dupCoins: 5000,  prob: 0.25, color: '#432818', textColor: '#ffedd8' },
    { id: 'w_silver',    label: '🥈 Silver Lounge',  short: '🥈 Silver',  type: 'rank',    value: 'silver',       dupCoins: 10000, prob: 0.10, color: '#334155', textColor: '#f8fafc' },
    { id: 'w_gold',      label: '🥇 Gold Reserve',   short: '🥇 Gold',    type: 'rank',    value: 'gold',         dupCoins: 25000, prob: 0.04, color: '#b38728', textColor: '#080705' },
    { id: 'w_diamond',   label: '💎 Diamond Elite',  short: '💎 Diamond', type: 'rank',    value: 'diamond',      dupCoins: 50000, prob: 0.01, color: '#0284c7', textColor: '#e0f2fe' }
];

// ==================== 3B. ALLGEMEINWISSEN QUIZ-POOL (24 FRAGEN) ====================
const QUIZ_QUESTIONS_POOL = [
    { q: "Welcher Planet ist der Sonne am nächsten?", options: ["Merkur", "Venus", "Mars", "Jupiter"], answer: 0 },
    { q: "Wie viele Bundesländer hat Deutschland?", options: ["14", "15", "16", "17"], answer: 2 },
    { q: "Was ist die Hauptstadt von Australien?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
    { q: "Welches chemische Element hat das Symbol 'Au'?", options: ["Silber", "Gold", "Aluminium", "Argon"], answer: 1 },
    { q: "Wie viele Kontinente gibt es auf der Erde?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "Wer malte die Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"], answer: 2 },
    { q: "Wie viele Sekunden hat eine Stunde?", options: ["1.200", "2.400", "3.600", "6.000"], answer: 2 },
    { q: "Welches ist das größte Säugetier der Welt?", options: ["Afrikanischer Elefant", "Blauwal", "Giraffe", "Weißer Hai"], answer: 1 },
    { q: "In welchem Jahr fiel die Berliner Mauer?", options: ["1987", "1989", "1990", "1991"], answer: 1 },
    { q: "Wie viele Zähne hat ein erwachsener Mensch normalerweise (inkl. Weisheitszähne)?", options: ["28", "30", "32", "34"], answer: 2 },
    { q: "Welcher Ozean ist der größte der Erde?", options: ["Atlantik", "Indischer Ozean", "Pazifischer Ozean", "Arktischer Ozean"], answer: 2 },
    { q: "Was ist die Hauptstadt von Japan?", options: ["Kyoto", "Osaka", "Tokio", "Hiroshima"], answer: 2 },
    { q: "Wie viele Spieler stehen bei einem Fußballspiel pro Mannschaft auf dem Platz?", options: ["9", "10", "11", "12"], answer: 2 },
    { q: "Welches Gas atmen Pflanzen hauptsächlich ein, um Photosynthese zu betreiben?", options: ["Sauerstoff", "Kohlendioxid", "Stickstoff", "Helium"], answer: 1 },
    { q: "Wie viele Farben hat ein klassischer Regenbogen?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "Welches Land hat die größte Fläche der Welt?", options: ["Kanada", "China", "USA", "Russland"], answer: 3 },
    { q: "Was ergibt 12 × 12?", options: ["124", "144", "154", "164"], answer: 1 },
    { q: "Welches Organ pumpt Blut durch den menschlichen Körper?", options: ["Lunge", "Leber", "Herz", "Niere"], answer: 2 },
    { q: "Wie heißt der höchste Berg der Erde?", options: ["K2", "Zugspitze", "Mount Everest", "Kilimandscharo"], answer: 2 },
    { q: "In welchem Land stehen die Pyramiden von Gizeh?", options: ["Mexiko", "Ägypten", "Peru", "Marokko"], answer: 1 },
    { q: "Wie viele Tage hat ein Schaltjahr?", options: ["364", "365", "366", "367"], answer: 2 },
    { q: "Welches Tier ist das schnellste Landtier der Welt?", options: ["Löwe", "Gepard", "Pferd", "Antilope"], answer: 1 },
    { q: "Was ist das härteste natürliche Mineral der Welt?", options: ["Quarz", "Rubin", "Diamant", "Smaragd"], answer: 2 },
    { q: "Wie heißt die Hauptstadt von Spanien?", options: ["Barcelona", "Sevilla", "Madrid", "Valencia"], answer: 2 }
];

// ==================== 4. LIVE CLOUD-SYNCHRONISATION ====================
let usersMap = {};
let userRigQueue = {};
let currentUserId = localStorage.getItem('neonSlotsCurrentUser') || null;
let lastBroadcastTimestamp = 0;

let currentBet = 50;
let isSpinning = false;
let isWheelSpinning = false;
let isAutoSpinning = false;
let passiveSecondsLeft = PASSIVE_INTERVAL_SEC;
let brokePopupDismissedThisRound = false;
let isSlowMoNextSpin = false;
let runawayActive = false;
let activeGameMode = 'slots';
let wheelRotationRad = 0;

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

function getRankIndex(rankKey) {
    const idx = RANK_ORDER.indexOf(rankKey);
    return idx === -1 ? 0 : idx;
}

function hasActiveBooster(user, boosterId) {
    if (!user || !user.activeBoosters) return false;
    const expiresAt = user.activeBoosters[boosterId];
    return typeof expiresAt === 'number' && expiresAt > Date.now();
}

function getActiveBoosters(user) {
    if (!user || !user.activeBoosters) return [];
    const now = Date.now();
    return Object.entries(user.activeBoosters)
        .filter(([id, expiresAt]) => BOOSTERS[id] && typeof expiresAt === 'number' && expiresAt > now)
        .map(([id, expiresAt]) => ({
            id,
            config: BOOSTERS[id],
            expiresAt,
            remainingSec: Math.ceil((expiresAt - now) / 1000)
        }));
}

function formatDurationMMSS(totalSeconds) {
    const secs = Math.max(0, Math.floor(totalSeconds));
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function activateBoosterForUser(user, boosterId) {
    const booster = BOOSTERS[boosterId];
    if (!user || !booster) return;
    const now = Date.now();
    const existing = (user.activeBoosters && user.activeBoosters[boosterId]) || 0;
    const baseTime = existing > now ? existing : now;
    const nextExpiry = baseTime + booster.durationSec * 1000;
    db.ref(`users/${user.id}/activeBoosters/${boosterId}`).set(nextExpiry);
}

function renderActiveBoostersBar(user) {
    const bar = document.getElementById('active-boosters-bar');
    if (!bar) return;
    const active = getActiveBoosters(user);
    if (!user || active.length === 0) {
        bar.classList.add('hidden');
        bar.innerHTML = '';
        return;
    }

    bar.classList.remove('hidden');
    bar.innerHTML = active
        .map(b => `<span class="booster-pill">${b.config.shortName} <strong>${formatDurationMMSS(b.remainingSec)}</strong></span>`)
        .join('');
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

// ==================== 4B. 5-MINUTEN GRATIS-COINS & BOOSTER TIMER ====================
setInterval(() => {
    const user = getCurrentUser();
    const timerTextEl = document.getElementById('passive-timer-text');
    if (!user || user.banned) {
        if (timerTextEl) timerTextEl.textContent = '05:00';
        renderActiveBoostersBar(null);
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

    renderActiveBoostersBar(user);
    const shopModalEl = document.getElementById('shop-modal');
    if (shopModalEl && !shopModalEl.classList.contains('hidden')) {
        updateShopBoosterTimers(user);
    }
}, 1000);

// ==================== 4C. PENNER-RETTUNGS & QUIZ LOGIK (< 10 COINS) ====================
const brokeQuizModal = document.getElementById('broke-quiz-modal');
const brokeIntroView = document.getElementById('broke-intro-view');
const brokeQuizView = document.getElementById('broke-quiz-view');
const brokeResultView = document.getElementById('broke-result-view');

let activeQuizQuestions = [];
let currentQuizIndex = 0;
let currentQuizCorrectCount = 0;
let quizAnswerLocked = false;

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function checkAndShowBrokePopup(forceOpen = false) {
    const user = getCurrentUser();
    if (!user || user.banned || isSpinning || !brokeQuizModal) return;

    if (user.coins < BROKE_THRESHOLD_COINS) {
        if (!forceOpen && brokePopupDismissedThisRound) return;
        if (!brokeQuizModal.classList.contains('hidden')) return;

        brokeIntroView.classList.remove('hidden');
        brokeQuizView.classList.add('hidden');
        brokeResultView.classList.add('hidden');
        brokeQuizModal.classList.remove('hidden');
    } else {
        brokePopupDismissedThisRound = false;
        brokeQuizModal.classList.add('hidden');
    }
}

function startBrokeQuiz() {
    activeQuizQuestions = shuffleArray(QUIZ_QUESTIONS_POOL).slice(0, 5);
    currentQuizIndex = 0;
    currentQuizCorrectCount = 0;
    quizAnswerLocked = false;

    brokeIntroView.classList.add('hidden');
    brokeResultView.classList.add('hidden');
    brokeQuizView.classList.remove('hidden');

    renderCurrentQuizQuestion();
}

function renderCurrentQuizQuestion() {
    const qObj = activeQuizQuestions[currentQuizIndex];
    quizAnswerLocked = false;

    document.getElementById('quiz-progress-text').textContent = `Frage ${currentQuizIndex + 1} / 5`;
    document.getElementById('quiz-score-text').textContent = `Richtig: ${currentQuizCorrectCount}`;
    document.getElementById('quiz-question-text').textContent = qObj.q;

    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    qObj.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mini-btn';
        btn.style.cssText = 'width: 100%; padding: 12px 14px; font-size: 0.95rem; text-align: left; background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.3); color: #fff; border-radius: 10px; transition: all 0.2s;';
        btn.textContent = `${['A', 'B', 'C', 'D'][idx]}. ${optText}`;
        btn.addEventListener('click', () => handleQuizAnswer(idx, btn));
        optionsContainer.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex, clickedBtn) {
    if (quizAnswerLocked) return;
    quizAnswerLocked = true;

    const qObj = activeQuizQuestions[currentQuizIndex];
    const allBtns = document.getElementById('quiz-options-container').querySelectorAll('button');
    const isCorrect = selectedIndex === qObj.answer;

    if (isCorrect) {
        currentQuizCorrectCount++;
        clickedBtn.style.background = 'rgba(16, 185, 129, 0.35)';
        clickedBtn.style.borderColor = '#10b981';
        playReelStopSound(2);
    } else {
        clickedBtn.style.background = 'rgba(239, 68, 68, 0.35)';
        clickedBtn.style.borderColor = '#ef4444';
        if (allBtns[qObj.answer]) {
            allBtns[qObj.answer].style.background = 'rgba(16, 185, 129, 0.25)';
            allBtns[qObj.answer].style.borderColor = '#10b981';
        }
        playLoseSound();
    }

    document.getElementById('quiz-score-text').textContent = `Richtig: ${currentQuizCorrectCount}`;

    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < 5) {
            renderCurrentQuizQuestion();
        } else {
            finishBrokeQuiz();
        }
    }, 850);
}

function finishBrokeQuiz() {
    brokeQuizView.classList.add('hidden');
    brokeResultView.classList.remove('hidden');

    const iconEl = document.getElementById('quiz-result-icon');
    const titleEl = document.getElementById('quiz-result-title');
    const descEl = document.getElementById('quiz-result-desc');
    const actionBtn = document.getElementById('quiz-retry-or-claim-btn');

    if (currentQuizCorrectCount === 5) {
        iconEl.textContent = '🎉🪙';
        titleEl.textContent = 'Stark! Alle 5 Fragen richtig!';
        descEl.innerHTML = `Du hast dir deinen <strong>+${BROKE_QUIZ_REWARD} 🪙 Rettungs-Bonus</strong> verdient. Viel Glück am Automaten!`;
        actionBtn.textContent = `💰 +${BROKE_QUIZ_REWARD} 🪙 abholen & weiterspielen`;
        playSmallWinSound();

        actionBtn.onclick = () => {
            const user = getCurrentUser();
            if (user) {
                const updatedCoins = (user.coins || 0) + BROKE_QUIZ_REWARD;
                db.ref(`users/${user.id}/coins`).set(updatedCoins);
                addCloudLog(`🧠 Rettungs-Quiz bestanden: ${user.id} (${user.username}) erhielt +${BROKE_QUIZ_REWARD} 🪙.`);
            }
            brokePopupDismissedThisRound = false;
            brokeQuizModal.classList.add('hidden');
        };
    } else {
        iconEl.textContent = '💀🤡';
        titleEl.textContent = 'Verkackt!';
        descEl.innerHTML = `Du hattest nur <strong>${currentQuizCorrectCount} von 5</strong> Fragen richtig.<br>Du kannst das Quiz so lange wiederholen, bis du alle 5 schaffst!`;
        actionBtn.textContent = '🔄 Nochmal versuchen (Neue Fragen)';
        playLoseSound();

        actionBtn.onclick = () => {
            startBrokeQuiz();
        };
    }
}

if (document.getElementById('start-broke-quiz-btn')) {
    document.getElementById('start-broke-quiz-btn').addEventListener('click', startBrokeQuiz);
}
if (document.getElementById('close-broke-modal-btn')) {
    document.getElementById('close-broke-modal-btn').addEventListener('click', () => {
        brokePopupDismissedThisRound = true;
        brokeQuizModal.classList.add('hidden');
    });
}

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
                coins: START_COINS_DEFAULT,
                startCoins: START_COINS_DEFAULT,
                totalWon: 0,
                totalWagered: 0,
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

        const transferBal = document.getElementById('transfer-balance-display');
        if (transferBal) transferBal.textContent = user.coins.toLocaleString('de-DE');

        renderProfitScale(user);
        renderActiveBoostersBar(user);
        renderTransferTargets(user);
        checkAndShowBrokePopup(false);
    } else {
        profileBadge.classList.add('hidden');
        cornerBadge.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        if (adminBtn) adminBtn.classList.add('hidden');
        if (dashboardModal) dashboardModal.classList.add('hidden');
        if (brokeQuizModal) brokeQuizModal.classList.add('hidden');
        const transferModalEl = document.getElementById('transfer-modal');
        if (transferModalEl) transferModalEl.classList.add('hidden');
        renderProfitScale(null);
        renderActiveBoostersBar(null);
        balanceEl.textContent = '0';
        authModal.classList.remove('hidden');
    }

    updateAutoSpinButtonUI(user);
}

// ==================== 6A. VERMÖGENS-SKALA & GEWINN-BILANZ ====================
function renderProfitScale(user) {
    const card = document.getElementById('profit-scale-card');
    if (!card) return;

    if (!user) {
        card.classList.add('hidden');
        return;
    }

    card.classList.remove('hidden');
    const startCoins = typeof user.startCoins === 'number' ? user.startCoins : START_COINS_DEFAULT;
    const currentCoins = user.coins || 0;
    const totalWon = user.totalWon || 0;
    const netDiff = currentCoins - startCoins;

    const startValEl = document.getElementById('scale-start-value');
    const currentValEl = document.getElementById('scale-current-value');
    const totalWonEl = document.getElementById('scale-total-won');
    const netBadgeEl = document.getElementById('scale-net-badge');
    const startLabelEl = document.getElementById('scale-start-label');
    const maxLabelEl = document.getElementById('scale-max-label');
    const fillEl = document.getElementById('scale-fill');
    const dotEl = document.getElementById('scale-current-dot');

    startValEl.textContent = `${startCoins.toLocaleString('de-DE')} 🪙`;
    currentValEl.textContent = `${currentCoins.toLocaleString('de-DE')} 🪙`;
    totalWonEl.textContent = `${totalWon.toLocaleString('de-DE')} 🪙`;
    startLabelEl.textContent = `Start: ${startCoins.toLocaleString('de-DE')} 🪙`;

    netBadgeEl.classList.remove('is-profit', 'is-loss');
    if (netDiff > 0) {
        netBadgeEl.textContent = `+${netDiff.toLocaleString('de-DE')} 🪙 Gewinn`;
        netBadgeEl.classList.add('is-profit');
    } else if (netDiff < 0) {
        netBadgeEl.textContent = `${netDiff.toLocaleString('de-DE')} 🪙 Verlust`;
        netBadgeEl.classList.add('is-loss');
    } else {
        netBadgeEl.textContent = '±0 🪙 Ausgeglichen';
    }

    const maxRight = Math.max(startCoins * 2, Math.ceil(currentCoins * 1.15));
    maxLabelEl.textContent = `${maxRight.toLocaleString('de-DE')} 🪙`;

    let posPercent = 50;
    if (currentCoins <= 0) {
        posPercent = 0;
    } else if (currentCoins < startCoins) {
        posPercent = (currentCoins / startCoins) * 50;
    } else if (currentCoins > startCoins) {
        posPercent = 50 + ((currentCoins - startCoins) / Math.max(1, maxRight - startCoins)) * 50;
    }
    posPercent = Math.max(0, Math.min(100, posPercent));

    fillEl.classList.remove('is-profit', 'is-loss');
    if (posPercent >= 50) {
        fillEl.classList.add('is-profit');
        fillEl.style.left = '50%';
        fillEl.style.width = `${posPercent - 50}%`;
    } else {
        fillEl.classList.add('is-loss');
        fillEl.style.left = `${posPercent}%`;
        fillEl.style.width = `${50 - posPercent}%`;
    }
    dotEl.style.left = `${posPercent}%`;
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

function createShopCard(item, user) {
    const owned = userOwnsItem(user, item.id);
    const isEquipped = item.type === 'title' && user.equippedTitle === item.badge;
    const canAfford = user.coins >= item.price;

    let btnHtml = '';
    let statusNote = '';

    if (item.type === 'booster') {
        const boosterActive = hasActiveBooster(user, item.boosterId);
        const expiresAt = (user.activeBoosters && user.activeBoosters[item.boosterId]) || 0;
        const remSec = boosterActive ? Math.ceil((expiresAt - Date.now()) / 1000) : 0;
        statusNote = `<div data-booster-timer="${item.boosterId}" style="font-size:0.78rem; color:#34d399; font-weight:700; margin-top:6px; ${boosterActive ? '' : 'display:none;'}">⏱️ Aktiv: noch ${formatDurationMMSS(remSec)}</div>`;
        btnHtml = `<button class="mini-btn" data-booster-btn="${item.boosterId}" style="width:100%; margin-top:10px; padding:8px; background:${canAfford ? 'var(--gold-btn-gradient)' : 'rgba(255,255,255,0.08)'}; color:${canAfford ? '#080705' : '#888'}; font-weight:800;" onclick="buyShopItem('${item.id}')">${boosterActive ? 'Verlängern' : 'Aktivieren'} (${item.price.toLocaleString('de-DE')} 🪙)</button>`;
    } else if (item.type === 'rank') {
        const currentIdx = getRankIndex(user.rank);
        const targetIdx = getRankIndex(item.rankKey);
        if (currentIdx >= targetIdx) {
            btnHtml = `<button class="mini-btn" disabled style="width:100%; margin-top:10px; padding:8px; background:rgba(16,185,129,0.18); color:#34d399; border-color:var(--green-lux);">✅ ${currentIdx === targetIdx ? 'Aktueller Rang' : 'Höherer Rang aktiv'}</button>`;
        } else {
            btnHtml = `<button class="mini-btn" style="width:100%; margin-top:10px; padding:8px; background:${canAfford ? 'var(--gold-btn-gradient)' : 'rgba(255,255,255,0.08)'}; color:${canAfford ? '#080705' : '#888'}; font-weight:800;" onclick="buyShopItem('${item.id}')">Kaufen (${item.price.toLocaleString('de-DE')} 🪙)</button>`;
        }
    } else if (!owned) {
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
            ${statusNote}
        </div>
        ${btnHtml}
    `;
    return card;
}

function updateShopBoosterTimers(user) {
    if (!user) return;
    Object.values(BOOSTERS).forEach(booster => {
        const timerEl = document.querySelector(`[data-booster-timer="${booster.id}"]`);
        const btnEl = document.querySelector(`[data-booster-btn="${booster.id}"]`);
        const active = hasActiveBooster(user, booster.id);
        if (timerEl) {
            if (active) {
                const remSec = Math.ceil((user.activeBoosters[booster.id] - Date.now()) / 1000);
                timerEl.style.display = 'block';
                timerEl.textContent = `⏱️ Aktiv: noch ${formatDurationMMSS(remSec)}`;
            } else {
                timerEl.style.display = 'none';
            }
        }
        if (btnEl) {
            btnEl.textContent = `${active ? 'Verlängern' : 'Aktivieren'} (${booster.price.toLocaleString('de-DE')} 🪙)`;
        }
    });
}

function renderShop() {
    const container = document.getElementById('shop-items-container');
    const user = getCurrentUser();
    if (!container || !user) return;

    container.innerHTML = '';

    const sections = [
        { title: '⚡ MODULE & KURZZEIT-BOOSTER (2–5 MIN.)', items: SHOP_ITEMS.filter(i => i.type === 'feature' || i.type === 'booster') },
        { title: '🎖️ EXKLUSIVE RÄNGE (DAUERHAFTER GEWINN-BONUS)', items: SHOP_ITEMS.filter(i => i.type === 'rank') },
        { title: '✨ KOSMETISCHE PRESTIGE-TITEL', items: SHOP_ITEMS.filter(i => i.type === 'title') }
    ];

    sections.forEach(sec => {
        const wrapper = document.createElement('div');
        const heading = document.createElement('h3');
        heading.className = 'shop-section-title';
        heading.textContent = sec.title;
        wrapper.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'shop-grid';
        sec.items.forEach(item => grid.appendChild(createShopCard(item, user)));
        wrapper.appendChild(grid);
        container.appendChild(wrapper);
    });
}

window.buyShopItem = function(itemId) {
    const user = getCurrentUser();
    if (!user || user.banned) return;
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (item.type !== 'booster' && item.type !== 'rank' && userOwnsItem(user, itemId)) return;

    if (item.type === 'rank' && getRankIndex(user.rank) >= getRankIndex(item.rankKey)) {
        return;
    }

    if (user.coins < item.price) {
        alert(`❌ Nicht genug Coins! Du brauchst ${item.price.toLocaleString('de-DE')} 🪙.`);
        return;
    }

    const newCoins = user.coins - item.price;
    db.ref(`users/${user.id}/coins`).set(newCoins);

    if (item.type === 'booster') {
        activateBoosterForUser(user, item.boosterId);
        playSmallWinSound();
        addCloudLog(`⚡ ${user.id} (${user.username}) aktivierte Booster "${item.name}" für ${item.price} 🪙.`);
        return;
    }

    if (item.type === 'rank') {
        db.ref(`users/${user.id}/rank`).set(item.rankKey);
        playJackpotFanfareSound();
        addCloudLog(`🎖️ ${user.id} (${user.username}) kaufte Rang "${item.name}" für ${item.price} 🪙!`);
        return;
    }

    db.ref(`users/${user.id}/ownedItems/${itemId}`).set(true);
    if (item.type === 'title') {
        db.ref(`users/${user.id}/equippedTitle`).set(item.badge);
    }

    playSmallWinSound();
    addCloudLog(`🛒 ${user.id} (${user.username}) kaufte "${item.name}" für ${item.price} 🪙.`);
};

// ==================== 6C. ÜBERWEISUNGS-FEATURE (SPIELER ZU SPIELER) ====================
const transferModal = document.getElementById('transfer-modal');
const transferTargetSelect = document.getElementById('transfer-target-select');
const transferTargetIdInput = document.getElementById('transfer-target-id');
const transferAmountInput = document.getElementById('transfer-amount-input');
const transferFeedback = document.getElementById('transfer-feedback');
const transferSubmitBtn = document.getElementById('transfer-submit-btn');

function renderTransferTargets(currentUser) {
    if (!transferTargetSelect || !currentUser) return;
    const previousValue = transferTargetSelect.value;
    transferTargetSelect.innerHTML = '<option value="">-- Spieler wählen oder unten ID eingeben --</option>';

    getUsersArray()
        .filter(u => !u.banned && u.id !== currentUser.id)
        .sort((a, b) => (a.idNumber || 0) - (b.idNumber || 0))
        .forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = `${u.id} – ${u.username} (${(u.coins || 0).toLocaleString('de-DE')} 🪙)`;
            transferTargetSelect.appendChild(opt);
        });

    if (previousValue) transferTargetSelect.value = previousValue;
}

function showTransferFeedback(message, isSuccess = false) {
    if (!transferFeedback) return;
    transferFeedback.textContent = message;
    transferFeedback.className = isSuccess ? 'success-text' : 'error-text';
    transferFeedback.classList.remove('hidden');
}

const openTransferBtn = document.getElementById('open-transfer-btn');
if (openTransferBtn) {
    openTransferBtn.addEventListener('click', () => {
        const user = getCurrentUser();
        if (!user) {
            authModal.classList.remove('hidden');
            return;
        }
        renderTransferTargets(user);
        if (transferFeedback) transferFeedback.classList.add('hidden');
        transferModal.classList.remove('hidden');
    });
}

const closeTransferBtn = document.getElementById('close-transfer-btn');
if (closeTransferBtn) {
    closeTransferBtn.addEventListener('click', () => transferModal.classList.add('hidden'));
}

if (transferTargetSelect) {
    transferTargetSelect.addEventListener('change', () => {
        if (transferTargetSelect.value) {
            transferTargetIdInput.value = transferTargetSelect.value;
        }
    });
}

document.querySelectorAll('.transfer-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const addVal = parseInt(btn.getAttribute('data-amount'), 10) || 0;
        const currVal = parseInt(transferAmountInput.value, 10) || 0;
        transferAmountInput.value = Math.max(1, currVal + addVal);
    });
});

if (transferSubmitBtn) {
    transferSubmitBtn.addEventListener('click', async () => {
        const sender = getCurrentUser();
        if (!sender) {
            authModal.classList.remove('hidden');
            return;
        }
        if (sender.banned) {
            showTransferFeedback('🚫 Dein Account ist gesperrt!');
            return;
        }
        if (isSpinning || isWheelSpinning) {
            showTransferFeedback('⏳ Bitte warte, bis der aktuelle Dreh beendet ist.');
            return;
        }

        const rawTarget = (transferTargetIdInput.value || transferTargetSelect.value || '').trim();
        const amount = parseInt(transferAmountInput.value, 10);

        if (!rawTarget) {
            showTransferFeedback('❌ Bitte eine Ziel-ID oder einen Spieler auswählen.');
            return;
        }
        if (isNaN(amount) || amount < 1) {
            showTransferFeedback('❌ Bitte einen gültigen Betrag (min. 1 🪙) eingeben.');
            return;
        }

        const targetUser = findPlayerByIdInput(rawTarget) ||
            getUsersArray().find(u => u.username.toLowerCase() === rawTarget.toLowerCase());

        if (!targetUser) {
            showTransferFeedback(`❌ Spieler "${rawTarget}" wurde nicht gefunden.`);
            return;
        }
        if (targetUser.id === sender.id) {
            showTransferFeedback('❌ Du kannst dir selbst keine Coins überweisen.');
            return;
        }
        if (targetUser.banned) {
            showTransferFeedback('🚫 An gesperrte Accounts können keine Coins überwiesen werden.');
            return;
        }
        if ((sender.coins || 0) < amount) {
            showTransferFeedback(`❌ Nicht genug Guthaben! Verfügbar: ${(sender.coins || 0).toLocaleString('de-DE')} 🪙.`);
            return;
        }

        transferSubmitBtn.disabled = true;
        try {
            const txResult = await db.ref(`users/${sender.id}/coins`).transaction((curr) => {
                if (typeof curr !== 'number' || curr < amount) return;
                return curr - amount;
            });

            if (!txResult.committed) {
                showTransferFeedback('❌ Nicht genug Guthaben für diese Überweisung.');
                transferSubmitBtn.disabled = false;
                return;
            }

            await db.ref(`users/${targetUser.id}/coins`).transaction((curr) => (curr || 0) + amount);

            db.ref(`notifications/${targetUser.id}`).set({
                message: `💸 ${sender.username} (${sender.id}) hat dir +${amount.toLocaleString('de-DE')} 🪙 überwiesen!`,
                timestamp: Date.now()
            });

            playSmallWinSound();
            addCloudLog(`💸 Überweisung: ${sender.id} (${sender.username}) überwies ${amount} 🪙 an ${targetUser.id} (${targetUser.username}).`);
            showTransferFeedback(`✅ ${amount.toLocaleString('de-DE')} 🪙 erfolgreich an ${targetUser.username} (${targetUser.id}) überwiesen!`, true);
            transferAmountInput.value = '100';
        } catch (err) {
            console.error(err);
            showTransferFeedback('❌ Verbindungsfehler bei der Überweisung.');
        }
        transferSubmitBtn.disabled = false;
    });
}

let lastNotificationTs = Date.now();
db.ref('notifications').on('value', (snapshot) => {
    const allNotes = snapshot.val() || {};
    if (!currentUserId || !allNotes[currentUserId]) return;
    const note = allNotes[currentUserId];
    if (note && note.timestamp > lastNotificationTs) {
        lastNotificationTs = note.timestamp;
        db.ref(`notifications/${currentUserId}`).remove();
        showGlobalBanner(note.message, true);
        playSmallWinSound();
    }
});

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

function getWeightedRandomSymbol(customWeights = null) {
    const weights = customWeights || symbols.map(s => s.weight);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < symbols.length; i++) {
        if (random < weights[i]) return symbols[i];
        random -= weights[i];
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

    if (hasActiveBooster(user, 'admin_magnet')) {
        const roll = Math.random();
        if (roll < 0.85) {
            const magnetWeights = [26, 26, 22, 15, 7.5, 2.8, 0.7];
            const winSym = getWeightedRandomSymbol(magnetWeights);
            return [winSym, winSym, winSym];
        }
        if (roll < 0.97) {
            const pairSym = getWeightedRandomSymbol();
            const others = symbols.filter(s => s.key !== pairSym.key);
            const otherSym = others[Math.floor(Math.random() * others.length)];
            const pos = Math.floor(Math.random() * 3);
            const trio = [pairSym, pairSym, pairSym];
            trio[pos] = otherSym;
            return trio;
        }
    }

    const luckyMatchProb = hasActiveBooster(user, 'boost_luck') ? 0.075 : 0.035;
    if (Math.random() < luckyMatchProb) {
        const luckySym = getWeightedRandomSymbol(LUCKY_MATCH_WEIGHTS);
        return [luckySym, luckySym, luckySym];
    }

    return [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()];
}

spinBtn.addEventListener('click', () => {
    if (isSpinning || isWheelSpinning) return;

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
        if (user.coins < BROKE_THRESHOLD_COINS) {
            checkAndShowBrokePopup(true);
        }
        return;
    }

    brokePopupDismissedThisRound = false;
    playLeverPullSound();
    pullLeverAnimation();

    isSpinning = true;
    spinBtn.disabled = true;
    betInputEl.disabled = true;

    const newBalanceAfterBet = user.coins - currentBet;
    db.ref(`users/${user.id}/coins`).set(newBalanceAfterBet);
    db.ref(`users/${user.id}/totalWagered`).transaction(c => (c || 0) + currentBet);

    slotCard.classList.remove('shake');
    statusEl.classList.remove('status-win');
    statusEl.textContent = 'Walzen drehen...';
    addCloudLog(`🎰 ${user.id} (${user.username}) setzt ${currentBet} 🪙`);

    reels.forEach(reel => {
        reel.classList.remove('landed', 'win-glow');
        reel.classList.add('spinning');
    });

    const hasTurbo = userOwnsItem(user, 'feature_turbo');
    let baseDelay = hasTurbo ? 450 : 1000;
    let stepDelay = hasTurbo ? 220 : 500;
    if (isSlowMoNextSpin) {
        baseDelay = 10000;
        stepDelay = 10000;
        isSlowMoNextSpin = false;
    }

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
                isSpinning = false;
                spinBtn.disabled = false;
                betInputEl.disabled = false;
                checkWin(results);

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

function getActiveWinBoosterMultiplier(user) {
    let mult = 1;
    if (hasActiveBooster(user, 'boost_mult15')) mult *= 1.5;
    if (hasActiveBooster(user, 'boost_mult20')) mult *= 2.0;
    return mult;
}

function checkWin(results) {
    const [r1, r2, r3] = results;
    const user = getCurrentUser();
    if (!user) return;

    const rankInfo = getRankInfo(user.rank);
    const rankBonus = rankInfo.bonus;
    const bonusPercent = Math.round((rankBonus - 1) * 100);
    const boosterMult = getActiveWinBoosterMultiplier(user);
    const boosterTag = boosterMult > 1 ? ` • ⚡×${boosterMult} Boost` : '';

    if (r1.icon === r2.icon && r2.icon === r3.icon) {
        const winAmount = Math.round(currentBet * r1.multiplier * rankBonus * boosterMult);
        const finalCoins = user.coins + winAmount;
        db.ref(`users/${user.id}/coins`).set(finalCoins);
        db.ref(`users/${user.id}/totalWon`).transaction(w => (w || 0) + winAmount);
        updateLastWin(winAmount);

        reels.forEach(r => r.classList.add('win-glow'));
        slotCard.classList.add('shake');

        statusEl.classList.add('status-win');
        statusEl.textContent = `🎉 ${r1.multiplier}x TREFFER! ${bonusPercent > 0 ? `(+${bonusPercent}% Rang${boosterTag}) ` : (boosterTag ? `(${boosterTag.slice(3)}) ` : '')}Gewinn: ${winAmount.toLocaleString('de-DE')} 🪙!`;
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
        const smallWin = Math.floor(currentBet * 0.90 * rankBonus * boosterMult);
        const finalCoins = user.coins + smallWin;
        db.ref(`users/${user.id}/coins`).set(finalCoins);
        db.ref(`users/${user.id}/totalWon`).transaction(w => (w || 0) + smallWin);
        updateLastWin(smallWin);
        playSmallWinSound();
        statusEl.classList.add('status-win');
        statusEl.textContent = `✨ 2 Gleiche! Sie erhalten ${smallWin.toLocaleString('de-DE')} 🪙 zurück${boosterTag}.`;
        if (finalCoins < BROKE_THRESHOLD_COINS) {
            setTimeout(() => checkAndShowBrokePopup(true), 600);
        }
    } else {
        let finalCoins = user.coins;
        if (hasActiveBooster(user, 'boost_cashback')) {
            const cashback = Math.floor(currentBet * 0.25);
            if (cashback > 0) {
                finalCoins += cashback;
                db.ref(`users/${user.id}/coins`).set(finalCoins);
                db.ref(`users/${user.id}/totalWon`).transaction(w => (w || 0) + cashback);
                updateLastWin(cashback);
                playSmallWinSound();
                statusEl.classList.add('status-win');
                statusEl.textContent = `💸 Cashback-Schild: +${cashback.toLocaleString('de-DE')} 🪙 (25%) gerettet!`;
                return;
            }
        }
        playLoseSound();
        updateLastWin(0);
        statusEl.classList.remove('status-win');
        statusEl.textContent = 'Kein Treffer. Versuchen Sie es erneut.';
        if (finalCoins < BROKE_THRESHOLD_COINS) {
            setTimeout(() => checkAndShowBrokePopup(true), 600);
        }
    }
}

// ==================== 8B. GAMEMODE SWITCHER & GLÜCKSRAD ====================
const modeSlotsBtn = document.getElementById('mode-slots-btn');
const modeWheelBtn = document.getElementById('mode-wheel-btn');
const slotsModeWrapper = document.getElementById('slots-mode-wrapper');
const wheelModeWrapper = document.getElementById('wheel-mode-wrapper');
const wheelCanvas = document.getElementById('lucky-wheel-canvas');
const wheelSpinBtn = document.getElementById('wheel-spin-btn');
const wheelStatusEl = document.getElementById('wheel-status-text');

function switchGameMode(mode) {
    if (isSpinning || isWheelSpinning) return;
    activeGameMode = mode;
    if (mode === 'wheel') {
        stopAutoSpin();
        if (slotsModeWrapper) slotsModeWrapper.classList.add('hidden');
        if (wheelModeWrapper) wheelModeWrapper.classList.remove('hidden');
        if (modeSlotsBtn) modeSlotsBtn.classList.remove('active');
        if (modeWheelBtn) modeWheelBtn.classList.add('active');
        drawLuckyWheel(wheelRotationRad);
    } else {
        if (wheelModeWrapper) wheelModeWrapper.classList.add('hidden');
        if (slotsModeWrapper) slotsModeWrapper.classList.remove('hidden');
        if (modeWheelBtn) modeWheelBtn.classList.remove('active');
        if (modeSlotsBtn) modeSlotsBtn.classList.add('active');
    }
}

if (modeSlotsBtn) modeSlotsBtn.addEventListener('click', () => switchGameMode('slots'));
if (modeWheelBtn) modeWheelBtn.addEventListener('click', () => switchGameMode('wheel'));

function drawLuckyWheel(rotationRad = 0) {
    if (!wheelCanvas) return;
    const ctx = wheelCanvas.getContext('2d');
    const size = wheelCanvas.width;
    const center = size / 2;
    const radius = center - 6;
    const count = WHEEL_SEGMENTS.length;
    const sliceAngle = (Math.PI * 2) / count;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < count; i++) {
        const seg = WHEEL_SEGMENTS[i];
        const startAngle = rotationRad + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#d4af37';
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = seg.textColor;
        ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(seg.short, radius - 16, 0);
        ctx.restore();
    }

    // Goldene Nieten am äußeren Rand
    for (let i = 0; i < count; i++) {
        const angle = rotationRad + i * sliceAngle;
        const dotX = center + Math.cos(angle) * (radius - 6);
        const dotY = center + Math.sin(angle) * (radius - 6);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fcf6ba';
        ctx.fill();
    }
}

function renderWheelOdds() {
    const grid = document.getElementById('wheel-odds-grid');
    if (!grid) return;
    grid.innerHTML = '';

    WHEEL_SEGMENTS.forEach(seg => {
        const div = document.createElement('div');
        if (seg.type === 'rank') div.className = 'mythic-row';
        else if (seg.type === 'booster' || seg.value >= 10000) div.className = 'legendary-row';
        div.innerHTML = `${seg.label} = <span>${seg.prob.toFixed(seg.prob < 0.1 ? 2 : 1)}%</span>`;
        grid.appendChild(div);
    });
}

function pickWeightedWheelSegmentIndex() {
    const totalProb = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.prob, 0);
    let r = Math.random() * totalProb;
    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
        if (r < WHEEL_SEGMENTS[i].prob) return i;
        r -= WHEEL_SEGMENTS[i].prob;
    }
    return 0;
}

function handleWheelPrize(user, seg) {
    const rankInfo = getRankInfo(user.rank);

    if (seg.type === 'coins') {
        if (seg.value > 0) {
            db.ref(`users/${user.id}/coins`).transaction(c => (c || 0) + seg.value);
            db.ref(`users/${user.id}/totalWon`).transaction(w => (w || 0) + seg.value);
            updateLastWin(seg.value);
            wheelStatusEl.classList.add('status-win');
            wheelStatusEl.textContent = `🎉 GLÜCKSRAD-TREFFER: +${seg.value.toLocaleString('de-DE')} 🪙 gewonnen!`;
            addCloudLog(`🎡 Glücksrad: ${user.id} (${user.username}) gewann +${seg.value} 🪙.`);
            if (seg.value >= 10000) {
                playJackpotFanfareSound();
                triggerMegaWinAnimation(user, { key: 'diamond', icon: '💎' }, seg.value);
                pushGlobalBroadcast(`🎡 GLÜCKSRAD JACKPOT: [${rankInfo.label}] ${user.username} (${user.id}) hat ${seg.value.toLocaleString('de-DE')} 🪙 am Glücksrad gewonnen!`, true);
            } else {
                playSmallWinSound();
            }
        } else {
            updateLastWin(0);
            playLoseSound();
            wheelStatusEl.classList.remove('status-win');
            wheelStatusEl.textContent = '💀 Leider eine Niete! Dreh gleich nochmal.';
        }
    } else if (seg.type === 'booster') {
        const booster = BOOSTERS[seg.value];
        activateBoosterForUser(user, seg.value);
        updateLastWin(0);
        playJackpotFanfareSound();
        wheelStatusEl.classList.add('status-win');
        wheelStatusEl.textContent = `⚡ SELTENER BOOST! ${booster.name} aktiviert!`;
        addCloudLog(`🎡⚡ Glücksrad-Boost: ${user.id} (${user.username}) gewann ${booster.name}!`);
    } else if (seg.type === 'rank') {
        const wonRankKey = seg.value;
        const wonRankInfo = getRankInfo(wonRankKey);
        const currentIdx = getRankIndex(user.rank);
        const targetIdx = getRankIndex(wonRankKey);

        if (targetIdx > currentIdx) {
            db.ref(`users/${user.id}/rank`).set(wonRankKey);
            updateLastWin(0);
            playJackpotFanfareSound();
            wheelStatusEl.classList.add('status-win');
            wheelStatusEl.textContent = `👑 JACKPOT! Neuer Rang freigeschaltet: ${wonRankInfo.label}!`;
            addCloudLog(`🎡👑 RANG-JACKPOT am Glücksrad: ${user.id} (${user.username}) gewann ${wonRankInfo.label}!`);
            pushGlobalBroadcast(`🎡👑 UNGLAUBLICH! ${user.username} (${user.id}) hat am Glücksrad den Rang ${wonRankInfo.label} gewonnen!`, true);
        } else {
            const comp = seg.dupCoins || 5000;
            db.ref(`users/${user.id}/coins`).transaction(c => (c || 0) + comp);
            db.ref(`users/${user.id}/totalWon`).transaction(w => (w || 0) + comp);
            updateLastWin(comp);
            playJackpotFanfareSound();
            wheelStatusEl.classList.add('status-win');
            wheelStatusEl.textContent = `👑 ${wonRankInfo.label} (bereits aktiv) → +${comp.toLocaleString('de-DE')} 🪙 Ersatz-Bonus!`;
            addCloudLog(`🎡 Glücksrad Rang-Duplikat für ${user.id} (${user.username}): +${comp} 🪙.`);
        }
    }

    setTimeout(() => {
        const fresh = getCurrentUser();
        if (fresh && fresh.coins < BROKE_THRESHOLD_COINS) {
            checkAndShowBrokePopup(true);
        }
    }, 600);
}

if (wheelSpinBtn) {
    wheelSpinBtn.addEventListener('click', () => {
        if (isWheelSpinning || isSpinning) return;

        const user = getCurrentUser();
        if (!user) {
            authModal.classList.remove('hidden');
            return;
        }
        if (user.banned) {
            wheelStatusEl.classList.remove('status-win');
            wheelStatusEl.textContent = '🚫 Ihr Account wurde gesperrt!';
            return;
        }
        if (user.coins < WHEEL_SPIN_COST) {
            wheelStatusEl.classList.remove('status-win');
            wheelStatusEl.textContent = `❌ Du brauchst mindestens ${WHEEL_SPIN_COST.toLocaleString('de-DE')} 🪙 für einen Dreh!`;
            if (user.coins < BROKE_THRESHOLD_COINS) checkAndShowBrokePopup(true);
            return;
        }

        isWheelSpinning = true;
        wheelSpinBtn.disabled = true;
        wheelStatusEl.classList.remove('status-win');
        wheelStatusEl.textContent = '🎡 Das Glücksrad dreht...';

        db.ref(`users/${user.id}/coins`).set(user.coins - WHEEL_SPIN_COST);
        db.ref(`users/${user.id}/totalWagered`).transaction(w => (w || 0) + WHEEL_SPIN_COST);
        addCloudLog(`🎡 ${user.id} (${user.username}) dreht das Glücksrad (-${WHEEL_SPIN_COST} 🪙)`);

        const winningIndex = pickWeightedWheelSegmentIndex();
        const winningSeg = WHEEL_SEGMENTS[winningIndex];
        const count = WHEEL_SEGMENTS.length;
        const sliceAngle = (Math.PI * 2) / count;

        // Pointer sitzt oben bei -PI / 2 (270°)
        const jitter = (Math.random() - 0.5) * sliceAngle * 0.55;
        const targetMod = ((-Math.PI / 2) - (winningIndex + 0.5) * sliceAngle + jitter) % (Math.PI * 2);
        const normalizedTargetMod = (targetMod + Math.PI * 2) % (Math.PI * 2);
        const currentMod = ((wheelRotationRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let delta = normalizedTargetMod - currentMod;
        if (delta <= 0) delta += Math.PI * 2;

        const extraSpins = (5 + Math.floor(Math.random() * 3)) * Math.PI * 2;
        const startRot = wheelRotationRad;
        const endRot = startRot + extraSpins + delta;
        const durationMs = 4500;
        const startTime = performance.now();
        let lastTickSlice = Math.floor(startRot / sliceAngle);

        function animateWheel(now) {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            wheelRotationRad = startRot + (endRot - startRot) * eased;
            drawLuckyWheel(wheelRotationRad);

            const currentSlice = Math.floor(wheelRotationRad / sliceAngle);
            if (currentSlice !== lastTickSlice) {
                lastTickSlice = currentSlice;
                playWheelTickSound();
            }

            if (t < 1) {
                requestAnimationFrame(animateWheel);
            } else {
                wheelRotationRad = endRot;
                drawLuckyWheel(wheelRotationRad);
                isWheelSpinning = false;
                wheelSpinBtn.disabled = false;
                const freshUser = getCurrentUser();
                if (freshUser) handleWheelPrize(freshUser, winningSeg);
            }
        }

        requestAnimationFrame(animateWheel);
    });
}

drawLuckyWheel(0);
renderWheelOdds();

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
    const trollInput = document.getElementById('troll-target-id-input');
    if (trollInput) trollInput.value = id;
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

// ==================== 10. ADMIN TROLL-ENGINE (LIVE VIA FIREBASE) ====================
function playClownHornSound() {
    withReadyAudio((ctx) => {
        const now = ctx.currentTime;
        [392.00, 311.13].forEach((freq, idx) => {
            const start = now + idx * 0.28;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.linearRampToValueAtTime(freq * 0.85, start + 0.25);
            gain.gain.setValueAtTime(0.24, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.26);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.28);
        });
    });
}

function triggerFakeJackpotTroll() {
    const overlay = document.getElementById('mega-win-overlay');
    const badge = document.getElementById('mega-win-badge');
    const icons = document.getElementById('mega-win-icons');
    const title = document.getElementById('mega-win-title');
    const counterEl = document.getElementById('mega-win-counter');
    const confettiContainer = document.getElementById('confetti-container');

    badge.textContent = '🌌 MYTHIC COSMIC DRAGON 1000x 🌌';
    icons.textContent = '🌌 🌌 🌌';
    title.textContent = 'UNFASSBARER JACKPOT!';
    counterEl.textContent = '1.000.000';

    confettiContainer.innerHTML = '';
    for (let i = 0; i < 45; i++) {
        const drop = document.createElement('div');
        drop.className = 'falling-coin';
        drop.textContent = ['🪙', '🌌', '👑'][i % 3];
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.animationDuration = '2s';
        confettiContainer.appendChild(drop);
    }

    playJackpotFanfareSound();
    overlay.classList.remove('hidden');

    setTimeout(() => {
        badge.textContent = '🤡 ADMIN TROLL-EDITION 🤡';
        icons.textContent = '💩 🤡 💩';
        title.textContent = 'APRIL, APRIL! DU BEKOMMST NIX!';
        counterEl.textContent = '0';
        playClownHornSound();
    }, 2400);
}

function activateRunawaySpinButton(durationMs = 15000) {
    if (runawayActive) return;
    runawayActive = true;

    const dodgeHandler = () => {
        if (!runawayActive) return;
        const randX = Math.floor(Math.random() * 240) - 120;
        const randY = Math.floor(Math.random() * 140) - 70;
        spinBtn.style.transform = `translate(${randX}px, ${randY}px)`;
        spinBtn.style.transition = 'transform 0.12s ease-out';
    };

    spinBtn.addEventListener('mouseenter', dodgeHandler);
    spinBtn.addEventListener('touchstart', dodgeHandler, { passive: true });
    statusEl.textContent = '🏃‍♂️ Hoppla! Dein Spin-Button hat Angst vor dir!';

    setTimeout(() => {
        runawayActive = false;
        spinBtn.removeEventListener('mouseenter', dodgeHandler);
        spinBtn.removeEventListener('touchstart', dodgeHandler);
        spinBtn.style.transform = '';
    }, durationMs);
}

function triggerFakeBanTroll() {
    const overlay = document.getElementById('fake-ban-overlay');
    const box = overlay ? overlay.querySelector('.fake-ban-box') : null;
    const titleEl = document.getElementById('fake-ban-title');
    const countdownEl = document.getElementById('fake-ban-countdown');
    const closeBtn = document.getElementById('close-fake-ban-btn');
    if (!overlay || !box || !titleEl || !countdownEl || !closeBtn) return;

    box.classList.remove('is-prank-revealed');
    titleEl.textContent = 'DEIN ACCOUNT WURDE WEGEN CHEATING DAUERHAFT GESPERRT';
    countdownEl.textContent = 'Coins werden gelöscht... 3...';
    closeBtn.classList.add('hidden');
    overlay.classList.remove('hidden');
    playLoseSound();

    setTimeout(() => {
        countdownEl.textContent = 'Coins werden gelöscht... 2...';
        playReelStopSound(1);
    }, 1000);

    setTimeout(() => {
        countdownEl.textContent = 'Coins werden gelöscht... 1...';
        playReelStopSound(2);
    }, 2000);

    setTimeout(() => {
        box.classList.add('is-prank-revealed');
        countdownEl.textContent = 'Spaß! 🤡 Alles noch da – schön weiterspielen!';
        closeBtn.classList.remove('hidden');
        playClownHornSound();
    }, 3000);
}

const closeFakeBanBtn = document.getElementById('close-fake-ban-btn');
if (closeFakeBanBtn) {
    closeFakeBanBtn.addEventListener('click', () => {
        document.getElementById('fake-ban-overlay').classList.add('hidden');
    });
}

function executeIncomingTroll(type) {
    switch (type) {
        case 'flip':
            document.body.classList.add('troll-flipped');
            playClownHornSound();
            setTimeout(() => document.body.classList.remove('troll-flipped'), 15000);
            break;

        case 'runaway':
            activateRunawaySpinButton(15000);
            break;

        case 'fakejackpot':
            triggerFakeJackpotTroll();
            break;

        case 'fakeban':
            triggerFakeBanTroll();
            break;

        case 'magnet': {
            const me = getCurrentUser();
            if (me) {
                activateBoosterForUser(me, 'admin_magnet');
                playJackpotFanfareSound();
                statusEl.classList.add('status-win');
                statusEl.textContent = '🧲 GOD-MODE: Magnet-Walzen für 60 Sekunden aktiviert!';
                showGlobalBanner('🧲 GLÜCKS-MAGNET AKTIVIERT! Für 60 Sekunden zieht dein Automat fast nur noch Gewinne an!', true);
            }
            break;
        }

        case 'forcequiz':
            brokePopupDismissedThisRound = false;
            if (brokeQuizModal) {
                brokeIntroView.classList.remove('hidden');
                brokeQuizView.classList.add('hidden');
                brokeResultView.classList.add('hidden');
                brokeQuizModal.classList.remove('hidden');
            }
            playClownHornSound();
            break;

        case 'drunk':
            document.body.classList.add('troll-drunk');
            statusEl.textContent = '🥴 Dir ist plötzlich ganz schwindelig...';
            setTimeout(() => document.body.classList.remove('troll-drunk'), 15000);
            break;

        case 'slowmo':
            isSlowMoNextSpin = true;
            statusEl.textContent = '🐌 Nächster Spin läuft in extremer Zeitlupe...';
            break;

        case 'airhorn':
            playClownHornSound();
            break;

        case 'earthquake':
            document.body.classList.add('troll-earthquake');
            playClownHornSound();
            setTimeout(() => document.body.classList.remove('troll-earthquake'), 5000);
            break;
    }
}

let lastUserTrollTs = Date.now();
db.ref('trolls').on('value', (snapshot) => {
    const allTrolls = snapshot.val() || {};
    if (!currentUserId || !allTrolls[currentUserId]) return;

    const trollData = allTrolls[currentUserId];
    if (trollData && trollData.timestamp > lastUserTrollTs) {
        lastUserTrollTs = trollData.timestamp;
        db.ref(`trolls/${currentUserId}`).remove();
        executeIncomingTroll(trollData.type);
    }
});

let lastGlobalTrollTs = Date.now();
db.ref('globalTroll').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.timestamp > lastGlobalTrollTs) {
        lastGlobalTrollTs = data.timestamp;
        executeIncomingTroll(data.type);
    }
});

window.sendTrollCommand = function(trollType) {
    const admin = getCurrentUser();
    if (!hasAdminAccess(admin)) return;

    const rawId = document.getElementById('troll-target-id-input').value;
    if (!rawId) {
        alert('Bitte eine Ziel-ID eingeben (z. B. ID2)!');
        return;
    }

    const targetUser = findPlayerByIdInput(rawId);
    if (!targetUser) {
        alert(`Kein Account mit der ID "${rawId}" gefunden!`);
        return;
    }

    db.ref(`trolls/${targetUser.id}`).set({
        type: trollType,
        timestamp: Date.now()
    });
    if (trollType === 'magnet') {
        addCloudLog(`🧲 Admin ${admin.id} aktivierte Magnet-Walzen (60s God-Mode-Buff) für ${targetUser.id} (${targetUser.username})!`);
    } else {
        addCloudLog(`😈 Admin ${admin.id} trollte ${targetUser.id} (${targetUser.username}) mit [${trollType.toUpperCase()}]!`);
    }
};

window.sendGlobalTroll = function(trollType) {
    const admin = getCurrentUser();
    if (!hasAdminAccess(admin)) return;

    db.ref('globalTroll').set({
        type: trollType,
        timestamp: Date.now()
    });
    addCloudLog(`🌪️ Admin ${admin.id} startete Server-Troll [${trollType.toUpperCase()}] für ALLE!`);
};

// ==================== 11. LIVE CASINO CHAT ====================
const chatMessagesEl = document.getElementById('chat-messages');
const chatInputEl = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatStatusEl = document.getElementById('chat-status');
let lastChatSentAt = 0;

function showChatStatus(msg) {
    if (!chatStatusEl) return;
    if (!msg) {
        chatStatusEl.textContent = '';
        chatStatusEl.classList.add('hidden');
        return;
    }
    chatStatusEl.textContent = msg;
    chatStatusEl.classList.remove('hidden');
}

function renderChatMessagesList(messages) {
    if (!chatMessagesEl) return;
    chatMessagesEl.innerHTML = '';

    if (messages.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'chat-empty';
        emptyDiv.textContent = 'Noch keine Nachrichten. Schreib als Erstes etwas in den Live-Chat!';
        chatMessagesEl.appendChild(emptyDiv);
        return;
    }

    messages.forEach(msg => {
        const row = document.createElement('div');
        row.className = `chat-msg ${msg.userId === currentUserId ? 'is-me' : ''}`;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'chat-time';
        timeSpan.textContent = msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
            : '';

        const rankInfo = getRankInfo(msg.rank);
        const rankPill = document.createElement('span');
        rankPill.className = `rank-pill ${rankInfo.cssClass}`;
        rankPill.textContent = rankInfo.label;

        const userSpan = document.createElement('span');
        userSpan.className = 'chat-user';
        userSpan.textContent = `${msg.username || 'Spieler'} (${msg.userId || '?'})${msg.isAdmin ? ' 🛡️' : ''}:`;

        const textSpan = document.createElement('span');
        textSpan.className = 'chat-text';
        textSpan.textContent = msg.text || '';

        row.appendChild(timeSpan);
        row.appendChild(rankPill);
        row.appendChild(userSpan);
        row.appendChild(textSpan);
        chatMessagesEl.appendChild(row);
    });

    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

db.ref('chat').limitToLast(50).on(
    'value',
    (snapshot) => {
        showChatStatus('');
        const chatData = snapshot.val() || {};
        const messages = Object.values(chatData).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        renderChatMessagesList(messages);
    },
    (err) => {
        console.error('Chat read error:', err);
        if (chatMessagesEl) {
            chatMessagesEl.innerHTML = '';
            const errDiv = document.createElement('div');
            errDiv.className = 'chat-empty';
            errDiv.style.color = '#f87171';
            errDiv.textContent = `❌ Chat konnte nicht geladen werden (${err.code || err.message}). Firebase-Regeln prüfen!`;
            chatMessagesEl.appendChild(errDiv);
        }
    }
);

async function sendChatMessage() {
    const user = getCurrentUser();
    if (!user) {
        showChatStatus('⚠️ Bitte zuerst einloggen, um zu chatten.');
        authModal.classList.remove('hidden');
        return;
    }
    if (user.banned) {
        showChatStatus('🚫 Gesperrte Accounts können nicht chatten!');
        return;
    }
    if (!chatInputEl) return;

    const text = chatInputEl.value.trim();
    if (!text) return;

    const now = Date.now();
    if (now - lastChatSentAt < 500) return;
    lastChatSentAt = now;

    showChatStatus('');
    if (chatSendBtn) chatSendBtn.disabled = true;

    try {
        await db.ref('chat').push({
            userId: String(user.id || ''),
            username: String(user.username || 'Spieler'),
            rank: String(user.rank || 'member'),
            isAdmin: Boolean(hasAdminAccess(user)),
            text: text.slice(0, 220),
            timestamp: now
        });
        chatInputEl.value = '';
    } catch (err) {
        console.error('Chat send error:', err);
        showChatStatus(`❌ Senden fehlgeschlagen: ${err.code || err.message || 'Firebase-Regeln prüfen!'}`);
    } finally {
        if (chatSendBtn) chatSendBtn.disabled = false;
    }
}

if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
}
if (chatInputEl) {
    chatInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}
