
let audioElement = document.querySelector('audio');
let audioCtx = new (window.AudioContext || window.webkitAudioContext);
let sourceNode = audioCtx.createMediaElementSource(audioElement); 

let analyserNode = audioCtx.createAnalyser();


sourceNode.connect(analyserNode)
analyserNode.connect(audioCtx.destination);

let data = new Uint8Array(analyserNode.frequencyBinCount);

document.querySelector("audio").onplay = (e) => {
    if (audioCtx.state == "suspended") {
        audioCtx.resume();
    }
};

let beatSectionCount = 20;
let beatSections = []
for(var i = 0; i < beatSectionCount; i ++){
    beatSections.push(0)
}

let ctx = document.querySelector("canvas").getContext("2d");

update();


function update(){
    requestAnimationFrame(update);
    analyserNode.getByteFrequencyData(data);

    caluclateBeatSections(data)
    let val = 0;
    for(let b of data){
        val += b
    }
    val /= data.length


    ctx.save()
    ctx.fillStyle = "white"
    ctx.fillRect(0,0,640,480)

    ctx.beginPath()
    for(var i = 0; i < beatSectionCount;i++){
        var gapSize = (ctx.canvas.width/(beatSectionCount + 1))
        ctx.arc(ctx.canvas.width - (gapSize * (i+1)),ctx.canvas.height/2,(gapSize * (beatSections[i]/255)), 0, 2 * Math.PI);
    }
    ctx.fillStyle = "red"
    ctx.fill();
    ctx.restore();
}

function caluclateBeatSections(data){
    for(var x = 0; x < beatSectionCount; x++){
        let val = 0 
        let count = 0;
        //console.log(255 * (x/(beatSectionCount + 1)),255 * ((x+1)/(beatSectionCount + 1)))
        for(var i in data){
            if(i >= 255 * (x/(beatSectionCount)) && i <= 255 * ((x+1)/(beatSectionCount))){
                val += data[i]
                count++
            }
        }
        if(count != 0){
            val /= count
        }
        beatSections[x] = val;
    }
}
