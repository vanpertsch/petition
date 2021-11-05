(function () {

    console.log("connected");
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    // Variables to keep track of the mouse position and left-button status
    var mouseX, mouseY, mouseDown = 0;

    var dataURL;

    canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
    canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
    window.addEventListener('mouseup', sketchpad_mouseUp, false);


    // Draws a dot at a specific position on the supplied canvas name
    // Parameters are: A canvas context, the x position, the y position, the size of the dot
    function drawDot(ctx, x, y, size) {
        // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
        r = 0; g = 0; b = 0; a = 255;

        // Select a fill style
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";

        // Draw a filled circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    function clearCanvas(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }



    // Keep track of the mouse button being pressed and draw a dot at current location
    function sketchpad_mouseDown() {
        mouseDown = 1;
        drawDot(ctx, mouseX, mouseY, 2);
    }

    // Keep track of the mouse button being released
    function sketchpad_mouseUp() {
        mouseDown = 0;
        dataURL = canvas.toDataURL();
        console.log(dataURL);
        const hiddenField = document.getElementById("hiddenfield");
        hiddenField.value = dataURL;

    }

    // Keep track of the mouse position and draw a dot if mouse button is currently pressed
    function sketchpad_mouseMove(e) {
        // Update the mouse co-ordinates when moved
        getMousePos(e);

        // Draw a dot if the mouse button is currently being pressed
        if (mouseDown == 1) {
            drawDot(ctx, mouseX, mouseY, 2);

        }
    }

    // Get the current mouse position relative to the top-left of the canvas
    function getMousePos(e) {

        if (e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
        else if (e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
    }

})();

