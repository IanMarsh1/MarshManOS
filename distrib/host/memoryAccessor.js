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
            if (segment == 0) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr, data);
                }
            }
            else if (segment == 1) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x100, data);
                }
            }
            else if (segment == 2) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x200, data);
                }
            }
            else {
                // TODO: make this print to screen and not say load
                console.log("Memory full");
            }
        }
        read(addr) {
            var data = 0x00;
            if (_currentPCB.Segment == 0) {
                if (addr >= 0x00 && addr <= 0xff) {
                    data = _Memory.getMem(addr);
                }
            }
            else if (_currentPCB.Segment == 1) {
                if (addr >= 0x00 && addr <= 0xff) {
                    data = _Memory.getMem(addr + 0x100);
                }
            }
            else if (_currentPCB.Segment == 2) {
                if (addr >= 0x00 && addr <= 0xff) {
                    data = _Memory.getMem(addr + 0x200);
                }
            }
            return data;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map