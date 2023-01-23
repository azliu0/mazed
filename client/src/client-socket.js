import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

export const move = (dir, _id, pin) => {
  console.log("moving");
  socket.emit("move", { dir: dir, _id: _id, pin: pin });
};

export const updateWindowSize = (windowSize) => {
  socket.emit("updateWindowSize", windowSize);
};

/**
 * Event for making a new lobby
 * @param {data.pin} data.pin game pin
 * @param {data.cards} data.cards array of card objects to be used during the game
 */
export const makeNewLobby = (data) => {
  console.log(data);
  socket.emit("makeNewLobby", data);
};

export const joinLobby = (data) => {
  console.log(data);
  socket.emit("joinLobby", data);
};
