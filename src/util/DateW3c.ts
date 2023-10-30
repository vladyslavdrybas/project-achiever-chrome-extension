class DateW3c extends Date {

    toString = (): string => {
        return this.toW3CString();
    }

    toUserView = (): string => {
        let year = this.getFullYear();
        let month: number|string = this.getMonth();
        month ++;
        if (month < 10) {
            month = '0' + month;
        }

        let day: number|string = this.getDate();
        if (day < 10) {
            day = '0' + day;
        }

        let hours: number|string = this.getHours();
        if (hours < 10) {
            hours = '0' + hours;
        }

        let minutes: number|string = this.getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
    }

    toW3CString = () => {
        let year = this.getFullYear();

        let month: number|string = this.getMonth();
        month ++;
        if (month < 10) {
            month = '0' + month;
        }

        let day: number|string = this.getDate();
        if (day < 10) {
            day = '0' + day;
        }

        let hours: number|string = this.getHours();
        if (hours < 10) {
            hours = '0' + hours;
        }

        let minutes: number|string = this.getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        let seconds: number|string = this.getSeconds();
        if (seconds < 10) {
            seconds = '0' + seconds;
        }

        let offset = -this.getTimezoneOffset();
        let offsetHours: number|string = Math.abs(Math.floor(offset / 60));
        let offsetMinutes: number|string = Math.abs(offset) - offsetHours * 60;
        if (offsetHours < 10) {
            offsetHours = '0' + offsetHours;
        }
        if (offsetMinutes < 10) {
            offsetMinutes = '0' + offsetMinutes;
        }
        let offsetSign = '+';
        if (offset < 0) {
            offsetSign = '-';
        }

        return year + '-' + month + '-' + day +
            'T' + hours + ':' + minutes + ':' + seconds +
            offsetSign + offsetHours + ':' + offsetMinutes;
    }
}

export default DateW3c;