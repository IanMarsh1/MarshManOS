/* ------------
     memoryAccessor.ts

     memory accessor is used to read and write to memory from the CPU

     ------------ */

module TSOS {
    export class MemoryAccessor {

        // write to mem and do data validation 
        public write(addr: number, data: number) {
            if (addr >= 0x00 && addr <= 0xff) {
                if (data <= 0xff) {
                    _Memory.setMem(addr, data);
                }
            }
        }
        public read(addr: number): number {
            return _Memory.getMem(addr);
        }
    }
}