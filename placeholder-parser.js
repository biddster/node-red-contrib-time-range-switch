/* eslint-disable max-lines-per-function */
/**
 The MIT License (MIT)

 Copyright (c) 2016 @biddster

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

const mustache = require('mustache');

class PlaceholderParser {
    constructor(context, message) {
        this.createDataObject(context, message);
    }

    getParsedValue(rawValue) {
        if(rawValue === undefined || rawValue === null) {
            return rawValue;
        }

        return mustache.render(rawValue.toString(), this.data);
    }

    createDataObject(context, message) {
        this.data = {
            msg: message,
            flow: [],
            global: []
        };

        if (!context) {
            return;
        }

        context.flow.keys().forEach(function(flowKey) {
            this.data.flow[flowKey] = context.flow.get(flowKey);
        }.bind(this));

        context.global.keys().forEach(function(globalKey) {
            this.data.global[globalKey] = context.global.get(globalKey);
        }.bind(this));
    }
}

module.exports = PlaceholderParser;
