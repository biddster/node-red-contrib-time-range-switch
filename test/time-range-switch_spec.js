/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-statements-per-line */
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

const should = require('should');
const moment = require('moment');
const mock = require('node-red-contrib-mock-node');

const nodeRedModule = require('../index.js');
const PlaceholderParser = require('../placeholder-parser');


// eslint-disable-next-line max-lines-per-function
describe('time-range-switch', function() {
    const parser = new PlaceholderParser(null, null);

    describe('getParsedMoment', function() {
        const node = mock(nodeRedModule, {});
        const time = moment('2019-11-21');
        node.now = function() { 
            return time.clone();
        };

        it('should add offset', function() {
            const result = node.getParsedMoment('12:00', 10, parser);
            result.format('YYYY-MM-DDTHH:mm:ss').should.equal('2019-11-21T12:10:00');
        });
        it('should subtract negative offset', function() {
            const result = node.getParsedMoment('12:00', -10, parser);
            result.format('YYYY-MM-DDTHH:mm:ss').should.equal('2019-11-21T11:50:00');
        });
        it('should not change date with offset 0', function() {
            const result = node.getParsedMoment('12:00', 0, parser);
            result.format('YYYY-MM-DDTHH:mm:ss').should.equal('2019-11-21T12:00:00');
        });
        it('should not change date with offset null', function() {
            const result = node.getParsedMoment('12:00', null, parser);
            result.format('YYYY-MM-DDTHH:mm:ss').should.equal('2019-11-21T12:00:00');
        });
        it('should not change date with offset undefined', function() {
            const result = node.getParsedMoment('12:00', undefined, parser);
            result.format('YYYY-MM-DDTHH:mm:ss').should.equal('2019-11-21T12:00:00');
        });
    });

    // eslint-disable-next-line max-lines-per-function
    describe('isCurrentTimeWithinRange', function() {
        const node = mock(nodeRedModule, {});
        it('should work with range over midnight starting in the moring', function() {
            const start = moment('2019-11-21 06:30');
            const end = moment('2019-11-21 03:30');

            node.now = function() { return moment('2019-11-21 06:31'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 00:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 03:29'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 06:29'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 03:31'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
        it('should work with range over midnight starting after midday', function() {
            const start = moment('2019-11-21 12:45');
            const end = moment('2019-11-21 02:45');

            node.now = function() { return moment('2019-11-21 12:46'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 00:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 02:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 12:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 02:46'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
        it('should work with range over midnight starting at night', function() {
            const start = moment('2019-11-21 22:45');
            const end = moment('2019-11-21 01:45');

            node.now = function() { return moment('2019-11-21 22:46'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 00:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 01:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 22:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 01:46'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
        it('should work with range in the moring', function() {
            const start = moment('2019-11-21 01:45');
            const end = moment('2019-11-21 02:45');

            node.now = function() { return moment('2019-11-21 01:46'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 02:11'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 02:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 01:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 02:46'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 00:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
        it('should work should work with range over midday', function() {
            const start = moment('2019-11-21 11:45');
            const end = moment('2019-11-21 12:45');

            node.now = function() { return moment('2019-11-21 11:46'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 12:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 11:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 12:46'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 00:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
        it('should work with range in the afternoon', function() {
            const start = moment('2019-11-21 16:10');
            const end = moment('2019-11-21 17:45');

            node.now = function() { return moment('2019-11-21 16:11'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 17:44'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 16:59'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 16:09'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 17:46'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 00:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
        it('should work from midnight to midnight', function() {
            const start = moment('2019-11-21 00:00');
            const end = moment('2019-11-21 00:00');

            node.now = function() { return moment('2019-11-21 00:00'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 08:59'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 16:59'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
        it('should work with switching day while processing start and end time', function() {
            const start = moment('2019-11-21 06:30');
            const end = moment('2019-11-22 03:30');

            node.now = function() { return moment('2019-11-21 06:31'); };
            let result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 12:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 00:00'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 03:29'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.true();

            node.now = function() { return moment('2019-11-21 06:29'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();

            node.now = function() { return moment('2019-11-21 03:31'); };
            result = node.isCurrentTimeWithinRange(start, end);
            result.should.be.false();
        });
    });

    describe('sendMessage', function() {
        it('should send in range to output 1', function() {
            const node = mock(nodeRedModule, {});

            node.sendMessage('messageText', true);
            const result = node.sent(0);

            result[0].should.equal('messageText')
            should.not.exist(result[1]);
        });
        it('should send outside range to output 2', function() {
            const node = mock(nodeRedModule, {});

            node.sendMessage('messageText', false);
            const result = node.sent(0);
            
            should.not.exist(result[0]);
            result[1].should.equal('messageText')
        });
    });

    describe('setStatus', function() {
        it('should set within range status', function() {
            const node = mock(nodeRedModule, {});
            const start = moment('2019-11-21 06:30');
            const end = moment('2019-11-22 03:30');

            node.setStatus(start, end, true);
            const result = node.status();

            result.fill.should.equal('green');
            result.shape.should.equal('dot');
            result.text.should.equal('06:30 - 03:30');
        });
        it('should set outside of range status', function() {
            const node = mock(nodeRedModule, {});
            const start = moment('2019-11-21 06:30');
            const end = moment('2019-11-22 03:30');

            node.setStatus(start, end, false);
            const result = node.status();

            result.fill.should.equal('green');
            result.shape.should.equal('ring');
            result.text.should.equal('06:30 - 03:30');
        });
    });

    describe('now', function() {
        it('should return a moment date', function() {
            const node = mock(nodeRedModule, {});
            const result = node.now();

            should.exist(result);
        });
    });

    describe('input', function() {
        it('should run through entire process with success', function() {
            // arrange
            let result = null;
            const node = mock(nodeRedModule, {
                startTime: '08:00',
                endTime: '10:00',
                startOffset: 1,
                endOffset: 2,
                lat: 51.33411,
                lon: -0.83716,
                unitTest: true
            });
            node.context = function() {
                return {
                    flow: {
                        'keys'() { return ['flowKey']},
                        'get'() { return '10:00' }
                    },
                    global: {
                        'keys'() { return []},
                        'get'() { return undefined }
                    }
                }
            };
            node.send = function(msg) {
                result = msg;
            };
            node.now = function() {
                return moment('2019-03-22 09:00:00');
            };
        
            // act
            node.emit('input', {});

            // assert
            should.exist(result[0]);
            should.not.exist(result[1]);
        });
    });
});
