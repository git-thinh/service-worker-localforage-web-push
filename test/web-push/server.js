
const _NET = require('net');
const _PATH = require('path');

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

let _MESSAGE_BUFFER = [];
let _SUBSCRIBES_CLIENTS = [];

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/* TCP_SERVER:55555 - PROXY FOR NGINX */

const _TCP_SERVER_PORT = 55555;
const _TCP_SERVER = new _NET.Server();

_TCP_SERVER.listen(_TCP_SERVER_PORT, function () {
    console.log(`TCP_SERVER: Server listening for connection requests on socket localhost:${_TCP_SERVER_PORT}`);
});

_TCP_SERVER.on('connection', function (socket) {
    console.log('TCP_SERVER: A new connection has been established.');
    //socket.write('Hello, client.');

    socket.on('data', function (chunk) {
        const s = chunk.toString();
        console.log('TCP_SERVER <- ' + s);
        _MESSAGE_BUFFER.push(s);
    });

    socket.on('end', function () {
        console.log('TCP_SERVER: Closing connection with the client');
    });

    socket.on('error', function (err) {
        console.log('TCP_SERVER: Error: ...');
    });
});

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/* HTTP:5000 - WEB-PUSH */

require('dotenv').config({ path: 'variables.env' });

const _HTTP_EXPRESS = require('express');
const _HTTP_WEB_PUSH = require('web-push');
const _HTTP_BODY_PARSER = require('body-parser');

const _HTTP_APP = _HTTP_EXPRESS();

_HTTP_APP.use(_HTTP_BODY_PARSER.json());
_HTTP_APP.use(_HTTP_EXPRESS.static(_PATH.join(__dirname, 'client')));

_HTTP_WEB_PUSH.setVapidDetails('mailto:test@example.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);

_HTTP_APP.post('/subscribe', (req, res) => {
    const subscription = req.body;
    console.log('WEB_PUSH: subscribe == ', subscription);
    _SUBSCRIBES_CLIENTS.push(subscription);
    res.status(201).json({ ok: true, total_clients: _SUBSCRIBES_CLIENTS.length });

    setInterval(function (_subscription) {
        const payload = JSON.stringify({ title: new Date() });
        _HTTP_WEB_PUSH.sendNotification(_subscription, payload).catch(error => console.error(error));
        console.log('WEB_PUSH: -> NOTIFY: ' + payload);
    }, 5000, subscription);
});

_HTTP_APP.set('port', process.env.PORT || 5000);
const _HTTP_SERVER = _HTTP_APP.listen(_HTTP_APP.get('port'), () => {
    console.log(`WEB_PUSH: Express running → PORT ${_HTTP_SERVER.address().port}`);
});

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/* TCP_CLIENT:55555 -> AUTO PUSH TO TCP_SERVER -> PUSH NOTIFY VIA WEB-PUSH */

var _TCP_CLIENT_CONNECTED = false;
var _TCP_CLIENT;
var _TCP_CLIENT_TIMER_INTERVAL;

function f_tcp___build_new_mesage() {
    let m = { title: 'Thông báo', body: new Date().toString() };
    return m;
}

function f_tcp_client___connect() {
    if (_TCP_CLIENT_CONNECTED) return;

    _TCP_CLIENT = new _NET.Socket();
    _TCP_CLIENT.connect(80, '127.0.0.1', function () {
        _TCP_CLIENT_CONNECTED = true;
        console.log('CLIENT_TCP: Connected');
        //client.write('Hello, server! Love, Client.');

        //////_TCP_CLIENT_TIMER_INTERVAL = setInterval(function (_client) {
        //////    try {
        //////        const s = JSON.stringify(f_tcp___build_new_mesage());
        //////        //console.log('TCP_CLIENT -> ' + s);
        //////        _client.write(s);
        //////    } catch (e) {
        //////        clearInterval(_TCP_CLIENT_TIMER_INTERVAL);
        //////        console.log('TCP_CLIENT -> ERROR: ', e);
        //////    }
        //////}, 3000, _TCP_CLIENT);

    });

    _TCP_CLIENT.on('error', function (ex) {
        clearInterval(_TCP_CLIENT_TIMER_INTERVAL);
        _TCP_CLIENT_CONNECTED = false;
        console.log("CLIENT_TCP: handled error ....");
        //console.log(ex);
    });

    _TCP_CLIENT.on('data', function (data) {
        try {
            console.log('CLIENT_TCP: Received: ' + data);
            _TCP_CLIENT.destroy(); // kill client after server's response
        } catch (e) { ; }
    });

    _TCP_CLIENT.on('close', function () {
        _TCP_CLIENT_CONNECTED = false;
        console.log('CLIENT_TCP: Connection closed');
    });
}

f_tcp_client___connect();
setInterval(function () { if (_TCP_CLIENT_CONNECTED == false) f_tcp_client___connect(); }, 5000);

//setInterval(function () {
//    if (_MESSAGE_BUFFER.length > 0) {
//        for (var i = 0; i < _SUBSCRIBES_CLIENTS.length; i++) {
//            const suc = _SUBSCRIBES_CLIENTS[i];
//            const payload = _MESSAGE_BUFFER.shift();
//            _HTTP_WEB_PUSH.sendNotification(suc, payload).catch(error => console.error(error));
//            console.log('WEB_PUSH: -> NOTIFY: ' + payload);
//        }
//    }
//}, 1000);

