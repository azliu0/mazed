const gameLogic = require("./game-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const userToPinMap = {}; // maps user ID to game pin

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;

  // if user was already in a game, reconnect them
  for (let pin in gameLogic.games) {
    for (let _id in gameLogic.games[pin]["players"]) {
      if (_id === user._id) {
        userToPinMap[user._id] = pin;
        gameLogic.games[pin]["players"][user._id]["active"] = true;
        socket.join(pin);
      }
    }
  }
};

const removeUser = (user, socket) => {
  console.log("remove user being called");
  console.log(user);
  if (user) {
    if (userToPinMap[user._id]) {
      let pin = userToPinMap[user._id];
      gameLogic.games[pin]["players"][user._id]["active"] = false;
      console.log("setting to false");
      delete userToPinMap[user._id];
    }
    delete userToSocketMap[user._id];
  }
  delete socketToUserMap[socket.id];
};

const sendGameState = () => {
  // console.log(gameLogic.games);
  // console.log("emitting game state");
  io.emit("update", gameLogic.games);
};

const startRunningGame = () => {
  // let winResetTimer = 0;
  gameLogic.generateMap();
  setInterval(() => {
    gameLogic.updateGameState();
    sendGameState();

    // // Reset game 5 seconds after someone wins.
    // if (gameLogic.gameState.winner != null) {
    //   winResetTimer += 1;
    // }
    // if (winResetTimer > 60 * 5) {
    //   winResetTimer = 0;
    //   gameLogic.resetWinner();
    // }
  }, 1000 / 60); // 60 frames per second
};

startRunningGame();

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
      });

      // description: teacher makes a new lobby
      // data: {pin: gamepin, cards: cards to be used during the game, teacherid: teacherid}
      socket.on("makeNewLobby", (data) => {
        socket.join(data.pin);
        userToPinMap[data.teacherid] = data.pin;
        gameLogic.makeNewGame(data);
      });

      // description: student attempts to join lobby
      // data: { studentid: id, pin: gamepin }
      socket.on("joinLobby", (data) => {
        if (!gameLogic.games[data.pin]) {
          socket.emit("joinFail", { err: "pin does not exist" });
        } else {
          socket.emit("joinSuccess");
          socket.join(data.pin);
          userToPinMap[data.studentid] = data.pin;
          gameLogic.playerJoin(data);
        }
      });

      socket.on("move", (data) => {
        const user = getUserFromSocketID(socket.id);
        // console.log("received movement on server side");
        // if (user) gameLogic.movePlayer(user._id, dir);
        gameLogic.movePlayer(data._id, data.pin, data.dir);
        // TODO uncomment
      });

      socket.on("getPin", (userId) => {
        if (userId) {
          if (userToPinMap[userId]) {
            // user found in userToPinMap
            let pin = userToPinMap[userId];
            socket.emit("receivePin", { pin: pin, cards: gameLogic.games[pin]["cards"] });
            return;
          }
          // check if user was already in a game
          for (let pin in gameLogic.games) {
            for (let _id in gameLogic.games[pin]["players"]) {
              if (_id === userId) {
                socket.emit("receivePin", { pin, pin, cards: gameLogic.games[pin]["cards"] });
                return;
              }
            }
          }
          console.log("user pin not found");
        } else {
          console.log("user not logged in");
        }
      });
      // getPin
      // receivePin

      // data: {windowsize.x: , windowsize.y: , _id: , pin: }
      socket.on("updateWindowSize", (data) => {
        gameLogic.setWindowSize(data._id, data.pin, data.x, data.y);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
};
