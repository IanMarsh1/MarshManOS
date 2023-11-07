/* ------------
     processControlBlock.ts

     Process Control Block is used to store inforamtion about process the cpu wants to run

     ------------ */

module TSOS {
     export class ProcessControlBlock {
          static pidNum: number = 0;
          public PID = ProcessControlBlock.pidNum++;
          public PC: number = 0;
          public Acc: number = 0;
          public Xreg: number = 0;
          public Yreg: number = 0;
          public Zflag: number = 0;
          public IR: number = 0;
          public status: string = null;
          public Segment: number = null;
          public quantum: number = _Scheduler.quantum;
          public base: number = null;
          public limit: number = null;
          public loc: string = "mem";


          public updatePCB(pc: number, acc: number, xreg: number, yreg: number, zflag: number, ir: number) {
               this.PC = pc;
               this.Acc = acc;
               this.Xreg = xreg;
               this.Yreg = yreg;
               this.Zflag = zflag;
               this.IR = ir;
          }
     }
}