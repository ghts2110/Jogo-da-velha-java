export default function createGame(){
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        }
    }

    function start(){
        const frequency = 2000;
        
        setInterval(addFruit, frequency)
    }

    // observer
    const observers = [];

    function subscribe(observerFunction){
        observers.push(observerFunction);
    }

    function notifyAll(command){
        for (const observerFunction of observers){
            observerFunction(command);
        }
    }

    // setar estado
    function setState(newState){
        Object.assign(state, newState);
    }

    // adicionar jogador
    function addPlayer(command){
        const playerId = command.playerId;
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height);
        const playerSocre = 0;

        state.players[playerId] = {
            x: playerX,
            y: playerY,
            score: playerSocre
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY: playerY,
            score: playerSocre
        });
    }

    // remover jogador
    function removePlayer(command) {
        const playerId = command.playerId;

        delete state.players[playerId];

        notifyAll({
            type: 'remove-player',
            playerId: playerId,
        });
    }

    // adicionar fruta
    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000);
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);


        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

         notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY
        });
    }

    // remover fruta
    function removeFruit(command) {
        const fruitId = command.fruitId;

        delete state.fruits[fruitId];

        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId,
        });
    }

    // mover
    function movePlayer(command){
        notifyAll(command);
        
        const acceptedMoves = {
            ArrowUp(player){
                player.y -= 1;
                if(player.y === -1){
                    player.y = state.screen.height-1;
                }
            },
            ArrowRight(player){
                player.x += 1;
                if(player.x === state.screen.width){
                    player.x = 0;
                } 
            },
            ArrowDown(player){
                player.y += 1;
                if(player.y === state.screen.height){
                    player.y = 0;
                } 
            },
            ArrowLeft(player){
                player.x -= 1;
                if(player.x === -1){
                    player.x = state.screen.width-1;
                } 
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

    // score
    function addScore(playerId){
        const player = state.players[playerId];
        if (!player) return;

        player.score += 1;
        
        notifyAll({
            type: 'add-score',
            playerId,
            score: player.score,
        });
    }

    function checkForFruitCollision(playerId){
        const player = state.players[playerId];

        for(const fruitId in state.fruits){
            const fruit = state.fruits[fruitId];

            if(player.x === fruit.x && player.y === fruit.y){
                addScore(playerId);
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
        removeFruit,
        setState,
        subscribe,
        start,
        addScore
    }
}
