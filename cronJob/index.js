const ENVIRONMENT = process.env.NODE_ENV || 'development';
const CronJob = require('cron').CronJob;
const fork    = require('child_process').fork;
const moment = require('moment');
const DURATIONS = {
    MINUTE_JOB: 1,
    HALF_HOUR_JOB: 30,
    FORTY_NINE_MINUTE_JOB: 49,
    ELEVEN_MINUTE_JOB: 11,
    HOUR_JOB: 60,
    DAILY_JOB: 1440,
    DATE_JOB: 3  //3rd date of month
};

class CronJobs {
    constructor() {
        let seconds = 10;
        let parsedDate = new Date()
        let newDate = new Date(parsedDate.getTime() + (1000 * seconds))
        new CronJob({
            cronTime: newDate, onTick: this.minuteJob.bind(this), start: false
        }).start();
    }

    async minuteJob() {
        await this.__executeJobByMatchingTime({ path: './execute-action-on-scheduled-messages.js', duration: DURATIONS.MINUTE_JOB });
    }


    async __executeJobByMatchingTime({ path, duration }) {
        if(duration === DURATIONS.MINUTE_JOB && (this.__isStartOfHour()
            || this.__isStartOfHalfHour()
            || this.__isFortyNineMinuteOfHour()
            || this.__isElevenMinuteOfHour()
            || this.__isStartOfDay())) {
            console.info(`ignoring the minute job at ${new Date()}`);
            return;
        }
        await this.__executeJob({ path, duration });
    }

    async __executeJob({ path, duration }) {
        if(this.runningJob && !this.__isStartOfDay()) {
            console.info(`There is some job ${this.runningJob} already running.`);
            return;
        }
        this.runningJob = path;
        return new Promise((resolve)=>{
            console.log(`Executing the job --> ${path} of duration --> ${duration} the access logs at -->${new Date()}`);
            const job = fork(path, [{ NODE_ENV: ENVIRONMENT }]);
            job.on('message', this.__callBackHandlerFunction);
            const timer = setTimeout(()=>{
                job.kill();
            }, 600000);
            job.on('exit', ()=>{
                this.__exitJob(resolve, timer);
            });
        });
    }
    __exitJob(resolve, timer) {
        resolve();
        this.runningJob = false;
        this.__exitBackHandlerFunction();
        timer && clearTimeout(timer);
    }
    __isStartOfHalfHour() {
        return moment().minute() === 28 || moment().minute() === 56;
    }

    __isStartOfHour() {
        return moment().minute() === 0;
    }

    __isStartOfDay() {
        return moment().minute() === 0 && moment().hour() === 7;
    }

    __isFortyNineMinuteOfHour() {
        return moment().minute() === 49;
    }

    __isElevenMinuteOfHour() {
        return moment().minute() === 11;
    }

    __exitBackHandlerFunction() {
        console.log('child process has been killed, process id');
    }

    __callBackHandlerFunction(log) {
        console.log('stdout log: ' + log);
    }
}
new CronJobs();
