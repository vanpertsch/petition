(function () {

    const canvas = document.getElementById("canvas");
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let mouseX, mouseY, mouseDown, dataURL = 0;

        canvas.addEventListener('mousedown', canvas_mouseDown);
        canvas.addEventListener('mousemove', canvas_mouseMove);
        window.addEventListener('mouseup', canvas_mouseUp);

        // add touch events
        // canvas.addEventListener("touchstart", canvas_mouseDown);
        // canvas.addEventListener("touchmove", canvas_mouseMove);
        // canvas.addEventListener("touchend", canvas_mouseUp);

        // Get the current mouse position relative to the top-left of the canvas
        function getMousePos(canvas, e) {

            var rect = canvas.getBoundingClientRect();

            mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
            mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

        }

        // Keep track of the mouse button being pressed and draw a dot at current location
        function canvas_mouseDown(e) {
            mouseDown = 1;
            ctx.moveTo(mouseX, mouseY);
            ctx.beginPath();

        }

        // Keep track of the mouse button being released
        function canvas_mouseUp() {
            mouseDown = 0;
            dataURL = canvas.toDataURL();
            const hiddenField = document.getElementById("hiddenfield");
            hiddenField.value = dataURL;
        }

        function canvas_mouseMove(e) {
            // Update the mouse co-ordinates when moved
            getMousePos(canvas, e);

            // Draw a dot if the mouse button is currently being pressed
            if (mouseDown == 1) {
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
            }
        }
    }

})();
