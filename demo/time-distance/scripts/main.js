'use strinct';

require(['jquery', 'jQuery.UI'], function ($) {
    $(document).ready(function () {
        $('ul').css({
            display: 'none'
        });

        $('input.datepicker').datepicker({
            dateFormat: 'yy-mm-dd'
        });
    });
});

require(['jquery', '../../../time-distance'], function ($, _) {
    var parseDate = function (date) {
            var dateArray = date.split('-');
            return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
        },
        pow = Math.pow,
        nativeRound = Math.round,
        round = function (value, digit) {
            var factor = pow(10, digit);
            return nativeRound(value * factor) / factor;
        };

    $(document).ready(function () {
        $('#calculate').on({
            click: function () {
                var targetDate = parseDate($('input.datepicker').val()),
                    currentDate = new Date();

                $('#year').text(round(_.yearDistance(currentDate, targetDate), 3));
                $('#month').text(round(_.monthDistance(currentDate, targetDate), 3));
                $('#week').text(round(_.weekDistance(currentDate, targetDate), 3));
                $('#day').text(round(_.dayDistance(currentDate, targetDate), 3));
                $('#hour').text(round(_.hourDistance(currentDate, targetDate), 3));

                $('ul').css({
                    display: 'block'
                });

                return false;
            }
        });
    });
});
