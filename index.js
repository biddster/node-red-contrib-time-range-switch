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
    'use strict';

    const SunCalc = require('suncalc');
    const moment = require('moment');
    const mustache = require("mustache");
    require('twix');
    const fmt = 'YYYY-MM-DD HH:mm';

    RED.nodes.registerType('time-range-switch', function(config) {
        RED.nodes.createNode(this, config);

        this.on('input', msg => {
            const now = this.now();
            const data = dataobject(this.context(), msg);
            const startTime = mustache.render(config.startTime.toString(), data);
            const startMoment = momentFor(startTime, now);
            const endTime = mustache.render(config.endTime.toString(), data);
            const endMoment = momentFor(endTime, now);
            const startOffset = mustache.render(config.startOffset.toString(), data);
            const endOffset = mustache.render(config.endOffset.toString(), data);
            
            if(startOffset) {
                startMoment.add(startOffset, 'minutes');
            }
            if (endOffset) {
                endMoment.add(endOffset, 'minutes');
            }
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
            const output = range.contains(now) ? 1 : 2;
            const msgs = [];
            msgs[output - 1] = msg;
            this.send(msgs);
            this.status({
                fill: 'green',
                shape: output === 1 ? 'dot' : 'ring',
                text: range.simpleFormat(fmt)
            });
        });

        const momentFor = (time, now) => {
            let m = null;
            const matches = new RegExp(/(\d+):(\d+)/).exec(time);
            if (matches && matches.length) {
                m = now
                    .clone()
                    .hour(matches[1])
                    .minute(matches[2]);
            } else {
                const sunCalcTimes = SunCalc.getTimes(now.toDate(), config.lat, config.lon);
                const date = sunCalcTimes[time];
                if (date) {
                    m = moment(date);
                }
            }

            if (m) {
                m.seconds(0);
            } else {
                this.status({ fill: 'red', shape: 'dot', text: `Invalid time: ${time}` });
            }
            return m;
        };

        const dataobject = (context, msg) => {
            var data = {}
            data.msg = msg;
            data.global = {};
            data.flow = {};
            var globalKeys = context.global.keys();
            var flowKeys = context.flow.keys();
            for (var key in globalKeys){
                data.global[globalKeys[key]] = context.global.get(globalKeys[key]);
            };
            for (var key in flowKeys){
                data.flow[flowKeys[key]] = context.flow.get(flowKeys[key]);
            };
            return data
        };

        this.now = function() {
            return moment();
        };
    });
};
