var lastQuestionID = 1;
var lastAnswerID = 0;
var deletedQuestions = [];
var deletedAnswers = [];

function init() {

    var $ = go.GraphObject.make; // for conciseness in defining templates
    diagram =
        $(go.Diagram, "diagramDiv", {
            allowCopy: false,
            initialContentAlignment: go.Spot.Center,
            layout: $(go.LayeredDigraphLayout, {
                setsPortSpots: false, // Links already know their fromSpot and toSpot
                columnSpacing: 50,
                layerSpacing: 10,
                isInitial: false,
                isOngoing: false
            }),
            validCycle: go.Diagram.CycleNotDirected,
            "undoManager.isEnabled": true,
            padding: 200
        });

    let fieldTemplate =
        $(go.Panel, "TableRow", // this Panel is a row in the containing Table
            $(go.TextBlock, {
                    margin: new go.Margin(0, 5),
                    column: 1,
                    font: "italic 11px sans-serif",
                    alignment: go.Spot.Left,
                    fromLinkable: false,
                    toLinkable: false
                },
                new go.Binding("text", "name")
            ),
            $(go.TextBlock, {
                    margin: new go.Margin(0, 5),
                    width: 100,
                    column: 2,
                    font: "11px sans-serif",
                    alignment: go.Spot.Left,
                    wrap: go.TextBlock.WrapFit,
                    editable: true
                },
                new go.Binding("text", "info").makeTwoWay()
            )
        );

    // when the document is modified, add a "*" to the title and enable the "Save" button
    diagram.addDiagramListener("Modified", function (e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !diagram.isModified;
        var idx = document.title.indexOf("*");
        if (diagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });

    let selectedColor = "#feca57";
    let startColor = "#1dd1a1";
    let questionColor = "#00d2d3";
    let answerColor = "#a29bfe";
    diagram.nodeTemplate = // the default node template
        $(go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY"
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: "white",
                    stroke: "gray",
                    minSize: new go.Size(180, 21)
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? selectedColor : "white";
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY"
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: fieldTemplate
                    },
                    new go.Binding("itemArray", "fields")
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: addNodeAndLink
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3
                })
            ),
            // input port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Left,
                    portId: "to",
                    toLinkable: true,
                    toSpot: go.Spot.Left
                },
                $(go.Shape, "Circle", {
                    width: 8,
                    height: 8,
                    fill: "white",
                    stroke: "gray"
                }),
                $(go.Shape, "Circle", {
                    width: 4,
                    height: 4,
                    fill: "dodgerblue",
                    stroke: null
                })
            )
        );

    diagram.nodeTemplateMap.add("Start",
        $(go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY",
                deletable: false
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: startColor,
                    stroke: "gray",
                    minSize: new go.Size(180, 21)
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? selectedColor : startColor;
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY"
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: fieldTemplate
                    },
                    new go.Binding("itemArray", "fields")
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: addNodeAndLink
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3
                })
            )
        ));

    diagram.nodeTemplateMap.add("Question",
        $(go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY"
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: questionColor,
                    stroke: "gray",
                    minSize: new go.Size(180, 21)
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? selectedColor : questionColor;
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY"
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: fieldTemplate
                    },
                    new go.Binding("itemArray", "fields")
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: addNodeAndLink
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3
                })
            ),
            // input port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Left,
                    portId: "to",
                    toLinkable: true,
                    toSpot: go.Spot.Left
                },
                $(go.Shape, "Circle", {
                    width: 8,
                    height: 8,
                    fill: "white",
                    stroke: "gray"
                }),
                $(go.Shape, "Circle", {
                    width: 4,
                    height: 4,
                    fill: "dodgerblue",
                    stroke: null
                })
            )
        ));

    diagram.nodeTemplateMap.add("Answer",
        $(go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY"
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: answerColor,
                    stroke: "gray",
                    minSize: new go.Size(180, 21)
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? selectedColor : answerColor;
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY"
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: fieldTemplate
                    },
                    new go.Binding("itemArray", "fields")
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: addNodeAndLink
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3
                })
            ),
            // input port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Left,
                    portId: "to",
                    toLinkable: true,
                    toSpot: go.Spot.Left
                },
                $(go.Shape, "Circle", {
                    width: 8,
                    height: 8,
                    fill: "white",
                    stroke: "gray"
                }),
                $(go.Shape, "Circle", {
                    width: 4,
                    height: 4,
                    fill: "dodgerblue",
                    stroke: null
                })
            )
        ));

    // this is a click event handler that adds a node and a link to the diagram,
    // connecting with the node on which the click occurred
    function addNodeAndLink(e, obj) {
        var fromNode = obj.part;
        var diagram = fromNode.diagram;
        diagram.startTransaction("Add State");
        // get the node data for which the user clicked the button
        var fromData = fromNode.data;

        let category, fields;

        if (fromData.category == "Start" || fromData.category == "Question") {
            category = "Answer";
            let aID = lastAnswerID + 1;

            // check if there's any unused answer IDs
            if (deletedAnswers.length > 0) {
                aID = deletedAnswers[0];
                deletedAnswers.shift();
            } else {
                lastAnswerID++;
            }

            fields = [{
                    name: "AnswerID",
                    info: aID
                },
                {
                    name: "QuestionID",
                    info: fromData.fields[0].info
                },
                {
                    name: "NextQID",
                    info: "#"
                },
                {
                    name: "PopupID",
                    info: "&"
                },
                {
                    name: "Points",
                    info: "2"
                }
            ];
        } else {
            category = "Question";
            // check if the answer already has a question, and only allow 1 question per answer
            for (let i in fromNode.linksConnected.Ac.n) {
                if (fromNode.linksConnected.Ac.n[i].fromNode == fromNode) {
                    return;
                }
            }

            let qID = lastQuestionID + 1;

            // check if there's any unused question IDs
            if (deletedQuestions.length > 0) {
                qID = deletedQuestions[0];
                deletedQuestions.shift();
            } else {
                lastQuestionID++;
                console.log("last question ID");
                console.log(lastQuestionID);
            }

            fields = [{
                name: "QuestionID",
                info: qID
            }];

            let updatefields = [{
                    name: "AnswerID",
                    info: fromData.fields[0].info
                },
                {
                    name: "QuestionID",
                    info: fromData.fields[1].info
                },
                {
                    name: "NextQID",
                    info: qID
                },
                {
                    name: "PopupID",
                    info: fromData.fields[3].info
                },
                {
                    name: "Points",
                    info: fromData.fields[4].info
                }
            ];

            var model = diagram.model;
            model.startTransaction("updateNextQID");
            model.setDataProperty(fromData, "fields", updatefields);
            model.commitTransaction("updateNextQID");
        }
        // create a new "State" data object, positioned off to the right of the fromNode
        var p = fromNode.location.copy();
        p.x += diagram.toolManager.draggingTool.gridSnapCellSize.width;
        var toData = {
            text: "new",
            category: category,
            loc: go.Point.stringify(p),
            "fields": fields
        };
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(toData);
        // create a link data from the old node data to the new node data
        var linkdata = {
            from: model.getKeyForNodeData(fromData),
            to: model.getKeyForNodeData(toData)
        };
        // and add the link data to the model
        model.addLinkData(linkdata);
        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);
        // snap the new node to a valid location
        newnode.location = diagram.toolManager.draggingTool.computeMove(newnode, p);
        // then account for any overlap
        shiftNodesToEmptySpaces();
        diagram.commitTransaction("Add State");
    }

    // Highlight ports when they are targets for linking or relinking.
    var OldTarget = null; // remember the last highlit port
    function highlight(port) {
        if (OldTarget !== port) {
            lowlight(); // remove highlight from any old port
            OldTarget = port;
            port.scale = 1.3; // highlight by enlarging
        }
    }

    function lowlight() { // remove any highlight
        if (OldTarget) {
            OldTarget.scale = 1.0;
            OldTarget = null;
        }
    }

    diagram.linkTemplate =
        $(go.Link, {
                selectionAdorned: false,
                fromPortId: "from",
                toPortId: "to",
                relinkableTo: true,
                routing: go.Link.AvoidsNodes
            },
            $(go.Shape, {
                stroke: "gray",
                strokeWidth: 2
            }, {
                mouseEnter: function (e, obj) {
                    obj.strokeWidth = 5;
                    obj.stroke = "dodgerblue";
                },
                mouseLeave: function (e, obj) {
                    obj.strokeWidth = 2;
                    obj.stroke = "gray";
                }
            }),
            $(go.Shape, // the arrowhead
                {
                    stroke: "gray",
                    strokeWidth: 2
                }, {
                    toArrow: "OpenTriangle",
                    fill: null
                })
        );

    function commonLinkingToolInit(tool) {
        // the temporary link drawn during a link drawing operation (LinkingTool) is thick and blue
        tool.temporaryLink =
            $(go.Link, {
                    layerName: "Tool"
                },
                $(go.Shape, {
                    stroke: "dodgerblue",
                    strokeWidth: 2
                }));

        // change the standard proposed ports feedback from blue rectangles to transparent circles
        tool.temporaryFromPort.figure = "Circle";
        tool.temporaryFromPort.stroke = null;
        tool.temporaryFromPort.strokeWidth = 0;
        tool.temporaryToPort.figure = "Circle";
        tool.temporaryToPort.stroke = null;
        tool.temporaryToPort.strokeWidth = 0;

        // provide customized visual feedback as ports are targeted or not
        tool.portTargeted = function (realnode, realport, tempnode, tempport, toend) {
            if (realport === null) { // no valid port nearby
                lowlight();
            } else if (toend) {
                highlight(realport);
            }
        };
    }

    var ltool = diagram.toolManager.linkingTool;
    commonLinkingToolInit(ltool);
    // do not allow links to be drawn starting at the "to" port
    ltool.direction = go.LinkingTool.ForwardsOnly;

    var rtool = diagram.toolManager.relinkingTool;
    commonLinkingToolInit(rtool);
    // change the standard relink handle to be a shape that takes the shape of the link
    rtool.toHandleArchetype =
        $(go.Shape, {
            isPanelMain: true,
            fill: null,
            stroke: "dodgerblue",
            strokeWidth: 5
        });

    // do not allow linking between nodes of the same category
    function sameCategory(fromnode, fromport, tonode, toport) {
        let value = true;
        if (fromnode.data.category === tonode.data.category) {
            value = false;
        }

        // check if the answer already has a question, and only allow 1 question per answer
        if (fromnode.data.category == "Answer") {
            if (fromnode.linksConnected.count > 0) {
                for (let i in fromnode.linksConnected.Ac.n) {
                    if (fromnode.linksConnected.Ac.n[i].fromNode == fromnode) {
                        value = false;
                    }
                }
            }
        } else if (fromnode.data.category == "Question") {
            if (tonode.linksConnected.count > 0) {
                for (let i in tonode.linksConnected.Ac.n) {
                    if (tonode.linksConnected.Ac.n[i].fromNode.data.category == "Question" || tonode.linksConnected.Ac.n[i].fromNode.data.category == "Start") {
                        value = false;
                    }
                }
            }
        }

        return value;
    }
    rtool.linkValidation = sameCategory;
    ltool.linkValidation = sameCategory;

    diagram.addDiagramListener("SelectionDeleted", function (e) {
        console.log(e.subject.Ea.key.data);
        let data = e.subject.Ea.key.data;
        if (data.category == "Answer") {
            deletedAnswers.push(data.fields[0].info);
            console.log(deletedAnswers);
        }
        if (data.category == "Question") {
            deletedQuestions.push(data.fields[0].info);
            console.log(deletedQuestions);
        }
    });

    diagram.addDiagramListener("LinkDrawn", function (e) {
        handleLinking(e);
    });

    diagram.addDiagramListener("LinkRelinked", function (e) {
        handleLinking(e);
    });

    function handleLinking(e) {

        let fromNode = e.subject.fromNode;
        let toNode = e.subject.toNode;
        let fromData = fromNode.data;
        let toData = toNode.data;

        if (fromData.category == "Answer") {

            let updatefields = [{
                    name: "AnswerID",
                    info: fromData.fields[0].info
                },
                {
                    name: "QuestionID",
                    info: fromData.fields[1].info
                },
                {
                    name: "NextQID",
                    info: toData.fields[0].info
                },
                {
                    name: "PopupID",
                    info: fromData.fields[3].info
                },
                {
                    name: "Points",
                    info: fromData.fields[4].info
                }
            ];
            var model = diagram.model;
            model.startTransaction("updateNextQID");
            model.setDataProperty(fromData, "fields", updatefields);
            model.commitTransaction("updateNextQID");
        } else if (fromData.category == "Start" || fromData.category == "Question") {

            let updatefields = [{
                    name: "AnswerID",
                    info: toData.fields[0].info
                },
                {
                    name: "QuestionID",
                    info: fromData.fields[0].info
                },
                {
                    name: "NextQID",
                    info: toData.fields[2].info
                },
                {
                    name: "PopupID",
                    info: toData.fields[3].info
                },
                {
                    name: "Points",
                    info: toData.fields[4].info
                }
            ];
            var model = diagram.model;
            model.startTransaction("updateNextQID");
            model.setDataProperty(toData, "fields", updatefields);
            model.commitTransaction("updateNextQID");
        }
    }

    // use a special DraggingTool to cause the dragging of a Link to start relinking it
    diagram.toolManager.draggingTool = new DragLinkingTool();

    // detect when dropped onto an occupied cell
    diagram.addDiagramListener("SelectionMoved", shiftNodesToEmptySpaces);

    function shiftNodesToEmptySpaces() {
        diagram.selection.each(function (node) {
            if (!(node instanceof go.Node)) return;
            // look for Parts overlapping the node
            while (true) {
                var exist = diagram.findObjectsIn(node.actualBounds,
                    // only consider Parts
                    function (obj) {
                        return obj.part;
                    },
                    // ignore Links and the dropped node itself
                    function (part) {
                        return part instanceof go.Node && part !== node;
                    },
                    // check for any overlap, not complete containment
                    true).first();
                if (exist === null) break;
                // try shifting down beyond the existing node to see if there's empty space
                node.position = new go.Point(node.actualBounds.x, exist.actualBounds.bottom + 10);
            }
        });
    }

    // prevent nodes from being dragged to the left of where the layout placed them
    // diagram.addDiagramListener("LayoutCompleted", function (e) {
    //     diagram.nodes.each(function (node) {
    //         if (node.category === "Recycle") return;
    //         node.minLocation = new go.Point(node.location.x, -Infinity);
    //     });
    // });

    initialLoad(); // load initial diagram
    load();
    layout();
}

let model;
function save() {
    model = diagram.model.toJson();
    document.getElementById("savedModelDiv").value = model;
    diagram.isModified = false;

    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {
            type: contentType
        });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    download(model, 'powerup-map-json.txt', 'text/plain');
}

function loadFile() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('fileinput');
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
        var newArr = JSON.parse(lines);
        model = newArr;
        load();
    }
}

function load() {
    //diagram.model = go.Model.fromJson(document.getElementById("savedModelDiv").value);
    document.getElementById("savedModelDiv").value = JSON.stringify(model);

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
    document.getElementById("savedModelDiv").value = JSON.stringify(model, null, "\t");
}

// Define a custom tool that changes a drag operation on a Link to a relinking operation,
// but that operates like a normal DraggingTool otherwise.
function DragLinkingTool() {
    go.DraggingTool.call(this);
    this.isGridSnapEnabled = false;
    this.isGridSnapRealtime = false;
    this.gridSnapCellSize = new go.Size(240, 1);
    this.gridSnapOrigin = new go.Point(5.5, 0);
}
go.Diagram.inherit(DragLinkingTool, go.DraggingTool);

// Handle dragging a link specially -- by starting the RelinkingTool on that Link
/** @override */
DragLinkingTool.prototype.doActivate = function () {
    var diagram = this.diagram;
    if (diagram === null) return;
    this.standardMouseSelect();
    var main = this.currentPart; // this is set by the standardMouseSelect
    if (main instanceof go.Link) { // maybe start relinking instead of dragging
        var relinkingtool = diagram.toolManager.relinkingTool;
        // tell the RelinkingTool to work on this Link, not what is under the mouse
        relinkingtool.originalLink = main;
        // start the RelinkingTool
        diagram.currentTool = relinkingtool;
        // can activate it right now, because it already has the originalLink to reconnect
        relinkingtool.doActivate();
        relinkingtool.doMouseMove();
    } else {
        go.DraggingTool.prototype.doActivate.call(this);
    }
};
// end DragLinkingTool