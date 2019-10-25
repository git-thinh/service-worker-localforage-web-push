
Vue.component('login', {
    mixins: [_MIXIN_COMS],
    template: ___getTemplate('login'),
    data: function () {
        return {
            username: localStorage['___USER'] == null ? 'pol' : localStorage['___USER'],
            password: '12345',
            is_setup: false
        };
    },
    mounted: function () {
        //$('.dimmer').removeClass('hidden');

        var _self = this;
        var url = new URL(location.href);
        var message = url.searchParams.get('message');
        if (message && message.length > 0) {
            _self.___alert(message);
        }
    },
    methods: {
        ___cache_done: function () {
            var _self = this;
            _self.is_setup = false;
        },

        fn_loginClick: function (event) {
            var _self = this;

            console.log('LOGIN: ', JSON.stringify(this._data));

            if (this.username.length == 0 || this.password.length == 0) {
                _self.___alert('Vui lòng nhập thông tin tài khoản');
                return;
            }

            var _URI_BASE = location.protocol + '//' + location.host;
            fetch(_URI_BASE + '/core/service/api/quotations?session=' + _CLIENT_ID).then(function (response) {
                return response.json();
            }).then((re) => {
                console.log('?????????????????????', res);
            });

            //////$('.dimmer').removeClass('hidden');
            //////___sendApi('user/login', { username: _self.username, password: _self.password }).then(result => {
            //////    setTimeout(function () {
            //////        $('.dimmer').addClass('hidden');
            //////        if (result.ok && result.result_items && result.result_items.length > 0) {
            //////            console.log('user.login ', result);
            //////            var user = result.result_items[0];
            //////            if (user.redirect_url && user.redirect_url.length > 0) {

            //////                localStorage['___USER'] = _self.username;

            //////                location.href = user.redirect_url;
            //////            }
            //////        } else {
            //////            _self.___alert('Vui lòng nhập chính xác tài khoản');
            //////        }
            //////    }, 1000);
            //////});
        }
    }
});
