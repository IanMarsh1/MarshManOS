/* ------------------------------
     scheduler.ts

     Used for scheduling programs to run
     ------------------------------ */
var TSOS;
(function (TSOS) {
    class Scheduler {
        _ProcessList = [];
        quantum = 6;
        lastRunProcessIndex = -1;
        _RunAll = false;
        schedule = "rr";
        /* This is taken from the shell of ip2.
         * I did not feel like it belonged in the shell
         * so I moved it here.
         */
        run(args) {
            // used to send correct output to the console
            let found = false;
            for (let pcb of _Scheduler._ProcessList) {
                // find the program with the pid that the user wants to run
                if (pcb.PID.toString(16) === args[0]) {
                    found = true;
                    // if the program is on disk we need to roll it in
                    if (pcb.loc == "disk") {
                        var toBeKilled = this.findTerminatedProcessInMem();
                        _Dispatcher._CurrentPCB = this._ProcessList[0];
                        if (toBeKilled === null) {
                            _Dispatcher.rollOut(_Dispatcher._CurrentPCB);
                            _Dispatcher.rollIn(pcb, _Dispatcher._CurrentPCB);
                        }
                        else {
                            _Dispatcher.rollOut(toBeKilled);
                            _Dispatcher.rollIn(pcb, toBeKilled);
                        }
                    }
                    // because we load to resident that is what we check for
                    if (pcb.status === "Resident") {
                        // quickly go from ready to running
                        pcb.status = "Ready";
                        pcb.status = "Running";
                        // send interrupt to dispatcher to start the program
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_IRQ, [pcb]));
                    }
                    // if the pid the user is looking for is terminated then we tell them
                    else if (pcb.status === "Terminated") {
                        _StdOut.putText("PID terminated");
                    }
                    // no need to keep looping once we find the program
                    break;
                }
            }
            if (!found) {
                _StdOut.putText("PID not loaded");
            }
        }
        /* Used github copliot a lot for this.
         * I think overall it took me longer because of it
         * and I spent a lot of time debugging. The prompt I
         * gave it was just writing runScheduler() and it gave me
         * a baseline that kinda worked. But it took me a while to
         * get it to work the way I wanted it to.
         */
        runScheduler() {
            /* This if is used if the user loads one program and types runall.
             * I did not like how it kept on scheduling the same program over and over
             * so this is the test I used to stop that.
             */
            if ((this._ProcessList.length === 1) && (this.allButOneTerminated())) {
                // still need to find the one program add send an interrupt to the dispatcher to start 
                let nextProcess = this.findNextProcess();
                _Kernel.krnTrace("Scheduling...");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_IRQ, [nextProcess]));
                _CPU.isExecuting = true;
                // _RunAll is used stop the tick command from running in the cpu.
                // Setting this to false is what stops the program from scheduling over and over.
                _Scheduler._RunAll = false;
            }
            // This else if is when there is more than one program loaded and we want to find the next one to run
            else if (this._ProcessList.length > 0 && !this.allProcessesTerminated()) {
                // find the next program to run
                _Kernel.krnTrace("Scheduling...");
                let nextProcess = this.findNextProcess();
                // if we find a program we send an interrupt to the dispatcher to start it
                if (nextProcess !== null) {
                    // if the next program is on disk we need to roll it in
                    if (nextProcess.loc == "disk") {
                        // if there is a program in memory that is terminated we remove it before any other program
                        var toBeKilled = this.findTerminatedProcessInMem();
                        if (toBeKilled === null) {
                            _Dispatcher.rollOut(_Dispatcher._CurrentPCB);
                            _Dispatcher.rollIn(nextProcess, _Dispatcher._CurrentPCB);
                        }
                        else {
                            _Dispatcher.rollOut(toBeKilled);
                            _Dispatcher.rollIn(nextProcess, toBeKilled);
                        }
                    }
                    _CPU.isExecuting = true;
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_IRQ, [nextProcess]));
                }
                // if every program is terminated BUT ONE I dont care about scheduling anymore just finish it
                else if (this.allButOneTerminated) {
                    _CPU.isExecuting = true;
                    _Scheduler._RunAll = false;
                }
            }
            // if we are done then we are done cpu can stop executing
            else {
                _CPU.isExecuting = false;
            }
        }
        // kinda self explanatory. Looks for any non terminated programs.
        allProcessesTerminated() {
            let allTerminated = true;
            for (let pcb of _Scheduler._ProcessList) {
                // if any are not found then we are not done
                if (pcb.status != "Terminated") {
                    allTerminated = false;
                    break;
                }
            }
            // if we are done then we are done AND STOP SCHEDULING
            // ...stoping scheduling was the hardest part of the project for 
            // me so thats why there is so much code to stop it.
            if (allTerminated)
                this._RunAll = false;
            return allTerminated;
        }
        // also self explanatory. Looks for any non terminated programs except one.
        allButOneTerminated() {
            let allTerminated = true;
            let count = 0;
            for (let pcb of _Scheduler._ProcessList) {
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
        /* When I first asked copilot to write this I thought I struck gold.
         * But I spent so much time debugging it that I could have just done it myself so much faster.
         * felt like I was stuck with shitty code that almost worked so you didn't want to throw it away but
         * I probably should have. I think I spent more time on this than any other part of the project.
         */
        findNextProcess() {
            let nextProcess = null;
            // try and find the index of the next process to run
            let i = (this.lastRunProcessIndex + 1) % this._ProcessList.length;
            // try to find the next process to run
            do {
                // If the current process is ready or running
                if (this._ProcessList[i].status === "Ready" || this._ProcessList[i].status === "Running") {
                    // If there is a current process and it's not terminated, set its status to ready
                    // this is because we found a new process to run and we are going to switch to it
                    if (_Dispatcher._CurrentPCB != null && _Dispatcher._CurrentPCB.status !== "Terminated")
                        _Dispatcher._CurrentPCB.status = "Ready";
                    // Set the next process to the current process
                    nextProcess = this._ProcessList[i];
                    // Update the last run process index
                    this.lastRunProcessIndex = i;
                }
                // used if we don't find a process to run
                i = (i + 1) % this._ProcessList.length;
                // Continue until we find the next process
            } while (i != this.lastRunProcessIndex && nextProcess === null);
            // Return the next process
            return nextProcess;
        }
        // check to see if we need to run the scheduler based on quantum value
        tick() {
            if (_Dispatcher._CurrentPCB.quantum > 1) {
                if (this.schedule === "rr")
                    _Dispatcher._CurrentPCB.quantum--;
            }
            else {
                _Dispatcher._CurrentPCB.quantum = this.quantum;
                this.runScheduler();
            }
        }
        // used to change status of all programs to ready when runall is called
        readyAll() {
            for (let pcb of _Scheduler._ProcessList) {
                if (pcb.status == "Resident") {
                    pcb.status = "Ready";
                }
            }
        }
        // change the quantum value for all programs
        changeQuantum(newQuantum) {
            this.quantum = newQuantum;
            for (let pcb of _Scheduler._ProcessList) {
                if (pcb.status !== 'Terminated')
                    pcb.quantum = this.quantum;
            }
            TSOS.Control.updatePCBList();
        }
        // if pid is in mem and terminated then we can roll it out
        findTerminatedProcessInMem() {
            for (let pcb of _Scheduler._ProcessList) {
                if (pcb.status == "Terminated" && (pcb.loc == "mem" || pcb.loc == "Space") && pcb.Segment != null) {
                    return pcb;
                }
            }
            return null;
        }
        changeSchedule() {
            if (this.schedule == "rr") {
                this.quantum = 6;
            }
            // if it is fcfs then i just dont tick down the quantum
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map