/* ------------
     memoryAccessor.ts

     memory accessor is used to read and write to memory from the CPU

     ------------ */

module TSOS {
    export class MemoryAccessor {

        public initMem(){
            _Memory.initMemory();
        }

        public initSeg(seg: number){
            _Memory.initSegment(seg);
        }

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