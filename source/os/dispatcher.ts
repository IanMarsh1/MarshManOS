module TSOS {
    export class Dispatcher {
        public _CurrentPCB: TSOS.ProcessControlBlock = null;

        public contextSwitch(newPCB :ProcessControlBlock): void {
            this._CurrentPCB = newPCB;
            this._CurrentPCB.status = "Running";
            _CPU.isExecuting = true;
        }
    }
}