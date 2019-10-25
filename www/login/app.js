var _SCOPE = 'login'; 

///////////////////////////////////////////////////////////////////////////////////

var _app_install = function () {
    console.log('UI.INSTALL ... ');

    head.load([ 
        { js_components: '/' + _SCOPE+'/components.js' },
        { css_app: '/' + _SCOPE +'/app.css' }
    ], function () {
        _app_init();
    });
};

var _app_init = function () {
    console.log('APP: _app_init ...');

    document.getElementById('ui-app').innerHTML = '<login></login>';

    _APP = new Vue({
        mixins: [_MIXIN_VUE],
        data: function () { return _DATA; },
        el: '#ui-app', 
        mounted: function () {
            //console.log('SCREEN_MAIN: mounted ...');
            //_app_ready();

        },
        watch: {
        }
    });
};

var _app_ready = function () {
    console.log('APP: _app_ready ...');
};

var _app_online = function () {
    //alert('online');
};

var _app_offline = function () {
    //alert('offline');
};
