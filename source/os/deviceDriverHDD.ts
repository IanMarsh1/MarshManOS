/* ----------------------------------
   DeviceDriverHDD.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHDD extends DeviceDriver {
        public formatted: boolean = false;
        public day = _CurrentDate.getDate().toString(16);
        public month = (_CurrentDate.getMonth() + 1).toString(16); // getMonth() is zero-based
        public year = _CurrentDate.getFullYear().toString().slice(-2); // get last two digits of year
        public yearShort = parseInt(this.year).toString(16);

                    

        public krnHDDFormat(quick: boolean) {
            if (this.formatted === true && quick === false) {
                
                const listOfFileNames = this.fileNames();
                for (var file of listOfFileNames) {
                    if (file.endsWith(".sys")) {
                        _StdOut.putText("Swap file detected! Cannot format HDD!");
                        return;
                    }
                }
            }
            else if (this.formatted === true && quick === true){
                const listOfFileNames = this.fileNames();
                for (var file of listOfFileNames) {
                    if (file.endsWith(".sys")) {
                        _StdOut.putText("Swap file detected! Cannot format HDD!");
                        return;
                    }
                }

                for (var t = 0; t < 4; t++) {
                    for (var s = 0; s < 8; s++) {
                        for (var b = 0; b < 8; b++) {
                            var tsb = `${t}:${s}:${b}`;
    
                            var data2 = sessionStorage.getItem(tsb); // 64 bytes -4 bytes for meta data
                            if (!(t === 0 && s === 0 && b === 0)) {
                                sessionStorage.setItem(tsb, "0000" + data2.substring(4, 124));
                                
                            }
                        }
                    }
                }
                TSOS.Control.updateHDD();
                return;
            }
            
            this.formatted = true;
            for (var t = 0; t < 4; t++) {
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var tsb = `${t}:${s}:${b}`;
    
                        var data = Array(124).fill("0"); // 64 bytes -4 bytes for meta data
                        if (t === 0 && s === 0 && b === 0) { // Set MBR
                            let hexValues = "100057617320697420776F7274682069743F";
                            data = hexValues.split('');
                            if (data.length < 124) {
                                data = data.concat(new Array(124 - data.length).fill("0"));
                            }
                        }
                            
                        sessionStorage.setItem(tsb, data.join('')); // Convert data array to string
                    }
                }
            }
        

            
            
            
            _StdOut.putText("HDD Formatted");
            TSOS.Control.updateHDD();
        }
            
            
        

        /* ----------------------------------
            Utils
        ---------------------------------- */  

        public getDIRLoc() {
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

        public getDATALoc() {
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

        public formatAddress(address: string) {
            // asked copliot for help with this
            let strData = String(address);
            let arrData = Array.from(strData);
            let formattedAddress = arrData.join(':');
            return formattedAddress;
        }

        public wipeDATA(address: string) {
            var firstFour = sessionStorage.getItem(address);
            firstFour = firstFour.substring(0, 4);
            var data = Array(124).fill("0"); 
            sessionStorage.setItem(address, firstFour + data.join(''));
            
        }

        public findDIRLoc(oldFileName) {

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

        public getAllData(linkAddress) {
            var output = "";
            while (linkAddress !== "FFF") {
                var data = sessionStorage.getItem(this.formatAddress(linkAddress));
                var nextTSB = data.substring(1, 4);
                linkAddress = nextTSB;
                output += data.substring(4, 124);

            }
            return output;

        }

        public deleteFileFull(fileName: string) {
            var done = false;

            if(this.formatted) {
                var fileLoc = this.findFile(fileName, false);
                var nextAddress = fileLoc;

                if (fileLoc !== null) {
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        sessionStorage.setItem(this.formatAddress(nextAddress),  "0" + "000" + Array(124).fill("0").join('')); 

                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") done = true;

                        TSOS.Control.updateHDD();
                    } while (!done);

                    TSOS.Control.updateHDD();
                }
            }
        }

        public findFile(fileName: string, recover: boolean) {

            if(this.formatted) {
                var fileLoc = null;
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if ((data[0] === "1")  && (s != 0 || b != 0)) {
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

        public findFileDIR(fileName: string) {

            if(this.formatted) {
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

        public getFileSize(fileName: string) {
            if(this.formatted) {
                var fileLoc = this.findFile(fileName, false);
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

        public fileNames() {

            if(this.formatted) {
                var files = [];
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            var fileName = data.slice(4,120).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                            files.push(fileName.replaceAll(/\0/g, ''));   
                        }
                    }
                }
                return files;
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        /* ----------------------------------
            File system Functions for user files
        ---------------------------------- */   

        public createFile(fileName: string, StdOutBool: boolean) {
            
            if(this.formatted) {
                var duplicateTest = this.findFile(fileName, false);
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
                    
                    if (StdOutBool) _StdOut.putText("File \"" + fileName + "\" created at DIR location: " + DIRaddress);

                    
                    sessionStorage.setItem(DIRaddress, output);
                    TSOS.Control.updateHDD();
                    return [DIRaddress, DATAaddress];
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }


        public writeFile(fileName: string, inputData: string, StdOutBool: boolean) {
            
            if(this.formatted) {
                this.deleteFileFull(fileName); // just in case we are re writing a file
                var formattedAddress = null;
                var nextAddress = this.findFile(fileName, false);
                
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

                        
                    }
                    TSOS.Control.updateHDD();

                    if (StdOutBool) _StdOut.putText("File \"" + fileName + "\" written to disk.");
                }
                else {
                    _StdOut.putText("File not found");
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        public ls(all: boolean) {

            if(this.formatted) {
                var files = [];
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            var fileName = data.slice(4,120).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                            const lsDate = parseInt(data.slice(120, 121), 0x10) + "/" + parseInt(data.slice(121, 122), 0x10) + "/" + parseInt(data.slice(122, 124), 0x10);
                            if (all) files.push(fileName + " " + this.getFileSize(fileName) + " bytes " + lsDate);
                            else if (fileName[0] != '.') files.push(fileName);   
                        }
                    }
                }
                _StdOut.putText("------Files------");
                _StdOut.advanceLine();
                for (var file of files) {
                    _StdOut.putText(file);
                    _StdOut.advanceLine();
                }
                return files;
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        public deleteFile(fileName: string, StdOutBool: boolean) {
            var done = false;

            if(this.formatted) {
                var fileLoc = this.findFile(fileName, false);
                var nextAddress = fileLoc;
                if (fileLoc !== null && !(fileName.endsWith(".sys") && StdOutBool)) {
                    do {
                        
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        sessionStorage.setItem(this.formatAddress(nextAddress), "0" + data.substring(1, 124));

                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            done = true;;
                        }
                        
                        
                    } while (!done);
                    data = sessionStorage.getItem(this.findFileDIR(fileName));
                    sessionStorage.setItem(this.findFileDIR(fileName), "0" + data.substring(1, 4) + data.substring(4, 124));

                    if (StdOutBool) _StdOut.putText("File \"" + fileName + "\" deleted");
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


        public readFile(fileName: string) {
            var done = false;
            var output = "";

            if(this.formatted) {
                var fileLoc = this.findFile(fileName, false);
                var nextAddress = fileLoc;

                if (fileLoc !== null && !(fileName.endsWith(".sys"))) {
                    do {
                        
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);

                        output += sessionStorage.getItem(this.formatAddress(nextAddress)).substring(4, 124); //.match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('')

                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            done = true;;
                        }
                        
                        
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

        public renameFile(oldFileName: string, newFileName: string) {
            if(this.formatted) {
                var DIRLoc = this.findDIRLoc(oldFileName);
                var duplicateTest = this.findFile(newFileName, false);

                if (DIRLoc === null) {
                    _StdOut.putText("File does not exists");
                    return;
                }
                
                else if (duplicateTest !== null) {
                    _StdOut.putText("File already exists");
                    return;
                }

                else{

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

        public copyFile(oldFileName: string, newFileName: string) {
            if(this.formatted) {
                var duplicateTest = this.findFile(newFileName, false);
                if ((duplicateTest !== null)) {
                    _StdOut.putText("File " + newFileName + " already exists");
                    return;
                }
                
                var oldDIRLoc = this.findDIRLoc(oldFileName);

                if (oldDIRLoc === null) {
                    _StdOut.putText("File does not exists");
                    return;
                }

                else{
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

        public createFileForSwap(fileName: string) {
            
            if(this.formatted) {
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

        public readFileSwap(fileName: string) {
            var done = false;
            var output = "";

            if(this.formatted) {
                var fileLoc = this.findFile(fileName, false);
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

        public writeFileForSwap(fileName: string, inputData: string) {
            
            if(this.formatted) {
                this.deleteFileFull(fileName); // just in case we are re writing a file
                var formattedAddress = null;
                var nextAddress = this.findFile(fileName, false);
                
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

        public recover(){
            var num = 0;
            if(this.formatted) {
                _StdOut.putText("---Recovering Files---");
                _StdOut.advanceLine();
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "0" && data[1] !== "0") {
                            var fileName = data.slice(4,120).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                            if(!(fileName.replaceAll(/\0/g, '').endsWith(".sys"))){
                                num++;
                                _StdOut.putText("Recovering: " + fileName);
                                _StdOut.advanceLine();

                                sessionStorage.setItem(`${0}:${s}:${b}`, "1" + data.substring(1, 124));
                                var fileLoc = this.findFile(fileName, false);
                                var nextAddress = fileLoc;
                                var done = false;
                                if (fileLoc !== null) {
                                    do {
                                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));

                                        var nextTSB = data.substring(1, 4);

                                        sessionStorage.setItem(this.formatAddress(nextAddress), "1" + data.substring(1, 124));

                                        nextAddress = nextTSB;
                                        if (nextAddress === "FFF") {
                                            done = true;
                                        }
                                        
                                    } while (!done);
                                }
                            }
                            
                        }
                    }
                }
                _StdOut.putText("MarshMan did his best");
                _StdOut.advanceLine();
                _StdOut.putText("and recovered " + num + " files");
                _StdOut.advanceLine();
                _StdOut.putText("----------------");
            }
            else{
                _StdOut.putText("HDD not formatted");
            }
            TSOS.Control.updateHDD();
        }
    }
}