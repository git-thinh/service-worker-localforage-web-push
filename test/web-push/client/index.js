var _SW, _REG;

var _sw_install = function (callback) {
    navigator.serviceWorker.getRegistration().then(function (registration) {
        if (!registration || !navigator.serviceWorker.controller) {

            var _sw_on_state_change = function (from, registration) {
                return function (e) {
                    //console.log('statechange initial state ', from, 'changed to', e.target.state);
                    if (e.target.state == 'activated') {
                        //console.log('e =  ', e.target);

                        _SW = e.target;
                        _REG = registration;

                        if (typeof callback == 'function') {
                            console.log('UI -> SW_INSTALL = USER_INIT ...');
                            callback('USER_INIT');
                        }
                    }
                };
            };

            //console.log('UI> install service ...'); 
            navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((registration) => {
                if (registration.waiting) {
                    //console.log('waiting', registration.waiting);
                    registration.waiting.addEventListener('statechange', _sw_on_state_change('waiting', registration));
                }

                if (registration.installing) {
                    //console.log('installing', registration.installing);
                    registration.installing.addEventListener('statechange', _sw_on_state_change('installing', registration));
                }

                if (registration.active) {
                    //console.log('active', registration.active);
                    registration.active.addEventListener('statechange', _sw_on_state_change('active', registration));

                    _SW = registration.active;
                    _REG = registration;

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

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const publicVapidKey = 'BMHYaPEnL1SiYgRQHt7cDz_kuFTY7DrPTQCv3q-SuK2BcOPz4EJG5CWO4ss72nYvcRnjaGuxE-OySrZv9oJmDnI';

_sw_remove(async function () {
    _sw_install(async function (state) {

        console.log('UI -> waiting for acceptance: _REG = ', _REG);

        const subscription = await _REG.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        console.log('UI -> acceptance complete: subscription = ', subscription);

        await fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(j => {
            console.log('post -> subscrib: ok = ', j);
        }).catch((err) => {
            console.log('post -> subscrib: error = ', err);
        });

    });
});