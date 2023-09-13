/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
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
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
                // https://asecuritysite.com/coding/asc2
            }
            // check for up and down arrow, backspace, or tab
            else if (keyCode == 8 || keyCode == 38 || keyCode == 40 || keyCode == 9) { // arrows backspace tab
                if (keyCode == 38)
                    chr = String.fromCharCode(0x2191);
                else if (keyCode == 40)
                    chr = String.fromCharCode(0x2193);
                else if (keyCode == 8)
                    chr = String.fromCharCode(8);
                else if (keyCode == 9)
                    chr = String.fromCharCode(9);
                _KernelInputQueue.enqueue(chr);
            }
            // check for all dig, space, special chars, and enter
            else if (((keyCode >= 48) && (keyCode <= 59)) || // digits
                (keyCode == 32) || // space
                (keyCode == 13)) { // enter
                if (isShifted === true) { // !@#$$%^&*()
                    if (keyCode == 48)
                        chr = String.fromCharCode(41);
                    else if (keyCode == 49)
                        chr = String.fromCharCode(33);
                    else if (keyCode == 50)
                        chr = String.fromCharCode(64);
                    else if (keyCode == 51)
                        chr = String.fromCharCode(35);
                    else if (keyCode == 52)
                        chr = String.fromCharCode(36);
                    else if (keyCode == 53)
                        chr = String.fromCharCode(37);
                    else if (keyCode == 54)
                        chr = String.fromCharCode(94);
                    else if (keyCode == 55)
                        chr = String.fromCharCode(38);
                    else if (keyCode == 56)
                        chr = String.fromCharCode(42);
                    else if (keyCode == 57)
                        chr = String.fromCharCode(40);
                    else if (keyCode == 59)
                        chr = String.fromCharCode(59);
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            // check for more special char
            else if (((keyCode => 186) && (keyCode <= 191)) ||
                ((keyCode => 219) && (keyCode <= 222))) { // <>:"{},./;'[]\
                if (isShifted === true) {
                    if (keyCode === 186)
                        chr = String.fromCharCode(58);
                    else if (keyCode === 187)
                        chr = String.fromCharCode(43);
                    else if (keyCode === 188)
                        chr = String.fromCharCode(60);
                    else if (keyCode === 189)
                        chr = String.fromCharCode(95);
                    else if (keyCode === 190)
                        chr = String.fromCharCode(62);
                    else if (keyCode === 191)
                        chr = String.fromCharCode(63);
                    else if (keyCode === 219)
                        chr = String.fromCharCode(123);
                    else if (keyCode === 220)
                        chr = String.fromCharCode(124);
                    else if (keyCode === 221)
                        chr = String.fromCharCode(125);
                    else if (keyCode === 222)
                        chr = String.fromCharCode(34);
                }
                else {
                    if (keyCode == 186)
                        chr = String.fromCharCode(59);
                    else if (keyCode == 187)
                        chr = String.fromCharCode(61);
                    else if (keyCode == 188)
                        chr = String.fromCharCode(44);
                    else if (keyCode == 189)
                        chr = String.fromCharCode(45);
                    else if (keyCode == 190)
                        chr = String.fromCharCode(46);
                    else if (keyCode == 191)
                        chr = String.fromCharCode(47);
                    else if (keyCode == 219)
                        chr = String.fromCharCode(91);
                    else if (keyCode == 220)
                        chr = String.fromCharCode(92);
                    else if (keyCode == 221)
                        chr = String.fromCharCode(93);
                    else if (keyCode == 222)
                        chr = String.fromCharCode(39);
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map