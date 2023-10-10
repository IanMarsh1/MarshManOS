var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
        }
        // load the program from shell to memory.
        load(program) {
            // set everything back to 0x00
            _MemoryAccessor.initMem();
            var pcb = new TSOS.ProcessControlBlock();
            for (var i = 0x00; i < program.length; i++) {
                // take in array of strings but change to numbers
                _MemoryAccessor.write(i, parseInt(program[i], 0x10));
            }
            pcb.status = "Ready";
            return pcb;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map