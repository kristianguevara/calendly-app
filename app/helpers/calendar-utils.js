if (typeof window.jQuery == 'undefined') {
    throw new Error('jQuery is not loaded');
}


window.$.fn.calendar = function (options) {
    var opts = window.$.extend({}, window.$.fn.calendar_defaults(), options);
    var languageSettings = window.$.fn.calendar_language(opts.language);
    opts = window.$.extend({}, opts, languageSettings);

    this.each(function () {
        var $calendarElement = window.$(this);
        $calendarElement.attr('id', 'calendar_' + Math.floor(Math.random() * 99999).toString(36));

        $calendarElement.data('initYear', opts.year);
        $calendarElement.data('initMonth', opts.month);
        $calendarElement.data('initDay', opts.day);
        $calendarElement.data('selectedYear', opts.year);
        $calendarElement.data('selectedMonth', opts.month);
        $calendarElement.data('selectedDay', opts.day);

        $calendarElement.data('monthLabels', opts.month_labels);
        $calendarElement.data('weekStartsOn', opts.weekstartson);
        $calendarElement.data('dowLabels', opts.dow_labels)

        $calendarElement.data('showDays', opts.show_days);
        $calendarElement.data('showPrevious', opts.show_previous);
        $calendarElement.data('showNext', opts.show_next);
        $calendarElement.data('cellBorder', opts.cell_border);
        $calendarElement.data('actionFunction', opts.action);

        drawCalendar();

        function drawCalendar() {
            var dateInitYear = parseInt($calendarElement.data('initYear'));
            var dateInitMonth = parseInt($calendarElement.data('initMonth')) - 1;
            var dateInitDay = parseInt($calendarElement.data('initDay'));
            var dateInitObj = new Date(dateInitYear, dateInitMonth, dateInitDay, 0, 0, 0, 0);
            $calendarElement.data('initDate', dateInitObj);

            var tableClassHtml = ($calendarElement.data('cellBorder')) ? ' table-bordered' : '';

            var $tableObj = window.$('<table class="table' + tableClassHtml + '"></table>');
            $tableObj = drawTable($calendarElement, $tableObj, dateInitObj.getFullYear(), dateInitObj.getMonth(), dateInitDay);

            var $containerHtml = window.$('<div class="calendar" id="' + $calendarElement.attr('id') + '"></div>');
            $containerHtml.append($tableObj);

            $calendarElement.append($containerHtml);
        }

        function drawTable($calendarElement, $tableObj, year, month, day) {
            var dateCurrObj = new Date(year, month, day, 0, 0, 0, 0);
            $calendarElement.data('currDate', dateCurrObj);

            $tableObj.empty();
            $tableObj = appendMonthHeader($calendarElement, $tableObj, year, month);
            $tableObj = appendDayOfWeekHeader($calendarElement, $tableObj);
            $tableObj = appendDaysOfMonth($calendarElement, $tableObj, year, month, day);

            return $tableObj;
        }


        function appendMonthHeader($calendarElement, $tableObj, year, month) {

            var $prevMonthNavIcon = window.$('<span> < </span>');
            var $nextMonthNavIcon = window.$('<span> > </span>');
            var selectedDay = parseInt($calendarElement.data('selectedDay'));

            var prevIsValid = $calendarElement.data('showPrevious');
            if (typeof(prevIsValid) === 'number' || !prevIsValid) {
                prevIsValid = checkMonthLimit($calendarElement.data('showPrevious'), true);
            }

            var $prevMonthNav = window.$('<div class="calendar-month-navigation"></div>');
            $prevMonthNav.attr('id', $calendarElement.attr('id') + '_nav-prev');
            $prevMonthNav.data('navigation', 'prev');
            if (prevIsValid !== false) {
                var prevMonth = (month - 1);
                var prevYear = year;
                if (prevMonth == -1) {
                    prevYear = (prevYear - 1);
                    prevMonth = 11;
                }
                $prevMonthNav.data('to', {year: prevYear, month: (prevMonth + 1)});
                $prevMonthNav.append($prevMonthNavIcon);

                $prevMonthNav.click(function (e) {
                    drawTable($calendarElement, $tableObj, prevYear, prevMonth, selectedDay);
                });
            }

            var nextIsValid = $calendarElement.data('showNext');
            if (typeof(nextIsValid) === 'number' || !nextIsValid) {
                nextIsValid = checkMonthLimit($calendarElement.data('showNext'), false);
            }

            var $nextMonthNav = window.$('<div class="calendar-month-navigation"></div>');
            $nextMonthNav.attr('id', $calendarElement.attr('id') + '_nav-next');
            $nextMonthNav.data('navigation', 'next');
            if (nextIsValid !== false) {
                var nextMonth = (month + 1);
                var nextYear = year;
                if (nextMonth == 12) {
                    nextYear = (nextYear + 1);
                    nextMonth = 0;
                }
                $nextMonthNav.data('to', {year: nextYear, month: (nextMonth + 1)});
                $nextMonthNav.append($nextMonthNavIcon);

                $nextMonthNav.click(function (e) {
                    drawTable($calendarElement, $tableObj, nextYear, nextMonth, selectedDay);
                });
            }

            var monthLabels = $calendarElement.data('monthLabels');

            var $prevMonthCell = window.$('<th></th>').append($prevMonthNav);
            var $nextMonthCell = window.$('<th></th>').append($nextMonthNav);

            var $currMonthLabel = window.$('<span>' + monthLabels[month] + ' ' + year + '</span>');
            $currMonthLabel.dblclick(function () {
                var dateInitObj = $calendarElement.data('initDate');
                drawTable($calendarElement, $tableObj, dateInitObj.getFullYear(), dateInitObj.getMonth(), selectedDay);
            });

            var $currMonthCell = window.$('<th colspan="5"></th>');
            $currMonthCell.append($currMonthLabel);

            var $monthHeaderRow = window.$('<tr class="calendar-month-header"></tr>');
            $monthHeaderRow.append($prevMonthCell, $currMonthCell, $nextMonthCell);

            $tableObj.append($monthHeaderRow);
            return $tableObj;
        }

        function appendDayOfWeekHeader($calendarElement, $tableObj) {
            if ($calendarElement.data('showDays')) {
                var weekStartsOn = $calendarElement.data('weekStartsOn');
                var dowLabels = $calendarElement.data('dowLabels');
                if (weekStartsOn === 0) {
                    var dowFull = window.$.extend([], dowLabels);
                    var sunArray = new Array(dowFull.pop());
                    dowLabels = sunArray.concat(dowFull);
                }

                var $dowHeaderRow = window.$('<tr class="calendar-dow-header"></tr>');
                window.$(dowLabels).each(function (index, value) {
                    $dowHeaderRow.append('<th>' + value + '</th>');
                });
                $tableObj.append($dowHeaderRow);
            }
            return $tableObj;
        }

        function appendDaysOfMonth($calendarElement, $tableObj, year, month, day) {
            var weeksInMonth = calcWeeksInMonth(year, month);
            var lastDayinMonth = calcLastDayInMonth(year, month);
            var firstDow = calcDayOfWeek(year, month, 1);
            var lastDow = calcDayOfWeek(year, month, lastDayinMonth);
            var currDayOfMonth = 1;
            var selectedMonth = parseInt($calendarElement.data('selectedMonth'));
            var selectedYear = parseInt($calendarElement.data('selectedYear'));


            var weekStartsOn = $calendarElement.data('weekStartsOn');
            if (weekStartsOn === 0) {
                if (lastDow == 6) {
                    weeksInMonth++;
                }
                if (firstDow == 6 && (lastDow == 0 || lastDow == 1 || lastDow == 5)) {
                    weeksInMonth--;
                }
                firstDow++;
                if (firstDow == 7) {
                    firstDow = 0;
                }
            }

            for (var wk = 0; wk < weeksInMonth; wk++) {
                var $dowRow = window.$('<tr class="calendar-dow"></tr>');
                for (var dow = 0; dow < 7; dow++) {
                    if (dow < firstDow || currDayOfMonth > lastDayinMonth) {
                        $dowRow.append('<td></td>');
                    } else {
                        var dateId = $calendarElement.attr('id') + '_' + dateAsString(year, month, currDayOfMonth);
                        var dayId = dateId + '_day';

                        var $dayElement = window.$('<div id="' + dayId + '" class="day" >' + currDayOfMonth + '</div>');
                        $dayElement.data('day', currDayOfMonth);

                        $dayElement.html(currDayOfMonth); 

                        if(day === currDayOfMonth && (month + 1 === selectedMonth) && year === selectedYear) {
                            $dayElement.html('<span class="badge badge-today">' + currDayOfMonth + '</span>');
                        }


                        var $dowElement = window.$('<td id="' + dateId + '"></td>');
                        $dowElement.append($dayElement);

                        $dowElement.data('date', dateAsString(year, month, currDayOfMonth));
                        $dowElement.data('hasEvent', false);

                        if (typeof($calendarElement.data('actionFunction')) === 'function') {
                            $dowElement.addClass('dow-clickable');
                            $dowElement.click(function () {
                                $calendarElement.data('selectedDate', window.$(this).data('date'));
                            });
                            $dowElement.click($calendarElement.data('actionFunction'));
                        }

                        $dowRow.append($dowElement);

                        currDayOfMonth++;
                    }
                    if (dow == 6) {
                        firstDow = 0;
                    }
                }

                $tableObj.append($dowRow);
            }
            return $tableObj;
        }


        function dateAsString(year, month, day) {
            var d = (day < 10) ? '0' + day : day;
            var m = month + 1;
            m = (m < 10) ? '0' + m : m;
            return year + '-' + m + '-' + d;
        }

        function calcDayOfWeek(year, month, day) {
            var dateObj = new Date(year, month, day, 0, 0, 0, 0);
            var dow = dateObj.getDay();
            if (dow == 0) {
                dow = 6;
            } else {
                dow--;
            }
            return dow;
        }

        function calcLastDayInMonth(year, month) {
            var day = 28;
            while (checkValidDate(year, month + 1, day + 1)) {
                day++;
            }
            return day;
        }

        function calcWeeksInMonth(year, month) {
            var daysInMonth = calcLastDayInMonth(year, month);
            var firstDow = calcDayOfWeek(year, month, 1);
            var lastDow = calcDayOfWeek(year, month, daysInMonth);
            var days = daysInMonth;
            var correct = (firstDow - lastDow);
            if (correct > 0) {
                days += correct;
            }
            return Math.ceil(days / 7);
        }

        function checkValidDate(y, m, d) {
            return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
        }

        function checkMonthLimit(count, invert) {
            if (!count) {
                count = 0;
            }
            var d1 = $calendarElement.data('currDate');
            var d2 = $calendarElement.data('initDate');

            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();

            if (invert) {
                if (months < (parseInt(count) - 1)) {
                    return true;
                }
            } else {
                if (months >= (0 - parseInt(count))) {
                    return true;
                }
            }
            return false;
        }
    }); // each()

    return this;
};


window.$.fn.calendar_defaults = function () {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();

    var settings = {
        language: false, //You can customize your own months and days. Putting false by default
        year: year,
        month: month,
        day: day,
        show_previous: true, //Should a user wish to remove prev button. Navigate through future months only
        show_next: true, //Should a user wish to remove next button. Navigate through past months only
        cell_border: true, //Add border or not
        show_days: true, //Show days of the week. Can be false to display straight on days
        weekstartson: 0, //Making this either Sunday = 0 or Monday = 1
        action: false //Just a placeholder for function. No need to mess with it
    };
    return settings;
};


window.$.fn.calendar_language = function (lang) {
    if (!lang) {
        lang = 'en';
    }

    switch (lang.toLowerCase()) {
        case 'en':
            return {
                month_labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                dow_labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            };
        case 'ph':
            return {
                month_labels: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
                dow_labels: ['Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado', 'Linggo']
            };
    }

};
