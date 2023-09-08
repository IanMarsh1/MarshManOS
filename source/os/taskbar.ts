function updateDateTime() {
    const currentDate = new Date();
    const currentDateElement = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeElement = currentDate.toLocaleTimeString('en-US');

    document.getElementById("dateOutput")!.textContent = currentDateElement;
    document.getElementById("timeOutput")!.textContent = currentTimeElement;
}
updateDateTime();

// the code needs to run every second
setInterval(updateDateTime, 1000);