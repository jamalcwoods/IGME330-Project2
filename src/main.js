
let audioElement = document.querySelector('audio');
let audioCtx = new (window.AudioContext || window.webkitAudioContext);
let sourceNode = audioCtx.createMediaElementSource(audioElement); 

let analyserNode = audioCtx.createAnalyser();

let filteredAnalyserNode = audioCtx.createAnalyser();

var filter = audioCtx.createBiquadFilter()
filter.frequency.setValueAtTime(100, audioCtx.currentTime);
filter.type = "lowpass";



sourceNode.connect(filter)
filter.connect(filteredAnalyserNode)

sourceNode.connect(analyserNode)
filter.connect(audioCtx.destination);

let data = new Uint8Array(analyserNode.frequencyBinCount);
let filteredData = new Uint8Array(filteredAnalyserNode.frequencyBinCount);

document.querySelector("audio").onplay = (e) => {
    if (audioCtx.state == "suspended") {
        audioCtx.resume();
    }
};


let ctx = document.querySelector("canvas").getContext("2d");

let counter = 0;
let beat = false

update()

function update(){
    requestAnimationFrame(update);
    analyserNode.getByteFrequencyData(data);
    filteredAnalyserNode.getByteFrequencyData(filteredData);

    let pos = Math.abs(ctx.canvas.width * Math.sin(counter))

    let val = 0;
    for(let b of data){
        val += b
    }
    val /= data.length

    let filteredval = 0
    for(let b of filteredData){
        filteredval += b
    }
    filteredval /= filteredData.length

    
    if(filteredval > 5){
        if(!beat){
            beat = true
            console.log(filteredData)
        }
    } else if(beat){
        beat = false
    }

    counter += val/(255 * 4)

    clear(ctx)
    ctx.save()
    ctx.arc(pos,ctx.canvas.height/2, val, 0, 2 * Math.PI);
    ctx.stroke()
    ctx.restore();


}

function clear(){
    ctx.save()
    ctx.fillStyle = "white"
    ctx.fillRect(0,0,640,480)
    ctx.fill()
    ctx.restore();
}