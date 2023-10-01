/* ------------
     memory.ts

     memory is used to to initialize, set, and get hex values from user 

     ------------ */

module TSOS {
     export class Memory {
          // set up the mem array to 256
          public memArray = new Array<number>(0xff);

          constructor() {
          }

          // fill the array up with 0s 
          public initMemory(){
               for (let i = 0x00; i < this.memArray.length; i++) {
                    this.memArray[i] = 0x00;
               }
          }

          // set memory from an address and data value
          // data validation is done in the memAccessor
          public setMem (addr: number, data: number){
               this.memArray[addr] = data;
          }

          // used for trouble shoting: used chat to help conver from dec to hex and it worked first try 
          public memDump(){
               // Convert and log each memory value as a hexadecimal string
               const hexArray = this.memArray.map((value) => value.toString(16).toUpperCase());
               console.log(hexArray);
          }
     }
} 