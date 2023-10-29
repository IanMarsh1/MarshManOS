/* ------------
     memoryAccessor.ts

     memory accessor is used to read and write to memory from the CPU

     ------------ */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        initMem() {
            _Memory.initMemory();
        }
        initSeg(seg) {
            _Memory.initSegment(seg);
        }
        // write to mem and do data validation 
        write(addr, data) {
            //console.log(i + " " + parseInt(program[i], 0x10));
            if (_CurrentSegment == 1) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr, data);
                }
            }
            else if (_CurrentSegment == 2) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x100, data);
                }
            }
            else if (_CurrentSegment == 3) {
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x200, data);
                }
            }
            else {
                console.log("Memory full");
            }
        }
        read(addr) {
            return _Memory.getMem(addr);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map