function updateDateTime() {
    _CurrentDate = new Date();
    _CurrentDateElement = _CurrentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    _CurrentTimeElement = _CurrentDate.toLocaleTimeString('en-US');
    document.getElementById("dateOutput").textContent = _CurrentDateElement;
    document.getElementById("timeOutput").textContent = _CurrentTimeElement;
}
function updateStatus() {
    document.getElementById("stat").innerHTML = _Stat;
}
updateDateTime();
updateStatus();
// the code needs to run every second
setInterval(updateDateTime, 1000);
//# sourceMappingURL=taskbar.js.map