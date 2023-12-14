/* ----------------------------------
   DeviceDriverHDD.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */

module TSOS {

    /* 
     *  Before any of this code is read I would like to say that I took the approach of
     *  when something is working under no circumstances do I touch it. That is 
     *  why there is a lot of repeated code. I tried my best to clean it up but
     *  ya...
     */



    // Extends DeviceDriver
    export class DeviceDriverHDD extends DeviceDriver {
        public formatted: boolean = false;

        // copliot did this for me when i asked for date in hex
        public day = _CurrentDate.getDate().toString(16);
        public month = (_CurrentDate.getMonth() + 1).toString(16); // getMonth() is zero-based
        public year = _CurrentDate.getFullYear().toString().slice(-2); // get last two digits of year
        public yearShort = parseInt(this.year).toString(16);

        

        public krnHDDFormat(quick: boolean) {

            // if the hdd is formatted and we are trying to format it again
            // I dont want to format it if there is a swap file
            if (this.formatted === true && quick === false) {
                
                const listOfFileNames = this.fileNames();
                for (var file of listOfFileNames) {
                    if (file.endsWith(".sys")) {
                        _StdOut.putText("Swap file detected! Cannot format HDD!");
                        return;
                    }
                }
            }

            // if the hdd is formatted and we are trying to quick format it will also look for
            // a swap file and not format if it finds one but if it doesn't it will format the first 2 bytes
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
                            
                            var data2 = sessionStorage.getItem(tsb);
                            if (!(t === 0 && s === 0 && b === 0)) {

                                // as long is it is not the MBR we will format it
                                sessionStorage.setItem(tsb, "0000" + data2.substring(4, 124));
                                
                            }
                        }
                    }
                }
                _StdOut.putText("HDD Quick Formatted");
                TSOS.Control.updateHDD();
                return;
            }
            
            // will only reach this if it is our first format
            var data = Array(124).fill("0"); // 64 bytes -4 bytes for meta data
            
            this.formatted = true;

            for (var t = 0; t < 4; t++) {
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var tsb = `${t}:${s}:${b}`;
    
                        if (t === 0 && s === 0 && b === 0) { // Set MBR
                            let hexValues = "100057617320697420776F7274682069743F"; // easter egg
                            var MBR = hexValues.split('');
                            if (MBR.length < 124) {
                                MBR = MBR.concat(new Array(124 - MBR.length).fill("0"));
                            }
                            sessionStorage.setItem(tsb, MBR.join('')); // Convert data array to string
                        }

                        // set to 0 for rest
                        else{
                            sessionStorage.setItem(tsb, data.join('')); // Convert data array to string
                        }
                            
                        
                    }
                }
            } 
            _StdOut.putText("HDD Formatted");
            TSOS.Control.updateHDD();
        }

        /* ----------------------------------
            Utils
        ---------------------------------- */  

        // this is used to find a DIR location that is free
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

        // this is used to find a DATA location that is free
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

        // sometime i get a TSB with out the : so this will add it
        public formatAddress(address: string) {

            // asked copliot for help with this
            let strData = String(address);
            let arrData = Array.from(strData);
            let formattedAddress = arrData.join(':');
            return formattedAddress;
        }

        // this is used to wipe a DATA location
        public wipe(address: string) {

            var firstFour = sessionStorage.getItem(address);
            firstFour = firstFour.substring(0, 4);
            var data = Array(124).fill("0"); 
            sessionStorage.setItem(address, firstFour + data.join(''));
        }

        // this is used for copy 
        public getAllData(linkAddress) {

            var output = "";

            // loop till we hit the end of the link
            while (linkAddress !== "FFF") {

                // get the data at the link
                var data = sessionStorage.getItem(this.formatAddress(linkAddress));
                var nextTSB = data.substring(1, 4);
                linkAddress = nextTSB;
                output += data.substring(4, 124);
            }

            // return the data from all the links
            return output;

        }

        // if i want to delete and set everything to 0 not just in use
        public deleteFileFull(fileName: string) {

            var done = false;

            if(this.formatted) {
                var fileLoc = this.findFileDataAddress(fileName);
                var nextAddress = fileLoc;

                // if the file exists
                if (fileLoc !== null) {

                    // loop till we hit the end of the link
                    do {
                        // set everything to 0 and find next address
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        sessionStorage.setItem(this.formatAddress(nextAddress),  "0" + "000" + Array(124).fill("0").join('')); 

                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") done = true;

                    } while (!done);
                    
                    TSOS.Control.updateHDD();
                }
            }
        }

        // I want to return the data address of a file
        public findFileDataAddress(fileName: string) {

            if(this.formatted) {

                var fileLoc = null;
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if ((data[0] === "1")  && (s != 0 || b != 0)) {

                            // This is basically the same as findFileDIR but it returns the fileLoc value
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

        // I want to return the DIR address of a file
        public findFileDIR(fileName: string) { 

            if(this.formatted) {

                var fileLoc = null;
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {

                            // This is basically the same as findFileDataAddress but it returns the file DIR value
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

        // used for ls -a to show size of file
        public getFileSize(fileName: string) {

            if(this.formatted) {

                var fileLoc = this.findFileDataAddress(fileName);
                var nextAddress = fileLoc;
                var size = 0;

                if (fileLoc !== null) {

                    // run a loop till he hit the end of the link
                    do {
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        size += 64; // each data block is 64 bytes

                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            return size;
                        }
                        
                    } while (nextAddress !== "FFF"); // end of the road
                }
            }
        }

        // used for format to see if there is a swap file
        public fileNames() {

            if(this.formatted) {

                var files = [];

                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "1" && (s != 0 || b != 0)) {
                            var fileName = data.slice(4,120).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                            files.push(fileName.replaceAll(/\0/g, ''));  // get rid of the '00' covert 
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

        // create a file w/ StdOutBool to see if we want to print to console
        public createFile(fileName: string, StdOutBool: boolean) {

            if(this.formatted) {

                // test to see if the file name already exists
                var duplicateTest = this.findFileDataAddress(fileName);
                if (duplicateTest !== null) {
                    _StdOut.putText("File already exists");
                    return;
                }

                // find address for DIR and DATA
                var DIRaddress = this.getDIRLoc();
                var DATAaddress = this.getDATALoc();
                
                // make sure there is nothing left from before
                this.wipe(DIRaddress); 
                
                if (DIRaddress !== null) { // if there is space in the DIR

                    // data should be all 0's
                    var data = sessionStorage.getItem(DIRaddress);

                    // get the name of the file to hex
                    var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex

                    // date is added at the end for ls -a
                    let day = _CurrentDate.getDate().toString(16);
                    let month = (_CurrentDate.getMonth() + 1).toString(16); // getMonth() is zero-based
                    let year = _CurrentDate.getFullYear().toString().slice(-2); // get last two digits of year
                    year = parseInt(year).toString(16);

                    // add all the data together
                    var output = "1" + DATAaddress + fileNameHex + data.substring(fileNameHex.length + 4, 120) + month + day + year;

                    // because DATAaddress does not have :
                    let formattedAddress = this.formatAddress(DATAaddress);

                    // fill the DATA with 0's could do the same data.substring but this is easier
                    var fill = Array(124).fill("0"); 

                    // set the DATA to 0's but put loc in use and link to FFF
                    sessionStorage.setItem(formattedAddress, "1" + "FFF" + fill.join(''));
                    
                    // if we want to print to console
                    if (StdOutBool) _StdOut.putText("File \"" + fileName + "\" created at DIR location: " + DIRaddress);

                    sessionStorage.setItem(DIRaddress, output);

                    // refresh the HDD display
                    TSOS.Control.updateHDD();
                    return [DIRaddress, DATAaddress];
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        // write to a file w/ StdOutBool to see if we want to print to console
        public writeFile(fileName: string, inputData: string, StdOutBool: boolean) {
            
            if(this.formatted) {

                // cant write to a swap file
                if (fileName.endsWith(".sys")) {
                    _StdOut.putText("Cannot write to a swap file");
                    return;
                }

                // just in case we are re writing a file and dont want anything that was there before
                this.deleteFileFull(fileName); 

                var formattedAddress = null;

                // find the first address of the data address of the file 
                var nextAddress = this.findFileDataAddress(fileName);
                
                if (nextAddress !== null) {

                    // loop till we have no more data to write
                    while (inputData.length > 0) {
                        
                        // format the address with :
                        formattedAddress = this.formatAddress(nextAddress);

                        // make sure there is nothing left from before for the next address
                        this.wipe(formattedAddress);

                        // should be all 0's
                        var data = sessionStorage.getItem(formattedAddress);

                        // Take a slice of inputData of length 60
                        var slice = inputData.slice(0, 60); // copliot helped come up with this idea
                        
                        // Remove the slice from inputData
                        inputData = inputData.slice(60);

                        // turn into hex from text
                        var fileInputData = slice.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // Convert text to Hex

                        // set address to FFF because we are at the end of the file but will change if not
                        nextAddress = "FFF";

                        data = "1" + nextAddress + fileInputData + data.substring(fileInputData.length + 4, 124);

                        // set address with the in use so if there is more to write then i dont find the same one
                        sessionStorage.setItem(formattedAddress, data);

                        // if we have more to write
                        if (inputData.length > 0) {
                            
                            // get the next address and will change from FFF to TSB
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

        // print to console all the files, all is to include hidden files, size, date
        public ls(all: boolean) {

            if(this.formatted) {

                var files = [];
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);

                        // as long as it is not the MBR and it is in use
                        if (data[0] === "1" && (s != 0 || b != 0)) {

                            // get the file name
                            var fileName = data.slice(4,120).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');

                            // last 4 bytes are the date
                            const lsDate = parseInt(data.slice(120, 121), 0x10) + "/" + parseInt(data.slice(121, 122), 0x10) + "/" + parseInt(data.slice(122, 124), 0x10);

                            // if we want all files with info
                            if (all) files.push(fileName + " " + this.getFileSize(fileName) + " bytes " + lsDate);

                            // without info
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

        // delete a file w/ StdOutBool to see if we want to print to console
        public deleteFile(fileName: string, StdOutBool: boolean) {

            // used to stop loop
            var done = false;

            if(this.formatted) {

                // find the first address of the data address of the file
                var fileLoc = this.findFileDataAddress(fileName);
                var nextAddress = fileLoc;

                // if the file exist (Note StdOutBool was also used to help with swapping to allow the delete command to work)
                if (fileLoc !== null && !(fileName.endsWith(".sys") && StdOutBool)) {
                    do {
                        
                        // set is ues to 0 and find next address
                        var data = sessionStorage.getItem(this.formatAddress(nextAddress));
                        var nextTSB = data.substring(1, 4);
                        sessionStorage.setItem(this.formatAddress(nextAddress), "0" + data.substring(1, 124));

                        nextAddress = nextTSB;
                        if (nextAddress === "FFF") {
                            done = true;
                        }
                        
                    } while (!done);

                    // set last address to 0
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

        // read a file vary similar to delete but just print to console
        public readFile(fileName: string) {

            // use to stop loop and for output
            var done = false;
            var output = "";

            if(this.formatted) {
                var fileLoc = this.findFileDataAddress(fileName);
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
                    TSOS.Control.updateHDD(); // probably dont need this

                }
                else {
                    _StdOut.putText("File not found");
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        // rename a file (user input validation is done in shell)
        public renameFile(oldFileName: string, newFileName: string) {

            if(this.formatted) {

                if (oldFileName.endsWith(".sys") || newFileName.endsWith(".sys")) {
                    _StdOut.putText("Cannot rename a swap file");
                    return;
                }
                
                // get the DATA address of the DIR
                var DIRLoc = this.findFileDIR(oldFileName);
                var duplicateTest = this.findFileDataAddress(newFileName);

                if (DIRLoc === null) {
                    _StdOut.putText("File does not exists");
                    return;
                }
                
                else if (duplicateTest !== null) {
                    _StdOut.putText("File already exists");
                    return;
                }

                else{
                    // delete the old name from DIR but not first 4 bytes
                    this.wipe(DIRLoc);

                    // should be all 0's
                    var data = sessionStorage.getItem(DIRLoc);

                    // get that first 4 bytes
                    var linkAddress = data.substring(0, 4);

                    // get new name and add everything together
                    var fileNameHex = newFileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex
                    var output = linkAddress + fileNameHex + data.substring(fileNameHex.length + 4, 120) + this.month + this.day + this.yearShort;
                        
                    _StdOut.putText("File \"" + oldFileName + "\" renamed to \"" + newFileName + "\"");

                    sessionStorage.setItem(DIRLoc, output);
                    
                    TSOS.Control.updateHDD();
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        // copy a file (user input validation is done in shell)
        public copyFile(oldFileName: string, newFileName: string) {

            if(this.formatted) {

                if (oldFileName.endsWith(".sys") || newFileName.endsWith(".sys")) {
                    _StdOut.putText("Cannot copy a swap file");
                    return;
                }
                
                // check if new file name already exists
                var duplicateTest = this.findFileDataAddress(newFileName);
                if ((duplicateTest !== null)) {
                    _StdOut.putText("File " + newFileName + " already exists");
                    return;
                }
                
                // get the DIR address of the old file
                var oldDIRLoc = this.findFileDIR(oldFileName);

                // if the file does not exist
                if (oldDIRLoc === null) {
                    _StdOut.putText("File does not exists");
                    return;
                }

                else{

                    // create a new file with the new name
                    this.createFile(newFileName, true);

                    // get the DIR address of the new file
                    var oldDIRData = sessionStorage.getItem(oldDIRLoc);

                    // get the Link address of the old file
                    var linkAddress = oldDIRData.substring(1, 4);

                    // uses the link address to get all the data from the old file
                    var oldFileData = this.getAllData(linkAddress);

                    // because I get the data in text I need to convert it to hex
                    oldFileData = oldFileData.match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');

                    // write the data to the new file
                    this.writeFile(newFileName, oldFileData, false);
                    
                    TSOS.Control.updateHDD();

                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        // MarshMan will do his darn best to recover files put will probably break everything
        public recover(){
            var num = 0;
            if(this.formatted) {
                _StdOut.putText("---Recovering Files---");
                _StdOut.advanceLine();

                // a lot of this code is from ls but instead of printing to console it will set the in use bit to 1
                for (var s = 0; s < 8; s++) {
                    for (var b = 0; b < 8; b++) {
                        var data = sessionStorage.getItem(`${0}:${s}:${b}`);
                        if (data[0] === "0" && data[1] !== "0") {

                            // remove the first 4 bytes
                            var fileName = data.slice(4,120).match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');

                            // if it is not a swap file
                            if(!(fileName.replaceAll(/\0/g, '').endsWith(".sys"))){

                                // set the in use bit to 1
                                num++;
                                _StdOut.putText("Recovering: " + fileName);
                                _StdOut.advanceLine();

                                sessionStorage.setItem(`${0}:${s}:${b}`, "1" + data.substring(1, 124));
                                var fileLoc = this.findFileDataAddress(fileName);
                                var nextAddress = fileLoc;
                                var done = false;
                                if (fileLoc !== null) {
                                    do {

                                        // go through all the links and set the in use bit to 1
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
                TSOS.Control.updateHDD();
            }
            else{
                _StdOut.putText("HDD not formatted");
            }
            
        }

        /* ----------------------------------
            Swap Only
        ---------------------------------- */   

        // a lot of this is the same as regular file creation but it is only used for swap files
        public createFileForSwap(fileName: string) {
            
            if(this.formatted) {
                var DIRaddress = this.getDIRLoc();
                var DATAaddress = this.getDATALoc();
                
                this.wipe(DIRaddress);
                
                if (DIRaddress !== null) {

                    // data should be all 0's
                    var data = sessionStorage.getItem(DIRaddress);

                    // convert file name to hex
                    var fileNameHex = fileName.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(''); // copliot helped Convert text to Hex

                    // add date to end for ls -a
                    var output = "1" + DATAaddress + fileNameHex + data.substring(fileNameHex.length + 4, 120) + this.month + this.day + this.yearShort;

                    // because DATAaddress does not have :
                    let formattedAddress = this.formatAddress(DATAaddress);

                    // could do the same data.substring but this is easier
                    var fill = Array(124).fill("0"); 

                    // set DATA loc to in use
                    sessionStorage.setItem(formattedAddress, "1" + "FFF" + fill.join(''));
                    
                    // set the DIR
                    sessionStorage.setItem(DIRaddress, output);

                    TSOS.Control.updateHDD();

                    return [DIRaddress, DATAaddress]; 
                }
            }
            else {
                _StdOut.putText("HDD not formatted");
            }
        }

        // This outputs the data from a swap file to store in memory
        public readFileSwap(fileName: string) {
            var done = false;
            var output = "";

            if(this.formatted) {
                var fileLoc = this.findFileDataAddress(fileName);
                var nextAddress = fileLoc;
                if (fileLoc !== null) {
                    do {

                        // get all the data from the links
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

        // This is used to write to a swap file

        // basically the same as writeFile but has a little less overhead making it run faster
        public writeFileForSwap(fileName: string, inputData: string) {
            
            if(this.formatted) {
                this.deleteFileFull(fileName); // just in case we are re writing a file
                var formattedAddress = null;
                var nextAddress = this.findFileDataAddress(fileName);
                
                if (nextAddress !== null) {
                    while (inputData.length > 0) {
                        
                        // format the address with :
                        formattedAddress = this.formatAddress(nextAddress);

                        // make sure there is nothing left from before for the next address
                        this.wipe(formattedAddress);

                        // should be all 0's
                        var data = sessionStorage.getItem(formattedAddress);

                        // Take a slice of inputData of length 60
                        var slice = inputData.slice(0, 120); // copliot helped come up with this idea

                        
                        
                        // Remove the slice from inputData
                        inputData = inputData.slice(120);


                        var fileInputData = slice; // Convert text to Hex

                        nextAddress = "FFF"; // will get changed if there is more to write

                        data = "1" + nextAddress + fileInputData + data.substring(fileInputData.length + 4, 124);

                        // need to do this because I don't want DATALoc to write to the same address
                        sessionStorage.setItem(formattedAddress, data);

                        if (inputData.length > 0) {
                            
                            nextAddress = this.getDATALoc(); // find the next address that is not the last one
                            
                            data = "1" + nextAddress + fileInputData + data.substring(fileInputData.length + 4, 124);
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
}