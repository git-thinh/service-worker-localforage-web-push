
var ENDPOINT = 'https://test.f88.vn/api/quotations';


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


var _SW, _REG;
 
var _sw_reinstall = function (callback) {
    return new Promise(function (resolve, reject) {
        if (sessionStorage['___SW_REMOVE'] == 'true') {
            sessionStorage['___SW_REMOVE'] = '';

            navigator.serviceWorker.ready.then(async function (registration) {
                console.log('A service worker is active:', registration.active.state);
                console.log('UI -> SW_INSTALL = USER_INIT ...');


                _REG = registration;
                console.log('UI -> waiting for acceptance: _REG = ', _REG);

                
                setTimeout(function () {
                    resolve({ ok: true });
                }, 300);
            });
            navigator.serviceWorker.register('service-worker.js');

        } else {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
                console.log('UI.SW -> REMOVE: DONE ...');
                sessionStorage['___SW_REMOVE'] = 'true';
                location.reload();
            });
            //reject({ok:false});
        }
    });
};




_sw_reinstall().then(async () => {


    const subscription = await _REG.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    console.log('UI -> acceptance complete: subscription = ', subscription);


    //const m = new BroadcastChannel('MSG_REG_WEB_PUSH');
    //m.postMessage(JSON.stringify(subscription));
    //m.close();


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

    loadQuotations();
});













// When clicking add button, get the new quote and author and post to
// the backend.
document.getElementById('add-form').onsubmit = function (event) {
    // Avoid navigation
    event.preventDefault();

    var newQuote = document.getElementById('new-quote').value.trim();
    // Skip if no quote provided.
    if (!newQuote) { return; }

    // Leave blank to represent an anonymous quote.
    var quoteAuthor = document.getElementById('quote-author').value.trim() ||
        'Anonymous';
    var quote = { text: newQuote, author: quoteAuthor };
    var headers = { 'content-type': 'application/json' };

    // Send the API request. In this case, a `POST` on `quotations` collection.
    fetch(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(quote),
        headers: headers
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (addedQuote) {

            console.log('uiiiiiiiiiiiii', addedQuote);

            document.getElementById('quotations').appendChild(getRowFor(addedQuote));
            resizeIframe();
        });
};

// A simply `GET` (default operation for `fetch()`) is enough to retrieve
// the collection of quotes.
function loadQuotations() {
    fetch(ENDPOINT)
        .then(function (response) {
            return response.json();
        })
        .then(showQuotations);
}

// Fill the table with the quotations.
function showQuotations(collection) {
    var table = document.getElementById('quotations');
    table.innerHTML = '';
    for (var index = 0, max = collection.length, quote; index < max; index++) {
        quote = collection[index];
        table.appendChild(getRowFor(quote));
    }
    resizeIframe();
}

// Builds a row for a quote.
function getRowFor(quote) {
    var tr = document.createElement('TR');
    var id = quote.id;

    // The row is identified by the quote id to allow easy deletion.
    tr.id = id;

    tr.appendChild(getCell(quote.text));
    tr.appendChild(getCell('by ' + quote.author));
    tr.appendChild(quote.isSticky ? getCell('') : getDeleteButton(id));
    return tr;
}

// Builds a data cell for some text.
function getCell(text) {
    var td = document.createElement('TD');
    td.textContent = text;
    return td;
}

// Builds a delete button for the quote.
function getDeleteButton(id) {
    var td = document.createElement('TD');
    var button = document.createElement('BUTTON');
    button.textContent = 'Delete';

    // In case of clicking the delete button, make the proper request to the API
    // and remove from the table.
    button.onclick = function () {
        deleteQuote(id).then(function () {
            var tr = document.getElementById(id);
            tr.parentNode.removeChild(tr);
        });
    };

    td.appendChild(button);
    return td;
}

// Make the request to the API for deleting the quote.
function deleteQuote(id) {
    return fetch(ENDPOINT + '/' + id, { method: 'DELETE' });
}

// Specifically for the cookbook site :(
function resizeIframe() {
    if (window.parent !== window) {
        window.parent.document.body.dispatchEvent(new CustomEvent('iframeresize'));
    }
}
