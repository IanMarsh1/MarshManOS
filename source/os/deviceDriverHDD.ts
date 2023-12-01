/* ----------------------------------
   DeviceDriverHDD.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHDD extends DeviceDriver {
        public formatted: boolean = false;

        public krnHDDFormat() {
            // Format the HDD
            if (this.formatted === false) {
                this.formatted = true;
                // copliot helped me with this, mostly with the session storage because I 
                // have never used it before
                for (var t = 0; t < 4; t++) {
                    for (var s = 0; s < 8; s++) {
                        for (var b = 0; b < 8; b++) {
                            var tsb = `${t}:${s}:${b}`;

                            var data = Array(125).fill("0");
                            if (t === 0 && s === 0 && b === 0) { // Set MBR
                                data[0] = "1";
                            }

                            sessionStorage.setItem(tsb, data.join('')); // Convert data array to string
                        }
                    }
                }
                _StdOut.putText("HDD Formatted");
                TSOS.Control.updateHDD();
            }
            else {
                _StdOut.putText("HDD already formatted");
            }
        }

        public createFile(fileName: string) {
            var address = this.getDIRLoc();
            if (address !== null) {
                var data = sessionStorage.getItem(address);
                var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                data = "1" + fileNameHex + data.substring(fileNameHex.length, 124);
                sessionStorage.setItem(address, data);
                TSOS.Control.updateHDD();
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        public getDIRLoc() {
            for (var s = 0; s < 8; s++) {
                for (var b = 0; b < 8; b++) {
                    var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                    if (data[0] === "0") {
                        console.log("location: " + `${0}:${s}:${b}`);
                        return `${0}:${s}:${b}`;
                    }
                }
            }
            _StdOut.putText("No more space in directory");
            return null;
        }

        public getDATALoc() {

        }
    }
}