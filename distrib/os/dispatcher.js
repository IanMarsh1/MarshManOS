var TSOS;
(function (TSOS) {
    class Dispatcher {
        _CurrentPCB = null;
        contextSwitch(newPCB) {
            this._CurrentPCB = newPCB;
            this._CurrentPCB.status = "Running";
            _CPU.isExecuting = true;
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map