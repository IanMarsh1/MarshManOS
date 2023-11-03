var TSOS;
(function (TSOS) {
    class Scheduler {
        _PCBList = [];
        quantum = null;
        constructor() {
        }
        init() {
            this.quantum = 6;
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map