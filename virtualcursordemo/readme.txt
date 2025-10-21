The purpose of this demo is to help others on this project understand how the virtual cursor works, and how we can implement it within our UI.

This demo requires access to your webcam along with Node.js to be installed on your device.
in the terminal, please run 'npm i' within the directory you have saved the demo to install the dependency.

This demo uses mediapipe to track the fingertip of your pointer finger on either hand and create a virtual cursor.

Currently, the virtual cursor is a blue dot.

On the page, there are 2  buttons that say 'click me!'. When clicked, they move to random spots on the page.

To interact with these elements using the virtual cursor, simply hover over them. After 1 second of hovering, it will click!

Please be sure to utilize the z-index as shown in the style sheet to place elements above the camera.

As of 10/13, any interactible(clickable) elements added to the page will work.
