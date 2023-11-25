/* ----------------------------------
   DeviceDriverHDD.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHDD extends DeviceDriver {

        public krnHDDFormat() {
            // Format the HDD
            sessionStorage.clear();
        }
    }
}