// Ruta de login para obtener un token JWT (ejemplo básico)
app.use(express.json());
app.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  // Validación simulada (en producción, validar contra base de datos)
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }
  // Simulación de autenticación exitosa
  const user = { username, role: role || 'player' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user });
});
import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import process from 'process';

const app = express();
const server = http.createServer(app);

// Clave secreta para JWT (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto123';

// Configurar CORS
app.use(cors());

// Middleware de autenticación JWT para rutas HTTP
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'No autenticado' });
  }
}

// Configurar Socket.io con CORS
const io = new Server(server, {
  path: '/fichas-socket',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware de autenticación para conexiones de socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Token de autenticación requerido'));
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Token inválido o expirado'));
    }
    socket.user = user;
    next();
  });
});

// Estado del juego
const rooms = new Map();
const GAME_STATES = {
  WAITING: 'waiting',
  BETTING: 'betting',
  DRAWING: 'drawing',
  REBETTING: 'rebetting',
  REVEALING: 'revealing',
  FINISHED: 'finished',
};

// Generar fichas únicas del 1 al 99
function generateFichas() {
  const fichas = [];
  for (let i = 1; i <= 99; i++) {
    fichas.push(i);
  }
  return fichas;
}

// Mezclar array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id, 'Usuario:', socket.user?.username || 'desconocido');

  // Obtener todas las salas
  socket.on('get-rooms', () => {
    const roomsList = Array.from(rooms.values());
    socket.emit('rooms-updated', roomsList);
  });

  // Crear sala
  socket.on('create-room', (roomConfig) => {
    const roomId = `room-${Date.now()}`;
    const newRoom = {
      id: roomId,
      name: roomConfig.name,
      maxPlayers: roomConfig.maxPlayers,
      minBet: roomConfig.minBet,
      startingChips: roomConfig.startingChips,
      players: [],
      status: 'waiting',
      gameState: GAME_STATES.WAITING,
      pot: 0,
      availableFichas: generateFichas(),
      currentPlayerIndex: 0,
      createdAt: new Date().toISOString()
    };

    rooms.set(roomId, newRoom);
    io.emit('rooms-updated', Array.from(rooms.values()));
    console.log('Sala creada:', roomId);
  });

  // Unirse a sala
  socket.on('join-room', ({ roomId, playerData }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Sala no encontrada' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Sala llena' });
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'La sala ya está en juego' });
      return;
    }

    // Agregar jugador a la sala
    const player = {
      id: playerData.id,
      username: playerData.username,
      socketId: socket.id,
      chips: room.startingChips,
      currentBet: 0,
      fichas: [],
      score: 0,
      status: 'waiting'
    };

    room.players.push(player);
    socket.join(roomId);
    
    socket.emit('room-joined', room);
    io.to(roomId).emit('players-updated', room.players);
    io.emit('rooms-updated', Array.from(rooms.values()));

    // Si se alcanza el mínimo de jugadores, iniciar fase de apuestas
    if (room.players.length >= 2) {
      room.gameState = GAME_STATES.BETTING;
      io.to(roomId).emit('game-state-updated', room.gameState);
    }

    console.log(`Jugador ${playerData.username} se unió a ${roomId}`);
  });

  // Salir de sala
  socket.on('leave-room', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.socketId !== socket.id);
    socket.leave(roomId);
    
    if (room.players.length === 0) {
      rooms.delete(roomId);
    } else {
      io.to(roomId).emit('players-updated', room.players);
    }

    socket.emit('room-left');
    io.emit('rooms-updated', Array.from(rooms.values()));
  });

  // Hacer apuesta
  socket.on('place-bet', (amount) => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    if (amount > player.chips) {
      socket.emit('error', { message: 'No tienes suficientes fichas' });
      return;
    }

    player.chips -= amount;
    player.currentBet = amount;
    room.pot += amount;
    player.status = 'betting';

    io.to(room.id).emit('players-updated', room.players);
    io.to(room.id).emit('pot-updated', room.pot);

    // Verificar si todos apostaron
    const allBetted = room.players.every(p => p.currentBet > 0);
    if (allBetted) {
      if (room.gameState === GAME_STATES.BETTING) {
        // Iniciar fase de juego
        room.gameState = GAME_STATES.DRAWING;
        room.availableFichas = shuffleArray(generateFichas());
        room.currentPlayerIndex = 0;
        
        io.to(room.id).emit('game-state-updated', room.gameState);
        io.to(room.id).emit('current-player-updated', room.players[0]);
      } else if (room.gameState === GAME_STATES.REBETTING) {
        // Iniciar revelación
        room.gameState = GAME_STATES.REVEALING;
        io.to(room.id).emit('game-state-updated', room.gameState);
        
        // Determinar ganador
        setTimeout(() => {
          determineWinner(room);
        }, 3000);
      }
    }
  });

  // Pedir ficha
  socket.on('draw-ficha', () => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.gameState !== GAME_STATES.DRAWING) return;

    const player = room.players.find(p => p.socketId === socket.id);
    const currentPlayer = room.players[room.currentPlayerIndex];

    if (!player || player.id !== currentPlayer.id) {
      socket.emit('error', { message: 'No es tu turno' });
      return;
    }

    if (room.availableFichas.length === 0) {
      socket.emit('error', { message: 'No quedan fichas disponibles' });
      return;
    }

    // Dar ficha al jugador
    const ficha = room.availableFichas.pop();
    player.fichas.push(ficha);
    player.score += ficha;

    // Verificar si se pasó de 100
    if (player.score > 100) {
      player.status = 'bust';
      // Pasar al siguiente jugador automáticamente
      nextPlayer(room);
    }

    io.to(room.id).emit('players-updated', room.players);
    io.to(room.id).emit('fichas-updated', room.availableFichas);
  });

  // Plantarse
  socket.on('stand', () => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.gameState !== GAME_STATES.DRAWING) return;

    const player = room.players.find(p => p.socketId === socket.id);
    const currentPlayer = room.players[room.currentPlayerIndex];

    if (!player || player.id !== currentPlayer.id) {
      socket.emit('error', { message: 'No es tu turno' });
      return;
    }

    player.status = 'stand';
    nextPlayer(room);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    // Remover jugador de todas las salas
    rooms.forEach((room, roomId) => {
      const initialLength = room.players.length;
      room.players = room.players.filter(p => p.socketId !== socket.id);
      
      if (room.players.length !== initialLength) {
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('players-updated', room.players);
        }
        io.emit('rooms-updated', Array.from(rooms.values()));
      }
    });
  });
});

// Funciones auxiliares
function findRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.socketId === socketId)) {
      return room;
    }
  }
  return null;
}

function nextPlayer(room) {
  room.currentPlayerIndex++;
  
  // Verificar si todos los jugadores terminaron
  const allFinished = room.players.every(p => 
    p.status === 'stand' || p.status === 'bust'
  );

  if (allFinished || room.currentPlayerIndex >= room.players.length) {
    // Pasar a segunda ronda de apuestas
    room.gameState = GAME_STATES.REBETTING;
    room.players.forEach(p => p.currentBet = 0);
    io.to(room.id).emit('game-state-updated', room.gameState);
  } else {
    // Siguiente jugador
    io.to(room.id).emit('current-player-updated', room.players[room.currentPlayerIndex]);
  }

  io.to(room.id).emit('players-updated', room.players);
}

function determineWinner(room) {
  // Filtrar jugadores que no se pasaron de 100
  const validPlayers = room.players.filter(p => p.score <= 100);

  if (validPlayers.length === 0) {
    // Nadie ganó, el pozo queda para la siguiente ronda
    io.to(room.id).emit('game-finished', { 
      message: 'Todos se pasaron de 100. El pozo se acumula para la siguiente ronda.',
      winner: null
    });
  } else {
    // Encontrar el más cercano a 100
    const winner = validPlayers.reduce((closest, player) => {
      const closestDiff = 100 - closest.score;
      const playerDiff = 100 - player.score;
      return playerDiff < closestDiff ? player : closest;
    });

    winner.chips += room.pot;
    
    io.to(room.id).emit('game-finished', {
      message: `¡${winner.username} ganó $${room.pot}!`,
      winner: winner
    });
  }

  // Reiniciar juego
  setTimeout(() => {
    resetGame(room);
  }, 5000);
}

function resetGame(room) {
  room.gameState = GAME_STATES.BETTING;
  room.pot = 0;
  room.availableFichas = generateFichas();
  room.currentPlayerIndex = 0;
  
  room.players.forEach(player => {
    player.fichas = [];
    player.score = 0;
    player.currentBet = 0;
    player.status = 'waiting';
  });

  io.to(room.id).emit('game-state-updated', room.gameState);
  io.to(room.id).emit('players-updated', room.players);
  io.to(room.id).emit('pot-updated', room.pot);
}


// Ruta protegida de prueba
app.get('/', authenticateJWT, (req, res) => {
  res.json({
    message: 'Servidor de Fichas a 100 funcionando',
    rooms: rooms.size,
    socketPath: '/fichas-socket',
    user: req.user
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎲 Servidor de Fichas a 100 corriendo en puerto ${PORT}`);
  console.log(`📡 Socket.io path: /fichas-socket`);
});
