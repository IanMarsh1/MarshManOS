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
            let memViolation = false;

            // because write is used before load is run I implemented this to check 
            // this way but im sure there is a better way
            if (data > 0xFF){
                memViolation = true;
            }
            
            else if(segment == 0){
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr, data);
                }
                else{
                    memViolation = true;
                }
            }

            else if(segment == 1){
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x100, data);
                }
                else{
                    memViolation = true;
                }
            }

            else if(segment == 2){
                if (addr >= 0x00 && addr <= 0xff) {
                    _Memory.setMem(addr + 0x200, data);
                }
                else{
                    memViolation = true;
                }
            }
            
            if (memViolation){
                _CPU.isExecuting = false
                _Dispatcher._CurrentPCB.status = "Terminated";

                // needed if we are running only one program
                if(_Scheduler._RunAll === true) _Scheduler.runScheduler();

                
                _StdOut.putText("PID: " + _Dispatcher._CurrentPCB.PID + " Memory out of bounds");
            }
        }

        // read and add pcb base to get the correct address
        public read(addr: number): number {
            var data = 0x00;
            if (addr >= 0x00 && addr <= 0xff) {
                data = _Memory.getMem(addr + _Dispatcher._CurrentPCB.base);
            }
            
            return data;
        }

        // dump memory to be stored in HDD
        public memDump() {               
            var output = [];
            for (var i = 0x00; i <= 0xff; i++) {
                var data = this.read(i).toString(16).toUpperCase();

                // add a 0 so when pulled of HDD it is the correct length
                data = data.length === 1 ? data.padStart(2, '0') : data;
                output.push(data);
            }
            return output;
        }
    }
}