/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        // Properties
        promptStr = ">";
        commandList = [];
        curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        apologies = "[sorry]";
        bsod = false; // used to stop execute of next command
        constructor() {
        }
        init() {
            var sc;
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date - displays the current date and time
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami - displays the users current location
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", " - displays the users current location.");
            this.commandList[this.commandList.length] = sc;
            // tellmeasecret - shows how much trust people have
            sc = new TSOS.ShellCommand(this.shellTellMeaSecret, "tellmeasecret", "<string> - how secure MarshManOS?");
            this.commandList[this.commandList.length] = sc;
            // status - shows how much trust people have
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Update status on taskbar.");
            this.commandList[this.commandList.length] = sc;
            // bsod - used for error checking 
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", " - Blue Screen of Death (aka you f***** up).");
            this.commandList[this.commandList.length] = sc;
            // load - add user code
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - load user code.");
            this.commandList[this.commandList.length] = sc;
            // run - run user code
            sc = new TSOS.ShellCommand(this.shellRun, "run", " - run user code.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line if dsod is not in play ...
            if (!this.bsod) {
                _StdOut.advanceLine();
            }
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            _CPU.isExecuting = false;
            this.bsod = true; // Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("ver shows current version of MarshManOS.");
                        break;
                    case "shutdown":
                        _StdOut.putText("This turns off MarshManOS.");
                        break;
                    case "cls":
                        _StdOut.putText("cls clears the screen of previously entered commands.");
                        break;
                    case "trace":
                        _StdOut.putText("Helps with debugging.");
                        break;
                    case "rot13":
                        _StdOut.putText("Moves the letter 13 to the right on the alphabet. Do it again and it will clear txt.");
                        break;
                    case "prompt":
                        _StdOut.putText("Changes > to what the user wants.");
                        break;
                    case "date":
                        _StdOut.putText("Display date in US standard then time 12-hour time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Displays a location, probably not the right one.");
                        break;
                    case "tellmeasecret":
                        _StdOut.putText("Creates a Top Secret database that stores all inputs, or does it?");
                        break;
                    case "status":
                        _StdOut.putText("Updates the status on the taskbar ([A-Z],[0-9],[!-)]).");
                        break;
                    case "bsod":
                        _StdOut.putText("Something went worng and the os does not know how to fix.");
                        break;
                    case "load":
                        _StdOut.putText("Only hex and spaces & valid.");
                        break;
                    case "run":
                        _StdOut.putText("Run user code in the User Program Input txt box.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate() {
            // Get current date info
            _CurrentDate = new Date();
            // print out current date and time
            _StdOut.putText(_CurrentDate.toLocaleDateString() + " " + _CurrentDate.toLocaleTimeString());
        }
        shellWhereami() {
            // diffrent responses to where am i?
            let options = ["Where am I! Where are you?", "That taco bell isn't sitting well", "Well obviously not here"];
            // get a random num for the length of the options array
            let randomIndex = Math.floor(Math.random() * options.length);
            // print one of the randomly selected options
            _StdOut.putText(options[randomIndex]);
        }
        shellTellMeaSecret(args) {
            // did this to test out how inputting strings works 
            if (args.length > 0) {
                _StdOut.putText("Why would you tell me that!");
            }
            else {
                _StdOut.putText("You got to tell me something!");
            }
        }
        shellStatus(args) {
            // did this to test out how inputting strings works 
            if (args.length > 0) {
                let statInput = "";
                for (let i = 0; i < args.length; i++) {
                    statInput += args[i] + " ";
                }
                _Stat = statInput;
                _StdOut.putText("Updated status to: " + _Stat);
                updateStatus();
            }
            else {
                _StdOut.putText("You got to tell me something!");
            }
        }
        shellBSOD() {
            _StdOut.putText("awww shit");
            // we need to shutdown because we have an error
            _Kernel.krnShutdown();
            // add img
            _StdOut.bsod();
            // need this so it does not clear the last line when execute is run 
            this.bsod = true;
        }
        shellLoad() {
            // get text from user program box
            var userProgramInput = (document.getElementById("taProgramInput")).value.trim();
            // ran into issue when running code copied from the OS site
            if (/\n/.test(userProgramInput)) {
                _StdOut.putText("No non-printable characters");
            }
            // if userbox is empty 
            else if (userProgramInput.length === 0) {
                _StdOut.putText("You got to tell me something!");
            }
            // make sure input is hex char or space
            else if (/^[0-9A-Fa-f\s]+$/.test(userProgramInput)) {
                var arrayProgram = userProgramInput.split(' ');
                var pcb = new TSOS.ProcessControlBlock();
                _MemoryManager.load(arrayProgram, pcb);
                _currentPCB = pcb;
                _StdOut.putText("PCB loaded: " + pcb.PID);
            }
            // it is not empty but has non hex values
            else {
                _StdOut.putText("Bad input only hex and spaces!");
            }
        }
        shellRun(args) {
            // right now we can only run one program at a time so if we try to run 
            // the current 
            _CPU.isExecuting = true;
            if ((_currentPCB.PID.toString(16) === args[0]) && (_currentPCB.status === "Ready")) {
                _currentPCB.status = "Running";
                _CPU.isExecuting = true;
            }
            // when we have already ran a pid, then we dont want to do it again 
            else if ((_currentPCB.PID.toString(16) === args[0]) && (_currentPCB.status === "Terminated")) {
                _StdOut.putText("PID terminated");
            }
            // pid given is not the current pid
            else {
                _StdOut.putText("PID not loaded");
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map