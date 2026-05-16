fetch('/php/getCount.php')
    .then(r => r.text())
    .then(count => {
        if(count != -1) {
            document.getElementById("conversionCountContainer").style.display = "flex";
            document.getElementById("conversionCount").innerText = count;
        }
    });