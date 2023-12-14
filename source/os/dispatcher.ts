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
            
            // dont need a swap file if the program is terminated
            if (removePCB.status === "Terminated"){
                _MemoryManager.clearMemSeg(removePCB.Segment);
                removePCB.loc = "Space";
            }

            // create a swap file and write the data to it
            else{
                var dataToSwap = _MemoryManager.memDump();
                _MemoryManager.clearMemSeg(removePCB.Segment);
                var name = "." + removePCB.PID.toString() + ".sys";
                _HDD.createFileForSwap(name);
                _HDD.writeFileForSwap(name, dataToSwap.join(""));
                removePCB.loc = "disk";
            }
            
            TSOS.Control.updatePCBList();
        }

        // roll in the program from disk
        public rollIn(addPCB: ProcessControlBlock, removePCB: ProcessControlBlock) {

            // format the name of the swap file
            var name = "." + addPCB.PID.toString() + ".sys";;

            // string of data from HDD
            var dataToSwap = _HDD.readFileSwap(name);

            // split the string into an array of 2 char strings
            const splitArray: string[] = dataToSwap.match(/.{1,2}/g) || [];
            
            _HDD.deleteFile(name, false);
            _MemoryManager.loadFromSwap(splitArray, addPCB, removePCB);
            addPCB.loc = "mem";
            TSOS.Control.updatePCBList();

        }
    }
}