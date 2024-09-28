const express = require ('express');
const bodyParser = require ('body-parser');
const { Server } = require ('socket.io');

const app = express ();
const io = new Server (app);

app.use (bodyParser.json ());


io.on('connection' ,() => {
    console.log('a user connected');
})

io.listen(8080, () => {
    console.log('Server is running on port 8080');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
})


