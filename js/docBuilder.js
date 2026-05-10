const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    VerticalAlign,
    TabStopType
} = docx;

function exportDocx(doc, fileName) {
    Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    });
}
function makeBisDoc(buildingName, docData) {
    return new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "12ptBold",
                    name: "12pt Bold",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        bold: true,
                        size: "12pt"
                    }
                },
                {
                    id: "14ptBold",
                    name: "14pt Bold",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: "Arial",
                        bold: true,
                        size: "14pt"
                    }
                },
                {
                    id: "14ptBoldHighlighted",
                    name: "14pt Bold Highlighted",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: "Arial",
                        highlight: 'yellow',
                        bold: true,
                        size: "14pt"
                    }
                }
            ]
        },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 180,
                        bottom: 180,
                        left: 360,
                        right: 360
                    }
                }
            },
            children: [
                buildHeading(buildingName),
                buildTable(docData),
                new Paragraph({
                    text: "Additional Information: ",
                    style: "14ptBoldHighlighted"
                }),
                new Paragraph({
                    text: "Details & Consistency are primary concerns for clients. Ensuring that the building is 100% every night is priority.",
                    style: "14ptBold"
                }),
                new Paragraph({
                    text: "",
                    style: "14ptBold"
                }),
                new Paragraph({
                    text: "Keys:____________ Key Card: ____________ Badges: ____________",
                    style: "14ptBold"
                }),
                new Paragraph({
                    text: "",
                    style: "14ptBold"
                }),
                new Paragraph({
                    text: "COMPLETED BY: ___________________________     DATE: _______",
                    style: "14ptBold"
                }),
                new Paragraph({
                    text: "",
                    style: "14ptBold"
                }),
                new Paragraph({
                    text: "INSPECTED BY: ____________________________     DATE: _______",
                    style: "14ptBold"
                }),
            ],
        }],
    });
}

function buildHeading(buildingName) {
    return new Paragraph({
        text: `Building: ${buildingName}\tWeek Ending: __________________`,
        style: "14ptBold",
        tabStops: [{
            type: TabStopType.RIGHT,
            position: 11160
        }],
        spacing: {
            line: 300,
        }

    });
}

function buildTable(docData) {
    let labelMap = {
        'monday': 'Mon',
        'tuesday': 'Tues',
        'wednesday': 'Wed',
        'thursday': 'Thurs',
        'friday': 'Fri',
        'saturday': 'Sat',
        'sunday': 'Sun',
        'week': 'W',
        'month': 'M',
        'quarter': 'Q',
        'as needed': 'as needed'
    }
    let includedColumns = [];

    let topRow = new TableRow({
        height: {
            value: 375,
        },
        children: [new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: {
                left: 100
            },
            children: [new Paragraph({
                text: "Areas of Responsibility",
                style: "12ptBold"
            })]
        })]
    });

    docData.forEach(areaValue => {
        areaValue.forEach((sectionValue, sectionKey) => {
            sectionKey.forEach(label => {
                if(!includedColumns.includes(labelMap[label])) {
                    includedColumns.push(labelMap[label]);
                }
            });
        });
    });

    //order labels
    let boxTitles = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'week', 'month', 'quarter'];
    let fullWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    includedColumns = boxTitles.filter(title => includedColumns.includes(labelMap[title])).map(title => labelMap[title]);

    includedColumns.forEach(includedColumn => {
        let cell = new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: {
                size: 560,
                type: WidthType.DXA
            },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun(includedColumn)],
                })
            ]
        })
        topRow.root.push(cell);
    });

    //create table
    const table = new Table({
        rows: [topRow],
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        borders: {
            top: {
                style: BorderStyle.DOUBLE
            },
            bottom: {
                style: BorderStyle.DOUBLE
            },
            left: {
                style: BorderStyle.DOUBLE
            },
            right: {
                style: BorderStyle.DOUBLE
            }
        }
    });

    //build table
    //get into areas
    docData.forEach((areaValue, areaKey) => {
        let areaTitle = areaKey;
        let areaLabels = [];

        //build area title labels
        areaValue.forEach((sectionValue, sectionKey) => {
            sectionKey.forEach(label => {
                if(!areaLabels.includes(label)) {
                    areaLabels.push(label);
                }
            })
        });
        //sort labels
        areaLabels = boxTitles.filter(l => areaLabels.includes(l));

        //append labels
        if(areaLabels.length > 0) {
            areaTitle += ' (';
            let appendIndex = 0;
            let thru = [];
            while (appendIndex < areaLabels.length) {
                let thisLabel = areaLabels[appendIndex];

                //thru
                if (areaLabels[appendIndex + 1] === fullWeek[fullWeek.indexOf(thisLabel) + 1] && areaLabels[appendIndex + 2] === fullWeek[fullWeek.indexOf(thisLabel) + 2] && areaLabels[appendIndex + 1] && areaLabels[appendIndex + 2]) {
                    thru[0] = labelMap[thisLabel];
                    thru[1] = labelMap[areaLabels[appendIndex + 2]];
                    let addIndex = 3;
                    if (areaLabels[appendIndex + 3] === fullWeek[fullWeek.indexOf(thisLabel) + 3] && areaLabels[appendIndex + 3]) {
                        thru[1] = labelMap[areaLabels[appendIndex + 3]];
                        addIndex++;
                        if (areaLabels[appendIndex + 4] === fullWeek[fullWeek.indexOf(thisLabel) + 4] && areaLabels[appendIndex + 4]) {
                            thru[1] = labelMap[areaLabels[appendIndex + 4]];
                            addIndex++;
                            if (areaLabels[appendIndex + 5] === fullWeek[fullWeek.indexOf(thisLabel) + 5] && areaLabels[appendIndex + 5]) {
                                thru[1] = labelMap[areaLabels[appendIndex + 5]];
                                addIndex++;
                                if (areaLabels[appendIndex + 6] === fullWeek[fullWeek.indexOf(thisLabel) + 6] && areaLabels[appendIndex + 6]) {
                                    thru[1] = labelMap[areaLabels[appendIndex + 6]];
                                    addIndex++;
                                }
                            }
                        }
                    }
                    appendIndex += addIndex;
                    areaTitle += thru[0] + '-' + thru[1];
                    if (appendIndex < areaLabels.length) {
                        areaTitle += ', '
                    }
                } else if (appendIndex < areaLabels.length - 1) {
                    areaTitle += labelMap[thisLabel] + ', ';
                    appendIndex++;
                } else {
                    areaTitle += labelMap[thisLabel];
                    appendIndex++;
                }
            }
            areaTitle += ')';
        }

        let areaRow = new TableRow({
            height: {
                value: 350,
            },
            children: [
                new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                        left: 100
                    },
                    shading: {
                        fill: "A6A6A6"
                    },
                    children: [
                        new Paragraph({
                            children: [new TextRun({
                                text: areaTitle,
                                bold: true
                            })]
                        })
                    ]
                })
            ]
        });
        includedColumns.forEach(includedColumn => {
            areaRow.root.push(
                new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    shading: {
                        fill: "A6A6A6"
                    },
                    width: {
                        size: 560,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun(includedColumn)],
                        })
                    ]
                })
            );
        });
        table.root.push(areaRow);

        //get into sections
        areaValue.forEach((sectionValue, sectionKey) => {
            let sectionColumns = [];
            for(let i = 0; i < sectionKey.length; i++) {
                sectionColumns.push(labelMap[sectionKey[i]]);
            }

            //get into line items
            sectionValue.forEach((lineItemValue, lineItemKey) => {
                let rowChildren = [new TableCell({
                    margins: {
                        left: 100,
                        top: 25,
                        bottom: 50
                    },
                    children: [new Paragraph(lineItemValue)]
                })];
                if(sectionColumns.includes('as needed')) {
                    rowChildren.push(
                        new TableCell({
                            columnSpan: includedColumns.length,
                            verticalAlign: VerticalAlign.CENTER,
                            shading: {
                                fill: "FFFFFF"
                            },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "Complete as needed.",
                                            bold: true
                                        })
                                    ]
                                })
                            ]
                        })
                    );
                } else {
                    includedColumns.forEach(includedColumn => {
                        if (sectionColumns.includes(includedColumn)) {
                            rowChildren.push(
                                new TableCell({
                                    shading: {
                                        fill: "FFFFFF"
                                    },
                                    children: [new Paragraph('')]
                                })
                            );
                        } else {
                            rowChildren.push(
                                new TableCell({
                                    shading: {
                                        fill: "000000"
                                    },
                                    children: [new Paragraph('')]
                                })
                            );
                        }
                    });
                }
                table.root.push(
                    new TableRow({
                        children: rowChildren,
                    })
                );
            });
        });
    });

    return table;
}