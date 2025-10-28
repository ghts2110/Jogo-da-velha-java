export default function createGame(){
        const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        }
    }

    // adicionar jogador
    function addPlayer(command){
        const playerId = command.playerId;
        const playerX = command.playerX;
        const playerY = command.playerY;

        state.players[playerId] = {
            x: playerX,
            y: playerY
        }
    }

    // remover jogador
    function removePlayer(command) {
        const playerId = command.playerId;

        delete state.players[playerId];
    }

    // adicionar fruta
    function addFruit(command) {
        const fruitId = command.fruitId;
        const fruitX = command.fruitX;
        const fruitY = command.fruitY;

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }
    }

    // remover fruta
    function removeFruit(command) {
        const fruitId = command.fruitId;

        delete state.fruits[fruitId];
    }

    // mover
    function movePlayer(command){
        const acceptedMoves = {
            ArrowUp(player){
                if(player.y > 0) player.y -= 1;
            },
            ArrowRight(player){
                if(player.x < state.screen.width-1) player.x += 1;
            },
            ArrowDown(player){
                if(player.y < state.screen.height-1) player.y += 1;
            },
            ArrowLeft(player){
                if(player.x > 0) player.x -= 1;
            }
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[command.playerId];
        const moveFunction = acceptedMoves[keyPressed];
        
        if(player && moveFunction){
            moveFunction(player);
            checkForFruitCollision(playerId);
        }
    }

    function checkForFruitCollision(playerId){
        const player = state.players[playerId];

        for(const fruitId in state.fruits){
            const fruit = state.fruits[fruitId];

            if(player.x === fruit.x && player.y === fruit.y){
                removeFruit({fruitId: fruitId});
            }
        }
    }

    return {
        movePlayer,
        state,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit
    }
}
