///////////////////////////////////////////////////////////////////////////////////
/* VARIABLES */

var _ROOT_PATH = location.pathname.substring(1, location.pathname.length).split('/')[0].toLowerCase();
_ROOT_PATH = '/' + _ROOT_PATH + '/' + _ROOT_PATH + '/';

var _CLIENT_ID, _CLIENT_IDS = [], _CACHE_DONE = false;

var _DB_SYNC_ONCE_INSTALL_SW = false, _DBS_INFO = {};

console.log('SW._ROOT_PATH = ', _ROOT_PATH, ', _DB_SYNC_ONCE_INSTALL_SW = ', _DB_SYNC_ONCE_INSTALL_SW);

///////////////////////////////////////////////////////////////////////////////////

var _URI_BASE = 'https://test.f88.vn/';
console.log('?????????????????', _URI_BASE);

importScripts('./lib/ServiceWorkerWare.js');

//By using Mozilla's ServiceWorkerWare we can quickly setup some routes
var ___API = new ServiceWorkerWare();

///////////////////////////////////////////////////////////////////////////////////

//#region [ MSG ]

const MSG_REG_WEB_PUSH = new BroadcastChannel('MSG_REG_WEB_PUSH');
MSG_REG_WEB_PUSH.onmessage = e => {
    var data = e.data;

    console.log('MSG_REG_WEB_PUSH === ', JSON.parse(data));
    //___reg_web_push(data);
};

//self.addEventListener('message', (e) => msg___on_message(e));

var msg___on_message = function (e) {
    var data = e.data;
    console.log('SW -> ON_MESSAGE: data = ', data);

    var is_string = typeof data == 'string';

    if (is_string) {
        _CLIENT_ID = data;

        if (_.find(_CLIENT_IDS, function (o) { return o == _CLIENT_ID; }) == null) {
            _CLIENT_IDS.push(_CLIENT_ID);
        }
    }

    if (_CLIENT_IDS.length > 10) {
        _CLIENT_IDS = _.filter(_CLIENT_IDS, function (o, index) { return index > 5; });
        console.log('SW -> ON_MESSAGE -> select top 5 lastest, _CLIENT_IDS = ', JSON.stringify(_CLIENT_IDS));
    }

    console.log('SW -> ON_MESSAGE: data = ', _CLIENT_ID, '; _CACHE_DONE = ', _CACHE_DONE, ', _CLIENT_IDS = ', _CLIENT_IDS);
};

var msg___send = function (data) {
    if (_CLIENT_ID) {
        const m = new BroadcastChannel(_CLIENT_ID);
        m.postMessage(_CLIENT_ID);
        m.close();
    }
};

var msg___broadcast = function (data) {
    console.log('SW -> DB_SYNC -> BROADCAST: _CLIENT_IDS = ', _CLIENT_IDS);

    if (_CLIENT_IDS.length == 0 && _CLIENT_ID) {
        msg___send(data);
    } else {
        for (var i = 0; i < _CLIENT_IDS.length; i++) {
            console.log('SW -> BROADCAST: ' + _CLIENT_IDS[i], data);
            var m = new BroadcastChannel(_CLIENT_IDS[i]);
            m.postMessage(data);
            m.close();
        }
    }
};

//#endregion

///////////////////////////////////////////////////////////////////////////////////

//#region [ ___guid, ___convert_unicode_to_ascii ]

const ___guid = function () {
    return 'id-xxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const ___convert_unicode_to_ascii = function (str) {
    if (str == null || str.length == 0) return '';
    str = str.trim();
    var AccentsMap = [
        "aàảãáạăằẳẵắặâầẩẫấậ",
        "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
        "dđ", "DĐ",
        "eèẻẽéẹêềểễếệ",
        "EÈẺẼÉẸÊỀỂỄẾỆ",
        "iìỉĩíị",
        "IÌỈĨÍỊ",
        "oòỏõóọôồổỗốộơờởỡớợ",
        "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
        "uùủũúụưừửữứự",
        "UÙỦŨÚỤƯỪỬỮỨỰ",
        "yỳỷỹýỵ",
        "YỲỶỸÝỴ"
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
        var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        var char = AccentsMap[i][0];
        str = str.replace(re, char);
    }

    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/ + /g, " ");

    str = str
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

    str = str.toLowerCase();

    return str;
};

//#endregion

///////////////////////////////////////////////////////////////////////////////////

//#region [ PUSH, INSTALL, ACTIVATE ]

self.addEventListener('push', (e) => ___sw_on_push(e));
const ___sw_on_push = async function (e) {
    if (e.data) {
        const data = await e.data.text();
        console.log('SW -> PUSH = ', data);
    }

    //self.registration.showNotification(data.title, { body: 'Yay it works!' });
};

const ___sw_on_install = function (e) {
    console.log('?????????????????????????? INSTALL ...');
};

const ___sw_on_activate = function (e) {
    console.log('?????????????????????????? ACTIVE ...');
};

//#endregion

///////////////////////////////////////////////////////////////////////////////////

//#region [ FETCH - API ]

// List of the default quotations.
var quotations = [
    {
        text: 'Humanity is smart. Sometime in the technology world we think' +
            'we are smarter, but we are not smarter than you.',
        author: 'Mitchell Baker'
    },
    {
        text: 'A computer would deserve to be called intelligent if it could ' +
            'deceive a human into believing that it was human.',
        author: 'Alan Turing'
    },
    {
        text: 'If you optimize everything, you will always be unhappy.',
        author: 'Donald Knuth'
    },
    {
        text: 'If you don\'t fail at least 90 percent of the time' +
            'you\'re not aiming high enough',
        author: 'Alan Kay'
    },
    {
        text: 'Colorless green ideas sleep furiously.',
        author: 'Noam Chomsky'
    }
].map(function (quotation, index) {
    // Add the id and the sticky flag to make the default quotations non removable.
    quotation.id = index + 1;
    quotation.isSticky = true;

    return quotation;
});

// Returns an array with all quotations.
___API.get(_URI_BASE + 'api/quotations', function (req, res) {
    return new Response(JSON.stringify(quotations.filter(function (item) {
        return item !== null;
    })));
});

// Delete a quote specified by id. The id is the position in the collection
// of quotations (the position is 1 based instead of 0).
___API.delete(_URI_BASE + 'api/quotations/:id', function (req, res) {
    var id = parseInt(req.parameters.id, 10) - 1;
    if (!quotations[id].isSticky) {
        quotations[id] = null;
    }
    return new Response({ status: 204 });
});

// Add a new quote to the collection.
___API.post(_URI_BASE + 'api/quotations', function (req, res) {

    console.log('ADD_ITEM: ' + _URI_BASE, req);

    return req.json().then(function (quote) {
        quote.id = quotations.length + 1;
        quotations.push(quote);
        return new Response(JSON.stringify(quote), { status: 201 });
    });
});

////___API.post(root + 'subscribe', function (req, res) {

////    console.log('/SUBSCRIBE: ' + root, req);

////    return fetch(req);
////});

//#endregion

///////////////////////////////////////////////////////////////////////////////////

//#region [ DB CACHE ]

importScripts('./lib/cache.js');
importScripts('./lib/localforage.min.js');
localforage.config({ driver: localforage.INDEXEDDB });
importScripts('./lib/lodash.min.js');

/* DB CHECK */

var COUNTER_CHECK = 0;

var db___check_save = function (key, o) {
    _DBS_INFO[key] = o;

    COUNTER_CHECK++;
    if (COUNTER_CHECK == _CACHE_URLS.length) {
        console.log('SW -> DB_CHECKING: _DBS_INFO = ', _DBS_INFO);
        if (_DB_SYNC_ONCE_INSTALL_SW)
            db___sync();
        else
            db___on_sync_done();
    }
};

var db___check = function () {
    _CACHE_URLS.map(o => {
        var key = o.api;
        console.log('SW -> DB_CHECKING: ', key);

        var request = indexedDB.open(key);
        request.onupgradeneeded = function () {
            console.log('SW -> DB_CREATE_OK: ', key);
            //request.result.createObjectStore(STORE_NAME, { autoIncrement: true });

            self['DB_' + key] = localforage.createInstance({ name: key });

            self['DB_' + key].ready().then(function () {
                console.log('SW -> DB_CREATE_OK -> OPENED: ', key);
                db___check_save(key, { ok: true, size: 0, db: key, action: 'CREATE_NEW' });
            }).catch(function (e) {
                console.log(e);
            });
        };
        request.onerror = function (event) {
            console.log('SW -> DB_OPEN_FAIL: ', key);
            //reject(key);
            db___check_save(key, { ok: false, size: 0, db: key, action: 'OPEN' });
        };
        request.onsuccess = function (event) {
            console.log('SW -> DB_OPEN_OK: ', key);
            //self['DB_' + key] = event.target.result;
            self['DB_' + key] = localforage.createInstance({ name: key });
            if (_DB_SYNC_ONCE_INSTALL_SW) {
                self['DB_' + key].clear().then(function () {
                    console.log('SW -> DB_OPEN_OK -> CLEAR ALL: ', key);
                    db___check_save(key, { ok: true, size: 0, db: key, action: 'OPEN' });
                });
            } else {
                self['DB_' + key].length().then(function (numberOfKeys) {
                    db___check_save(key, { ok: true, size: numberOfKeys, db: key, action: 'OPEN' });
                });
            }
        };

    });
};

/* DB SYNC */

var CACHE_REQUESTS_COUNTER = 0;

var db___sync = function () {
    var CACHE_REQUESTS = _CACHE_URLS.map(url => fetch(url.url));

    Promise.all(CACHE_REQUESTS).then(responses => responses.forEach(async (response, index) => {
        var json = await response.json();
        var key = _CACHE_URLS[index].api;
        //console.log(`${response.url}: ${response.status}`);

        console.log('SW -> DB_SYNC: ' + key, json);

        var a = json, i = 0;
        switch (key) {
            case 'REGION':
                for (i = 0; i < a.length; i++) {
                    a[i].str_name_ascii = ___convert_unicode_to_ascii(a[i].str_name);
                    a[i].str_pid_name = '';
                    a[i].str_pid_name_ascii = '';
                    if (a[i].pid > 0) {
                        var po = _.find(a, function (o) { return o.id == a[i].pid; });
                        if (po) {
                            a[i].str_pid_name = po.str_name;
                            a[i].str_pid_name_ascii = ___convert_unicode_to_ascii(po.str_name);
                        }
                    }
                }
                break;
            case 'PAWN':
                for (i = 0; i < a.length; i++) {
                    a[i].str_city_name_ascii = ___convert_unicode_to_ascii(a[i].str_city_name);
                    a[i].str_district_name_ascii = ___convert_unicode_to_ascii(a[i].str_district_name);
                    if (i % 3 > 0) a[i].area_id = 1; else a[i].area_id = 0;
                }
                break;
        }

        self[key] = a;
        //_CACHE_KEYS.push(key);

        if (key.endsWith('_COLS') == false) {
            var db = self['DB_' + key];
            for (i = 0; i < a.length; i++) {
                //console.log(key, i, self[key][i].id);
                db.setItem(a[i].id, a[i]);
            }
        }

        CACHE_REQUESTS_COUNTER++;
        if (CACHE_REQUESTS_COUNTER == _CACHE_URLS.length) {
            db___on_sync_done();
        }

        return a;
    }));
};

/* DB EVENTS */

var db___on_sync_done = function () {
    console.log('SW -> DB_SYNC: done ... _CLIENT_ID = ', _CLIENT_ID);

    _CACHE_DONE = true;

    msg___broadcast({ command: 'CACHE_DONE' });
};

//#endregion

///////////////////////////////////////////////////////////////////////////////////

// Start the service worker.
___API.init();

console.log('??????????????????????? === db___check');
db___check();