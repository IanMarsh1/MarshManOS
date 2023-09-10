/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);

            // https://asecuritysite.com/coding/asc2
            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)) {                       // enter
                if(isShifted === true){
                    if(keyCode == 48) chr = String.fromCharCode(41);
                    else if(keyCode == 49) chr = String.fromCharCode(33);
                    else if(keyCode == 50) chr = String.fromCharCode(64);
                    else if(keyCode == 51) chr = String.fromCharCode(35);
                    else if(keyCode == 52) chr = String.fromCharCode(36);
                    else if(keyCode == 53) chr = String.fromCharCode(37);
                    else if(keyCode == 54) chr = String.fromCharCode(94);
                    else if(keyCode == 55) chr = String.fromCharCode(38);
                    else if(keyCode == 56) chr = String.fromCharCode(42);
                    else if(keyCode == 57) chr = String.fromCharCode(40);
                }
                else{
                    chr = String.fromCharCode(keyCode);
                }
            
                _KernelInputQueue.enqueue(chr);
            }
            
        }
    }
}
