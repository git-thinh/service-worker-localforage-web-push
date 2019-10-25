
var _TOKEN = null, _PROFILE = null;
var _CLIENT_ID = ___guid(), _CACHE_DONE = parseInt(sessionStorage['_CACHE_DONE']) == 1 ? true : false;

//////////////////////////////////////////////////////////////////////////////
/* APP VUE */

var _APP, _ROUTER, _MIXIN_VUE, _MIXIN_COMS;
var _V_COM_ALL = [], _V_MAIN_GRID, _V_POPUP = {}, _V_POPUP_CURRENT, _IS_CLICK_OPEN_POPUP = false;

//////////////////////////////////////////////////////////////////////////////
/* TOKEN UPDATE */

if (location.href.indexOf('?token=') != -1) {
    var a = location.href.split('?token=');
    _TOKEN = a[1];
    sessionStorage['token'] = _TOKEN;
    location.href = a[0];
}

//////////////////////////////////////////////////////////////////////////////
/* GLOBAL VARIABLES */

var _DATA, _CACHE_STORE_NAME = 'STORE_POL_V1';
var _SW;

//////////////////////////////////////////////////////////////////////////////
/* DATA APP */

_DATA = {
    loading: true,
    isMobi: false,
    isTablet: false,
    objApp: {},
    objView: {},
    objLang: {},
    objMessage: {},
    objUserInfo: {
        session_id: '',
        token: '',
        user_id: 0
    },
    objMenu: {},
    objItemSelected: {},
    objItemSelectedTextDisplay: '',
    objItemSelectedIndex: -1,
    objSearch: {
        optionsCurrent: {},
        optionsRuntime: {}
    },
    objModel: {
        ok: true,
        result_items: [],
        request: {},
        total_items: 0,
        count_result: 0,
        page_total: 0,
        page_number: 1,
        page_size: 20
    },
    objAction: {},
    objComponent: {}
};

//////////////////////////////////////////////////////////////////////////////
/* MSG CLIENT */

const _MSG_CLIENT = new BroadcastChannel(_CLIENT_ID);
_MSG_CLIENT.onmessage = e => ___msg_on_message(e);

var ___msg_on_message = function (e) {
    var m = e.data;
    console.log('UI.ON_MESSAGE <- ', m);

    if (typeof m == 'string') {
        ;
    } else {
        switch (m.command) {
            case 'CACHE_DONE':

                _app_ready();

                _V_COM_ALL.forEach(v => {
                    if (typeof v.___cache_done == 'function') {
                        setTimeout(v.___cache_done, 1);
                    }
                });

                break;
        }
    }

};

//////////////////////////////////////////////////////////////////////////////
/* SERVICE */

sessionStorage['token'] = '123456';

var _sw_install = function (callback) {
    navigator.serviceWorker.getRegistration().then(function (registration) {
        if (!registration || !navigator.serviceWorker.controller) {

            var _sw_on_state_change = function (from) {
                return function (e) {
                    //console.log('statechange initial state ', from, 'changed to', e.target.state);
                    if (e.target.state == 'activated') {
                        //console.log('e =  ', e.target);
                        _SW = e.target;
                        if (typeof callback == 'function') {
                            console.log('UI -> SW_INSTALL = USER_INIT ...');
                            callback('USER_INIT');
                        }
                    }
                };
            };

            //console.log('UI> install service ...'); 
            navigator.serviceWorker.register('/core/service/_sw.js').then((registration) => {
                if (registration.waiting) {
                    //console.log('waiting', registration.waiting);
                    registration.waiting.addEventListener('statechange', _sw_on_state_change('waiting'));
                }

                if (registration.installing) {
                    //console.log('installing', registration.installing);
                    registration.installing.addEventListener('statechange', _sw_on_state_change('installing'));
                }

                if (registration.active) {
                    //console.log('active', registration.active);
                    registration.active.addEventListener('statechange', _sw_on_state_change('active'));
                    _SW = registration.active;
                    if (typeof callback == 'function') {
                        console.log('UI -> SW_INSTALL = USER_RECONNECT ...');
                        callback('USER_RECONNECT');
                    }
                }
            });
        }
    });
};

var _sw_remove = function (callback) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            registration.unregister();
        }

        console.log('UI.SW -> REMOVE: DONE ...');

        if (typeof callback == 'function') callback();
    });
};

var _sw_install_login = function () {
    console.log('UI.SW_INSTALL: _SCOPE = ' + _SCOPE + ' -> open screen login ...');

    sessionStorage['_CACHE_DONE'] = 0;

    _sw_remove(function () {
        _sw_install(function (state) {
            _sw_on_ready();
        });
    });
};

var _sw_install_test = function () {
    console.log('UI.SW_INSTALL: _SCOPE = ' + _SCOPE + ' -> open screen test ...');

    sessionStorage['_CACHE_DONE'] = 0;

    _sw_remove(function () {
        _sw_install(function (state) {
            _sw_on_ready();
        });
    });
};

var _sw_install_page = function () {
    _sw_remove(function () {
        _sw_install(function (state) {
            _sw_on_ready();
        });
    });
};

var _sw_on_ready = function () {
    console.log('UI -> SW_ON_READY ...');
    _SW.postMessage(_CLIENT_ID);
};

console.log('UI -> _SCOPE ===== ', _SCOPE);

if (sessionStorage['token'] != null && _SCOPE != 'login' && _SCOPE != 'adm-test') _sw_install_page();
else if (_SCOPE == 'login') _sw_install_login();
else if (_SCOPE == 'adm-test') _sw_install_test();
else if (sessionStorage['token'] == null || sessionStorage['token'].length == 0) ___go_login();
