//////////////////////////////////////////////////////////////////////////////
/* GLOBAL FUNTIONS */

var ___go_login = function (msg) {
    if (msg && msg.length > 0)
        location.href = location.protocol + '//' + location.host + '/login?message=' + msg;
    else
        location.href = location.protocol + '//' + location.host + '/login';
};

var ___convert_unicode_to_ascii = function (str) {
    if (str == null || str.length == 0) return '';
    str = str.trim();
    if (str.length == 0) return '';

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

var ___guid = function () {
    return 'id-xxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

var ___send_message = function (data) {
    return new Promise(function (resolve, reject) {
        const client = new BroadcastChannel('SW_BROADCAST_CHANNEL_MESSAGE');
        client.onmessage = (eve) => {
            var res = eve.data;
            console.log('UI.___SEND_MESSAGE <- ', res);
            if (res.ok || res.loading) {
                resolve(res);
            } else {
                reject(res);
            }
        };
        client.postMessage(data);
    });
};

//////////////////////////////////////////////////////////////////////////////

/* API: POST 

 ___sendApi('pawn/form-filter', { state: this.state, created: this.created })
                .then(result => {
                    setTimeout(function () {
                        $('.dimmer').addClass('hidden');
                        if (result.ok && result.result_items && result.result_items.length > 0) {
                            console.log('user.login ', result);
                            var user = result.result_items[0];
                            if (user.redirect_url && user.redirect_url.length > 0) {
                                location.href = user.redirect_url;
                            }
                        } else {
                            _self.___alert('Vui lòng nhập chính xác tài khoản');
                        }
                    }, 1000);
                },{ page_number: 1, page_size: 10, order_by: '', group_by: ''});
 
 */

var ___sendApi = function (apiName, data, callback, options) {
    // options: { page_number: 1, page_size: 10, counter_api:'', counter_api_id:'', counter_self_id:'', order_by: '', group_by: '', group_id: 'shop_id' }

    if (options == null) options = { page_number: 1, page_size: 20, page_total: 0, order_by: '', func_name: '' };
    if (options.page_number == null) options.page_number = 1;
    if (options.page_size == null) options.page_size = 20;
    if (options.page_total == null) options.page_total = 0;
    if (options.order_by == null) options.order_by = '';
    if (options.func_name == null) options.func_name = '';

    //options.page_number = _DATA.objModel.page_number;
    //options.page_size = _DATA.objModel.page_size;

    if (apiName == null || apiName.length == 0) {
        callback({ ok: false, message: 'apiName must be not NULL' });
        return;
    }

    var a = apiName.split('/');
    var command = a[0].toUpperCase();
    var js_conditons = '';
    var conditons = '';

    if (a.length > 1 && a[1].toLowerCase() != 'all') js_conditons = ___getUrl('/' + _SCOPE + '/api/' + apiName + '.js', null, '');
    if (js_conditons.length > 0) {
        var compiled = _.template(js_conditons);
        conditons = compiled(data);
    }
    if (conditons.length == 0) conditons = ' function(o){return true;} ';

    if (a.length > 1 && a[1].toLowerCase() == 'all') options.page_size = Number.MAX_SAFE_INTEGER;

    var id = ___guid();
    if (typeof callback === 'function') {
        window[id + '_callback'] = function (result) {
            callback(result);
        };
    }

    return new Promise(function (resolve, reject) {
        var messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function (event) {
            var msg = event.data;
            //console.log('UI.___postApi = ', msg);
            if (msg.ok || msg.loading) {
                resolve(msg);
            } else {
                reject(msg);
            }
        };

        _REQUEST_MSG_CURRENT = { id: id, command: command, data: conditons, options: options };
        console.log('___sendApi = ', _REQUEST_MSG_CURRENT);
        if (_SW) _SW.postMessage(_REQUEST_MSG_CURRENT, [messageChannel.port2]);
    });
};

var ___apiSendSetting = function (obj) {
    console.log('___apiSendSetting = ', obj);
    return ___sendApi(obj.api, obj.data, obj.callback, obj.options);
};

var ___getUrl = function (url, type, _valueDefaultIfFail) {
    if (url == null) return _valueDefaultIfFail;
    if (url.indexOf('?') == -1)
        url = url + '?_is_admin=true';
    else
        url = url + '&_is_admin=true';

    //console.log('REQUEST_URL === ', url);

    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);

    if (request.status === 200) {
        if (type == 'json') {
            var text = request.responseText;
            if (text && text.length > 3 && text[3] == '{') text = text.substr(3, text.length);
            return JSON.parse(text);
        }
        return request.responseText;
    }
    if (type == 'json') return _valueDefaultIfFail;

    return _valueDefaultIfFail;
};

var ___getTemplate = function (tempName) {
    return ___getUrl('/' + _SCOPE + '/_temp/' + tempName + '.html', '');
};

var ___getApiConfig = function (tempName) {
    return ___getUrl('/' +_SCOPE + '/_json/' + tempName + '.json', 'json', {});
};

var ___ajax_get = function (url, type, _valueDefaultIfFail) {
    if (url == null) return _valueDefaultIfFail;
    console.log('REQUEST_URL === ', url);

    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);

    if (request.status === 200) {
        if (type == 'json') {
            var text = request.responseText;
            if (text && text.length > 3 && text[3] == '{') text = text.substr(3, text.length);
            return JSON.parse(text);
        }
        return request.responseText;
    }
    if (type == 'json') return _valueDefaultIfFail;

    return _valueDefaultIfFail;
};

var ___get_json = function (file_name) {
    return ___getUrl('/' +_SCOPE + '/_json/' + file_name, 'json', {});
};

var ___ajax_post = function (url, data, type, _valueDefaultIfFail) {
    if (url == null) return _valueDefaultIfFail;
    console.log('REQUEST_URL === ', url, data);

    var request = new XMLHttpRequest();
    request.open('POST', url, false);
    //request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('sessionid', '12345');
    request.setRequestHeader('pushcode', '100');
    request.setRequestHeader('Content-Type', 'text/plain');
    request.send(data);

    if (request.status === 200) {
        if (type == 'json') {
            var text = request.responseText;
            if (text && text.length > 3 && text[3] == '{') text = text.substr(3, text.length);
            return JSON.parse(text);
        }
        return request.responseText;
    }
    if (type == 'json') return _valueDefaultIfFail;

    return _valueDefaultIfFail;
};

var ___fetch = function (url, data) {
    console.log('FETCH.1 === ', url, data);

    _FETCH_MSG_CURRENT = {
        url: url,
        options: {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'sessionid': '12345',
                'pushcode': '111',
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            //body: '111' + JSON.stringify({ Conditions: 'id > 0', PageNumber: 1, PageSize: 10000000 }) // body data type must match "Content-Type" header
            body: data
        }
    };

    return fetch(_FETCH_MSG_CURRENT.url, _FETCH_MSG_CURRENT.options).then(res => res.text()).then(text => {
        console.log('FETCH.2 ===== ', text);
        if (text && text.length > 3 && text[3] == '{') text = text.substr(3, text.length);
        var o = JSON.parse(text);

        if (o.PageSize == null || o.PageSize == 0) o.PageSize = 10;
        if (o.PageNumber == null || o.PageNumber == 0) o.PageNumber = 1;
        if (o.TotalItems == null || o.TotalItems == 0) o.TotalItems = 0;
        if (o.CountResult == null || o.CountResult == 0) o.CountResult = 0;
        if (o.Request == null || o.Request == 0) o.Request = _FETCH_MSG_CURRENT;
        if (o.Message == null || o.Message == 0) o.Message = '';

        var page_total = parseInt((o.CountResult / o.PageSize).toString().split('.')[0]);
        if (o.CountResult % o.PageSize > 0) page_total++;

        console.log(o.CountResult, o.PageSize, page_total);

        var result_items = o.ResultItems;
        if (result_items && result_items.length > 0) {
            for (var k = 0; k < o.ResultItems.length; k++) {
                if (o.ResultItems[k].___index == null)
                    o.ResultItems[k].___index = (k + 1) * o.PageNumber;
            }
        } else {
            result_items = [];
        }

        return {
            ok: o.Ok,
            result_items: result_items,
            message: o.Message,
            request: o.Request,
            total_items: o.TotalItems,
            count_result: o.CountResult,
            page_total: page_total,
            page_number: o.PageNumber,
            page_size: o.PageSize
        };
    });
};

var ___post_api = function (apiName, data) {
    var root_path = location.pathname.substring(1, location.pathname.length).split('/')[0].toLowerCase();
    var url = '/' + root_path + '/api/' + apiName + '/post_request';
    return ___fetch(url, data);
};

var ___post_action = function (apiName, actionName, data) {
    if (actionName == null || actionName.length == 0) actionName = 'post_request';
    var root_path = location.pathname.substring(1, location.pathname.length).split('/')[0].toLowerCase();
    var url = '/' + root_path + '/api/' + apiName + '/post_updateByAction?storeAction=' + actionName;
    return ___fetch(url, data);
};

var ___plugin = function (api, item, key) {
    var fun = 'plugin___' + api + '___' + key;
    if (typeof window[fun] == 'function') {
        var v = window[fun](item, key);
        //console.log(fun, v);
        return v;
    }
    return item[key];
};

var ___cache_done = function () {
    console.log('INIT.___CACHE_DONE ...');

    _V_COM_ALL.forEach(v => {
        if (typeof v.___cache_done == 'function') {
            setTimeout(v.___cache_done, 1);
        }
    });

    //if (_APP) {
    //    _CACHE_DONE = true;
    //    sessionStorage['_CACHE_DONE'] = 1;

    //    _APP.$data.loading = false;
    //    var vu = _APP.___com_get('kit-home-pawn-form-filter');
    //    if (vu && typeof vu._btn_search_filter == 'function') vu._btn_search_filter();
    //}
};
