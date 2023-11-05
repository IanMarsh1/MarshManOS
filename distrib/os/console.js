/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        currentFont;
        currentFontSize;
        currentXPosition;
        currentYPosition;
        buffer;
        kernelInputQueueHistory;
        commandIndex;
        commandIndexSearch;
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", kernelInputQueueHistory = [], commandIndex = 0, commandIndexSearch = 0) {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.kernelInputQueueHistory = kernelInputQueueHistory;
            this.commandIndex = commandIndex;
            this.commandIndexSearch = commandIndexSearch;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        clearLine() {
            const lineHeight = this.currentFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);
            // added +1 because there was a small line left
            _DrawingContext.clearRect(0, this.currentYPosition - lineHeight + 4, _Canvas.width, lineHeight);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    this.kernelInputQueueHistory.push(this.buffer);
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    this.commandIndex = this.kernelInputQueueHistory.length;
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(9)) { // Tab
                    // Clear the whole line
                    this.clearLine();
                    // Move cursor back to the start
                    this.currentXPosition = 0;
                    // add the > or what ever the user changes it to
                    this.putText(_OsShell.promptStr);
                    /*
                     * I used chatgpt for help with this. I gave it the for and
                     * if and it worked out the rest
                     *
                     * I want the tab to only complete if it is the only option
                     */
                    // Create an array to store matching command suggestions
                    const suggestions = [];
                    for (let i = 0; i < _OsShell.commandList.length; i++) {
                        const command = _OsShell.commandList[i].command;
                        if (command.startsWith(this.buffer)) {
                            // Collect matching commands for auto-completion
                            suggestions.push(command);
                        }
                    }
                    if (suggestions.length === 1) {
                        // If there's only one suggestion, auto-complete the command
                        this.buffer = suggestions[0];
                    }
                    // Display the updated buffer
                    this.putText(this.buffer);
                }
                else if (chr === String.fromCharCode(8)) { // Backspace
                    // clear the whole line
                    this.clearLine();
                    // move curser back to the start
                    this.currentXPosition = 0;
                    // add the > or what ever the user changes it to
                    this.putText(_OsShell.promptStr);
                    // ctrl+v the buffer again but - 1
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    this.putText(this.buffer);
                }
                else if (chr === String.fromCharCode(0x2191)) { // arrow up
                    if (this.commandIndex > 0) {
                        // clear the whole line
                        this.clearLine();
                        // move curser back to the start
                        this.currentXPosition = 0;
                        // add the > or what ever the user changes it to
                        this.putText(_OsShell.promptStr);
                        // Get the previous command
                        this.commandIndex -= 1;
                        var prevCommand = this.kernelInputQueueHistory[this.commandIndex];
                        // Display the previous command on the console
                        this.putText(prevCommand);
                        // Update the buffer with the previous command
                        this.buffer = prevCommand;
                    }
                }
                else if (chr === String.fromCharCode(0x2193)) { // arrow down
                    if ((this.commandIndex + 1) < this.kernelInputQueueHistory.length) {
                        // clear the whole line
                        this.clearLine();
                        // move curser back to the start
                        this.currentXPosition = 0;
                        // add the > or what ever the user changes it to
                        this.putText(_OsShell.promptStr);
                        // Get the next command
                        this.commandIndex += 1;
                        var nextCommand = this.kernelInputQueueHistory[this.commandIndex];
                        // Display the next command on the console
                        this.putText(nextCommand);
                        // Update the buffer with the next command
                        this.buffer = nextCommand;
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // originly i did line wrap the most complicated way posible but but then i relized i just need to break up long inputs into chars
                // and that is what the for loop is used for. Takes long text and makes it sinlge chars
                for (let i = 0; i < text.length; i++) {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);
                    console.log(text[i]);
                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[i]);
                    // if the next char is going to go over the edge + a little buffer then we should go to the next line
                    if (this.currentXPosition > _Canvas.width - (this.currentFontSize + 5)) {
                        this.advanceLine();
                    }
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        }
        bsod() {
            /*
             * I used chatgpt for some of this to get help with
             * drawImageOnCanvas() and img.onload
             */
            // get the canvas element by its ID
            var canvas = document.getElementById('display');
            // get the 2D context for the canvas
            var canvasContext = canvas.getContext('2d');
            // create an img object
            var img = new Image();
            // set the source of the image
            img.src = 'distrib/images/bsod.png';
            //  draw the image on the canvas
            function drawImageOnCanvas() {
                canvasContext.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            // Call the function to draw the image on the canvas
            img.onload = drawImageOnCanvas;
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            var lineHight = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            /*
             * if the canvas has hit the bottom of the 500 x 500 then we need to start moving the code up
             * by taking a picture (how i think of it) and then pasting the picture back down but cut off the
             * top by the size of the line
             */
            if (this.currentYPosition > _Canvas.height - lineHight) {
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
                // https://stackoverflow.com/questions/13669404/typescript-problems-with-type-system 
                var canvas = document.getElementById('display');
                var canvasContext = canvas.getContext('2d');
                let picture = canvasContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                this.clearScreen();
                canvasContext.putImageData(picture, 0, 0 - lineHight);
            }
            /*
             * if we have not yet hit the bottom then we need to keep on going till we do.
             * this was how the code worked before the if was added.
             */
            else {
                this.currentYPosition += lineHight;
            }
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map