function updateDateTime() {
    _CurrentDate = new Date();
    _CurrentDateElement = _CurrentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    _CurrentTimeElement = _CurrentDate.toLocaleTimeString('en-US');

    // update the elements on the webpage
    document.getElementById("dateOutput")!.textContent = _CurrentDateElement;
    document.getElementById("timeOutput")!.textContent = _CurrentTimeElement;
}
// used for updating status on taskbar. Run when status command is put in the CLI 
function updateStatus() {
    document.getElementById("stat")!.innerHTML = _Stat;
}
updateDateTime();
updateStatus();

// the code needs to run every second to update the seconds. duh 
setInterval(updateDateTime, 1000);