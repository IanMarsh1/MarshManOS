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
        update({ PC, IR, Acc, Xreg, Yreg, Zflag }) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.IR = IR;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processContolBlock.js.map