'use strict';

import Filter from './filter';
import Triple from './triple';

export default class GraphPattern {
    constructor(elements, optional = false, alternative = false, allowedTypes = [Triple, Filter]) {
        this.clear();
        this._allowedTypes = allowedTypes;
        this._optional = optional;
        this._alternative = alternative;
        if (Array.isArray(elements)) {
            for (let i = 0; i < elements.length; i += 1) {
                this.addElement(elements[i]);
            }
        } else if (elements) {
            this.addElement(elements);
        }
    }

    addElement(element, atIndex = -1) {
        if (typeof element === 'string') {
            element = new Triple(element);
        }
        if (this._allowedTypes.indexOf(element.constructor) > -1) {
            this._elements.splice(atIndex < 0 ? this.countElements() : atIndex, 0, element);
        } else {
            throw new Error(`TypeError: Element of type ${element.constructor || typeof element} is not allowed for this block.`);
        }
    }

    removeElements(atIndex = 0, count = 1) {
        if (atIndex >= 0 && atIndex + count < this.countElements()) {
            this._elements.splice(atIndex, count);
        } else {
            throw new Error('OutOfBounds: Cannot remove elements from block, index and/or count out of bounds.');
        }
    }

    getElements() {
        return this._elements;
    }

    countElements() {
        return this._elements.length;
    }

    clear() {
        this._elements = [];
    }

    toString() {
        var result = `${this._optional ? 'OPTIONAL ' : ''}${this._alternative ? 'UNION ' : ''}{ `;
        for (let i = 0; i < this._elements.length; i += 1) {
            result += `${this._elements[i].toString()} ${this._elements[i] instanceof Triple ? '. ' : ''}`;
        }
        result += ' } ';
        return result;
    }
}