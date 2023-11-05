var TSOS;
(function (TSOS) {
    class Scheduler {
        _PCBList = [];
        quantum = 6;
        lastRunProcessIndex = -1; // copoliot
        _RunAll = false;
        constructor() { }
        setQuantum(quantum) {
            this.quantum = quantum;
        }
        runScheduler() {
            if (this._PCBList.length > 0 && !this.allProcessesTerminated()) {
                _Kernel.krnTrace("Scheduling...");
                let nextProcess = this.findNextProcess();
                if (nextProcess !== null) {
                    _CPU.isExecuting = true;
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_IRQ, [nextProcess]));
                }
                else if (this.allButOneTerminated) {
                    _CPU.isExecuting = true;
                    _Scheduler._RunAll = false;
                }
            }
            else {
                _CPU.isExecuting = false;
            }
        }
        allProcessesTerminated() {
            let allTerminated = true;
            for (let pcb of _Scheduler._PCBList) {
                if (pcb.status != "Terminated") {
                    allTerminated = false;
                    break;
                }
            }
            if (allTerminated)
                this._RunAll = false;
            //console.log(allTerminated);
            return allTerminated;
        }
        allButOneTerminated() {
            let allTerminated = true;
            let count = 0;
            for (let pcb of _Scheduler._PCBList) {
                if (pcb.status != "Terminated") {
                    count++;
                    if (count > 1) {
                        allTerminated = false;
                        break;
                    }
                }
            }
            return allTerminated;
        }
        lastProc() {
            for (let pcb of _Scheduler._PCBList) {
                if (pcb.status = "Running") {
                    return pcb;
                }
            }
        }
        findNextProcess() {
            let nextProcess = null;
            // copoliot
            let i = (this.lastRunProcessIndex + 1) % this._PCBList.length;
            do {
                if (this._PCBList[i].status === "Ready" || this._PCBList[i].status === "Running") {
                    if (_Dispatcher._CurrentPCB != null && _Dispatcher._CurrentPCB.status !== "Terminated")
                        _Dispatcher._CurrentPCB.status = "Ready";
                    nextProcess = this._PCBList[i];
                    this.lastRunProcessIndex = i;
                }
                i = (i + 1) % this._PCBList.length;
            } while (i != this.lastRunProcessIndex && nextProcess === null);
            //if (nextProcess === null) nextProcess = this.lastProc();
            return nextProcess;
        }
        tick() {
            if (_Dispatcher._CurrentPCB.quantum > 1) {
                _Dispatcher._CurrentPCB.quantum--;
            }
            else {
                _Dispatcher._CurrentPCB.quantum = this.quantum;
                this.runScheduler();
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map