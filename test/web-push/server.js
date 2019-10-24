
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
let _MESSAGE_NOTIFY = '';

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/* TCP_SERVER:55555 - PROXY FOR NGINX */

// Include Nodejs' net module.
const Net = require('net');
// The port on which the server is listening.
const port = 55555;

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new Net.Server();
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
server.listen(port, function () {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
});

// When a client requests a connection with the server, the server creates a new
// socket dedicated to that client.
server.on('connection', function (socket) {
    console.log('A new connection has been established.');

    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.


    //socket.write('Hello, client.');

    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function (chunk) {
        //console.log(`Data received from client: ${chunk.toString()`});

        const s = chunk.toString();
        _MESSAGE_NOTIFY = s;
        //console.log('Data received from client: ' + s);
        console.log('> TCP_SERVER <- ' + s);
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function () {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function (err) {
        //console.log(`Error: ${err}`);
        console.log('Error: ...');
    });
});

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/* HTTP:5000 - WEB-PUSH */

require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
console.log('publicVapidKey == ', publicVapidKey);
console.log('privateVapidKey == ', privateVapidKey);

webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

// Subscribe route

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    console.log('subscribe == ', subscription);

    res.status(201).json({});

    setInterval(function (_subscription) {
        // create payload

        if (_MESSAGE_NOTIFY.length > 0) {
            const payload = JSON.stringify({ title: _MESSAGE_NOTIFY });
            webPush.sendNotification(_subscription, payload).catch(error => console.error(error));
            _MESSAGE_NOTIFY = '';
            console.log('> WEB_PUSH -> NOTIFY: ' + _MESSAGE_NOTIFY);
        }

    }, 1000, subscription);

});

app.set('port', process.env.PORT || 5000);
const server_http = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server_http.address().port}`);
});


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/* TCP_CLIENT:55555 -> AUTO PUSH TO TCP_SERVER -> PUSH NOTIFY VIA WEB-PUSH */

var client = new Net.Socket();
client.connect(port, '127.0.0.1', function () {
    console.log('Connected');
    //client.write('Hello, server! Love, Client.');

    setInterval(function (_client) {
        const s = new Date().toString();
        console.log('> TCP_CLIENT -> ' + s);
        _client.write(s);
    }, 3000, client);

});

client.on('data', function (data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('close', function () {
    console.log('Connection closed');
});

