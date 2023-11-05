/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // used a chat for this.
            // I asked for a table that have 32 rows and 9 col and i added some of the other stuff
            const memTable = document.getElementById('memTable');
            const numRows = 0x60;
            const numColumns = 0x9;
            var rowCount = 0x00;
            // two for loops to init memory display
            for (let i = 0; i < numRows; i++) {
                const row = memTable.insertRow(i);
                // the first col in each row will be the start address
                const cell = row.insertCell(0);
                cell.textContent = "0x" + rowCount.toString(0x10).toUpperCase();
                // add 8 for each row
                rowCount = rowCount + 0x08;
                // display all 00s
                for (let j = 1; j < numColumns; j++) {
                    const cell = row.insertCell(j);
                    cell.textContent = "00";
                }
            }
            // used chat for this.
            // I gave it the mem above and said I wanted a similar thing but with pc, acc, etc
            const pcbTable = document.getElementById('pcbTable');
            // create the first row of headers
            const headerRow = pcbTable.insertRow(0);
            const headers = ['PC', 'ACC', 'Xreg', 'Yreg', 'Zflag', 'IR'];
            // get the array of headers and add them to the table
            for (let i = 0; i < 0x06; i++) {
                const headerCell = document.createElement('th');
                headerCell.textContent = headers[i];
                headerRow.appendChild(headerCell);
            }
            // create another row for the 0s and new values when changed
            const dataRow = pcbTable.insertRow(1);
            // starting values
            const pcbData = {
                PC: 0,
                ACC: 0,
                Xreg: 0,
                Yreg: 0,
                Zflag: 0,
                IR: 0,
            };
            // get the values and add
            for (let i = 0; i < 0x06; i++) {
                const cell = dataRow.insertCell(i);
                cell.textContent = pcbData[headers[i]].toString(); // Use the header as the key to get the value
            }
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        /*
         * Used chat for this
         * I gave it the code above this and asked for a function to update the table
         * and this is what it gave me. After a few changes it worked
         */
        static updateMemory(address, value) {
            // Ignore the first col because that is just for info
            const numColumns = 0x8;
            // Calculate row and column based on the provided address
            const col = (address % numColumns) + 1; // Calculate column (remainder) + 1
            const row = Math.floor(address / numColumns); // Calculate row (integer division)
            // add a leading 0 if it is only a 0
            const formattedValue = value.toString(16).toUpperCase().padStart(2, '0');
            // Update the specified cell with the new value
            const cell = document.querySelector(`#memTable tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
            if (cell) {
                cell.innerText = formattedValue; // Convert to hex
            }
        }
        // used chat for this. I gave it the update mem and said I wanted the same thing for pcb
        static updatePCBData(data) {
            // html var and define the second row as the row we want to update
            const pcbTable = document.getElementById('pcbTable');
            const dataRow = pcbTable.rows[1];
            const headers = ['PC', 'Acc', 'Xreg', 'Yreg', 'Zflag', 'IR'];
            // go through the array given from cpu and display the changes
            for (let i = 0; i < headers.length; i++) {
                const cell = dataRow.cells[i];
                cell.textContent = data[headers[i]].toString(16).toUpperCase();
            }
        }
        static updatePCBList() {
            // copliot
            const pcbList = document.getElementById('pcbList');
            const tbody = pcbList.tBodies[0] || pcbList.appendChild(pcbList.ownerDocument.createElement('tbody'));
            tbody.innerHTML = '';
            _Scheduler._PCBList.forEach((pcb) => {
                const row = tbody.insertRow();
                Object.values(pcb).forEach((cellValue) => {
                    const cell = row.insertCell();
                    cell.textContent = typeof cellValue === 'number' ? cellValue.toString(16).toUpperCase() : String(cellValue);
                });
            });
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        /*
         * Host Events
         */
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // memory init
            _Memory = new TSOS.Memory();
            _Memory.initMemory(); // Set up memory with 0x00 
            _MemoryAccessor = new TSOS.MemoryAccessor();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.       
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map