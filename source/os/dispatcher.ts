/* ------------------------------
     dispatcher.ts

     Used for context switching (aka kicking kids off the swing set)
     ------------------------------ */
module TSOS {
    export class Dispatcher {
        public _CurrentPCB: TSOS.ProcessControlBlock = null;

        public contextSwitch(newPCB :ProcessControlBlock): void {

            // simple just kick the old program out and load the new one
            // the old program is set to ready in the scheduler
            this._CurrentPCB = newPCB;
            this._CurrentPCB.status = "Running";
            _CPU.isExecuting = true;
            
        }
    }
}