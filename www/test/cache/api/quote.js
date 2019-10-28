
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

// Returns an array with all quotations.
___API.get(_URI_BASE + 'api/quotations', function (req, res) {
    return new Response(JSON.stringify(quotations.filter(function (item) {
        return item !== null;
    })));
});

// Delete a quote specified by id. The id is the position in the collection
// of quotations (the position is 1 based instead of 0).
___API.delete(_URI_BASE + 'api/quotations/:id', function (req, res) {
    var id = parseInt(req.parameters.id, 10) - 1;
    if (!quotations[id].isSticky) {
        quotations[id] = null;
    }
    return new Response({ status: 204 });
});

// Add a new quote to the collection.
___API.post(_URI_BASE + 'api/quotations', function (req, res) {

    console.log('ADD_ITEM: ' + _URI_BASE, req);

    return req.json().then(function (quote) {
        quote.id = quotations.length + 1;
        quotations.push(quote);
        return new Response(JSON.stringify(quote), { status: 201 });
    });
});

////___API.post(root + 'subscribe', function (req, res) {

////    console.log('/SUBSCRIBE: ' + root, req);

////    return fetch(req);
////});