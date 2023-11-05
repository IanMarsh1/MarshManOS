module TSOS {
    export class Scheduler {
        
        public _PCBList: TSOS.ProcessControlBlock[] = [];
        public quantum: number = 6;
        public lastRunProcessIndex: number = -1; // copoliot
        public _RunAll: boolean = false;

        constructor(){}

        public setQuantum(quantum: number): void {
            this.quantum = quantum;
        }

        public runScheduler(): void {
            if(this._PCBList.length > 0 && !this.allProcessesTerminated()){
                _Kernel.krnTrace("Scheduling...");
                let nextProcess = this.findNextProcess();
                if(nextProcess !== null){
                    _CPU.isExecuting = true;
                    _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_IRQ, [nextProcess]));
                }
            }
            else{
                _CPU.isExecuting = false;
            }
        }

        public allProcessesTerminated(): boolean {
            let allTerminated = true;

            for(let pcb of _Scheduler._PCBList) {
                if(pcb.status != "Terminated"){
                    allTerminated = false;
                    
                    break;
                }
            }
            if(allTerminated) this._RunAll = false;
            //console.log(allTerminated);
            return allTerminated;
        }

        public lastProc(): TSOS.ProcessControlBlock {
            for(let pcb of _Scheduler._PCBList) {
                if(pcb.status = "Running"){
                    return pcb;
                }
            }
        }

        public findNextProcess(): TSOS.ProcessControlBlock {
            let nextProcess = null;

            // copoliot
            let i = (this.lastRunProcessIndex + 1) % this._PCBList.length;

            do {
                if(this._PCBList[i].status === "Ready" || this._PCBList[i].status === "Running"){
                    if(_Dispatcher._CurrentPCB != null && _Dispatcher._CurrentPCB.status !== "Terminated") _Dispatcher._CurrentPCB.status = "Ready";
                    nextProcess = this._PCBList[i];
                    this.lastRunProcessIndex = i;
                    
                }
                i = (i + 1) % this._PCBList.length;
            } while(i != this.lastRunProcessIndex && nextProcess === null);

            //if (nextProcess === null) nextProcess = this.lastProc();
            return nextProcess;
        }

        public tick(): void {
            if(_Dispatcher._CurrentPCB.quantum > 1){
                _Dispatcher._CurrentPCB.quantum--;
            } else {
                _Dispatcher._CurrentPCB.quantum = this.quantum;
                this.runScheduler();
            }

        }

    }  
}