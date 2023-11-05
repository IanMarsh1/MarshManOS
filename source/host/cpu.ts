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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public ACC: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public IR: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.ACC = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            this.PC = _Dispatcher._CurrentPCB.PC;
            this.ACC = _Dispatcher._CurrentPCB.Acc;
            this.Xreg = _Dispatcher._CurrentPCB.Xreg;
            this.Yreg = _Dispatcher._CurrentPCB.Yreg;
            this.Zflag = _Dispatcher._CurrentPCB.Zflag;
            
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.

            this.IR = _MemoryAccessor.read(this.PC);
            this.PC++;

            if (this.IR === 0xA9){ // Load the accumulator with a constant
                this.ACC = _MemoryAccessor.read(this.PC);
                this.PC++;

            }

            else if (this.IR === 0xAD){ // Load the accumulator from memory

                // this code will be used a lot and its goal is to set the bytes in order
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var addr = secByte << 8;
                addr = addr + firstByte;

                this.ACC = _MemoryAccessor.read(addr);

            }

            else if (this.IR === 0x8D){ // Store the accumulator in memory
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var addr = secByte << 8;
                addr = addr + firstByte;

                _MemoryAccessor.write(addr, this.ACC, _Dispatcher._CurrentPCB.Segment);
            }

            else if (this.IR === 0x6D){ // Add with carry
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var addr = secByte << 8;
                addr = addr + firstByte;

                var num1 = _MemoryAccessor.read(addr);
                var num2 = this.ACC;
                
                /* 
                 * asked chat
                 * gave it the code above and asked to do add with carry. 
                 * I did it differently in org and arc but i did not like 
                 * how it was done so i decided to see how chat would do it
                 * and i think it is better
                 */

                var C = 0;

                // perform the addition with carry
                var result = num1 + num2 + C;

                // update the carry flag based on the result
                C = (result > 0xFF) ? 1 : 0;

                // update the accumulator with the result
                this.ACC = result & 0xFF;
            }

            else if (this.IR === 0xA2){ // Load the X register with a constant
                this.Xreg = _MemoryAccessor.read(this.PC);
                this.PC++;
            }

            else if (this.IR === 0xAE){ // Load the X register from memory
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var addr = secByte << 8;
                addr = addr + firstByte;

                this.Xreg = _MemoryAccessor.read(addr);
            }

            else if (this.IR === 0xA0){ // Load the Y register with a constant
                this.Yreg = _MemoryAccessor.read(this.PC);
                this.PC++;
            }

            else if (this.IR === 0xAC){ // Load the Y register from memory
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var addr = secByte << 8;
                addr = addr + firstByte;

                this.Yreg = _MemoryAccessor.read(addr);
            }

            else if (this.IR === 0xEA){ // no op
                // the meaning of life
            }

            else if (this.IR === 0x00){ // Break
                _CPU.isExecuting = false;
                _Dispatcher._CurrentPCB.status = "Terminated";
                //console.log(_Scheduler._PCBList);
                
                if(_Scheduler._RunAll) _Scheduler.runScheduler();
            }

            else if (this.IR === 0xEC){ // Compare a byte in memory to the X reg
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var addr = secByte << 8;
                addr = addr + firstByte;

                // set the z flag if =
                if (this.Xreg === _MemoryAccessor.read(addr)){
                    this.Zflag = 1;
                }

                // if not z = 0
                else{
                    this.Zflag = 0;
                }
            }

            else if (this.IR === 0xD0){ // Branch n bytes if Z flag = 0 
                var jump = _MemoryAccessor.read(this.PC);

                this.PC++;

                if (this.Zflag === 0x0) {
                    // Calculate the new PC value
                    const newPC = this.PC + jump;

                    // Check if the new PC exceeds memory boundaries
                    if (newPC > 0xFF) {
                        this.PC = newPC - 0x100;
                    } 
                    else {
                        this.PC = newPC;
                    }
                }
            }

            else if (this.IR === 0xEE){ // Increment the value of a byte 
                var firstByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var secByte = _MemoryAccessor.read(this.PC);
                this.PC++;

                var addr = secByte << 8;
                addr = addr + firstByte;

                var num = _MemoryAccessor.read(addr);

                num++;

                _MemoryAccessor.write(addr, num, _Dispatcher._CurrentPCB.Segment);
            }

            else if (this.IR === 0xFF){ // System Call 
                if(this.Xreg === 0x01) { // $01 in X reg = print the integer stored in the Y register
                    _Console.putText(this.Yreg.toString());
                } 
                else if (this.Xreg === 0x02) { // $02 in X reg = print the 00-terminated string stored at the address in the Y register
                    var addr = this.Yreg;
                    var asciiCode = _MemoryAccessor.read(addr);

                    // run to we hit 0x00
                    while(asciiCode != 0x00){
                        addr++;
                        _Console.putText(String.fromCharCode(asciiCode))
                        asciiCode = _MemoryAccessor.read(addr);
                    }
                }
                // I never move the PC when reading so no need to pc++
            }

            else { // if it runs this code then we hit an error and should BSOD
                //console.log("Wrong: " + this.IR.toString(16));
                _Kernel.krnShutdown();
                _StdOut.bsod();
                //console.log(_Scheduler._PCBList)
            }  

            // data to be passed to be displayed 
            const pcbData = {
                PC: this.PC,
                Acc: this.ACC,
                Xreg: this.Xreg,
                Yreg: this.Yreg,
                Zflag: this.Zflag,
                IR: this.IR,
            };
            
            // update the pcb display
            TSOS.Control.updatePCBData(pcbData);
            _Scheduler.tick();

            // update the pcb
            _Dispatcher._CurrentPCB.updatePCB(this.PC, this.ACC, this.Xreg, this.Yreg, this.Zflag, this.IR);
        }
    }
}
