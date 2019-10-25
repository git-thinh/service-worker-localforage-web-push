﻿
var _ROOT_PATH = location.pathname.substring(1, location.pathname.length).split('/')[0].toLowerCase();
_ROOT_PATH = '/' + _ROOT_PATH + '/' + _ROOT_PATH + '/';

var _CLIENT_ID, _CLIENT_IDS = [], _CACHE_DONE = false;

var _DB_SYNC_ONCE_INSTALL_SW = false, _DBS_INFO = {};

console.log('SW._ROOT_PATH = ', _ROOT_PATH, ', _DB_SYNC_ONCE_INSTALL_SW = ', _DB_SYNC_ONCE_INSTALL_SW);

///////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////

importScripts('/_libs/cache.js');
importScripts('/_libs/localforage.min.js');
localforage.config({ driver: localforage.INDEXEDDB });
importScripts('/_libs/lodash.min.js');

///////////////////////////////////////////////////////////////////

self.addEventListener('install', function (event) {
    console.log('SW. installed!');
});

self.addEventListener('activate', function (event) {
    console.log('SW. activated!');
    event.waitUntil(self.clients.claim());
    db___check();
});

///////////////////////////////////////////////////////////////////

self.addEventListener('fetch', function (event) {
    var url = event.request.url;
    console.log('DEBUG: fetch === ', url);

    if (event.request.url.includes('cookbook-proxy')) {
        var init = {
            method: 'GET',
            mode: event.request.mode,
            cache: 'default'
        };

        var url2 = event.request.url.split('cookbook-proxy/')[1];
        console.log('DEBUG: proxying', url2);

        event.respondWith(fetch(url2, init));
    } else {
        event.respondWith(fetch(event.request));
    }



    //var res = new Response(JSON.stringify({ Ok: true }), {
    //    headers: { 'Content-Type': 'application/json' }
    //});
    //event.respondWith(res);
});

///////////////////////////////////////////////////////////////////

////self.addEventListener('message', (e) => msg___on_message(e));

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

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
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
            db___check_save(key,{ ok: false, size: 0, db: key, action: 'OPEN' });
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

///////////////////////////////////////////////////////////////////
/* DB SYNC */

var CACHE_REQUESTS = _CACHE_URLS.map(url => fetch(url.url));
var CACHE_REQUESTS_COUNTER = 0;

var db___sync = function () {
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

///////////////////////////////////////////////////////////////////
/* DB EVENTS */

var db___on_sync_done = function () {
    console.log('SW -> DB_SYNC: done ... _CLIENT_ID = ', _CLIENT_ID);

    _CACHE_DONE = true;

    msg___broadcast({ command: 'CACHE_DONE' });
};

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
