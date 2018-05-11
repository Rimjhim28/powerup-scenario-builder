Live Demo:

https://rawgit.com/justKD/powerup-scenario-planner/master/index.html

## Basic Use

- Click the + icon to add a new child node
- Double-click on text to edit
- Hitting enter starts a new line, click off of the text box to close the editor and save the value
- Italicized text are the property names and can not be edited 
- Delete a node or link by selecting it and hitting your delete key
- Select and drag a node to move it around
- The "Do Layout" button at the bottom will automatically restructure the visual map

## Linking

- Creating a new node automatically links the parent to child
- Click and drag on a link or a node to re-link the record
    - Answers can have only one link in and one link out
        - Delete any existing links before attempting to re-link
    - Questions can have multiple entry points and multiple answers
    - Links can not be made if it would create a potential infinite loop

## Save and Load

- Clicking "Save" will download a file to your downloads folder.
    - It's just a text file storing the JSON information for your current workspace
- To load a file, click "Open" to open a finder and select the appropriate text file.