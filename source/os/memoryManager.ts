module TSOS {
    export class MemoryManager {
        constructor(){
            
        }
        
        // load the program from shell to memory.
        public load(program: string[]): ProcessControlBlock  {
            // set everything back to 0x00
            _MemoryAccessor.initMem();
            var pcb = new ProcessControlBlock();
            
            for (var i = 0x00; i < program.length; i++) {

                // take in array of strings but change to numbers
                _MemoryAccessor.write(i, parseInt(program[i], 0x10));
            }
            pcb.status = "Ready";
            return pcb;
        }
    }
}