let buildingDays = [];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayKeywords = {
    'seven days': [
        'seven days',
        'seven nights',
        'seven times',
        'every day of the week'
    ],
    'weekdays': [
        'weekday'
    ],
    'daily': [
        'daily',
        'everyday',
        'every day',
        'per day',
        'nightly',
        'every night',
        'per night',
        'every shift',
        'per shift'
    ]
}
const otherKeywords = [
    'week',
    'month',
    'quarter',
    'as needed'
];

function setBuildingDays(xml) { //sets which days are considered "daily"
    buildingDays = [];
    const iItalics = findAllOccurrences(xml, "<w:i/>");
    iItalics.forEach(index => {
        const sectionTitle = getParagraphText(xml, index);
        const sectionDays = getSectionDays(sectionTitle);
        sectionDays.forEach(day => {
            if (!buildingDays.includes(day)) {
                buildingDays.push(day);
            }
        });
    });
}

function appendData(xml, data, list, pageEnd, i) { //flexible function for appending scrubbed data
    const paragraphText = getParagraphText(xml, list[i]);
    if(!data.title.endsWith(paragraphText)) {
        data.title += " " + paragraphText;
    }
    data.xml += " " + xml.slice(list[i], list[i + 1] ?? pageEnd);
}
function setData(xml, map, data, list, pageEnd, i) { //flexible function for setting scrubbed data
    map.set(data.title.trim(), map.get(data.title.trim()) + data.xml.trim());
    data.title = '';
    data.xml = '';
    appendData(xml, data, list, pageEnd, i);
}

function getDocumentData(xml) {
    const retMap = new Map;
    const iHeading1 = findAllOccurrences(xml, 'w:val="Heading1');
    const iHeading3 = xml.indexOf('w:val="Heading3');
    const pageEnd = iHeading3 === -1 ? xml.indexOf("</w:p>", xml.lastIndexOf('<w:numPr')) : iHeading3;
    if(iHeading1.length > 0) {
        let buildings = new Map;
        let building = {title: "", xml: ""}
        appendData(xml, building, iHeading1, pageEnd, 0);
        for(let i = 1; i <= iHeading1.length; i++) {
            if(!building.xml.includes('w:val="Heading2')) {
                appendData(xml, building, iHeading1, pageEnd, i);
            } else {
                setData(xml, buildings, building, iHeading1, pageEnd, i);
            }
        }
        buildings.forEach((v, k) => {
            setBuildingDays(v);
            retMap.set(k, getBuildingData(v, pageEnd));
        });
    } else {
        errors.add("No Heading 1 style found.");
    }
    if(!xml.includes('w:val="Heading2')) {
        errors.add("No Heading 2 style found.");
    }
    return retMap;
}
function getBuildingData(xml, pageEnd) {
    let retMap = new Map;
    const iHeading2 = findAllOccurrences(xml, 'w:val="Heading2');
    if(iHeading2.length > 0) {
        let areas = new Map;
        let area = {title: "", xml: ""}
        appendData(xml, area, iHeading2, pageEnd, 0);
        for(let i = 1; i <= iHeading2.length; i++) {
            if(!area.xml.includes("<w:i/>") && !area.xml.includes("<w:numPr")) {
                appendData(xml, area, iHeading2, pageEnd, i);
            } else {
                setData(xml, areas, area, iHeading2, pageEnd, i);
            }}
        areas.forEach((v, k) => {
            retMap.set(k, getAreaData(v, pageEnd));
        });
    } else {
        warnings.add("No Heading 2 style found for one or more building(s).");
    }
    return retMap;
}
function getAreaData(xml, pageEnd) {
    let retMap = new Map;
    const iItalics = findAllOccurrences(xml, "<w:i/>", "<w:numPr");
    const iBullets = findAllOccurrences(xml, "<w:numPr");
    if(iItalics.length > 0) {
        if(iBullets.length > 0) {
            let curItalic = 0;
            let curBullet = 0;
            while(curItalic < iItalics.length) {
                let iFirst = curItalic;
                let iLast = curItalic;
                while (iItalics.length > curItalic + 1 && iItalics[curItalic + 1] < iBullets[curBullet]) {
                    curItalic++;
                    iLast = curItalic;
                }

                const sectionXML = xml.slice(iItalics[iFirst], iItalics[iLast + 1] ?? pageEnd);
                const sectionTitle = getParagraphRangeText(xml, iItalics[iFirst], iItalics[iLast]);
                if(sectionXML.includes("<w:numPr") && sectionTitle) {
                    const sectionKeywords = getSectionKeywords(sectionTitle);
                    const sectionBullets = getSectionBullets(sectionXML);
                    retMap.set(sectionKeywords, sectionBullets);
                }

                while (iBullets[curBullet] < iItalics[curItalic + 1]) {
                    curBullet++;
                }
                curItalic++;
            }
        } else {
            warnings.add("No bullet points found in one or more area(s).");
        }
    } else {
        warnings.add("No italics found for section titles in one or more area(s).");
    }

    return retMap;
}
function getSectionKeywords(sectionText) {
    sectionText = sectionText.toLowerCase();
    let retArr = getSectionDays(sectionText);

    //other labels
    if(retArr.length === 0) {
        otherKeywords.forEach(keyword => {
            if(retArr.length === 0 && sectionText.includes(keyword)) {
                if (!retArr.includes(keyword)) retArr.push(keyword);
            }
        });
    }

    if(retArr.length === 0) {
        warnings.add("No keywords found in one or more section(s).");
    }
    return retArr;
}
function getSectionDays(sectionText) {
    sectionText = sectionText
        .toLowerCase()
        .replace(/\bthrough\b/g, "-")
        .replace(/\s*-\s*/g, "-");

    let retArr = [];

    // Find all days and their index positions
    const foundDays = [];
    days.forEach(day => {
        let idx = sectionText.indexOf(day);
        while (idx !== -1) {
            foundDays.push({ day, index: idx });
            idx = sectionText.indexOf(day, idx + 1);
        }
    });

    // Walk through and detect ranges
    for (let i = 0; i < foundDays.length; i++) {
        const { day, index } = foundDays[i];
        const dayEnd = index + day.length;

        if (sectionText.charAt(dayEnd) === '-') {
            const nextDayObj = foundDays.find(d => d.index > index && sectionText.slice(dayEnd).startsWith(`-${d.day}`));
            const fallbackNext = foundDays.find(d => d.index > index);
            const rangeEnd = nextDayObj || fallbackNext;

            if (rangeEnd) {
                const startIdx = days.indexOf(day);
                const endIdx = days.indexOf(rangeEnd.day);
                // handle wrapping ranges (e.g., saturday-monday)
                const rangeDays = startIdx <= endIdx
                    ? days.slice(startIdx, endIdx + 1)
                    : [...days.slice(startIdx), ...days.slice(0, endIdx + 1)];

                rangeDays.forEach(d => {
                    if (!retArr.includes(d)) retArr.push(d);
                });
            } else if (!retArr.includes(day)) {
                retArr.push(day);
            }
        } else {
            if (!retArr.includes(day)) retArr.push(day);
        }
    }

    Object.entries(dayKeywords).forEach(([k, v]) => {
        v.forEach(keyPhrase => {
            if(sectionText.includes(keyPhrase)) {
                if(k === 'seven days') {
                    days.forEach(day => {
                        if(!retArr.includes(day)) retArr.push(day);
                    });
                } else {
                    if(k === 'weekdays') {
                        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                            if (!retArr.includes(day)) retArr.push(day);
                        });
                    }
                    if(k === 'daily') {
                        buildingDays.forEach(day => {
                            if(!retArr.includes(day)) retArr.push(day);
                        });
                    }
                }
            }
        });
    });

    return retArr;
}
function getSectionBullets(xml) {
    let retArr = [];
    const iBullets = findAllOccurrences(xml, "<w:numPr");
    if(iBullets.length > 0) {
        for(let i = 0; i < iBullets.length; i++) {
            const bulletText = getParagraphText(xml, iBullets[i]);
            retArr.push(bulletText);
        }
    } else {
        warnings.add("No bullet points found for one or more section(s).");
    }
    return retArr;
}