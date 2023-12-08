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

                            var data = Array(120).fill("0"); // 64 bytes -4 bytes for meta data
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

        /* ----------------------------------
            Utils
        ---------------------------------- */  

        public getDIRLoc() {
            for (var s = 0; s < 8; s++) {
                for (var b = 0; b < 8; b++) {
                    var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                    if (data[0] === "0") {
                        //console.log("location: " + `${0}:${s}:${b}`);
                        return `${0}:${s}:${b}`;
                    }
                }
            }
            _StdOut.putText("No more space in directory");
            return null;
        }

        public getDATALoc() {
            for (var t = 1; t < 4; t++) {
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${t}:${s}:${b}`);
                        if (data[0] === "0") {
                            //console.log("location: " + `${t}:${s}:${b}`);
                            return `${t}${s}${b}`;
                        }
                    }
                }
            }
            _StdOut.putText("No more space in DATA");
            return null;
        }

        /* ----------------------------------
            File system Functions for user files
        ---------------------------------- */   

        public createFile(fileName: string) {
            
            if(this.formatted) {
                var DIRaddress = this.getDIRLoc();
                var DATAaddress = this.getDATALoc();
                
                if (DIRaddress !== null) {
                    var data = sessionStorage.getItem(DIRaddress);
                    var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                    var output = "1" + DATAaddress + fileNameHex + data.substring(fileNameHex.length + 4, 120);
                    sessionStorage.setItem(DIRaddress, output);
                    TSOS.Control.updateHDD();
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        public writeFile(fileName: string, inputData: string) {
            
            if(this.formatted) {
                var DATAaddress = this.findFile(fileName);
                
                if (DATAaddress !== null) {

                    // asked copliot for help with this
                    let strData = String(DATAaddress);
                    let arrData = Array.from(strData);
                    let formattedAddress = arrData.join(':');

                    var data = sessionStorage.getItem(formattedAddress);

                    var fileInputData = inputData.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                    console.log(data);
                    data = "1" + "FFF" + fileInputData + data.substring(fileInputData.length + 4, 120);
                    sessionStorage.setItem(formattedAddress, data);
                    TSOS.Control.updateHDD();
                }
                else {
                    _StdOut.putText("File not found");
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        public findFile(fileName: string) {
            if(this.formatted) {
                var fileLoc = null;
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            // I told copliot that data was in hex and I wanted in text and it did this for me
                            fileLoc = data.slice(1, 4);
                            var file = data.slice(4);
                            var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                            file = file.substring(0, fileNameHex.length);
                            
                            if (file === fileNameHex) {
                                
                                return fileLoc;
                                
                            }
                        }
                    }
                }
                return null;
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        
        }

        public ls() {
            if(this.formatted) {
                var files = [];
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            // I told copliot that data was in hex and I wanted in text and it did this for me
                            var fileName = data.slice(4).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
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
    }
}