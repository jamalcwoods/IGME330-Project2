
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
//Controls

let beatSectionCount = 5;
let beatSections = []
let color1 = "#000000",color2 = "#ffffff"
let ctx = document.querySelector("canvas").getContext("2d");

update();



document.querySelector("#frequencySectionAmount").addEventListener("input",function(e){
    beatSectionCount = parseInt(e.target.value)
    document.querySelector("#frequencySphereInd").innerHTML = "Number of Frequency Spheres: " + e.target.value
})

document.querySelector("#color1").addEventListener("input",function(e){
    color1 = e.target.value
})

document.querySelector("#color2").addEventListener("input",function(e){
    color2 = e.target.value
})


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
    var gradient1 = ctx.createLinearGradient(ctx.canvas.width/2,ctx.canvas.height/2,ctx.canvas.width/2,0);
    gradient1.addColorStop(0, color1);
    gradient1.addColorStop(val/255, color2);
    gradient1.addColorStop(1- val/255, color1);
    gradient1.addColorStop(1, color2);

    var gradient2 = ctx.createLinearGradient(ctx.canvas.width/2,ctx.canvas.height/2, ctx.canvas.width/2,ctx.canvas.height);
    gradient2.addColorStop(0, color1);
    gradient2.addColorStop(val/255, color2);
    gradient2.addColorStop(1- val/255, color1);
    gradient2.addColorStop(1, color2);
    
    ctx.fillStyle = gradient1
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height/2)

    ctx.fillStyle = gradient2
    ctx.fillRect(0,ctx.canvas.height/2,ctx.canvas.width,ctx.canvas.height)

    for(var i = 0;i <  data.length; i++){
        var y = ctx.canvas.height - ((ctx.canvas.height/data.length) * (i+1))
        var x1 = (ctx.canvas.width/2) - ((ctx.canvas.width/4) *  data[i]/255)
        var x2 = (ctx.canvas.width/2) + ((ctx.canvas.width/4) *  data[i]/255)
        ctx.beginPath();
        ctx.moveTo(x1,y)
        ctx.lineTo(x2,y)
        ctx.stroke()
    }

    ctx.beginPath()
    for(var i = 0; i < beatSectionCount;i++){
        var gapSize = (ctx.canvas.width/(beatSectionCount + 1))
        ctx.arc(ctx.canvas.width - (gapSize * (i+1)),ctx.canvas.height/2,(gapSize * (beatSections[i]/255)), 0, 2 * Math.PI);
    }

    
    
    
    ctx.fillStyle = color2
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
