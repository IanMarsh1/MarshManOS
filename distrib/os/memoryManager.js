var TSOS;
(function (TSOS) {
    class MemoryManager {
        residentList;
        constructor() {
        }
        // load the program from shell to memory.
        load(program) {
            // set everything back to 0x00
            _Memory.initMemory();
            var pcb = new TSOS.ProcessControlBlock();
            //this.residentList[pcb.PID] = pcb;
            //pcb.stat = "Resident";
            for (var i = 0x00; i < program.length; i++) {
                // take in array of strings but change to numbers
                _Memory.setMem(i, parseInt(program[i], 0x10));
            }
            _Memory.memDump(); // temp 
            return pcb.PID;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map