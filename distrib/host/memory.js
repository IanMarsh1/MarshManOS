/* ------------
     memory.ts

     memory is used to to initialize, set, and get hex values from user

     ------------ */
var TSOS;
(function (TSOS) {
    class Memory {
        // set up the mem array to 256
        memArray = new Array(0x2ff);
        memSeg0Base = 0x000;
        memSeg0Limit = 0x0FF;
        memSeg1Base = 0x100;
        memSeg1Limit = 0x1FF;
        memSeg2Base = 0x200;
        memSeg2Limit = 0x2FF;
        constructor() {
        }
        // fill the array up with 0s 
        initMemory() {
            for (let i = 0x00; i < this.memArray.length; i++) {
                this.memArray[i] = 0x00;
                TSOS.Control.updateMemory(i, 0x00);
            }
        }
        // fill a segment with 0s
        // used copolit to help with this function and it worked first try
        // after defining base and limit for each segment it did it for me
        initSegment(Segment) {
            if (Segment == 0) {
                for (let i = this.memSeg0Base; i <= this.memSeg0Limit; i++) {
                    this.setMem(i, 0x00);
                }
            }
            else if (Segment == 1) {
                for (let i = this.memSeg1Base; i <= this.memSeg1Limit; i++) {
                    this.setMem(i, 0x00);
                }
            }
            else if (Segment == 2) {
                for (let i = this.memSeg2Base; i <= this.memSeg2Limit; i++) {
                    this.setMem(i, 0x00);
                }
            }
        }
        // set memory from an address and data value
        // data validation is done in the memAccessor
        setMem(addr, data) {
            this.memArray[addr] = data;
            TSOS.Control.updateMemory(addr, data);
        }
        getMem(addr) {
            return this.memArray[addr];
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map