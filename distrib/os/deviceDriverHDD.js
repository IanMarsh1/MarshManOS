/* ----------------------------------
   DeviceDriverHDD.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverHDD extends TSOS.DeviceDriver {
        formatted = false;
        krnHDDFormat() {
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
        createFile(fileName) {
            if (this.formatted) {
                var address = this.getDIRLoc();
                if (address !== null) {
                    var data = sessionStorage.getItem(address);
                    var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                    data = "1" + fileNameHex + data.substring(fileNameHex.length, 124);
                    sessionStorage.setItem(address, data);
                    TSOS.Control.updateHDD();
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        getDIRLoc() {
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
        ls() {
            if (this.formatted) {
                var files = [];
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            // I told copliot that data was in hex and I wanted in text and it did this for me
                            var fileName = data.slice(1).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                            files.push(fileName);
                        }
                    }
                }
                _StdOut.putText("------Files------");
                _StdOut.advanceLine();
                for (var file of files) {
                    _StdOut.putText(file);
                    _StdOut.advanceLine();
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        getDATALoc() {
        }
    }
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverHDD.js.map