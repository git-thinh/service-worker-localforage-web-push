var _ROOT_PATH = location.pathname.substring(1, location.pathname.length).split('/')[0].toLowerCase();
_ROOT_PATH = '/' + _ROOT_PATH + '/' + _ROOT_PATH + '/';
console.log('SW._ROOT_PATH = ', _ROOT_PATH);

importScripts('/_libs/lodash.min.js');
//importScripts(_ROOT_PATH + '_CONFIG.js');

//importScripts(_ROOT_PATH + 'service/const.js');
//importScripts(_ROOT_PATH + 'service/base.js');
//importScripts(_ROOT_PATH + 'service/msg.js');
//importScripts(_ROOT_PATH + 'service/ws.js');

var _URI = location.protocol + '//' + location.host;

var SCOPE = {
    'test': [
        _URI + '/adm-test'
    ],
    'vtp': [
        _URI + '/adm-vtp-pawn',
        _URI + '/adm-vtp-pawn-invited'
    ],
    'pol': [
        _URI + '/adm-pawn-online'
    ],
    'afsg': [
        _URI + '/adm-affiliate-finance-sg'
    ],
    'ketoan': [
        _URI + '/adm-affiliate-accountant'
    ]
};

var USER = [
    { user_id: 1, ref_id: 1, scope: 'test', username: 'test', password: '12345', fullname: 'Test' },
    { user_id: 2, ref_id: 1, scope: 'ketoan', username: 'ketoan', password: '12345', fullname: 'Kế toán' },
    { user_id: 4, ref_id: 1, scope: 'afsg', username: 'afsg', password: '12345', fullname: 'Tài chính Sài Gòn' },
    { user_id: 4, ref_id: 1, scope: 'vtp', username: 'vtp', password: '12345', fullname: 'Viettel-Post' },
    { user_id: 5, ref_id: 1, scope: 'pol', username: 'pol', password: '12345', fullname: 'PawnOnline DRS' }
];

var PROFILE = {};

function get_token(user) {
    var token = JSON.stringify({ user_id: user.user_id, time: new Date().toString(), username: user.username, scope: user.scope });
    var encode_url = encodeURIComponent(token);
    return btoa(encode_url);
}

var _msg_token = new BroadcastChannel('MSG_LOGIN_TOKEN_VALID');
_msg_token.onmessage = (e) => {
    console.log(_ROOT_PATH + ' > MSG_LOGIN_TOKEN_VALID', e.data);
    //var ok = e.data == PROFILE.token;
    //if (ok) {
    _msg_token.postMessage(PROFILE);
    //} else {
    //    _msg_token.postMessage({ ok: false });
    //}
};


self.addEventListener('message', function (e) {
    var msg = e.data,
        command = msg.command,
        data = msg.data;

    console.log("SW> msg = ", msg);

    var _items = [];

    if (self[command] != null) {
        //_items = _.filter(self[command], function (o, index) { return index == 0; });

        eval('var _func = ' + msg.data);
        _items = _.filter(self[command], _func);
        if (_items.length > 0) {
            var user = JSON.parse(JSON.stringify(_items[0]));
            var token = get_token(user);
            user.token = token;
            user.ok = true;
            delete user['password'];
            user.scope_urls = SCOPE[user.scope];
            user.redirect_url = SCOPE[user.scope] == null ? '' : (SCOPE[user.scope][0] + '?token=' + token);

            console.log("SW> LOGIN_OK = ", user);
            PROFILE = user;

            e.ports[0].postMessage({
                ok: true,
                result_items: [user],
                request: msg,
                total_items: self[command].length,
                count_result: _items.length,
                page_number: 1,
                page_size: 10
            });
        } else {
            e.ports[0].postMessage({
                ok: true,
                result_items: [],
                request: msg,
                total_items: self[command].length,
                count_result: 0,
                page_number: 1,
                page_size: 10
            });
        }
    } else {
        switch (command) {
            case 'USER_LOGIN':
                //_items = _.filter(_USER, )
                e.ports[0].postMessage({ ok: true, result_items: _items });
                break;
        }
    }
});