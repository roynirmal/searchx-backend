'use strict';

const indri = require('../../../../lib/node-indri/node-indri');
const searcher = new indri.Searcher({
    "index": "../data/Aquaint-Index",
    "rules" : "method:dirichlet,mu:1000",
    "fbTerms": 10,
    "fbMu": 1500,
    "includeFields": {
        "title": "title",
        "docno": "docno",
        "date": "date",
        "source": "source",
        "text": "text"
    },
    "includeDocument" : true,
    "resultsPerPage": 10
});

const verticals = [
    'text'
];

/*
 * Fetches data from indri
 *
 * @params {query} the search query string
 * @params {vertical} type of search results (web, images, etc)
 * @params {pageNumber} the number of the page of results to show (1-based indexing)
 * @params {relevanceFeedbackDocuments} the set of documents to use for relevance feedback
 */
exports.fetch = function (query, vertical, pageNumber, relevanceFeedbackDocuments) {
    if (!verticals.includes(vertical)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid vertical'
        }
    }

    return new Promise(function (resolve, reject) {
        const callback = function (error, results) {
            if (error) return reject(error);
            resolve(formatResults(results));
        };
        relevanceFeedbackDocuments = relevanceFeedbackDocuments.map(string => parseInt(string));
        searcher.search(query, pageNumber, relevanceFeedbackDocuments, callback);
    });
};


function formatResults(results) {
    return {
        results: results.map(result => ({
            id: result.docid,
            collectionId: result.fields.docno,
            name: result.fields.title,
            date: result.fields.date,
            source: result.fields.source,
            snippet: result.snippet,
            text: result.fields.text
        }))
    };
}