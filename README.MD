### Only tested in desktop Chrome and Safari

Live Demo:

https://rawgit.com/justKD/powerup-scenario-planner/master/index.html


![alt text](https://raw.githubusercontent.com/justKD/powerup-scenario-planner/master/example.png)

## Intro

Each panel represents a record in the PowerUp Q&A database. This tool is 
designed to correlate with those tables. Green panels represent Questions,
and purple panels represent Answers.

## Basic Use

- Click the + icon to add a new child node
- Double-click on text to edit
- Hitting enter starts a new line, click off of the text box to close the editor and save the value
- Italicized text are the property names and can not be edited 
- Delete a node or link by selecting it and hitting your delete key
- Select and drag a record to move it around
- The "Do Layout" button at the bottom will automatically restructure the visual map

- While it's possible to set the lower text fields to any text, you should match the data to what PowerUp expects:
    - Most fields require an integer.
    - An answer field that ends the scenario must be a negative integer if it should start a minigame
    - or a non-integer character (currently "$") to go directly to the clear screen

## Linking

- Creating a new node automatically links the parent to child
- Click and drag on a link or a node to re-link the record
    - Answers can have only one link in and one link out
        - Delete any existing links before attempting to re-link
    - Questions can have multiple entry points and multiple answers
    - Links can not be made if it would create a potential infinite loop
- Creating a link will automatically update the appropriate QuestionID and NextQID 
properties of adjacent records.
    - Manually edit those values at your own risk.

## Save, Load, Export

- Clicking "Save" will download a file to your downloads folder.
    - It's just a text file storing the JSON information for your current workspace
- To load a file, click "Open" to open a finder and select the appropriate text file.
- Clicking either export button will download a CSV ready to be used with PowerUp.

## Notable Changes

- Instead of listing question and answer IDs sequentially, this tool assigns an ID range beginning with 1000 * the scenario ID assigned in the starting question. This will help make the database more human-readable, and also allows us to expand the scenarios without having to re-number everything or introduce unnecessary confusion.
    - Simply assign the Scenario ID in the starting question and click to add the first node. As long as you do not change the scenario ID again, this tool will handle the rest.
- This tool will not allow links that could create potential infinite loops.