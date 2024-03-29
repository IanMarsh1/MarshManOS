var TSOS;
(function (TSOS) {
    class MemoryManager {
        // clear all memory by setting it to 0x00
        clearMemAll() {
            _MemoryAccessor.initSeg(0);
            _MemoryAccessor.initSeg(1);
            _MemoryAccessor.initSeg(2);
            TSOS.Control.updatePCBList();
            //_currentSegment is used as a pointer for loading programs into memory
            _CurrentSegment = null;
        }
        // clear a specific memory segment does not set _currentSegment to null
        clearMemSeg(segment) {
            _MemoryAccessor.initSeg(segment);
        }
        memDump() {
            var output = _MemoryAccessor.memDump();
            return output;
        }
        loadFromSwap(program, pcb, oldPCB) {
            pcb.base = oldPCB.base;
            pcb.limit = oldPCB.limit;
            pcb.Segment = oldPCB.Segment;
            pcb.loc = "mem";
            var programSlice = [];
            programSlice = program.slice(0, 256);
            //console.log("load from swap " + program);
            for (var i = 0x00; i < programSlice.length; i++) {
                // take in array of strings but change to numbers
                _MemoryAccessor.write(i, parseInt(programSlice[i], 0x10), pcb.Segment);
            }
            oldPCB.Segment = null;
            oldPCB.base = null;
            oldPCB.limit = null;
            TSOS.Control.updatePCBList();
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
            else {
                pcb.Segment = null;
                pcb.base = null;
                pcb.limit = null;
            }
            if (_CurrentSegment < 3) {
                for (var i = 0x00; i < program.length; i++) {
                    // take in array of strings but change to numbers
                    _MemoryAccessor.write(i, parseInt(program[i], 0x10), _CurrentSegment);
                    pcb.loc = "mem";
                }
            }
            else {
                var name = "." + pcb.PID.toString() + ".sys";
                ;
                _HDD.createFile(name, false);
                _HDD.writeFileForSwap(name, program.join(""));
                pcb.loc = "disk";
            }
            pcb.status = "Resident";
            _CurrentSegment++;
            return pcb;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map