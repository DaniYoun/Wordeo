require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// load router modules: https://expressjs.com/en/guide/routing.html
const wordRoute = require('./routes/words');
const scoreRoute = require('./routes/scores');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const gameRoute = require('./routes/game');
const storeRoutes = require('./routes/store');

// set express app
const app = express();

app.use(cors());
app.use(jsonParser);
app.use(urlencodedParser);
app.use('/words', wordRoute);
app.use('/scores', scoreRoute);
app.use('/api', authRoute);
app.use('/user', userRoute);
app.use('/game', gameRoute);
app.use('/store', storeRoutes);

// Load socket io client to emit events to the server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'help' || data.toString().trim() === 'h') {
    console.log('===HELP MENU:===\n');
    console.log('help | h \t\t\t- display this menu');
    console.log('games | g \t\t\t- display all games');
    console.log('games clean | g clean \t\t- clean up expired games');
    console.log('games clean all | g clean all \t- remove all games (could break things!)');
    console.log('socket test | st \t\t- emit a socket io event');
    console.log('exit | quit \t\t\t- exit the program');

    console.log('\n');
  } else if (data.toString().trim() === 'exit' || data.toString().trim() === 'quit') {
    console.log('EXITING...\n\n');
    process.exit();
  } else if (data.toString().trim() === 'socket test' || data.toString().trim() === 'st') {
    io.emit('message', 'Hello World!');
  }
});
// const InventoryRoutes = require('./routes/inventory');

// test endpoint
app.get('/', (req, res) => {
  res.json({ version: 'V2' });
});

// export
module.exports = {
  server, io,
};
