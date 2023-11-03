module TSOS {
    export class Scheduler {
        
        public _PCBList: TSOS.ProcessControlBlock[] = [];
        public quantum: number = null;

        constructor(){
           
        }
        public init(): void {
            this.quantum = 6;
        }
    }
} 