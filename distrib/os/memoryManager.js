var TSOS;
(function (TSOS) {
    class MemoryManager {
        // clear all memory by setting it to 0x00
        clearMemAll() {
            _MemoryAccessor.initSeg(0);
            _MemoryAccessor.initSeg(1);
            _MemoryAccessor.initSeg(2);
            //_currentSegment is used as a pointer for loading programs into memory
            _CurrentSegment = null;
        }
        // clear a specific memory segment does not set _currentSegment to null
        clearMemSeg(segment) {
            _MemoryAccessor.initSeg(segment);
        }
        // load the program from shell to memory.
        load(program, pcb) {
            // set everything back to 0x00
            //_MemoryAccessor.initMem();
            if (_CurrentSegment == null) {
                _CurrentSegment = 0;
                pcb.base = 0;
                pcb.limit = 255;
                pcb.Segment = _CurrentSegment;
                _MemoryAccessor.initSeg(0);
            }
            else if (_CurrentSegment == 1) {
                pcb.Segment = _CurrentSegment;
                pcb.base = 256;
                pcb.limit = 511;
                _MemoryAccessor.initSeg(1);
            }
            else if (_CurrentSegment == 2) {
                pcb.Segment = _CurrentSegment;
                pcb.base = 512;
                pcb.limit = 767;
                _MemoryAccessor.initSeg(2);
            }
            for (var i = 0x00; i < program.length; i++) {
                // take in array of strings but change to numbers
                _MemoryAccessor.write(i, parseInt(program[i], 0x10), _CurrentSegment);
            }
            pcb.status = "Resident";
            _CurrentSegment++;
            return pcb;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map