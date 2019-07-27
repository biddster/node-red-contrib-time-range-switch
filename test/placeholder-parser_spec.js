/**
 The MIT License (MIT)

 Copyright (c) 2016 @biddster

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the 'Software'), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

const should = require('should');
const PlaceholderParser = require('../placeholder-parser.js');

// eslint-disable-next-line max-lines-per-function
describe('placeholder-parser', function() {
    // arrange
    const message = { topic: 'topic', payload: 'payload' };
    const context = {
        flow: {
            'keys'() { return ['flowKey', 'intFlowKey']},
            'get'(key) { return key === 'flowKey' ? 'flowValue' : 12345 }
        },
        global: {
            'keys'() { return ['globalKey', 'intGlobalFlowKey']},
            'get'(key) { return key === 'globalKey' ? 'globalValue' : '' }
        }
    };

    // eslint-disable-next-line max-lines-per-function
    describe('getParsedValue', function() {
        const parser = new PlaceholderParser(context, message);
        it('should parse message property', function() {
            const result = parser.getParsedValue('text {{msg.payload}} more text')
            result.should.equal('text payload more text');
        });
        it('should parse flow property', function() {
            const result = parser.getParsedValue('text {{flow.flowKey}} more text')
            result.should.equal('text flowValue more text');
        });
        it('should parse global property', function() {
            const result = parser.getParsedValue('text {{global.globalKey}} more text')
            result.should.equal('text globalValue more text');
        });
        it('should parse multiple', function() {
            const result = parser.getParsedValue('first {{flow.flowKey}} and second {{global.globalKey}}')
            result.should.equal('first flowValue and second globalValue');
        });
        it('should remove unknown property', function() {
            const result = parser.getParsedValue('text {{msg.unknown}} more text')
            result.should.equal('text  more text');
        });
        it('should remove invalid property', function() {
            const result = parser.getParsedValue('text {{other.globalKey}} more text')
            result.should.equal('text  more text');
        });
        it('should remove unprefixed property', function() {
            const result = parser.getParsedValue('text {{globalKey}} more text')
            result.should.equal('text  more text');
        });
        it('should not change text', function() {
            const result = parser.getParsedValue('text}} {other.globalKey} more text')
            result.should.equal('text}} {other.globalKey} more text');
        });
        it('should parse empty string', function() {
            const result = parser.getParsedValue('')
            result.should.be.empty();
        });
        it('should parse integer', function() {
            const result = parser.getParsedValue(1)
            result.should.equal('1');
        });
        it('should parse false boolean', function() {
            const result = parser.getParsedValue(false)
            result.should.equal('false');
        });
        it('should parse true boolean', function() {
            const result = parser.getParsedValue(true)
            result.should.equal('true');
        });
        it('should parse undefined', function() {
            const result = parser.getParsedValue(undefined)
            should.not.exist(result);
        });
        it('should parse null', function() {
            const result = parser.getParsedValue(null)
            should.not.exist(result);
        });
        it('should handle null context', function() {
            const nullParser = new PlaceholderParser(null, null);
            const result = nullParser.getParsedValue('text')
            result.should.equal('text');
        });
        it('should handle integers in context', function() {
            const result = parser.getParsedValue('{{flow.intFlowKey}}')
            result.should.equal('12345');
        });
    });
});
