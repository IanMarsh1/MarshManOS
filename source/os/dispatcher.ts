/* ------------------------------
     dispatcher.ts

     Used for context switching (aka kicking kids off the swing set)
     ------------------------------ */
module TSOS {
    export class Dispatcher {
        public _CurrentPCB: TSOS.ProcessControlBlock = null;

        public contextSwitch(newPCB :ProcessControlBlock): void {

            // simple just kick the old program out and load the new one
            // the old program is set to ready in the scheduler
            this._CurrentPCB = newPCB;
            this._CurrentPCB.status = "Running";
            _CPU.isExecuting = true;
        }

        // roll out the program to disk
        public rollOut(removePCB: ProcessControlBlock) {
            // get the data from memory 
            var dataToSwap = _MemoryManager.memDump();
            _MemoryManager.clearMemSeg(removePCB.Segment);
            var name = "." + removePCB.PID.toString() + ".sys";
            _HDD.createFileForSwap(name);
            _HDD.writeFileForSwap(name, dataToSwap.join(""));
            removePCB.loc = "disk";
            TSOS.Control.updatePCBList();
        }

        public rollIn(addPCB: ProcessControlBlock, removePCB: ProcessControlBlock) {
            var name = "." + addPCB.PID.toString() + ".sys";;
            var dataToSwap = _HDD.readFileSwap(name);

            const splitArray: string[] = dataToSwap.match(/.{1,2}/g) || [];
            
            _HDD.deleteFile(name, false);
            _MemoryManager.loadFromSwap(splitArray, addPCB, removePCB);
            addPCB.loc = "mem";
            TSOS.Control.updatePCBList();

        }
    }
}