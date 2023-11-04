var TSOS;
(function (TSOS) {
    class Scheduler {
        _PCBList = [];
        quantum = 6;
        constructor() {
        }
        setQuantum(quantum) {
            this.quantum = quantum;
        }
        runScheduler() {
        }
        findNextProcess() {
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map