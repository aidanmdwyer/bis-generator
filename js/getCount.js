fetch('/php/getCount.php')
    .then(r => r.text())
    .then(count => {
        document.getElementById("conversionCount").innerText = count + " Documents Converted since May 2026.";
    });