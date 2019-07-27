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

module.exports = function(RED) {

    const moment = require('moment');
    require('twix');

    const PlaceholderParser = require('./placeholder-parser');
    const DateParser = require('./date-parser');

    RED.nodes.registerType('time-range-switch', function(config) {
        RED.nodes.createNode(this, config);

        this.on('input', msg => {
            const parser = new PlaceholderParser(this.context(), msg);

            const startMoment = this.getParsedMoment(config.startTime, config.startOffset, parser);
            const endMoment = this.getParsedMoment(config.endTime, config.endOffset, parser);

            const isWithinRange = this.isCurrentTimeWithinRange(startMoment, endMoment);

            this.sendMessage(msg, isWithinRange);
            this.setStatus(startMoment, endMoment, isWithinRange);
        });

        this.now = function() {
            return moment();
        };

        this.getParsedMoment = function(timeString, offset, placeholderParser) {
            const parsedTime = placeholderParser.getParsedValue(timeString);
            const parsedMoment = DateParser.momentFor(parsedTime, this.now());

            const parsedOffset = placeholderParser.getParsedValue(offset);
            if (parsedOffset) {
                parsedMoment.add(parsedOffset, 'minutes');
            }

            return parsedMoment;
        };

        this.isCurrentTimeWithinRange = function(startMoment, endMoment) {
            const now = this.now();

            // align end to be before AND within 24 hours of start
            while (endMoment.diff(startMoment, 'seconds') < 0) {
                // end before start
                endMoment.add(1, 'day');
            }
            while (endMoment.diff(startMoment, 'seconds') > 86400) {
                // end more than day before start
                endMoment.subtract(1, 'day');
            }
            // move start and end window to be within a day of now
            while (endMoment.diff(now, 'seconds') < 0) {
                // end before now
                startMoment.add(1, 'day');
                endMoment.add(1, 'day');
            }
            while (endMoment.diff(now, 'seconds') > 86400) {
                // end more than day from now
                startMoment.subtract(1, 'day');
                endMoment.subtract(1, 'day');
            }

            const range = moment.twix(startMoment, endMoment);
            return range.contains(now);
        };

        this.sendMessage = function(message, isWithinRange) {
            const withinRangeOutput = 0;
            const outsideOutput = 1;

            const outputIndex = isWithinRange
                ? withinRangeOutput
                : outsideOutput;

            const messageContainer = [];
            messageContainer[outputIndex] = message;

            this.send(messageContainer);
        };

        this.setStatus = function(startMoment, endMoment, isWithinRange) {
            const startText = startMoment.format('HH:mm');
            const endText = endMoment.format('HH:mm');

            this.status({
                fill: 'green',
                shape: isWithinRange ? 'dot' : 'ring',
                text:  `${startText} - ${endText}`
            });
        };
    });
};
