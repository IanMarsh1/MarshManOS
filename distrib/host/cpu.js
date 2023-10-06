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
        ACC;
        Xreg;
        Yreg;
        Zflag;
        IR;
        isExecuting;
        constructor(PC = 0, ACC = 0, Xreg = 0, Yreg = 0, Zflag = 0, IR = 0, isExecuting = false) {
            this.PC = PC;
            this.ACC = ACC;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.IR = IR;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.ACC = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            this.IR = _MemoryAccessor.read(this.PC);
            this.PC++;
            if (this.IR === 0xA9) { // Load the accumulator with a constant
                this.ACC = _MemoryAccessor.read(this.PC);
                this.PC++;
            }
            else if (this.IR === 0xAD) { // Load the accumulator from memory
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                var addr = secByte << 8;
                addr = addr + firstByte;
                this.ACC = _MemoryAccessor.read(addr);
            }
            else if (this.IR === 0x8D) { // Store the accumulator in memory
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                var addr = secByte << 8;
                addr = addr + firstByte;
                _MemoryAccessor.write(addr, this.ACC);
            }
            else if (this.IR === 0x6D) { // Add with carry
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                var addr = secByte << 8;
                addr = addr + firstByte;
                var num1 = _MemoryAccessor.read(addr);
                var num2 = this.ACC;
                // Assuming C is the carry flag (initialize it as 0 or 1 as needed)
                var C = 0;
                // Perform the addition with carry
                var result = num1 + num2 + C;
                // Update the carry flag based on the result
                C = (result > 0xFF) ? 1 : 0;
                // Update the accumulator (ACC) with the result (8-bit)
                this.ACC = result & 0xFF;
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
                _CPU.isExecuting = false;
            }
            else if (this.IR === 0xEC) { // Compare a byte in memory to the X reg
            }
            else if (this.IR === 0xD0) { // Branch n bytes if Z flag = 0
            }
            else if (this.IR === 0xEE) { // Increment the value of a byte 
            }
            else if (this.IR === 0xFF) { // System Call 
            }
            else { // if it runs this code then we hit an error and should BSOD
                console.log("Wrong: " + this.IR);
            }
            console.log("public this.PC: number =", this.PC.toString(16));
            console.log("public this.Acc: number =", this.ACC.toString(16));
            console.log("public this.Xreg: number =", this.Xreg.toString(16));
            console.log("public this.Yreg: number =", this.Yreg.toString(16));
            console.log("public this.Zflag: number =", this.Zflag.toString(16));
            console.log("public this.IR: number =", this.IR.toString(16));
            console.log("public this.isExecuting: boolean =", this.isExecuting);
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map