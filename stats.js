var gameStatus = {
    since : Date.now(),     /* this is totally ours */
    gamesInitialized : 0,   /* number of games initialized */
    gamesAborted : 0,       /* number of games aborted */
    gamesCompleted : 0      /* number of games successfully completed */
};

module.exports = gameStatus;