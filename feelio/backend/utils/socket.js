// feelio/backend/utils/socket.js
let io;

const init = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
      logger.info(`User ${userId} connected to socket`);
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { init, getIO };
