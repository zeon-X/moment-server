let io;

export const setIO = (socketServer) => {
  io = socketServer;
};

export const getIO = () => io;

export const emitToUser = (userId, event, payload) => {
  if (!io) return;

  io.to(`user:${userId}`).emit(event, payload);
};
