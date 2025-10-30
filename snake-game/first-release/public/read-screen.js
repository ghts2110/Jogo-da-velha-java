export default function readScreen(screen, game, requestAnimationFrame, currentPlayerId){
    const context = screen.getContext('2d');
    screen.width = game.state.screen.width;
    screen.height = game.state.screen.height

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