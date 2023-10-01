module TSOS {
    export class MemoryManager {
        constructor(){
        }
        
        // load the program from shell to memory.
        public load(program: string[])  {
            // set everything back to 0x00
            _Memory.initMemory();
            
            for (var i = 0x00; i < program.length; i++) {

                // take in array of strings but change to numbers
                _Memory.setMem(i, parseInt(program[i], 0x10));
            }
            _Memory.memDump(); // temp 
            
        }
    }
}