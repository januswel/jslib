'use strinct';

(function () {
    /**
     * An object to export
     *
     * @param {Date} base
     * */
    var TimeDistance = function TimeDistance(base) {
            this.base = base;
        },
        // constants
        SECOND_MILLISECOND = 1000,
        MINUTE_MILLISECOND = 60 * SECOND_MILLISECOND,
        HOUR_MILLISECOND = 60 * MINUTE_MILLISECOND,
        DAY_MILLISECOND = 24 * HOUR_MILLISECOND,
        WEEK_MILLISECOND = 7 * DAY_MILLISECOND,
        YEAR_MILLISECOND = 365 * DAY_MILLISECOND,
        // utility functions
        getNumberOfDaysForMonth = function (year, month) {
            return new Date(year, month + 1, 0).getDate()
        };

    TimeDistance.prototype = {
        /**
         *  @returns {number}
         *  @param {Date} target
         * */
        year: function (target) {
            var deltaMillsecond = target.getTime() - this.base.getTime();
            return deltaMillsecond / YEAR_MILLISECOND;
        },
        /**
         *  @returns {number}
         *  @param {Date} target
         * */
        month: function (target) {
            var base = this.base,
                deltaYear = target.getFullYear() - base.getFullYear(),
                deltaMonth = deltaYear * 12 + target.getMonth() - base.getMonth(),
                baseOffsetMilliseconds = base.getDate() * DAY_MILLISECOND
                    + base.getHours() * HOUR_MILLISECOND
                    + base.getMinutes() * MINUTE_MILLISECOND
                    + base.getSeconds() * SECOND_MILLISECOND
                    + base.getMilliseconds(),
                baseNumberOfDaysForMonth = getNumberOfDaysForMonth(base.getFullYear(), base.getMonth() + 1),
                baseOffsetRate = baseOffsetMilliseconds / (baseNumberOfDaysForMonth * DAY_MILLISECOND),
                dstOffsetMilliseconds = target.getDate() * DAY_MILLISECOND
                    + target.getHours() * HOUR_MILLISECOND
                    + target.getMinutes() * MINUTE_MILLISECOND
                    + target.getSeconds() * SECOND_MILLISECOND
                    + target.getMilliseconds(),
                dstNumberOfDaysForMonth = getNumberOfDaysForMonth(target.getFullYear(), target.getMonth() + 1),
                dstOffsetRate = dstOffsetMilliseconds / (dstNumberOfDaysForMonth * DAY_MILLISECOND);

            return deltaMonth - baseOffsetRate + dstOffsetRate;
        },
        /**
         *  @returns {number}
         *  @param {Date} target
         * */
        week: function (target) {
            var deltaMillsecond = target.getTime() - this.base.getTime();
            return deltaMillsecond / WEEK_MILLISECOND;
        },
        /**
         *  @returns {number}
         *  @param {Date} target
         * */
        day: function (target) {
            var deltaMillsecond = target.getTime() - this.base.getTime();
            return deltaMillsecond / DAY_MILLISECOND;
        },
        /**
         *  @returns {number}
         *  @param {Date} target
         * */
        hour: function (target) {
            var deltaMillsecond = target.getTime() - this.base.getTime();
            return deltaMillsecond / HOUR_MILLISECOND;
        },
        /**
         *  @returns {number}
         *  @param {Date} target
         * */
        minute: function (target) {
            var deltaMillsecond = target.getTime() - this.base.getTime();
            return deltaMillsecond / MINUTE_MILLISECOND;
        },
        /**
         *  @returns {number}
         *  @param {Date} target
         * */
        second: function (target) {
            var deltaMillsecond = target.getTime() - this.base.getTime();
            return deltaMillsecond / SECOND_MILLISECOND;
        },
        /**
         *  @returns {number}
         *  @param {Date} target
         */
        millisecond: function (target) {
            return target.getTime() - this.base.getTime();
        }
    };

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function ($) {
            return TimeDistance;
        });
    }

    if (typeof window === 'object' && typeof window.document === 'object') {
        window.TimeDistance = TimeDistance;
    }
})();
