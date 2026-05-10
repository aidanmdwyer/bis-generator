const _htmlDecodeDiv = document.createElement("div");
function decodeHtmlEntities(htmlString) {
    _htmlDecodeDiv.innerHTML = htmlString;
    return _htmlDecodeDiv.textContent;
}
const _htmlEncodeDiv = document.createElement("div");
function escapeHtml(text) {
    _htmlEncodeDiv.innerText = text;
    return _htmlEncodeDiv.innerHTML;
}
function findAllOccurrences(xml, subString, exclude = null) {
    if (subString.length === 0) return [];

    const occurrences = [];
    let startIndex = 0;

    while (startIndex !== -1) {
        startIndex = xml.indexOf(subString, startIndex);

        if (startIndex !== -1) {
            if(!exclude || !(getParagraphXml(xml, startIndex).includes(exclude))) {
                occurrences.push(startIndex);
            }
            startIndex += subString.length;
        }
    }
    return occurrences;
}

function getParagraphXml(xml, i) {
    if (i < 0) stringUtilityError();

    let start = xml.lastIndexOf("<w:p", i);
    if (start < 0) start = 0;

    let end = xml.indexOf("</w:p>", i);
    if (end < 0) end = xml.length;

    return xml.slice(start, end + 6);
}
function getParagraphText(xml, i) {
    return getText(getParagraphXml(xml, i));
}
function getParagraphRangeText(xml, iFirst, iLast) {
    if (iFirst < 0) stringUtilityError();
    if (iLast < 0) stringUtilityError();

    let start = xml.lastIndexOf("<w:p", iFirst);
    if (start < 0) start = 0;

    let end = xml.indexOf("</w:p>", iLast);
    if (end < 0) end = xml.length;

    const paragraphXML = xml.slice(start, end + 6);

    return getText(paragraphXML);
}
function getText(xml) {
    const text = [...xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('').trim();
    return decodeHtmlEntities(text);
}

function stringUtilityError() {
    errors.add("Backend .docx parse error");
}