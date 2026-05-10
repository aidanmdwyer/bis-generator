let errors = new Set;
let warnings = new Set;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateDownloads(docData) {
    const date = new Date();
    const year = `${date.getFullYear()}`;

    docData.forEach((v, k) => {
        const btn = document.createElement('button');
        btn.onclick = () => {
            btn.disabled = true;
            exportDocx(
                makeBisDoc(k, v),
                `${k} BIS ${date.getMonth() + 1}.${date.getDate()}.${year.substring(2)}.docx`
            );
        };
        btn.innerText = 'Download \n"' + k + '"\n BIS';
        downloadsSection.appendChild(btn);
    });
}

const uploadText = document.getElementById("uploadText");
const progressBar = document.getElementById("progressBar");
const downloadsSection = document.getElementById("downloadButtons");
document.getElementById("fileInput").addEventListener("change", async (event) => {
    downloadsSection.innerHTML = '';
    uploadText.innerHTML = '';
    errors.clear();
    warnings.clear();

    const file = event.target.files[0];
    if (!file) return;

    progressBar.style.display = 'inline';
    progressBar.value = 0;

    try {
        let documentXML;
        if(file.name.endsWith(".docx")) {
            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);
            documentXML = await zip.file("word/document.xml").async("string");
        } else if(file.name.endsWith(".xml")) {
            documentXML = await file.text();
        }

        if(documentXML) {
            while (progressBar.value < 100) {
                await delay(5);
                progressBar.value += 2;
            }
            progressBar.style.display = 'none';

            const docData = getDocumentData(documentXML);
            console.log('READ DATA FOR ' + file.name + ':');
            console.log(docData);

            uploadText.innerHTML = `File uploaded successfully: <img src="/imgs/docx_icon.png" style="width:20px; vertical-align: middle;" alt="docx icon"><a href="${URL.createObjectURL(file)}" download="${file.name}"> ${escapeHtml(file.name)}</a><br>`;

            if (errors.size > 0) {
                let errStr = '<br>';
                errors.forEach(error => {
                    errStr += `<span style="color: red">ERROR: ${error}</span><br>`;
                });
                uploadText.innerHTML += errStr;
            } else if (warnings.size > 0 && docData) {
                let warnStr = '<br>';
                warnings.forEach(warning => {
                    warnStr += `<span style="color: darkorange">WARNING: ${warning}</span><br>`;
                });
                uploadText.innerHTML += warnStr;
                generateDownloads(docData);
            } else if (docData) {
                generateDownloads(docData);
            }
        } else {
            progressBar.style.display = 'none';
        }
    } catch (err) {
        progressBar.style.display = 'none';

        errors.add("Input error.");
        let errStr = '<br>';
        errors.forEach(error => {
            errStr += `<span style="color: red">ERROR: ${error}</span><br>`;
        });
        uploadText.innerHTML += errStr;
    }
});