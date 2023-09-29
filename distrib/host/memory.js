/* ------------
     memory.ts

     memory is used to to initialize, set, and get hex values from user

     ------------ */
var TSOS;
(function (TSOS) {
    class Memory {
        memArray = new Array(0xff);
        initMemory() {
            for (let i = 0x00; i < 0xff; i++) {
                this.memArray[i] = 0x00;
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map