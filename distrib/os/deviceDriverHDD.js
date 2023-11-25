/* ----------------------------------
   DeviceDriverHDD.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverHDD extends TSOS.DeviceDriver {
        krnHDDFormat() {
            // Format the HDD
            sessionStorage.clear();
        }
    }
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverHDD.js.map