module TSOS {
    export class MemoryManager {
        
        constructor(){
           
        }

        public clearMemAll() {
            _MemoryAccessor.initSeg(0);
            _MemoryAccessor.initSeg(1);
            _MemoryAccessor.initSeg(2);
            _CurrentSegment = null;
        }
        
        
        // load the program from shell to memory.
        public load(program: string[], pcb: ProcessControlBlock): ProcessControlBlock {
            // set everything back to 0x00
            //_MemoryAccessor.initMem();
            if(_CurrentSegment == null){
                _CurrentSegment = 0;
                pcb.Segment = _CurrentSegment;
                _MemoryAccessor.initSeg(0);
            }
            else if(_CurrentSegment == 1){
                pcb.Segment = _CurrentSegment;
                _MemoryAccessor.initSeg(1);
            }
            else if(_CurrentSegment == 2){
                pcb.Segment = _CurrentSegment;
                _MemoryAccessor.initSeg(2);
            }
            
            for (var i = 0x00; i < program.length; i++) {
                
                // take in array of strings but change to numbers
                _MemoryAccessor.write(i, parseInt(program[i], 0x10), _CurrentSegment);
            }
            pcb.status = "Ready";
            _CurrentSegment ++;
            return pcb;
        }
    }
}