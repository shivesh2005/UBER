const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Adjust these three paths/exports if yours differ.
const captainModel = require('./models/captain.model');
const userModel = require('./models/user.model');
const BlackListToken = require('./models/blackListToken.model');

let io;

const isValidCoord = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) &&
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

function initializeSocket(server) {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Authenticate every socket with the same JWT used by the REST API.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      if (await BlackListToken.findOne({ token })) {
        return next(new Error('Token is no longer valid'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id = decoded._id || decoded.id;

      const captain = await captainModel.findById(id);
      if (captain) {
        socket.data = { role: 'captain', id: String(captain._id) };
        return next();
      }
      const user = await userModel.findById(id);
      if (user) {
        socket.data = { role: 'user', id: String(user._id) };
        return next();
      }
      return next(new Error('Account not found'));
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const { role, id } = socket.data;

    if (role === 'captain') {
      await captainModel.findByIdAndUpdate(id, { socketId: socket.id });

      // Captain -> server: "here is my position"
      socket.on('captain:location', async ({ lat, lng, heading } = {}) => {
        lat = Number(lat);
        lng = Number(lng);
        if (!isValidCoord(lat, lng)) return;

        await captainModel.findByIdAndUpdate(id, {
          location: { lat, long: lng },
          status: 'active',
        });

        io.to(`captain:${id}`).emit('captain:location', {
          captainId: id,
          lat,
          lng,
          heading: Number.isFinite(Number(heading)) ? Number(heading) : null,
          at: Date.now(),
        });
      });

      socket.on('disconnect', async () => {
        await captainModel.findByIdAndUpdate(id, { socketId: null, status: 'inactive' });
        io.to(`captain:${id}`).emit('captain:offline', { captainId: id });
      });
    }

    if (role === 'user') {
      // Rider -> server: "let me watch this captain"
      socket.on('rider:track', async ({ captainId } = {}) => {
        if (!mongoose.isValidObjectId(captainId)) return;

        // TODO: once you have a Ride model, only allow this if the captain
        // is assigned to a ride that belongs to this rider (socket.data.id).
        const captain = await captainModel
          .findById(captainId)
          .select('location vehicle status');
        if (!captain) return socket.emit('rider:track-error', { message: 'Captain not found' });

        socket.join(`captain:${captainId}`);

        // Send the last known position straight away.
        if (captain.location?.lat != null && captain.location?.long != null) {
          socket.emit('captain:location', {
            captainId,
            lat: captain.location.lat,
            lng: captain.location.long,
            heading: null,
            at: Date.now(),
          });
        }
        socket.emit('rider:track-started', {
          captainId,
          vehicleType: captain.vehicle?.vehicleType,
          status: captain.status,
        });
      });

      socket.on('rider:untrack', ({ captainId } = {}) => {
        socket.leave(`captain:${captainId}`);
      });
    }
  });

  return io;
}

const getIO = () => io;

module.exports = { initializeSocket, getIO };