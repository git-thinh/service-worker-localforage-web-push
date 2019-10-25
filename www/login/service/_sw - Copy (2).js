
var _ROOT_PATH = location.pathname.substring(1, location.pathname.length).split('/')[0].toLowerCase();
_ROOT_PATH = '/' + _ROOT_PATH + '/' + _ROOT_PATH + '/';

var _CLIENT_CURRENT_ID, _CLIENT_ID, _CLIENT_IDS = [], _CACHE_DONE = false;

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

importScripts('/_libs/localforage.min.js');

localforage.config({ driver: localforage.INDEXEDDB });

importScripts('/_libs/lodash.min.js');

///////////////////////////////////////////////////////////////////

self.addEventListener('install', function (event) {
    console.log('SW. installed!');
});

self.addEventListener('activate', function (event) {
    console.log('SW. activated!');
    db___check();
    event.waitUntil(self.clients.claim());
});

//self.addEventListener('message', (e) => ___msg_on_message(e));

const _MSG_SERVICE_CHANNEL = new BroadcastChannel('MSG_SERVICE_CHANNEL');
_MSG_SERVICE_CHANNEL.onmessage = e => msg___on_message(e);
var msg___on_message = function (e) {
    var data = e.data;
    var is_string = typeof data == 'string';
    _CLIENT_CURRENT_ID = data;

    if (is_string) {
        if (_.find(_CLIENT_IDS, function (o) { return o == _CLIENT_ID; }) == null) {
            _CLIENT_IDS.push(_CLIENT_ID);
            localStorage['_CLIENT_IDS'] = JSON.stringify(_CLIENT_IDS);
        }
    }

    if (_CLIENT_IDS.length > 10) {
        _CLIENT_IDS = _.filter(_CLIENT_IDS, function (o, index) { return index > 5; });
        console.log('SW -> ON_MESSAGE -> select top 5 lastest, _CLIENT_IDS = ', JSON.stringify(_CLIENT_IDS));
    }

    console.log('SW -> ON_MESSAGE: data = ', _CLIENT_CURRENT_ID, '; _CACHE_DONE = ', _CACHE_DONE, ', _CLIENT_IDS = ', localStorage['_CLIENT_IDS']);
};
var msg___send = function (data) {
    if (_CLIENT_ID) {
        const m = new BroadcastChannel(_CLIENT_ID);
        m.postMessage(_CLIENT_ID);
        m.close();
    }
};

function msg___broadcast(data) {
    console.log('SW -> DB_SYNC -> BROADCAST: _CLIENT_IDS = ', localStorage['_CLIENT_IDS']);

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

const _SQL_CUSTOMER_CACHE_ALL =
    "SELECT [CustomerID] as id ^\
        ,isnull([Status],'') as int_status ^\
        ,isnull([Name],'') as str_name ^\
        ,isnull([Gender],'') as bit_gender ^\
        ,CAST(replace(replace(replace(convert(varchar, Created, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_created_dtime ^\
        ,isnull(CAST(replace(replace(replace(convert(varchar, [Birthday], 120), '-', ''), ':', ''), ' ', '') AS bigint), 0) as int_birthday_date ^\
        ,isnull([Address],'') as str_address ^\
        ,isnull([Mobile],'') as str_phone ^\
        ,isnull([Email],'') as str_email ^\
    FROM [pos].[PawnOnlineCustomer]";

const _SQL_PAWN_CACHE_ALL =
    "SELECT TOP 100 p.PawnOnlineID as id ^\
    , isnull(p.Status, 1)           as int_status ^\
    , isnull(p.Queued, -1)          as int_queued ^\
    , isnull(p.POLRegion, 0)        as area_id ^\
    , isnull(p.ReferenceId, 0)      as ref_id ^\
    , isnull(p.ReferenceType, 0)    as int_ref_type ^\
    , isnull(p.Asset, '')           as str_asset_type ^\
    , isnull(p.Trademark, '')       as str_trademark ^\
    , isnull(p.ProductionYear, '')  as str_product_year ^\
    , isnull(p.Url, '')             as str_url ^\
    , isnull(p.Description, '')     as str_description ^\
    , CAST(replace(replace(replace(convert(varchar, p.Created, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_created_dtime ^\
    , CAST(replace(replace(replace(convert(varchar, p.RegisterDate, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_register_dtime ^\
    , isnull(p.Money, 0)            as lng_money ^\
    , isnull(p.Days, 0)             as int_days ^\
    , isnull(p.CarInBank, 0)        as bit_car_in_bank ^\
    , isnull(p.PawnID, 0)           as pos_pawn_id ^\
    , isnull(p.ShopID, 0)           as shop_id ^\
    , isnull(p.ShopCallerID, 0)     as shop_caller_id ^\
    , isnull(p.CustomerID, 0)       as customer_id ^\
    , isnull(p.RegionID, 0)         as district_id ^\
    , isnull(p.County, '')           as str_district_name ^\
    , isnull(p.Province, '')        as str_city_name ^\
FROM                                [pos].[PawnOnline] p ^\
--where p.ShopCallerID is not null and p.ShopCallerID > 0 ^\
order by p.Created desc";

const _SQL_USER_CACHE_ALL =
    "SELECT DISTINCT ^\
        u.UserID as id, ^\
        u.UserName as str_user_name, ^\
        g.[Name] as str_group_name, ^\
        u.UserFullName as str_full_name, ^\
        '12345' as str_pass_word, ^\
        (CASE ^\
                WHEN u.ApproveLevel = 1 AND UserPosition = 4 THEN N'Nhân viên cửa hàng' ^\
                WHEN u.ApproveLevel = 1 AND UserPosition = 3 THEN N'Quản lý CH' ^\
                WHEN u.ApproveLevel = 2 THEN 'QLKV' END) ^\
        as str_possition, ^\
        ug.GroupID as group_id, ^\
        s.ShopID as shop_id, ^\
        s.Name as str_shop_name ^\
    FROM pos.[User] u ^\
        INNER JOIN pos.[UserGroup] ug ON ug.UserID = u.UserID ^\
        INNER JOIN pos.[Group] g ON ug.GroupID = g.GroupID ^\
                                                            AND g.STATUS = 1 AND g.IsShop = 1 AND g.GroupID NOT IN(46) ^\
        INNER JOIN pos.[GroupShop] gs ON g.GroupID = gs.GroupID ^\
        INNER JOIN pos.[ShopDetail] s ON gs.ShopCode = s.Code AND s.OpenDate IS NOT NULL AND s.CloseDate IS NULL AND s.STATUS = 1 AND s.ShopID NOT IN(20, 154) ^\
    WHERE u.STATUS = 1 ^\
        AND(u.ApproveLevel = 1 OR u.ApproveLevel IS NULL) ^\
        --AND s.Code IN('HN01DT')";

const _URI_API_JSON = '/adm-pawn-online/api-json?token=EB976D531188435EA006FCE8769C53D5&api=';
const _URI_API_JSON_AMAZON = '/adm-pawn-online/api-json?str_connect=DB_CACHE_POS_AMAZON&token=EB976D531188435EA006FCE8769C53D5&api=';

const _CACHE_URLS = [
    //{
    //    api: 'PAWN_COLS',
    //    url: _ROOT_PATH + '/_json/pawn-grid-cols.json'
    //},
    //{
    //    api: 'PAWN',
    //    url: _URI_API_JSON_AMAZON + "PAWN&cache=false&sql=" + _SQL_PAWN_CACHE_ALL
    //},
    //{
    //    api: 'USER',
    //    url: _URI_API_JSON_AMAZON + "USER&cache=true&sql=" + _SQL_USER_CACHE_ALL
    //},
    //{
    //    api: 'CUSTOMER',
    //    url: _URI_API_JSON_AMAZON + "CUSTOMER&cache=true&sql=" + _SQL_CUSTOMER_CACHE_ALL
    //},
    //{
    //    api: 'DMVV',
    //    url: _URI_API_JSON_AMAZON + "DMVV&cache=true&sql=" + "SELECT  ROW_NUMBER() OVER(ORDER BY [ma_vv] ASC) as id, [ma_vv] as str_code, [ten_vv] as str_name FROM [dbo].[dmvv] where ten_vv2 != ''"
    //},
    {
        api: 'AREA',
        url: _URI_API_JSON + "AREA&cache=true&sql=" + "select id,name as str_name from mobile.pol_area"
    },
    //{
    //    api: 'STEP',
    //    url: _URI_API_JSON + "STEP&cache=true&sql=" + "select id,name as str_name from mobile.pol_step"
    //},
    {
        api: 'CHANNEL',
        url: _URI_API_JSON_AMAZON + "CHANNEL&cache=false&sql=" + "SELECT distinct ROW_NUMBER() OVER(ORDER BY [name] ASC) as id, [name] as str_name,[Status] as [state] FROM [pos].[PawnOnlineSource] order by [name]"
    },
    //{
    //    api: 'REGION',
    //    url: _URI_API_JSON_AMAZON + "REGION&cache=true&sql=" + "select [RegionID] as id ,[Name] as str_name, isnull([ParentID],0) as pid from pos.region"
    //},
    {
        api: 'SHOP',
        url: _URI_API_JSON_AMAZON + "SHOP&cache=true&sql=" + "select shopid as id, code, [name] as str_name from pos.shopdetail"
    }
];

///////////////////////////////////////////////////////////////////
/* DB CHECK */

var CACHE_CHECKS = _CACHE_URLS.map(o => {
    var key = o.api;
    console.log('SW -> DB_CHECKING: ', key);

    return new Promise(function (resolve, reject) {
        var request = indexedDB.open(key);
        request.onupgradeneeded = function () {
            console.log('SW -> DB_CREATE_OK: ', key);
            //request.result.createObjectStore(STORE_NAME, { autoIncrement: true });

            self['DB_' + key] = localforage.createInstance({ name: key });

            self['DB_' + key].ready().then(function () {
                console.log('SW -> DB_CREATE_OK -> OPENED: ', key);
                resolve({ ok: true, size: 0, db: key, action: 'CREATE_NEW' });
            }).catch(function (e) {
                console.log(e);
            });
        };
        request.onerror = function (event) {
            console.log('SW -> DB_OPEN_FAIL: ', key);
            //reject(key);
            resolve({ ok: false, size: 0, db: key, action: 'OPEN' });
        };
        request.onsuccess = function (event) {
            console.log('SW -> DB_OPEN_OK: ', key);
            //self['DB_' + key] = event.target.result;
            self['DB_' + key] = localforage.createInstance({ name: key });
            if (_DB_SYNC_ONCE_INSTALL_SW) {
                self['DB_' + key].clear().then(function () {
                    console.log('SW -> DB_OPEN_OK -> CLEAR ALL: ', key);
                    resolve({ ok: true, size: 0, db: key, action: 'OPEN' });
                });
            } else {
                self['DB_' + key].length().then(function (numberOfKeys) {
                    resolve({ ok: true, size: numberOfKeys, db: key, action: 'OPEN' });
                });
            }
        };

    });
});
var COUNTER_CHECK = 0;
var db___check = function () {
    Promise.all(CACHE_CHECKS).then(vals => vals.forEach((o, index) => {
        //console.log('SW -> DB_DONE: ', index, o);
        var key = _CACHE_URLS[index].api;
        //console.log('SW -> DB_CHECKING: ', key);
        _DBS_INFO[key] = o;

        COUNTER_CHECK++;
        if (COUNTER_CHECK == _CACHE_URLS.length) {
            console.log('SW -> DB_CHECKING: _DBS_INFO = ', localStorage['_CLIENT_IDS']);
            if (_DB_SYNC_ONCE_INSTALL_SW)
                db___sync();
            else
                db___on_sync_done();
        }
    }));
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
    console.log('SW -> DB_SYNC: done ...');

    _CACHE_DONE = true;

    msg___broadcast({ command: 'CACHE_DONE' });
};

///////////////////////////////////////////////////////////////////

