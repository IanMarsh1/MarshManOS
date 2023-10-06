/* ------------
     memoryAccessor.ts

     memory accessor is used to read and write to memory from the CPU

     ------------ */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        // write to mem and do data validation 
        write(addr, data) {
            if (addr >= 0x00 && addr <= 0xff) {
                if (data <= 0xff) {
                    _Memory.setMem(addr, data);
                }
            }
        }
        read(addr) {
            return _Memory.getMem(addr);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map