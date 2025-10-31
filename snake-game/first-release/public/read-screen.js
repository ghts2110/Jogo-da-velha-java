export function readScreen(screen, game, requestAnimationFrame, currentPlayerId){
    const context = screen.getContext('2d');
    screen.width = game.state.screen.width;
    screen.height = game.state.screen.height;

    context.fillStyle = 'white';
    context.clearRect(0, 0, screen.width, screen.height);

    for(const playerId in game.state.players){
        const player = game.state.players[playerId];
        context.fillStyle = 'red';
        context.fillRect(player.x, player.y, 1, 1);
    }

    for(const fruitId in game.state.fruits){
        const fruit = game.state.fruits[fruitId];
        context.fillStyle = 'green';
        context.fillRect(fruit.x, fruit.y, 1, 1);
    }

    const currentPlayer = game.state.players[currentPlayerId];

    if(currentPlayer){
        context.fillStyle = '#F0DB4F';
        context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1);
    }

    requestAnimationFrame(() => {
        readScreen(screen, game, requestAnimationFrame, currentPlayerId);
    });
}

function prepHiDPICanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;

  const { width: cssW, height: cssH } = canvas.getBoundingClientRect();

  canvas.width  = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);

  const ctx = canvas.getContext('2d');

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return ctx;
}

export function readScoreScreen(screen, game, requestAnimationFrame, currentPlayerId) {
    const ctx = prepHiDPICanvas(screen);
    const W = screen.clientWidth;
    const H = screen.clientHeight;

    // fundo + título
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('Jogadores', 10, 10);

    // coluna de lista
    const playersSorted = Object.entries(game.state.players)
        .sort(([, a], [, b]) => (b.score ?? 0) - (a.score ?? 0));
    
    ctx.font = '12px monospace';
    const leftX = 10;
    const rightX = W - 12;
    let y = 36;
    const lineH = 18;
    const truncate = (s, max = 22) => (s.length > max ? s.slice(0, max - 3) + '...' : s);

    for (const [playerId, p] of playersSorted) {
        const score = p?.score ?? 0;

        ctx.fillStyle = playerId === currentPlayerId ? '#1a73e8' : '#111';
        ctx.fillText(truncate(playerId), leftX, y);

        ctx.fillStyle = '#111';
        ctx.fillText(String(score), rightX, y);

        y += lineH;
        if (y > H - 10) break;
    }

    requestAnimationFrame(() => readScoreScreen(screen, game, requestAnimationFrame, currentPlayerId));
}
