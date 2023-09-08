// Define a function to update the date and time display
function updateDateTime() {
    const currentDate = new Date();
    const currentDateElement = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeElement = currentDate.toLocaleTimeString('en-US');
    console.log(currentDateElement);
    console.log(currentTimeElement);
    document.getElementById("current-date-display").textContent = currentDateElement;
    document.getElementById("current-time-display").textContent = currentTimeElement;
}
// Update the date and time immediately
updateDateTime();
// Set up an interval to update the date and time every second
setInterval(updateDateTime, 1000);
//# sourceMappingURL=taskbar.js.map