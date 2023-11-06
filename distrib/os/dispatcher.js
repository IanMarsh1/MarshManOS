var TSOS;
(function (TSOS) {
    class Dispatcher {
        _CurrentPCB = null;
        contextSwitch(newPCB) {
            // simple just kick the old program out and load the new one
            // the old program is set to ready in the scheduler
            this._CurrentPCB = newPCB;
            this._CurrentPCB.status = "Running";
            _CPU.isExecuting = true;
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map