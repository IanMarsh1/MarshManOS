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
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
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
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
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
                else if (chr === String.fromCharCode(0x2191)) {
                    this.putText("hi");
                }
                else if (chr === String.fromCharCode(0x2193)) {
                    this.putText("hi2");
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
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
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