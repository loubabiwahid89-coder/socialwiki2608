// ═══════════════════════════════════════════════════════════
// 🎲 PARCHISI STAR - Complete Game Logic (Part 1/3)
// ═══════════════════════════════════════════════════════════

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // SUPABASE SETUP
    // ═══════════════════════════════════════════════════════════
    const SUPABASE_URL = "https://zcffrkvxmxvojkbmtufe.supabase.co";
    const SUPABASE_KEY = "sb_publishable_lgKbPrSB163cJn-jNWAQCw_QdtqBvrG";
    
    let supabaseClient = null;
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    // ═══════════════════════════════════════════════════════════
    // GAME CONSTANTS
    // ═══════════════════════════════════════════════════════════
    const COLORS = ['red', 'green', 'yellow', 'blue'];
    const SAFE_TILES = [0, 8, 13, 21, 26, 34, 39, 47];
    const TOTAL_TILES = 52;

    // ═══════════════════════════════════════════════════════════
    // GLOBAL STATE
    // ═══════════════════════════════════════════════════════════
    let state = {
        currentUser: null,
        currentProfile: null,
        currentGame: null,
        currentPlayer: null,
        players: [],
        selectedPlayersCount: 2,
        realtimeChannel: null,
        boardTiles: [],
        pieces: {},
        isRolling: false,
        turnTimeout: null,
        TURN_DURATION: 60
    };

    // ═══════════════════════════════════════════════════════════
    function getLang() {
        return localStorage.getItem("socialwiki_lang") || "en";
    }

        function t(key) {
        const lang = getLang();
        
        // 1. translations.js الرئيسي (الأولوية)
        if (typeof window.translations !== 'undefined') {
            if (window.translations[lang] && window.translations[lang][key]) {
                return window.translations[lang][key];
            }
            if (window.translations['en'] && window.translations['en'][key]) {
                return window.translations['en'][key];
            }
        }
        
        // 2. parchisi_translations (احتياطي)
        if (window.parchisi_translations && window.parchisi_translations[lang] && window.parchisi_translations[lang][key]) {
            return window.parchisi_translations[lang][key];
        }
        
        // 3. أعد المفتاح
        return key;
    }

    function applyParchisiTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);
            if (translated && translated !== key) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (!el.value) el.placeholder = translated;
                } else {
                    el.textContent = translated;
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // TOAST NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    function showToast(message, type) {
        type = type || 'info';
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = '0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════
    // LOADING OVERLAY
    // ═══════════════════════════════════════════════════════════
    function showLoading(text) {
        const overlay = document.getElementById('loadingOverlay');
        const textEl = document.getElementById('loadingText');
        if (overlay) overlay.classList.add('show');
        if (textEl) textEl.textContent = text || 'Loading...';
    }

    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    // ═══════════════════════════════════════════════════════════
    // SCREEN SWITCHING
    // ═══════════════════════════════════════════════════════════
    function showScreen(name) {
        const screens = {
            lobby: document.getElementById('lobbyScreen'),
            waiting: document.getElementById('waitingScreen'),
            game: document.getElementById('gameScreen')
        };

        Object.keys(screens).forEach(key => {
            if (screens[key]) {
                screens[key].style.display = (key === name) ? 'block' : 'none';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // SELECT PLAYERS COUNT
    // ═══════════════════════════════════════════════════════════
    window.selectPlayers = function(btn, count) {
        document.querySelectorAll('.players-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedPlayersCount = count;
    };

    // ═══════════════════════════════════════════════════════════
    // CREATE ROOM
    // ═══════════════════════════════════════════════════════════
    window.createRoom = async function() {
        if (!state.currentUser) {
            showToast('Please login first', 'error');
            return;
        }

        showLoading('Creating room...');

        try {
            const { data, error } = await supabaseClient.rpc('create_parchisi_game', {
                p_max_players: state.selectedPlayersCount
            });

            if (error) {
                console.error('Create error:', error);
                showToast('Error: ' + error.message, 'error');
                hideLoading();
                return;
            }

            if (!data || !data.success) {
                showToast(data?.error || 'Failed to create room', 'error');
                hideLoading();
                return;
            }

            console.log('✅ Room created:', data.room_code);
            showToast(t('parchisi_game_created') + ': ' + data.room_code, 'success');
            
            await loadGame(data.game_id);
            
        } catch (err) {
            console.error('Exception:', err);
            showToast('Error: ' + err.message, 'error');
            hideLoading();
        }
    };

    // ═══════════════════════════════════════════════════════════
    // JOIN ROOM
    // ═══════════════════════════════════════════════════════════
    window.joinRoom = async function() {
        if (!state.currentUser) {
            showToast('Please login first', 'error');
            return;
        }

        const input = document.getElementById('joinRoomCode');
        const code = input ? input.value.trim().toUpperCase() : '';

        if (!code || code.length !== 6) {
            showToast('Enter a valid 6-character room code', 'error');
            return;
        }

        showLoading('Joining room...');

        try {
            const { data, error } = await supabaseClient.rpc('join_parchisi_game', {
                p_room_code: code
            });

            if (error) {
                console.error('Join error:', error);
                showToast('Error: ' + error.message, 'error');
                hideLoading();
                return;
            }

            if (!data || !data.success) {
                showToast(data?.error || 'Room not found', 'error');
                hideLoading();
                return;
            }

            console.log('✅ Joined room:', code);
            showToast('Joined room!', 'success');

            await loadGame(data.game_id);

        } catch (err) {
            console.error('Exception:', err);
            showToast('Error: ' + err.message, 'error');
            hideLoading();
        }
    };

    // ═══════════════════════════════════════════════════════════
    // LOAD GAME
    // ═══════════════════════════════════════════════════════════
    async function loadGame(gameId) {
        try {
            const { data: game, error: gameErr } = await supabaseClient
                .from('parchisi_games')
                .select('*')
                .eq('id', gameId)
                .single();

            if (gameErr || !game) {
                showToast('Game not found', 'error');
                hideLoading();
                return;
            }

            state.currentGame = game;
            await loadPlayers(gameId);

            state.currentPlayer = state.players.find(p => p.user_id === state.currentUser.id);

            subscribeToGame(gameId);

            hideLoading();
            routeScreen();

        } catch (err) {
            console.error('Load game error:', err);
            showToast('Error: ' + err.message, 'error');
            hideLoading();
        }
    }

    // ═══════════════════════════════════════════════════════════
    // LOAD PLAYERS
    // ═══════════════════════════════════════════════════════════
    async function loadPlayers(gameId) {
        const { data: players, error } = await supabaseClient
            .from('parchisi_players')
            .select('*')
            .eq('game_id', gameId)
            .order('player_index', { ascending: true });

        if (error) {
            console.error('Load players error:', error);
            return;
        }

        const userIds = players.map(p => p.user_id);
        const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds);

        const profilesMap = {};
        (profiles || []).forEach(p => profilesMap[p.id] = p);

        state.players = players.map(p => {
            const profile = profilesMap[p.user_id] || {};
            return {
                ...p,
                username: profile.full_name || profile.username || 'User',
                avatar_url: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username || 'User'}&background=1877f2&color=fff`
            };
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ROUTE SCREEN
    // ═══════════════════════════════════════════════════════════
    function routeScreen() {
        if (!state.currentGame) {
            showScreen('lobby');
            return;
        }

        if (state.currentGame.status === 'waiting') {
            showScreen('waiting');
            renderWaitingScreen();
        } else if (state.currentGame.status === 'playing') {
            showScreen('game');
            renderGameScreen();
        } else if (state.currentGame.status === 'finished') {
            showScreen('game');
            renderGameScreen();
            showWinner();
        }
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER WAITING SCREEN
    // ═══════════════════════════════════════════════════════════
    function renderWaitingScreen() {
        if (!state.currentGame) return;

        const codeEl = document.getElementById('roomCodeDisplay');
        if (codeEl) codeEl.textContent = state.currentGame.room_code;

        const countEl = document.getElementById('playersCount');
        if (countEl) countEl.textContent = state.players.length;
        const maxEl = document.getElementById('maxPlayers');
        if (maxEl) maxEl.textContent = state.currentGame.max_players;

        const slotsContainer = document.getElementById('waitingPlayers');
        if (slotsContainer) {
            slotsContainer.innerHTML = '';
            for (let i = 0; i < state.currentGame.max_players; i++) {
                const player = state.players.find(p => p.player_index === i);
                const slot = document.createElement('div');
                slot.className = 'waiting-player-slot ' + COLORS[i] + (player ? ' filled' : ' empty');
                
                if (player) {
                    const isHost = player.user_id === state.currentGame.host_id;
                    slot.innerHTML = `
                        <img src="${player.avatar_url}" alt="${player.username}">
                        <div class="slot-name">${player.username}</div>
                        <div class="slot-status">${isHost ? '👑 ' + t('parchisi_host') : t('parchisi_guest')}</div>
                    `;
                } else {
                    slot.innerHTML = `
                        <div class="slot-avatar">👤</div>
                        <div class="slot-name">---</div>
                        <div class="slot-status">${t('parchisi_waiting')}</div>
                    `;
                }
                slotsContainer.appendChild(slot);
            }
        }

        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            const isHost = state.currentGame.host_id === state.currentUser.id;
            const isFull = state.players.length === state.currentGame.max_players;
            
            if (isHost && (isFull || state.players.length >= 2)) {
                startBtn.style.display = 'inline-flex';
            } else {
                startBtn.style.display = 'none';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // START GAME
    // ═══════════════════════════════════════════════════════════
    window.startGame = async function() {
        if (!state.currentGame) return;

        if (state.currentGame.host_id !== state.currentUser.id) {
            showToast('Only host can start', 'error');
            return;
        }

        if (state.players.length < 2) {
            showToast('Need at least 2 players', 'error');
            return;
        }

        showLoading('Starting game...');

        try {
            const { error } = await supabaseClient
                .from('parchisi_games')
                .update({ 
                    status: 'playing',
                    current_turn: 0,
                    updated_at: new Date().toISOString()
                })
                .eq('id', state.currentGame.id);

            if (error) {
                showToast('Error: ' + error.message, 'error');
                hideLoading();
                return;
            }

            showToast(t('parchisi_game_started'), 'success');
            hideLoading();

        } catch (err) {
            console.error('Start error:', err);
            hideLoading();
        }
    };

    // ═══════════════════════════════════════════════════════════
    // LEAVE ROOM
    // ═══════════════════════════════════════════════════════════
    window.leaveRoom = async function() {
        if (!state.currentGame || !state.currentPlayer) {
            backToLobby();
            return;
        }

        if (!confirm('Leave this room?')) return;

        try {
            await supabaseClient
                .from('parchisi_players')
                .delete()
                .eq('id', state.currentPlayer.id);

            if (state.currentGame.host_id === state.currentUser.id) {
                await supabaseClient
                    .from('parchisi_games')
                    .update({ status: 'finished' })
                    .eq('id', state.currentGame.id);
            }

            unsubscribe();
            backToLobby();

        } catch (err) {
            console.error('Leave error:', err);
            backToLobby();
        }
    };

    // ═══════════════════════════════════════════════════════════
    // BACK TO LOBBY
    // ═══════════════════════════════════════════════════════════
    window.backToLobby = function() {
        state.currentGame = null;
        state.currentPlayer = null;
        state.players = [];
        state.pieces = {};
        showScreen('lobby');
        applyParchisiTranslations();
    };

    // ═══════════════════════════════════════════════════════════
    // COPY ROOM CODE
    // ═══════════════════════════════════════════════════════════
    window.copyRoomCode = function() {
        if (!state.currentGame) return;
        navigator.clipboard.writeText(state.currentGame.room_code);
        showToast(t('parchisi_copied'), 'success');
    };

    // ═══════════════════════════════════════════════════════════
    // COPY ROOM LINK
    // ═══════════════════════════════════════════════════════════
    window.copyRoomLink = function() {
        if (!state.currentGame) return;
        const link = window.location.origin + window.location.pathname + '?room=' + state.currentGame.room_code;
        navigator.clipboard.writeText(link);
        showToast(t('parchisi_copied'), 'success');
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER GAME SCREEN
    // ═══════════════════════════════════════════════════════════
    function renderGameScreen() {
        if (!state.currentGame) return;

        if (Object.keys(state.pieces).length === 0) {
            state.players.forEach(p => {
                state.pieces[p.id] = Array.isArray(p.pieces) ? p.pieces : [
                    { id: 0, position: -1, isHome: true, isFinished: false },
                    { id: 1, position: -1, isHome: true, isFinished: false },
                    { id: 2, position: -1, isHome: true, isFinished: false },
                    { id: 3, position: -1, isHome: true, isFinished: false }
                ];
            });
        }

        drawBoard();
        drawPieces();
        drawPanels();
        updateTurnUI();
    }

    // ═══════════════════════════════════════════════════════════
    // DRAW BOARD
    // ═══════════════════════════════════════════════════════════
    function drawBoard() {
        const board = document.getElementById('board');
        if (!board) return;

        const center = document.getElementById('boardCenter');
        board.innerHTML = '';
        if (center) board.appendChild(center);

        const positions = generateTilePositions();

        positions.forEach((pos, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = 'tile_' + index;
            tile.dataset.position = index;
            tile.style.gridColumn = pos.col;
            tile.style.gridRow = pos.row;

            if (SAFE_TILES.includes(index)) tile.classList.add('safe');

            const zoneColor = getZoneColor(index);
            if (zoneColor) tile.classList.add('start-' + zoneColor);

            board.appendChild(tile);
        });
    }

    // Generate positions for 52 tiles in 15x15 grid
    function generateTilePositions() {
        const positions = [];
        
        // Perimeter path (clockwise from top-left corner)
        // Using 15x15 grid with 52 tiles
        
        // Top row (columns 3-9): 7 tiles
        for (let c = 3; c <= 9; c++) positions.push({ row: 0, col: c });
        
        // Right column (rows 1-4): 4 tiles
        for (let r = 1; r <= 4; r++) positions.push({ row: r, col: 14 });
        
        // Row 5 (columns 10-14): 5 tiles
        for (let c = 10; c <= 14; c++) positions.push({ row: 5, col: c });
        
        // Right column (rows 6-8): 3 tiles
        for (let r = 6; r <= 8; r++) positions.push({ row: r, col: 14 });
        
        // Row 9 (columns 10-14): 5 tiles
        for (let c = 14; c >= 10; c--) positions.push({ row: 9, col: c });
        
        // Right column (rows 10-14): 5 tiles
        for (let r = 10; r <= 14; r++) positions.push({ row: r, col: 14 });
        
        // Bottom row (columns 13-5): 9 tiles
        for (let c = 13; c >= 5; c--) positions.push({ row: 14, col: c });
        
        // Left column (rows 13-10): 4 tiles
        for (let r = 13; r >= 10; r--) positions.push({ row: r, col: 0 });
        
        // Row 9 (columns 4-0): 5 tiles
        for (let c = 4; c >= 0; c--) positions.push({ row: 9, col: c });
        
        // Left column (rows 8-6): 3 tiles
        for (let r = 8; r >= 6; r--) positions.push({ row: r, col: 0 });
        
        // Row 5 (columns 4-0): 5 tiles
        for (let c = 0; c <= 4; c++) positions.push({ row: 5, col: c });
        
        // Left column (rows 4-1): 4 tiles
        for (let r = 4; r >= 1; r--) positions.push({ row: r, col: 0 });
        
        return positions.slice(0, 52);
    }

    function getZoneColor(index) {
        if (index === 0) return 'red';
        if (index === 13) return 'green';
        if (index === 26) return 'yellow';
        if (index === 39) return 'blue';
        return null;
    }

    // ═══════════════════════════════════════════════════════════
    // DRAW PIECES
    // ═══════════════════════════════════════════════════════════
    function drawPieces() {
        document.querySelectorAll('.board-piece').forEach(el => el.remove());

        const piecesByPosition = {};

        Object.keys(state.pieces).forEach(playerId => {
            const player = state.players.find(p => p.id === playerId);
            if (!player) return;
            
            const color = player.color;
            const pieces = state.pieces[playerId] || [];

            pieces.forEach(piece => {
                if (piece.isHome || piece.isFinished) return;
                if (piece.position < 0) return;

                const key = piece.position;
                if (!piecesByPosition[key]) piecesByPosition[key] = [];
                piecesByPosition[key].push({
                    playerId: playerId,
                    color: color,
                    piece: piece
                });
            });
        });

        Object.keys(piecesByPosition).forEach(position => {
            const tile = document.getElementById('tile_' + position);
            if (!tile) return;

            const pieces = piecesByPosition[position];
            const total = pieces.length;

            pieces.forEach((item, i) => {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'board-piece ' + item.color;
                
                const offset = 5;
                const angle = (i / total) * Math.PI * 2;
                const dx = Math.cos(angle) * offset;
                const dy = Math.sin(angle) * offset;
                
                pieceEl.style.left = '50%';
                pieceEl.style.top = '50%';
                pieceEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                pieceEl.textContent = (item.piece.id + 1);

                if (isPieceSelectable(item.playerId, item.piece)) {
                    pieceEl.classList.add('selectable');
                    pieceEl.onclick = () => movePiece(item.playerId, item.piece.id);
                }

                tile.appendChild(pieceEl);
            });
        });
    }

    function isPieceSelectable(playerId, piece) {
        if (!state.currentPlayer) return false;
        if (state.currentPlayer.id !== playerId) return false;
        if (state.currentGame.current_turn !== state.currentPlayer.player_index) return false;
        if (!state.currentGame.dice_rolled) return false;

        const diceValue = state.currentGame.dice_value;

        if (piece.isHome) return diceValue === 6;
        if (piece.isFinished) return false;
        return (piece.position + diceValue) <= 52;
    }

    // ═══════════════════════════════════════════════════════════
    // DRAW PANELS
    // ═══════════════════════════════════════════════════════════
    function drawPanels() {
        const leftPlayer = state.players[1] || state.players[0];
        const rightPlayer = state.players[0];

        if (leftPlayer) updatePanel('left', leftPlayer);
        if (rightPlayer) updatePanel('right', rightPlayer);
    }

    function updatePanel(side, player) {
        const avatarEl = document.getElementById(side + 'Avatar');
        const nameEl = document.getElementById(side + 'Name');
        const colorEl = document.getElementById(side + 'Color');
        const piecesEl = document.getElementById(side + 'Pieces');
        const homeEl = document.getElementById(side + 'Home');
        const finishedEl = document.getElementById(side + 'Finished');

        if (avatarEl) avatarEl.src = player.avatar_url;
        if (nameEl) nameEl.textContent = player.username;
        if (colorEl) colorEl.textContent = t('parchisi_' + player.color);

        const pieces = state.pieces[player.id] || [];
        let homeCount = 0;
        let finishedCount = 0;

        if (piecesEl) {
            piecesEl.innerHTML = '';
            pieces.forEach(piece => {
                if (piece.isHome) homeCount++;
                if (piece.isFinished) finishedCount++;

                const badge = document.createElement('div');
                badge.className = 'piece-badge ' + player.color;
                if (piece.isHome) badge.classList.add('home');
                if (piece.isFinished) badge.classList.add('finished');
                badge.innerHTML = `●<span class="piece-num">${piece.id + 1}</span>`;
                piecesEl.appendChild(badge);
            });
        }

        if (homeEl) homeEl.textContent = homeCount;
        if (finishedEl) finishedEl.textContent = finishedCount;

        const panel = document.getElementById(side === 'left' ? 'panelLeft' : 'panelRight');
        if (panel) {
            const isActive = state.currentGame.current_turn === player.player_index;
            panel.className = 'player-panel p-' + player.color + (isActive ? ' active' : '');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // UPDATE TURN UI
    // ═══════════════════════════════════════════════════════════
    function updateTurnUI() {
        const turnText = document.getElementById('turnText');
        const diceValue = document.getElementById('diceValue');
        const rollBtn = document.getElementById('rollBtn');

        if (!state.currentGame || !state.currentPlayer) return;

        const currentPlayerIndex = state.currentGame.current_turn;
        const currentPlayerData = state.players.find(p => p.player_index === currentPlayerIndex);
        const isMyTurn = currentPlayerData && currentPlayerData.user_id === state.currentUser.id;

        if (turnText) {
            if (isMyTurn) {
                turnText.textContent = t('parchisi_your_turn');
            } else {
                turnText.textContent = currentPlayerData ? 
                    `${currentPlayerData.username}...` : 
                    t('parchisi_waiting_turn');
            }
        }

        if (diceValue) {
            if (state.currentGame.dice_rolled && state.currentGame.dice_value > 0) {
                diceValue.textContent = getDiceEmoji(state.currentGame.dice_value);
            } else {
                diceValue.textContent = '🎲';
            }
        }

        if (rollBtn) {
            rollBtn.disabled = !isMyTurn || state.currentGame.dice_rolled || state.isRolling;
        }
    }

    function getDiceEmoji(value) {
        const emojis = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };
        return emojis[value] || value;
    }

    // ═══════════════════════════════════════════════════════════
    // ROLL DICE
    // ═══════════════════════════════════════════════════════════
    window.rollDice = async function() {
        if (!state.currentGame || state.isRolling) return;

        state.isRolling = true;

        const overlay = document.getElementById('diceOverlay');
        const anim = document.getElementById('diceAnimation');
        if (overlay) overlay.classList.add('show');
        
        const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        let count = 0;
        const interval = setInterval(() => {
            if (anim) anim.textContent = emojis[Math.floor(Math.random() * 6)];
            count++;
            if (count > 10) clearInterval(interval);
        }, 80);

        try {
            const { data, error } = await supabaseClient.rpc('roll_parchisi_dice', {
                p_game_id: state.currentGame.id
            });

            setTimeout(async () => {
                if (overlay) overlay.classList.remove('show');
                state.isRolling = false;

                if (error || !data || !data.success) {
                    showToast(data?.error || error?.message || 'Roll failed', 'error');
                    return;
                }

                console.log('🎲 Rolled:', data.dice_value);
                
                await loadGame(state.currentGame.id);
                setTimeout(() => checkAutoMove(), 500);

            }, 1000);

        } catch (err) {
            console.error('Roll error:', err);
            if (overlay) overlay.classList.remove('show');
            state.isRolling = false;
            showToast('Error: ' + err.message, 'error');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // CHECK AUTO MOVE
    // ═══════════════════════════════════════════════════════════
    function checkAutoMove() {
        if (!state.currentPlayer) return;
        if (state.currentGame.current_turn !== state.currentPlayer.player_index) return;
        if (!state.currentGame.dice_rolled) return;

        const pieces = state.pieces[state.currentPlayer.id] || [];
        const dice = state.currentGame.dice_value;
        const movablePieces = pieces.filter(p => {
            if (p.isHome) return dice === 6;
            if (p.isFinished) return false;
            return (p.position + dice) <= 52;
        });

        if (movablePieces.length === 0) {
            showToast(t('parchisi_no_moves'), 'warning');
            setTimeout(() => nextTurn(), 1500);
        } else if (movablePieces.length === 1 && !movablePieces[0].isHome) {
            setTimeout(() => movePiece(state.currentPlayer.id, movablePieces[0].id), 800);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // MOVE PIECE
    // ═══════════════════════════════════════════════════════════
    window.movePiece = async function(playerId, pieceId) {
        if (!state.currentPlayer || state.currentPlayer.id !== playerId) return;
        if (!state.currentGame.dice_rolled) {
            showToast(t('parchisi_roll_first'), 'error');
            return;
        }

        const dice = state.currentGame.dice_value;
        const pieces = state.pieces[playerId];
        const piece = pieces.find(p => p.id === pieceId);
        if (!piece) return;

        // Move piece
        if (piece.isHome && dice === 6) {
            piece.isHome = false;
            piece.position = getStartPosition(state.currentPlayer.color);
        } else {
            piece.position = Math.min(52, piece.position + dice);
            if (piece.position >= 52) {
                piece.isFinished = true;
                piece.position = 52;
            }
        }

        // Save to DB
        try {
            await supabaseClient
                .from('parchisi_players')
                .update({ pieces: pieces })
                .eq('id', playerId);

            const allFinished = pieces.every(p => p.isFinished);
            if (allFinished) {
                await endGame(playerId);
                return;
            }

            if (dice !== 6) {
                setTimeout(() => nextTurn(), 500);
            } else {
                await supabaseClient
                    .from('parchisi_games')
                    .update({ dice_rolled: false, dice_value: 0 })
                    .eq('id', state.currentGame.id);
                await loadGame(state.currentGame.id);
            }

        } catch (err) {
            console.error('Move error:', err);
            showToast('Error: ' + err.message, 'error');
        }
    };

    function getStartPosition(color) {
        const starts = { red: 0, green: 13, yellow: 26, blue: 39 };
        return starts[color] || 0;
    }

    // ═══════════════════════════════════════════════════════════
    // NEXT TURN
    // ═══════════════════════════════════════════════════════════
    async function nextTurn() {
        if (!state.currentGame) return;

        const nextPlayerIndex = (state.currentGame.current_turn + 1) % state.players.length;

        try {
            await supabaseClient
                .from('parchisi_games')
                .update({
                    current_turn: nextPlayerIndex,
                    dice_rolled: false,
                    dice_value: 0,
                    turn_started_at: new Date().toISOString()
                })
                .eq('id', state.currentGame.id);

            await loadGame(state.currentGame.id);

        } catch (err) {
            console.error('Next turn error:', err);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // END GAME
    // ═══════════════════════════════════════════════════════════
    async function endGame(winnerId) {
        if (!state.currentGame) return;

        const winner = state.players.find(p => p.id === winnerId);

        try {
            await supabaseClient
                .from('parchisi_games')
                .update({
                    status: 'finished',
                    winner_id: winner ? winner.user_id : null
                })
                .eq('id', state.currentGame.id);

            await loadGame(state.currentGame.id);

        } catch (err) {
            console.error('End game error:', err);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // SHOW WINNER
    // ═══════════════════════════════════════════════════════════
    function showWinner() {
        if (!state.currentGame || !state.currentGame.winner_id) return;

        const winner = state.players.find(p => p.user_id === state.currentGame.winner_id);
        const nameEl = document.getElementById('winnerName');
        const overlay = document.getElementById('winnerOverlay');

        if (nameEl) {
            nameEl.textContent = winner ? winner.username : 'Unknown';
        }

        if (overlay) overlay.classList.add('show');
    }

    // ═══════════════════════════════════════════════════════════
    // PLAY AGAIN
    // ═══════════════════════════════════════════════════════════
    window.playAgain = async function() {
        if (!state.currentGame) return;

        for (const player of state.players) {
            const resetPieces = [
                { id: 0, position: -1, isHome: true, isFinished: false },
                { id: 1, position: -1, isHome: true, isFinished: false },
                { id: 2, position: -1, isHome: true, isFinished: false },
                { id: 3, position: -1, isHome: true, isFinished: false }
            ];
            await supabaseClient
                .from('parchisi_players')
                .update({ pieces: resetPieces })
                .eq('id', player.id);
        }

        await supabaseClient
            .from('parchisi_games')
            .update({
                status: 'playing',
                current_turn: 0,
                dice_rolled: false,
                dice_value: 0,
                winner_id: null
            })
            .eq('id', state.currentGame.id);

        document.getElementById('winnerOverlay').classList.remove('show');
        await loadGame(state.currentGame.id);
    };

    // ═══════════════════════════════════════════════════════════
    // REALTIME SUBSCRIPTION
    // ═══════════════════════════════════════════════════════════
    function subscribeToGame(gameId) {
        unsubscribe();

        state.realtimeChannel = supabaseClient
            .channel('parchisi_' + gameId)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'parchisi_games',
                filter: 'id=eq.' + gameId
            }, async (payload) => {
                console.log('📡 Game updated');
                await loadGame(gameId);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'parchisi_players',
                filter: 'game_id=eq.' + gameId
            }, async (payload) => {
                console.log('📡 Players updated');
                await loadGame(gameId);
            })
            .subscribe((status) => {
                console.log('📡 Realtime:', status);
            });
    }

    function unsubscribe() {
        if (state.realtimeChannel) {
            supabaseClient.removeChannel(state.realtimeChannel);
            state.realtimeChannel = null;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // LANGUAGE MENU
    // ═══════════════════════════════════════════════════════════
    window.toggleLanguageMenu = function() {
        const menu = document.getElementById('languageMenu');
        if (!menu) return;
        menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
    };

    window.changeLanguage = function(lang) {
        if (typeof window.setLanguage === 'function') {
            window.setLanguage(lang);
        }
        localStorage.setItem('socialwiki_lang_user_chosen', lang);
        const menu = document.getElementById('languageMenu');
        if (menu) menu.style.display = 'none';
        applyParchisiTranslations();
    };

    // Close menu on outside click
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('languageMenu');
        if (!menu) return;
        if (e.target.closest('.language-selector')) return;
        menu.style.display = 'none';
    });

    // ═══════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════
    async function init() {
        console.log('🎲 Parchisi Star initializing...');

        if (!supabaseClient) {
            console.error('❌ Supabase client not initialized');
            return;
        }

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        state.currentUser = user;

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', user.id)
            .single();
        state.currentProfile = profile;

        const navName = document.getElementById('navProfileName');
        const navImg = document.getElementById('navProfileImg');
        if (navName) navName.textContent = profile?.full_name || profile?.username || 'User';
        if (navImg) navImg.src = profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.username || 'User'}&background=1877f2&color=fff`;

        applyParchisiTranslations();

        // ✅ ملء حقل الإدخال فقط (بدون انضمام تلقائي)
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('room');
        if (roomCode) {
            const input = document.getElementById('joinRoomCode');
            if (input) {
                input.value = roomCode.toUpperCase();
                console.log('📝 Room code filled. Click Join to enter.');
            }
        }

        // ✅ نُظهر اللوبي دائماً — لا استئناف تلقائي
        showScreen('lobby');

        console.log('✅ Parchisi Star ready');
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
