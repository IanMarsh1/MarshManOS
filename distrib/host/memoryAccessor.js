/* ------------
     memoryAccessor.ts

     memory accessor is used to read and write to memory from the CPU

     ------------ */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memSeg0Base = 0x000;
        memSeg0Limit = 0x0FF;
        memSeg1Base = 0x100;
        memSeg1Limit = 0x1FF;
        memSeg2Base = 0x200;
        memSeg2Limit = 0x2FF;
        initMem() {
            _Memory.initMemory();
        }
        initSeg(seg) {
            _Memory.initSegment(seg);
        }
        // write to mem and do data validation 
        write(addr, data, segment) {
            let memViolation = false;
            // because write is used before load is run I implemented this to check 
            // this way but im sure there is a better way
            if (segment == 0) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr, data);
                }
                else {
                    memViolation = true;
                }
            }
            else if (segment == 1) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x100, data);
                }
                else {
                    memViolation = true;
                }
            }
            else if (segment == 2) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x200, data);
                }
                else {
                    memViolation = true;
                }
            }
            if (memViolation) {
                console.log("Memory out of bounds");
                // needed if we are running only one program
                if (_Scheduler._RunAll === false)
                    _CPU.isExecuting = false;
                _Dispatcher._CurrentPCB.status = "Terminated";
                _StdOut.putText("PID: " + _Dispatcher._CurrentPCB.PID + " Memory out of bounds");
            }
        }
        // read and add pcb base to get the correct address
        read(addr) {
            var data = 0x00;
            if (addr >= 0x00 && addr <= 0xff) {
                data = _Memory.getMem(addr + _Dispatcher._CurrentPCB.base);
            }
            return data;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map