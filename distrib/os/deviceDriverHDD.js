/* ----------------------------------
   DeviceDriverHDD.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverHDD extends TSOS.DeviceDriver {
        formatted = false;
        day = _CurrentDate.getDate().toString(16);
        month = (_CurrentDate.getMonth() + 1).toString(16); // getMonth() is zero-based
        year = _CurrentDate.getFullYear().toString().slice(-2); // get last two digits of year
        yearShort = parseInt(this.year).toString(16);
        krnHDDFormat() {
            if (this.formatted === false) {
                this.formatted = true;
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
        findDIRLoc(oldFileName) {
            var fileLoc = null;
            for (var s = 0; s < 8; s++) {
                for (var b = 0; b < 8; b++) {
                    var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                    if (data[0] === "1" && (s != 0 || b != 0)) {
                        // I told copliot that data was in hex and I wanted in text and it did this for me
                        fileLoc = data.slice(1, 4);
                        var file = data.slice(4, 120);
                        var fileNameHex = oldFileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex
                        var zeroFill = Array(116 - fileNameHex.length).fill("0");
                        fileNameHex = fileNameHex + zeroFill.join('');
                        if (file === fileNameHex) {
                            return `${0}${s}${b}`;
                        }
                    }
                }
            }
            return null;
        }
        getAllData(linkAddress) {
            var output = "";
            while (linkAddress !== "FFF") {
                var data = sessionStorage.getItem(this.formatAddress(linkAddress));
                var nextTSB = data.substring(1, 4);
                linkAddress = nextTSB;
                output += data.substring(4, 124);
            }
            return output;
        }
        deleteFileFull(fileName) {
            var done = false;
            if (this.formatted) {
                var fileLoc = this.findFile(fileName);
                var nextAddress = fileLoc;
                if (fileLoc !== null) {
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        sessionStorage.setItem(this.formatAddress(nextAddress), "0" + "000" + Array(124).fill("0").join(''));
                        nextAddress = nextTSB;
                        if (nextAddress === "FFF")
                            done = true;
                        TSOS.Control.updateHDD();
                    } while (!done);
                    TSOS.Control.updateHDD();
                }
            }
        }
        findFile(fileName) {
            if (this.formatted) {
                var fileLoc = null;
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            fileLoc = data.slice(1, 4);
                            var file = data.slice(4, 120);
                            var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex
                            var zeroFill = Array(116 - fileNameHex.length).fill("0");
                            fileNameHex = fileNameHex + zeroFill.join('');
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
                            var file = data.slice(4, 120);
                            var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex
                            var zeroFill = Array(116 - fileNameHex.length).fill("0");
                            fileNameHex = fileNameHex + zeroFill.join('');
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
        getFileSize(fileName) {
            if (this.formatted) {
                var fileLoc = this.findFile(fileName);
                var nextAddress = fileLoc;
                var size = 0;
                if (fileLoc !== null) {
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        size += 64;
                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            return size;
                        }
                    } while (true);
                }
            }
        }
        /* ----------------------------------
            File system Functions for user files
        ---------------------------------- */
        createFile(fileName, StdOutBool) {
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
                    var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex
                    let day = _CurrentDate.getDate().toString(16);
                    let month = (_CurrentDate.getMonth() + 1).toString(16); // getMonth() is zero-based
                    let year = _CurrentDate.getFullYear().toString().slice(-2); // get last two digits of year
                    year = parseInt(year).toString(16);
                    var output = "1" + DATAaddress + fileNameHex + data.substring(fileNameHex.length + 4, 120) + month + day + year;
                    let formattedAddress = this.formatAddress(DATAaddress);
                    var fill = Array(124).fill("0");
                    sessionStorage.setItem(formattedAddress, "1" + "FFF" + fill.join(''));
                    if (StdOutBool)
                        _StdOut.putText("File \"" + fileName + "\" created at DIR location: " + DIRaddress);
                    sessionStorage.setItem(DIRaddress, output);
                    TSOS.Control.updateHDD();
                    return [DIRaddress, DATAaddress];
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        writeFile(fileName, inputData, StdOutBool) {
            if (this.formatted) {
                this.deleteFileFull(fileName); // just in case we are re writing a file
                var formattedAddress = null;
                var nextAddress = this.findFile(fileName);
                if (nextAddress !== null) {
                    while (inputData.length > 0) {
                        formattedAddress = this.formatAddress(nextAddress);
                        this.wipeDATA(formattedAddress);
                        var data = sessionStorage.getItem(formattedAddress);
                        // Take a slice of inputData of length 60
                        var slice = inputData.slice(0, 60);
                        // Remove the slice from inputData
                        inputData = inputData.slice(60);
                        var fileInputData = slice.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // Convert text to Hex
                        nextAddress = "FFF";
                        data = "1" + nextAddress + fileInputData + data.substring(fileInputData.length + 4, 124);
                        sessionStorage.setItem(formattedAddress, data);
                        if (inputData.length > 0) {
                            nextAddress = this.getDATALoc();
                            data = "1" + nextAddress + fileInputData + data.substring(fileInputData.length + 4, 124);
                            sessionStorage.setItem(formattedAddress, data);
                        }
                        TSOS.Control.updateHDD();
                    }
                    if (StdOutBool)
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
        ls(all) {
            if (this.formatted) {
                var files = [];
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            var fileName = data.slice(4, 120).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                            const lsDate = parseInt(data.slice(120, 121), 0x10) + "/" + parseInt(data.slice(121, 122), 0x10) + "/" + parseInt(data.slice(122, 124), 0x10);
                            if (all)
                                files.push(fileName + " " + this.getFileSize(fileName) + " bytes " + lsDate);
                            else if (fileName[0] != '.')
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
        deleteFile(fileName, StdOutBool) {
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
                    } while (!done);
                    data = sessionStorage.getItem(this.findFileDIR(fileName));
                    sessionStorage.setItem(this.findFileDIR(fileName), "0" + data.substring(1, 4) + data.substring(4, 124));
                    if (StdOutBool)
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
        readFile(fileName) {
            var done = false;
            var output = "";
            if (this.formatted) {
                var fileLoc = this.findFile(fileName);
                var nextAddress = fileLoc;
                if (fileLoc !== null) {
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        output += sessionStorage.getItem(this.formatAddress(nextAddress)).substring(4, 124); //.match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('')
                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            done = true;
                            ;
                        }
                        TSOS.Control.updateHDD();
                    } while (!done);
                    output = output.match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                    _StdOut.putText("output: " + output);
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
        renameFile(oldFileName, newFileName) {
            if (this.formatted) {
                var DIRLoc = this.findDIRLoc(oldFileName);
                var duplicateTest = this.findFile(newFileName);
                if (DIRLoc === null) {
                    _StdOut.putText("File does not exists");
                    return;
                }
                else if (duplicateTest !== null) {
                    _StdOut.putText("File already exists");
                    return;
                }
                else {
                    this.wipeDATA(this.formatAddress(DIRLoc));
                    var data = sessionStorage.getItem(this.formatAddress(DIRLoc));
                    var linkAddress = data.substring(0, 4);
                    var fileNameHex = newFileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex
                    var output = linkAddress + fileNameHex + data.substring(fileNameHex.length + 4, 124);
                    _StdOut.putText("File \"" + oldFileName + "\" renamed to \"" + newFileName + "\"");
                    sessionStorage.setItem(this.formatAddress(DIRLoc), output);
                    TSOS.Control.updateHDD();
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        copyFile(oldFileName, newFileName) {
            if (this.formatted) {
                var duplicateTest = this.findFile(newFileName);
                if ((duplicateTest !== null)) {
                    _StdOut.putText("File " + newFileName + " already exists");
                    return;
                }
                var oldDIRLoc = this.findDIRLoc(oldFileName);
                if (oldDIRLoc === null) {
                    _StdOut.putText("File does not exists");
                    return;
                }
                else {
                    this.createFile(newFileName, true);
                    var oldDIRData = sessionStorage.getItem(this.formatAddress(oldDIRLoc));
                    var linkAddress = oldDIRData.substring(1, 4);
                    var oldFileData = this.getAllData(linkAddress);
                    oldFileData = oldFileData.match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                    this.writeFile(newFileName, oldFileData, false);
                    TSOS.Control.updateHDD();
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        /* ----------------------------------
            Swap Only
        ---------------------------------- */
        createFileForSwap(fileName) {
            if (this.formatted) {
                var DIRaddress = this.getDIRLoc();
                var DATAaddress = this.getDATALoc();
                this.wipeDATA(DIRaddress);
                if (DIRaddress !== null) {
                    var data = sessionStorage.getItem(DIRaddress);
                    var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex
                    var output = "1" + DATAaddress + fileNameHex + data.substring(fileNameHex.length + 4, 120) + this.month + this.day + this.yearShort;
                    let formattedAddress = this.formatAddress(DATAaddress);
                    var fill = Array(124).fill("0");
                    sessionStorage.setItem(formattedAddress, "1" + "FFF" + fill.join(''));
                    sessionStorage.setItem(DIRaddress, output);
                    TSOS.Control.updateHDD();
                    return [DIRaddress, DATAaddress];
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        readFileSwap(fileName) {
            var done = false;
            var output = "";
            if (this.formatted) {
                var fileLoc = this.findFile(fileName);
                var nextAddress = fileLoc;
                if (fileLoc !== null) {
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        var fileData = sessionStorage.getItem(this.formatAddress(nextAddress)).substring(4, 124);
                        output = output + fileData;
                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            done = true;
                        }
                    } while (!done);
                    TSOS.Control.updateHDD();
                    return output;
                }
                else {
                    _StdOut.putText("File not found");
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }
        writeFileForSwap(fileName, inputData) {
            if (this.formatted) {
                this.deleteFileFull(fileName); // just in case we are re writing a file
                var formattedAddress = null;
                var nextAddress = this.findFile(fileName);
                if (nextAddress !== null) {
                    while (inputData.length > 0) {
                        formattedAddress = this.formatAddress(nextAddress);
                        this.wipeDATA(formattedAddress);
                        var data = sessionStorage.getItem(formattedAddress);
                        // Take a slice of inputData of length 60
                        var slice = inputData.slice(0, 120);
                        // Remove the slice from inputData
                        inputData = inputData.slice(120);
                        var fileInputData = slice; // Convert text to Hex
                        nextAddress = "FFF";
                        data = "1" + nextAddress + fileInputData + fileInputData + data.substring(fileInputData.length + 4, 120);
                        sessionStorage.setItem(formattedAddress, data);
                        if (inputData.length > 0) {
                            nextAddress = this.getDATALoc();
                            data = "1" + nextAddress + fileInputData + fileInputData + data.substring(fileInputData.length + 4, 120);
                            sessionStorage.setItem(formattedAddress, data);
                        }
                    }
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
    }
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverHDD.js.map