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

            // copliot helped me with this, mostly with the session storage because I 
            // have never used it before
            for (var t = 0; t < 4; t++) {
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var key = t + ":" + s + ":" + b;
                        sessionStorage.setItem(key, "0".repeat(64));
                    }
                }
            }
            TSOS.Control.updateHDD();
        }
        
    }
}