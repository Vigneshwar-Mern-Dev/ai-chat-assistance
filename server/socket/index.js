const { Server } = require("socket.io");
const { isAllowedOrigin } = require("../utils/corsOptions");
const { validateSocketAuth } = require("../utils/dashboardAuth");

function createSocketServer(httpServer, store) {
  const io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin is not allowed"));
      }
    }
  });

  io.use(validateSocketAuth);

  store.on("snapshot", (snapshot) => {
    io.emit("app:snapshot", snapshot);
  });

  io.on("connection", (socket) => {
    socket.emit("app:snapshot", store.getSnapshot());
  });

  return io;
}

module.exports = {
  createSocketServer
};
