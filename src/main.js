
let audioElement = document.querySelector('audio');
let audioCtx = new (window.AudioContext || window.webkitAudioContext);
let sourceNode = audioCtx.createMediaElementSource(audioElement); 

let highshelf = false;
let lowshelf = false;
let distortion = false;
let analyserNode = audioCtx.createAnalyser();

let filteredAnalyserNode = audioCtx.createAnalyser();

let biquadFilter = audioCtx.createBiquadFilter();
biquadFilter.type = "highshelf";

let lowShelfBiquadFilter = audioCtx.createBiquadFilter()
lowShelfBiquadFilter.type = "lowshelf";

let distortionFilter = audioCtx.createWaveShaper();

let distortionAmount = 0;


sourceNode.connect(biquadFilter)
biquadFilter.connect(lowShelfBiquadFilter)
lowShelfBiquadFilter.connect(distortionFilter)
distortionFilter.connect(analyserNode)
analyserNode.connect(audioCtx.destination);

let data = new Uint8Array(analyserNode.frequencyBinCount);
let filteredData = new Uint8Array(filteredAnalyserNode.frequencyBinCount);

document.querySelector("audio").onplay = (e) => {
    if (audioCtx.state == "suspended") {
        audioCtx.resume();
    }
};


let ctx = document.querySelector("canvas").getContext("2d");

setupUI();
update();

function update(){
    requestAnimationFrame(update);
    analyserNode.getByteFrequencyData(data);
    filteredAnalyserNode.getByteFrequencyData(filteredData);

    

    let val = 0;
    for(let b of data){
        val += b
    }
    val /= data.length
    

    clear(ctx)
    ctx.save()
    ctx.arc(ctx.canvas.width/2,ctx.canvas.height/2 - (ctx.canvas.height/2 * (val/255)), val, 0, 2 * Math.PI);
    ctx.arc(ctx.canvas.width/2,ctx.canvas.height/2 + (ctx.canvas.height/2 * (val/255)), val, 0, 2 * Math.PI);
    ctx.arc(ctx.canvas.width/2 - (ctx.canvas.width/2 * (val/255)),ctx.canvas.height/2, val, 0, 2 * Math.PI);
    ctx.arc(ctx.canvas.width/2 + (ctx.canvas.width/2 * (val/255)),ctx.canvas.height/2, val, 0, 2 * Math.PI);
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

function setupUI(){
   
    document.querySelector('#highshelfCB').checked = highshelf; 
   
    document.querySelector('#highshelfCB').onchange = e => {
        highshelf = e.target.checked;
        toggleHighshelf(); 
    };
    
    
    toggleHighshelf(); 
    
    document.querySelector('#lowshelfCB').checked = lowshelf;

    document.querySelector('#lowshelfCB').onchange = e => {
        lowshelf = e.target.checked;
        toggleLowshelf(); 
    };

    toggleLowshelf()

    document.querySelector('#distortionSlider').value = distortionAmount;
    document.querySelector('#distortionSlider').onchange = e => {
        distortionAmount = e.target.value;
    };

    document.querySelector('#distortionCB').checked = distortion;
    document.querySelector('#distortionCB').onchange = e => {
        distortion = e.target.checked;
        toggleDistortion();
    };

    toggleDistortion();
}

function toggleHighshelf(){
    if(highshelf){
        biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); 
        biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
    }else{
        biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

function toggleLowshelf(){
    if(lowshelf){
        lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    }else{
        lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

function toggleDistortion(){
    if(distortion){
        distortionFilter.curve = null; 
        distortionFilter.curve = makeDistortionCurve(distortionAmount);
    }else{
        distortionFilter.curve = null;
    }
}


function makeDistortionCurve(amount=20) {
    let n_samples = 256, curve = new Float32Array(n_samples);
    for (let i =0 ; i < n_samples; ++i ) {
        let x = i * 2 / n_samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}