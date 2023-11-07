/* ------------
     memory.ts

     memory is used to to initialize, set, and get hex values from user 

     ------------ */

module TSOS {
     export class Memory {
          // set up the mem array to 256
          public memArray = new Array<number>(0x2ff);
          public memSeg0Base = 0x000;
          public memSeg0Limit = 0x0FF;
          public memSeg1Base = 0x100;
          public memSeg1Limit = 0x1FF;
          public memSeg2Base = 0x200;
          public memSeg2Limit = 0x2FF;

          constructor() {
          }

          // fill the array up with 0s 
          public initMemory(){
               for (let i = 0x00; i < this.memArray.length; i++) {
                    this.memArray[i] = 0x00;
                    TSOS.Control.updateMemory(i, 0x00);
               }
          }

          // fill a segment with 0s
          // used copolit to help with this function and it worked first try
          // after defining base and limit for each segment it did it for me
          public initSegment(Segment: number){
               if (Segment == 0){
                    for (let i = this.memSeg0Base; i <= this.memSeg0Limit; i++) {
                         this.setMem(i,0x00);
                    }
               }
               else if (Segment == 1){
                    for (let i = this.memSeg1Base; i <= this.memSeg1Limit; i++) {
                         this.setMem(i,0x00);
                    }
               }
               else if (Segment == 2){
                    for (let i = this.memSeg2Base; i <= this.memSeg2Limit; i++) {
                         this.setMem(i,0x00);
                    }
               }
          }

          // set memory from an address and data value
          // data validation is done in the memAccessor
          public setMem(addr: number, data: number){
               this.memArray[addr] = data;
               TSOS.Control.updateMemory(addr, data);        
          }
          
          public getMem(addr: number): number{
               return this.memArray[addr];     
          }
     }
}