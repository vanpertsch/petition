(() => {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    //body
    ctx.beginPath();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = "5";
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 20);
    ctx.stroke();
});
