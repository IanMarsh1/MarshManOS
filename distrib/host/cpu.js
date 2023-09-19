/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Cpu {
        PC;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        IR;
        isExecuting;
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, IR = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.IR = IR;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            this.IR = 0x00;
            if (this.IR === 0xA9) { // Load the accumulator with a constant
            }
            else if (this.IR === 0xAD) { // Load the accumulator from memory
            }
            else if (this.IR === 0x8D) { // Store the accumulator in memory
            }
            else if (this.IR === 0x6D) { // Add with carry
            }
            else if (this.IR === 0xA2) { // Load the X register with a constant
            }
            else if (this.IR === 0xAE) { // Load the X register from memory
            }
            else if (this.IR === 0xA0) { // Load the Y register with a constant
            }
            else if (this.IR === 0xAC) { // Load the Y register from memory
            }
            else if (this.IR === 0xEA) { // no op
            }
            else if (this.IR === 0x00) { // Break
            }
            else if (this.IR === 0xEC) { // Compare a byte in memory to the X reg
            }
            else if (this.IR === 0xD0) { // Branch n bytes if Z flag = 0
            }
            else if (this.IR === 0xEE) { // Increment the value of a byte 
            }
            else if (this.IR === 0xFF) { // System Call 
            }
            else { // if it runs this code then we hit an error and shoudl BSOD
                console.log("Wrong: " + this.IR);
            }
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map