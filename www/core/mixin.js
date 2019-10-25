
_MIXIN_COMS = {
    props: [
        'is-main',
        'click-out-it-self-to-close',
        'visible-on-top',
        'bit-visible-counter',
        'bit-full-text-search',
        'str-width',
        'str-min-width',
        'str-action',
        'str-icon-textbox',
        'str-placeholder',
        'event-change',
        'vue-ref',
        'vue-ref-callback',
        'data-store-value',
        'api-send-setting',
        'api-result-filter',
        'api-bind-id',
        'api-bind-name',
        'str-name-field-value'
    ],
    mounted: function () {
        var _self = this;
        if (_self.$vnode) {
            _V_COM_ALL.push(_self);

            var _class = '';
            var tag = _self.$vnode.tag;
            if (tag && tag.indexOf('-kit-') != -1) _class = 'kit-' + tag.split('-kit-')[1];
            if (_class == 'kit-home-pawn-grid') _V_MAIN_GRID = _self;

            _self.ispopup = false;
            if (_class.indexOf('kit-popup-') == 0) {
                _self.ispopup = true;
                _V_POPUP[_class] = _self;
            }

            if (_self.isMain == null) _self.isMain = false;
            _self.___name = _class;
            _self.___id = '___vc' + _self._uid;

            //console.log(_self.___id, _self.isMain, _self.ispopup);

            if (_self.$el) {
                Vue.nextTick(function () {
                    classie.add(_self.$el, 'ui-component');
                    if (_class.length > 0) classie.add(_self.$el, _class);

                    _self.$el.setAttribute('id', _self.___id);

                    ////$('.ui.progress').progress({
                    ////    duration: 200,
                    ////    total: 200,
                    ////    text: {
                    ////        active: '{value} of {total} done'
                    ////    }
                    ////});

                });
            }


            if (_self.$children) {
                _self.$children.map(v => {
                    if (v.vueRef) {
                        //console.log(v.vueRef);
                        _self.$refs[v.vueRef] = v;
                    }
                });
            }

        }
    },
    methods: {
        ___alert: function (msg) {
            swal(msg);
        },
        ___alert_type: function (msg, type) {
            if (type) {
                type = "success";
            } else {
                type = "error";
            }
            swal("Thông báo", msg, type);
        },

        ___reset_form: function (item) {
            $.each(item._self.$children,
                function (i, v) {
                    $('.' + v.___name).dropdown('restore defaults');
                });

            var frm_id = item.$el.id;
            document.getElementById(frm_id).reset();
        },
        ___login: function () {
            var _self = this;
            ___go_login();
        },
        ___logout: function () {
            var _self = this;
            //swal({
            //    title: "Logout",
            //    text: "Bạn chắc chắn muốn thoát tài khoản?",
            //    icon: "warning",
            //    buttons: true,
            //    dangerMode: true
            //}).then((_ok) => {
            //    if (_ok) {
            _self.___login();
            //    }
            //});
        },
        ___popup: function (name, para) {
            var _self = this;
            //console.log('___popup -> ', name);

            if (_V_POPUP[name] && _V_POPUP[name].visible == true && _V_POPUP[name].visibleOnTop == true) {
                //popup alway opening + visibleOnTop is true -> alway opening
                _V_POPUP[name].$data.para = para;
                if (typeof _V_POPUP[name].___visible == 'function') _V_POPUP[name].___visible();
                _V_POPUP_CURRENT = name;
                _IS_CLICK_OPEN_POPUP = true;
                return;
            }

            if (typeof name == 'string' && _V_POPUP[name]) {
                _V_POPUP[name].$data.visible = !_V_POPUP[name].$data.visible;
                _V_POPUP[name].$data.para = para;
                if (typeof _V_POPUP[name].___visible == 'function') _V_POPUP[name].___visible();
                _V_POPUP_CURRENT = name;
                _IS_CLICK_OPEN_POPUP = true;
                return;
            }

            if (_self.visible) {
                _IS_CLICK_OPEN_POPUP = false;
                _self.visible = false;
                _V_POPUP_CURRENT = null;
            }
            //console.log('_V_POPUP_CURRENT = ', _V_POPUP_CURRENT);
        },
        ___popup_current: function () {
            return _V_POPUP[_V_POPUP_CURRENT];
        },
        ___popup_current_name: function () {
            var p = this.___popup_current();
            if (p) return p.___name;
            return null;
        },
        ___popup_current_visible: function () {
            var p = this.___popup_current();
            if (p && p.visible != null) return p.visible;
            return false;
        },
        ___popup_current_close: function () {
            var p = this.___popup_current();
            if (p) p.visible = false;
        },
        ___popup_closeAll: function () {
            for (var key in _V_POPUP) {
                if (_V_POPUP[key].visible) _V_POPUP[key].visible = false;
            }
        },
        ___fetch: function (url, data) { return ___fetch(url, data); },
        ___ajax_get: function (url, type, _valueDefaultIfFail) {
            return ___ajax_get(url, type, _valueDefaultIfFail);
        },
        ___ajax_post: function (url, data, type, _valueDefaultIfFail) {
            return ___ajax_post(url, type, _valueDefaultIfFail);
        },
        ___api_config: function (apiName) { return ___getApiConfig(apiName); },
        ___com_get: function (comName) {
            var el = document.querySelector('.' + comName);
            if (el && el.__vue__) return el.__vue__;
            return null;
        },
        ___mainGrid_loading: function (visiable) {
            if (_V_MAIN_GRID && typeof _V_MAIN_GRID.___loading == 'function') {
                _V_MAIN_GRID.___loading(visiable);
            }
        },
        ___mainGrid_scroll: function (e) {
            //console.log('___mainGrid_scroll ?????');
            this.___popup_closeAll();
        },
        ___mainGrid_focus: function (e) {
            var el = document.querySelector('#table-grid-main #input_focus');
            if (el) el.focus();
        },
        ___mainGrid_pager_Reset: function () {
            _DATA.objModel.page_number = 1;
            _DATA.objModel.page_size = 10;
            _DATA.objModel.page_total = 0;
            _DATA.objModel.count_result = 0;
        },
        ___mainGrid_goPage: function (page_number) {
            if (page_number > 0 && page_number <= this.objModel.page_total) {
                //_DATA.objModel.page_number = page_number;
                this.___mainGrid_executeSearch(null, page_number);
            }
        },
        ___mainGrid_setOptionSearchByKey(optionName, val) {
            _APP.$data.objSearch.optionsRuntime[optionName] = val;
        },
        ___mainGrid_setOptionSearchByKey_pushKeyVal(optionName, val, status) {

            if (status == true) {
                _APP.objSearch.optionsRuntime[optionName].push(val);
            } else {
                var index = _APP.objSearch.optionsRuntime[optionName].indexOf(val);

                if (index > -1) {
                    _APP.objSearch.optionsRuntime[optionName].splice(index, 1);
                }
            }
        },
        ___mainGrid_executeSearch: function (callbackComplete, page_number) {
            var _self = this;

            console.log('___mainGrid_executeSearch ... ');
            console.log('APP.watch -> objSearch.optionsRuntime = ', JSON.stringify(_APP.$data.objSearch.optionsRuntime));

            _self.___mainGrid_loading(true);

            _APP.$data.objModel.result_items = [];

            // data = { state: 1 }
            // { state: status, date_start: '20190526', date_end: '20190920' }

            //var para = {
            //    shop_id: 0,
            //    user_id: 0,
            //    state: null,
            //    created_start: 0,
            //    created_end: 0
            //};
            var para = _APP.objSearch.optionsRuntime;


            //if (data) {
            //    for (var key in data) {
            //        if (para.hasOwnProperty(key)) {
            //            para[key] = data[key];
            //        }
            //    }
            //}


            ___sendApi('pawn/form-filter', para, null, { page_number: page_number == null ? 1 : page_number })
                .then(result => {
                    //setTimeout(function () {
                    $('.dimmer').addClass('hidden');
                    if (result.ok && result.result_items && result.result_items.length > 0) {

                        _APP.$data.objModel = result;

                    } else {
                        //_self.___alert('Vui lòng nhập chính xác tài khoản');
                        console.log("Request không có data");
                    }

                    if (typeof callbackComplete == 'function') callbackComplete(result);

                    _APP.$data.objSearch.optionsCurrent = para;

                    _self.___mainGrid_loading(false);
                    //}, 1000);
                });

        }//end functions
    }
};
_MIXIN_VUE = {};