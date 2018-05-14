function save() {
    model = diagram.model.toJson();
    diagram.isModified = false;

    let data = {
        model: model,
        lastQuestionID: lastQuestionID,
        lastAnswerID: lastAnswerID,
        deletedQuestions: deletedQuestions,
        deletedAnswers: deletedAnswers
    }

    download(JSON.stringify(data), 'powerup-map-json.txt', 'text/plain');
    //console.log(JSON.parse(model).nodeDataArray);
}

function exportCSV(target) {
    model = diagram.model.toJson();

    let j = JSON.parse(model).nodeDataArray;
    let sID = j[0].fields[1].info;
    let arr = [];
    let fileName;

    if (target) {
        handleQuestions();
        fileName = "powerup-map-questions.csv";
    } else {
        handleAnswers();
        fileName = "powerup-map-answers.csv";
    }

    function handleQuestions() {
        for (let i in j) {
            let record = j[i];
            if (record.category == "Start" || record.category == "Question") {
                let ScenarioID = sID;
                let QuestionID = record.fields[0].info;
                let QDescription = record.text;
                let newRecord = {
                    QuestionID: QuestionID,
                    ScenarioID: ScenarioID,
                    QDescription: QDescription
                }
                arr.push(newRecord);
            }
        }
    }

    function handleAnswers() {
        for (let i in j) {
            let record = j[i];
            if (record.category == "Answer") {
                let AnswerID = record.fields[0].info;
                let QuestionID = record.fields[1].info;
                let ADescription = record.text;
                let NextQID = record.fields[2].info;
                let Points = record.fields[4].info;
                let PopupID = record.fields[3].info;
                let newRecord = {
                    AnswerID: AnswerID,
                    QuestionID: QuestionID,
                    ADescription: ADescription,
                    NextQID: NextQID,
                    Points: Points,
                    PopupID: PopupID
                }
                arr.push(newRecord);
            }
        }
    }

    // console.log(an);
    // console.log(qu);

    let items = arr;
    let replacer = (key, value) => value === null ? '' : value;
    let header = Object.keys(items[0]);
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');

    download(csv, fileName);

    //console.log(csv)
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {
        type: contentType
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function loadFile() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('fileInput');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    } else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    } else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
    }

    function receivedText(e) {
        let lines = e.target.result;
        let data = JSON.parse(lines);
        model = data.model;
        lastQuestionID = data.lastQuestionID;
        lastAnswerID = data.lastAnswerID;
        deletedQuestions = data.deletedQuestions;
        deletedAnswers = data.deletedAnswers;
        load();
    }
}

function load() {
    diagram.clear()
    diagram.model = go.Model.fromJson(model);

    lastQuestionID = 0;
    lastAnswerID = 0;

    // update lastQuestionID and lastAnswerID when loading a model
    let nodes = diagram.model.nodeDataArray;
    for (let i in nodes) {
        let data = nodes[i];
        let category = data.category;

        if (category == "Question" || category == "Start") {
            let currentID = parseInt(data.fields[0].info, 10);
            if (currentID > lastQuestionID) {
                lastQuestionID = currentID;
            }
        }
        if (category == "Answer") {
            let currentID = parseInt(data.fields[0].info, 10);
            if (currentID > lastQuestionID) {
                lastAnswerID = currentID;
            }
        }
    }
}

function layout() {
    diagram.layoutDiagram(true);
}

function initialLoad() {
    model = {
        "class": "go.GraphLinksModel",
        "nodeDataArray": [{
            "key": 1,
            "text": "Starting Question",
            "category": "Start",
            "fields": [{
                    name: "QuestionID",
                    info: "1"
                },
                {
                    name: "ScenarioID",
                    info: "0"
                }
            ]
        }],
        "linkDataArray": []
    }
}