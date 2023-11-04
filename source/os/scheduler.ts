module TSOS {
    export class Scheduler {
        
        public _PCBList: TSOS.ProcessControlBlock[] = [];
        public quantum: number = 6;

        constructor(){
           
        }
        
        public setQuantum(quantum: number): void {
            this.quantum = quantum;
        }

        public runScheduler(): void {
            
        }

        public findNextProcess() {
            
        }
    }
        
        
}
