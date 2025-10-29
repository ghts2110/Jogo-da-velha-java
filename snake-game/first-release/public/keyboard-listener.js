export default function createKeyboardListener(document){
    const state = {
        observers: [],
        playerID: null
    }

    function registerPlayerId(playerID){
        state.playerID = playerID;
    }

    function subscribe(observerFunction){
        state.observers.push(observerFunction);
    }

    function notifyAll(command){
        for (const observerFunction of state.observers){
            observerFunction(command);
        }
    }

    document.addEventListener('keydown', handleKeydown);
    
    function handleKeydown(event){
        const keyPressed = event.key;

        const command = {
            type: 'move-player',
            playerId: state.playerID,
            keyPressed
        }

        notifyAll(command);
    }

    return {
        subscribe,
        registerPlayerId
    }
}