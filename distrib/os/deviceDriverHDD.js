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
                            var data = Array(124).fill("0"); // 64 bytes -4 bytes for meta data
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
        getDIRLoc() {
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
        getDATALoc() {
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
        formatAddress(address) {
            // asked copliot for help with this
            let strData = String(address);
            let arrData = Array.from(strData);
            let formattedAddress = arrData.join(':');
            return formattedAddress;
        }
        wipeDATA(address) {
            var firstFour = sessionStorage.getItem(address);
            firstFour = firstFour.substring(0, 4);
            var data = Array(124).fill("0");
            sessionStorage.setItem(address, firstFour + data.join(''));
        }
        /* ----------------------------------
            File system Functions for user files
        ---------------------------------- */
        createFile(fileName) {
            if (this.formatted) {
                var duplicateTest = this.findFile(fileName);
                if (duplicateTest !== null) {
                    _StdOut.putText("File already exists");
                    return;
                }
                var DIRaddress = this.getDIRLoc();
                var DATAaddress = this.getDATALoc();
                this.wipeDATA(DIRaddress);
                if (DIRaddress !== null) {
                    var data = sessionStorage.getItem(DIRaddress);
                    var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                    var output = "1" + DATAaddress + fileNameHex + data.substring(fileNameHex.length + 4, 124);
                    let formattedAddress = this.formatAddress(DATAaddress);
                    var fill = Array(124).fill("0");
                    sessionStorage.setItem(formattedAddress, "1" + "FFF" + fill.join(''));
                    _StdOut.putText("File \"" + fileName + "\" created at DIR location: " + DIRaddress);
                    sessionStorage.setItem(DIRaddress, output);
                    TSOS.Control.updateHDD();
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        writeFile(fileName, inputData) {
            if (this.formatted) {
                //this.deleteFileFull(fileName); // just in case we are re writing a file
                var DATAaddress = this.findFile(fileName);
                var formattedAddress = null;
                var nextAddress = null;
                if (DATAaddress !== null) {
                    while (inputData.length > 0) {
                        // Find an empty address for each slice
                        if (formattedAddress === null) {
                            formattedAddress = this.formatAddress(DATAaddress);
                        }
                        else {
                            formattedAddress = this.formatAddress(nextAddress);
                        }
                        this.wipeDATA(formattedAddress);
                        var data = sessionStorage.getItem(formattedAddress);
                        // Take a slice of inputData of length 60
                        var slice = inputData.slice(0, 60);
                        // Remove the slice from inputData
                        inputData = inputData.slice(60);
                        var fileInputData = slice.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // Convert text to Hex
                        nextAddress = "FFF";
                        if (inputData.length > 0) {
                            nextAddress = this.getDATALoc();
                            //console.log("nextAddress: " + nextAddress);
                        }
                        if (fileInputData.length > 120) {
                            fileInputData = fileInputData.substring(0, 120);
                        }
                        data = "1" + nextAddress + fileInputData + data.substring(fileInputData.length + 4, 124);
                        sessionStorage.setItem(formattedAddress, data);
                        TSOS.Control.updateHDD();
                    }
                    _StdOut.putText("File \"" + fileName + "\" written to disk.");
                }
                else {
                    _StdOut.putText("File not found");
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        findFile(fileName) {
            if (this.formatted) {
                var fileLoc = null;
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            // I told copliot that data was in hex and I wanted in text and it did this for me
                            fileLoc = data.slice(1, 4);
                            var file = data.slice(4);
                            var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                            var zeroFill = Array(120 - fileNameHex.length).fill("0");
                            fileNameHex = fileNameHex + zeroFill.join('');
                            //console.log("file: " + file + " fileNameHex: " + fileNameHex);
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
        findFileDIR(fileName) {
            if (this.formatted) {
                var fileLoc = null;
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            // I told copliot that data was in hex and I wanted in text and it did this for me
                            fileLoc = data.slice(1, 4);
                            var file = data.slice(4);
                            var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16)).join(''); // copliot helped Convert text to Hex
                            var zeroFill = Array(120 - fileNameHex.length).fill("0");
                            fileNameHex = fileNameHex + zeroFill.join('');
                            //console.log("file: " + file + " fileNameHex: " + fileNameHex);
                            if (file === fileNameHex) {
                                return `${0}:${s}:${b}`;
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
        ls() {
            if (this.formatted) {
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
        deleteFile(fileName) {
            var done = false;
            if (this.formatted) {
                var fileLoc = this.findFile(fileName);
                var nextAddress = fileLoc;
                if (fileLoc !== null) {
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        sessionStorage.setItem(this.formatAddress(nextAddress), "0" + data.substring(1, 124));
                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            done = true;
                            ;
                        }
                        TSOS.Control.updateHDD();
                    } while (!done);
                    data = sessionStorage.getItem(this.findFileDIR(fileName));
                    sessionStorage.setItem(this.findFileDIR(fileName), "0" + data.substring(1, 4) + data.substring(4, 124));
                    _StdOut.putText("File \"" + fileName + "\" deleted");
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
        deleteFileFull(fileName) {
            if (this.formatted) {
                var fileLoc = this.findFile(fileName);
                if (fileLoc !== null) {
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(fileLoc));
                        var nextAddress = data.substring(1, 4);
                        sessionStorage.setItem(this.formatAddress(fileLoc), "0" + "000" + Array(124).fill("0").join(''));
                        TSOS.Control.updateHDD();
                    } while (nextAddress !== "FFF");
                }
                else {
                    //_StdOut.putText("File not found");
                    console.log("File not found");
                }
            }
            else {
                //_StdOut.putText("HDD not formatted");
            }
        }
    }
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverHDD.js.map