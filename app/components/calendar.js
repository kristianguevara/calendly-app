import Component from '@ember/component';
import '../helpers/calendar-utils';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CalendarComponent extends Component {
    @tracked selectedDate = this.initCurrentDate();

    didRender = () => {

        window.$(document).ready(() => {
            var that = this;

            window.$('#calendar-component').calendar({ 
                language: 'en', //en or ph
                action: function() { 
                    that.highlightDate(this.id); 
                }
            })
        });

    }

    initCurrentDate = () => {
        var currDate = new Date()
        var year = currDate.getFullYear();
        var month = currDate.getMonth() + 1;
        var day = currDate.getDate()
        return month + '/' + day + '/' + year;
    }

    highlightDate = (id) => {
        
        var selectedDate = $('#' + id).data('date');
        var selectedYear = selectedDate.split('-')[0]
        var selectedMonth = selectedDate.split('-')[1]
        var selectedDay = selectedDate.split('-')[2]

        var selectedFormattedDate = selectedMonth + '/' + selectedDay + '/' + selectedYear;
        var idPrefix = id.split('_')[0] + '_' + id.split('_')[1];


        var previousSelectedYear = parseInt(this.selectedDate.split('/')[2])
        var previousSelectedMonth = this.selectedDate.split('/')[0];
        var previousSelectedDay = this.selectedDate.split('/')[1]
        var previousSelectedDate = previousSelectedYear + '-' + previousSelectedMonth + '-' + previousSelectedDay;
        var combinedPrefix = idPrefix + '_' + previousSelectedDate;
        var selectedDateElement = window.$('#' + combinedPrefix);

        var calendarElement = window.$('#' + idPrefix);

        calendarElement.data('selectedYear', selectedYear);
        calendarElement.data('selectedMonth', selectedMonth);

        //Remove previously-selected day
        previousSelectedDay = previousSelectedDay.charAt(0) == 0 ? previousSelectedDay.charAt(1) : previousSelectedDay;
        calendarElement.data('selectedDay', selectedDay);
        selectedDateElement.html('<div id="' + combinedPrefix + '_day" class="day">' + previousSelectedDay + '</div>');

        var dayId = id + '_day';
        var dateElement = window.$('#' + dayId);

        this.selectedDate = selectedFormattedDate;   


        //Add highlight
        selectedDay = selectedDay.charAt(0) == 0 ? selectedDay.charAt(1) : selectedDay;
        dateElement.html('<span class="badge badge-today">' + selectedDay + '</span>');

    }

    @action
    calendarInput(evt) {
        //let selectedDay = evt.target.value;
        evt.preventDefault();
    }

}