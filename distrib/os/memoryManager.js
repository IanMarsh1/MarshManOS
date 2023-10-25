var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
        }
        // load the program from shell to memory.
        load(program, pcb) {
            // set everything back to 0x00
            //_MemoryAccessor.initMem();
            console.log(_CurrentSegment);
            if (_CurrentSegment == null) {
                _CurrentSegment = 0;
                pcb.Segment = _CurrentSegment;
                _MemoryAccessor.initSeg(0);
            }
            else if (_CurrentSegment == 1) {
                pcb.Segment = _CurrentSegment;
                _MemoryAccessor.initSeg(1);
            }
            else if (_CurrentSegment == 2) {
                pcb.Segment = _CurrentSegment;
                _MemoryAccessor.initSeg(2);
            }
            _CurrentSegment++;
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