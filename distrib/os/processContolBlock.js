/* ------------
     processControlBlock.ts

     Process Control Block is used to store inforamtion about process the cpu wants to run

     ------------ */
var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        static pidNum = 0;
        PID = ProcessControlBlock.pidNum++;
        PC = 0;
        Acc = 0;
        Xreg = 0;
        Yreg = 0;
        Zflag = 0;
        IR = 0;
        status = null;
        Segment = null;
        quantum = _Scheduler.quantum;
        base = null;
        limit = null;
        loc = null;
        updatePCB(pc, acc, xreg, yreg, zflag, ir) {
            this.PC = pc;
            this.Acc = acc;
            this.Xreg = xreg;
            this.Yreg = yreg;
            this.Zflag = zflag;
            this.IR = ir;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processContolBlock.js.map