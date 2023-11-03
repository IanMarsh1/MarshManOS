/* ------------
     memoryAccessor.ts

     memory accessor is used to read and write to memory from the CPU

     ------------ */

module TSOS {
    export class MemoryAccessor {
        public memSeg0Base = 0x000;
        public memSeg0Limit = 0x0FF;
        public memSeg1Base = 0x100;
        public memSeg1Limit = 0x1FF;
        public memSeg2Base = 0x200;
        public memSeg2Limit = 0x2FF;

        public initMem(){
            _Memory.initMemory();
        }

        public initSeg(seg: number){
            _Memory.initSegment(seg);
        }

        // write to mem and do data validation 
        public write(addr: number, data: number, segment: number) {
            
            if(segment == 0){
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr, data);
                }
                else{
                    console.log("Memory out of bounds");
                    _currentPCB.status = "Terminated";
                    _CPU.isExecuting = false;
                    _StdOut.putText("Memory out of bounds");
                }
            }

            else if(segment == 1){
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x100, data);
                }
                else{
                    console.log("Memory out of bounds");
                    _currentPCB.status = "Terminated";
                    _CPU.isExecuting = false;
                    _StdOut.putText("Memory out of bounds");
                }
            }

            else if(segment == 2){
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x200, data);
                }
                else{
                    console.log("Memory out of bounds");
                    _currentPCB.status = "Terminated";
                    _CPU.isExecuting = false;
                    _StdOut.putText("Memory out of bounds");
                }
            }

            else{
                // TODO: make this print to screen and not say load
                console.log("Memory full");
            }
            
        }

        public read(addr: number): number {
            var data = 0x00;
            if(_currentPCB.Segment == 0){
                if (addr >= 0x00 && addr <= 0xff) {
                    data = _Memory.getMem(addr);
                }
            }

            else if(_currentPCB.Segment == 1){
                if (addr >= 0x00 && addr <= 0xff) {
                    data =_Memory.getMem(addr + 0x100);
                }
            }

            else if(_currentPCB.Segment == 2){
                if (addr >= 0x00 && addr <= 0xff) {
                    data = _Memory.getMem(addr + 0x200);
                }
            }
            return data;
        }
    }
}