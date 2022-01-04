(function () {

    console.log("connected");
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var dataURL;

    $("#canvas").mousedown((e) => {
        ctx.moveTo(e.offsetX, e.offsetY);
        ctx.beginPath();

        $("#canvas").mousemove((e) => {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        });

        $("#canvas").mouseup(() => {
            dataURL = canvas.toDataURL();
            const hiddenField = document.getElementById("hiddenfield");
            hiddenField.value = dataURL;

            $("#canvas").off("mousemove");
        });
    });


})();


