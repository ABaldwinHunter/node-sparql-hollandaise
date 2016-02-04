'use strict';

var SparqlTransport = require('./transport'),
    SparqlPrefix = require('./prefix'),
    SparqlGraphPattern = require('./graph-pattern'),
    SparqlGroupGraphPattern = require('./group-graph-pattern'),
    SparqlQueryTypes = require('./query-types');

class SparqlQuery {

    //
    //
    // setup query basics

    constructor(endpoint) {
        this.reset();
        this._transport = new SparqlTransport(endpoint);
    }

    //
    //
    // base iri

    base(content) {
        this._config.base = content;
    }

    //
    //
    // prefix

    prefix(content) {
        if (Array.isArray(content)) {
            for (var i = 0; i < content.length; i += 1) {
                this.addPrefix(content[i]);
            }
        } else {
            this.addPrefix(content);
        }
        return this;
    }

    addPrefix(content) {
        if (content instanceof SparqlPrefix) {
            this._config.prefixes.push(content);
        } else if (typeof content === 'string') {
            this._config.prefixes.push(new SparqlPrefix(content));
        }
    }

    getPrefixes() {
        return this._config.prefixes;
    }

    clearPrefixes() {
        this._config.prefixes = [];
    }

    //
    //
    // query types

    select(content, modifier) {
        this._config.query = new SparqlQueryTypes.SparqlQuerySelect(content, modifier);
        return this;
    }

    describe(content) {
        this._config.query = new SparqlQueryTypes.SparqlQueryDescribe(content);
        return this;
    }

    ask() {
        this._config.query = new SparqlQueryTypes.SparqlQueryAsk();
        return this;
    }

    construct(triples) {
        this._config.query = new SparqlQueryTypes.SparqlQueryConstruct(triples);
        return this;
    }

    //
    //
    // dataset clause

    from(content, named = false) {
        if (Array.isArray(content)) {
            for (var i = 0; i < content.length; i += 1) {
                this._config.datasetClause.push(`FROM${named ? ' NAMED' : ''} ${content[i]}`);
            }
        } else {
            this._config.datasetClause.push(`FROM${named ? ' NAMED' : ''} ${content[i]}`);
        }
        return this;
    }

    getDatasetClauses() {
        return this._config.datasetClause;
    }

    clearDatasetClauses() {
        this._config.datasetClause = [];
    }

    //
    //
    // where clause

    where(content) {
        if (Array.isArray(content)) {
            for (var i = 0; i < content.length; i += 1) {
                this.addToWhereClause(content[i]);
            }
        } else if (content instanceof SparqlGraphPattern ||
            content instanceof SparqlGroupGraphPattern) {
            this.setWhereClause(content);
        } else {
            this.addToWhereClause(content);
        }
        return this;
    }

    setWhereClause(graphPattern) {
        if (graphPattern instanceof SparqlGraphPattern ||
            graphPattern instanceof SparqlGroupGraphPattern) {
            this._config.whereClause = graphPattern;
        } else {
            throw new Error('TypeError: Where clause must be a graph pattern.');
        }
    }

    addToWhereClause(content, atIndex = -1) {
        if (this._config.whereClause === null) {
            this._config.whereClause = new SparqlGraphPattern(content);
        } else {
            this._config.whereClause.addElement(content, atIndex);
        }
    }

    removeFromWhereClause(atIndex = 0, count = 1) {
        this._config.whereClause.removeElements(atIndex, count);
    }

    clearWhereClause() {
        this._config.whereClause.clear();
    }

    getWhereClause() {
        return this._config.whereClause.getElements();
    }

    getWhereClauseCount() {
        return this._config.whereClause.countElements();
    }

    //
    //
    // solution modifiers

    order(content) {
        if (typeof content === 'string') {
            this._config.solutionModifiers.push(`ORDER BY ${content}`);
        } else {
            throw new Error(`Input for ORDER must be string but is ${typeof content}.`);
        }
        return this;
    }

    limit(count) {
        if (typeof count === 'number') {
            this._config.solutionModifiers.push(`LIMIT ${count}`);
        } else {
            throw new Error(`Input for LIMIT must be number but is ${typeof count}.`);
        }
        return this;
    }

    offset(count) {
        if (typeof count === 'number') {
            this._config.solutionModifiers.push(`OFFSET ${count}`);
        } else {
            throw new Error(`Input for OFFSET must be number but is ${typeof count}.`);
        }
        return this;
    }

    //
    //
    // execute query

    exec() {
        return this._transport.submit(this.toString());
    }

    //
    //
    // util

    toString() {
        var queryString = '';

        if (this._config.base) {
            queryString += `BASE ${this._config.base}`;
        }

        if (this._config.prefixes.length > 0) {
            for (let i = 0; i < this._config.prefixes.length; i += 1) {
                queryString += `${this._config.prefixes[i].toString()} `;
            }
        }

        if (this._config.query) {
            queryString += this._config.query.toString();
        } else {
            throw new Error(`TypeError: Query type must be defined.`);
        }

        if (this._config.datasetClause instanceof Array) {
            queryString += `${this._config.datasetClause.join(' ')} `;
        } else {
            throw new Error(`TypeError: Dataset clause should be array but is ${typeof this._config.datasetClause}`);
        }

        if (this._config.whereClause) {
            queryString += `WHERE ${this._config.whereClause.toString()}`;
        } else {
            throw new Error(`TypeError: Where clause is not defined!`);
        }

        if (this._config.solutionModifiers instanceof Array) {
            for (let i = 0; i < this._config.solutionModifiers.length; i += 1) {
                queryString += `${this._config.solutionModifiers[i].toString()} `;
            }
        }

        return queryString;
    }

    reset() {
        this._config = {
            base: null,
            prefixes: [],
            query: null,
            datasetClause: [],
            whereClause: null,
            solutionModifiers: []
        };
    }
}

module.exports = SparqlQuery;