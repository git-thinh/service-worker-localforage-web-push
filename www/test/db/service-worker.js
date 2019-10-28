
const MSG_REG_WEB_PUSH = new BroadcastChannel('MSG_REG_WEB_PUSH');
MSG_REG_WEB_PUSH.onmessage = e => {
    var data = e.data;

    console.log('MSG_REG_WEB_PUSH === ', JSON.parse(data));
    //___reg_web_push(data);
};
 
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
    console.log('?????????????????????????? ACTIVE ...', e);
     
};














importScripts('./lib/ServiceWorkerWare.js');

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

// Determine the root for the routes. I.e, if the Service Worker URL is
// `http://example.com/path/to/sw.js`, then the root is
// `http://example.com/path/to/`
var root = (function () {
    var tokens = (self.location + '').split('/');
    tokens[tokens.length - 1] = '';
    return tokens.join('/');
})();

root = 'https://test.f88.vn/'
console.log('?????????????????', root);

// By using Mozilla's ServiceWorkerWare we can quickly setup some routes
// for a _virtual server_. Compare this code with the one from the
// [server side in the API analytics recipe](/api-analytics_server_doc.html).
var worker = new ServiceWorkerWare();

// Returns an array with all quotations.
worker.get(root + 'api/quotations', function (req, res) {
    return new Response(JSON.stringify(quotations.filter(function (item) {
        return item !== null;
    })));
});

// Delete a quote specified by id. The id is the position in the collection
// of quotations (the position is 1 based instead of 0).
worker.delete(root + 'api/quotations/:id', function (req, res) {
    var id = parseInt(req.parameters.id, 10) - 1;
    if (!quotations[id].isSticky) {
        quotations[id] = null;
    }
    return new Response({ status: 204 });
});

// Add a new quote to the collection.
worker.post(root + 'api/quotations', function (req, res) {

    console.log('ADD_ITEM: ' + root, req);

    return req.json().then(function (quote) {
        quote.id = quotations.length + 1;
        quotations.push(quote);
        return new Response(JSON.stringify(quote), { status: 201 });
    });
});

////worker.post(root + 'subscribe', function (req, res) {

////    console.log('/SUBSCRIBE: ' + root, req);

////    return fetch(req);
////});

// Start the service worker.
worker.init();
