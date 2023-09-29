/* ------------
     memory.ts

     memory is used to to initialize, set, and get hex values from user 

     ------------ */

module TSOS {

     export class Memory {
          public memArray = new Array<number>(0xff);

          public initMemory(){       
               for (let i = 0x00; i < 0xff; i++) {
                    this.memArray[i] = 0x00;
               }
          }


     }
}