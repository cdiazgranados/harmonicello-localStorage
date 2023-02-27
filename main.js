let hertz = 440;
let waveform = "sine";
let sustain = false;
let instrument = "cello";
let defaultPreset = {
  hertz: 440,
  waveform: "sine",
  sustain: false,
  instrument: "cello",
};
let synths = {}; //holding frequency values of sustained pitches

let violinArr = ["E", "A", "D", "G"];
let bassArr = ["G", "D", "A", "E"];
let celloArr = ["A", "D", "G", "C"];

const toggle = document.querySelector(".toggle input");
toggle.addEventListener("click", toggleSustain);
const clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", clear);

function toggleSustain() {
  sustain = toggle.checked ? true : false;
}

function clear() {
  console.log("testing clear");

  for (const property in synths) {
    synths[property].stop();
  }

  for (let i = 0; i < 4; i++) {
    var element = document.getElementById(i);
    var children = element.children;
    for (let j = 0; j < children.length; j++) {
      var child = children[j];
      child.style.background = child.getAttribute("background-color");
      child.setAttribute("state", "off");
    }
  }
}

function getHertz() {
  hertz = document.getElementById("getHertz").value;

  drawGrid(hertz);

  document.getElementById("getHertz").setAttribute("value", hertz);
  console.log(document.getElementById("getHertz").value);
}

function getWaveform() {
  waveform = document.getElementById("waveform").value;
  drawGrid(hertz);
}

function getInstrument() {
  instrument = document.getElementById("instrument").value;
  changeStrings();
  drawGrid(hertz);
  console.log(instrument);
}

function changeStrings() {
  if (instrument == "violin") {
    document.getElementById("string-four").innerHTML = violinArr[3];
    document.getElementById("string-three").innerHTML = violinArr[2];
    document.getElementById("string-two").innerHTML = violinArr[1];
    document.getElementById("string-one").innerHTML = violinArr[0];
    console.log("changed to violin strings");
  }

  if (instrument == "viola" || instrument == "cello") {
    document.getElementById("string-four").innerHTML = celloArr[3];
    document.getElementById("string-three").innerHTML = celloArr[2];
    document.getElementById("string-two").innerHTML = celloArr[1];
    document.getElementById("string-one").innerHTML = celloArr[0];
    console.log("changed to cello/viola strings");
  }

  if (instrument == "bass") {
    document.getElementById("string-four").innerHTML = bassArr[3];
    document.getElementById("string-three").innerHTML = bassArr[2];
    document.getElementById("string-two").innerHTML = bassArr[1];
    document.getElementById("string-one").innerHTML = bassArr[0];
    console.log("changed to bass strings");
  }
}

function makeString(f) {
  return [f, f * 2, f * 3, f * 4, f * 5, f * 6, f * 7, f * 8];
}

function makeGrid(f) {
  //viola
  let string1 = f;
  let string2 = (string1 * (4 / 3)) / 2;
  let string3 = (string2 * (4 / 3)) / 2;
  let string4 = (string3 * (4 / 3)) / 2;

  if (instrument == "cello") {
    string1 = f/2;
    string2 = (string1 * (4 / 3)) / 2;
    string3 = (string2 * (4 / 3)) / 2;
    string4 = (string3 * (4 / 3)) / 2;
    console.log("makeGrid cello");
  } else if (instrument == "violin") {
    string2 = f;
    string1 = string2 * (3 / 2);
    string3 = (string2 * (4 / 3)) / 2;
    string4 = (string3 * (4 / 3)) / 2;
    console.log("makeGrid violin");
  } else if (instrument == "bass") {
    string3 = f / 4;
    string4 = (string3 * (3 / 2)) / 2;
    string2 = string3 * (4 / 3);
    string1 = string2 * (4 / 3);
    console.log("makeGrid bass");
  }

  return [
    makeString(string1),
    makeString(string2),
    makeString(string3),
    makeString(string4),
  ];
}

function drawGrid(f) {
  let notes = makeGrid(f);

  for (let i = 0; i < notes.length; i++) {
    var element = document.getElementById(i);
    var children = element.children;
    for (let j = 0; j < children.length; j++) {
      var child = children[j];
      child.setAttribute("data-note", notes[i][j]);
      child.setAttribute("state", "off");
      child.addEventListener("click", toggleSynth);
    }
  }
}

const audioCtx = new AudioContext();
audioCtx.suspend();

function toggleSynth(event) {
  let button = event.target;
  let frequency = button.getAttribute("data-note");
  if (button.getAttribute("state") == "off" && sustain == false) {
    console.log("testing no sustain");
    button.setAttribute("state", "on");
    button.style.background = "#00FF00";
    //have to create a new audio context for each note that is not sustained
    const audioCt = new AudioContext();
    let oscillatorNode = audioCt.createOscillator();
    let gainNode = audioCt.createGain();
    let output = audioCt.destination;
    oscillatorNode.connect(gainNode);
    gainNode.gain.setValueAtTime(0.1, audioCt.currentTime);
    //sounds like a marimba
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCt.currentTime + 3);
    gainNode.connect(output);
    oscillatorNode.frequency.value = frequency;
    oscillatorNode.type = waveform;
    oscillatorNode.start(0);
    oscillatorNode.stop(0.8);

    button.setAttribute("state", "off");
    button.style.background = button.getAttribute("background-color");
  } else if (button.getAttribute("state") == "off" && sustain == true) {
    button.setAttribute("state", "on");
    button.style.background = "#00FF00";
    let oscillatorNode = makeOscillator();
    oscillatorNode.start();
    oscillatorNode.type = waveform;
    oscillatorNode.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    synths[frequency] = oscillatorNode;
  } else {
    button.setAttribute("state", "off");
    button.style.background = button.getAttribute("background-color");
    synths[frequency].stop();
  }
  console.log(synths);

  audioCtx.resume();
}

function makeOscillator() {
  let oscillatorNode = audioCtx.createOscillator();
  let gainNode = audioCtx.createGain();
  let output = audioCtx.destination;

  oscillatorNode.connect(gainNode);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.connect(output);
  // oscillatorNode.start()

  return oscillatorNode;
}

drawGrid(hertz);


//*******
//LOCAL STORAGE CRUD OPERATIONS
//*******

//Create
  function createPreset() {
  let newTitle = document.getElementById("newPreset").value;
  if (newTitle == ""){
    alert("Please name your new preset")
  } else {  
  var presetList;
  if(localStorage.getItem("presetList") == null){
    presetList = [];
  } else {
    presetList = JSON.parse(localStorage.getItem("presetList"))
  }

  presetList.push({title : newTitle,
    hertz : hertz,
    sustain: sustain,
    waveform: waveform,
    instrument: instrument})



  localStorage.setItem("presetList", JSON.stringify(presetList))

}
}

//Read
function appendData() {
  var data = JSON.parse(localStorage.getItem("presetList"));
  var mainContainer = document.getElementById("presets");
  for (var i = 0; i < data.length; i++) {
    // console.log(JSON.stringify(data[i].title))
    // console.log(i);
    var option = document.createElement("option");
    option.setAttribute("value", i);
    var nod = document.createTextNode(data[i].title);
    option.appendChild(nod);
    mainContainer.appendChild(option);
  }
}

appendData();

//switch presets
  function usePreset() {
    let presetID = document.getElementById("presets").value;
    if (presetID == "default") {
          console.log("default selected");
          hertz = defaultPreset.hertz;
          document.getElementById("getHertz").setAttribute("value", hertz);
          document.getElementById("getHertz").value = hertz;
          instrument = defaultPreset.instrument;
          const $selectInstrument = document.querySelector("#instrument");
          $selectInstrument.value = instrument;
          changeStrings();
          waveform = defaultPreset.waveform;
          const $selectWaveform = document.querySelector("#waveform");
          $selectWaveform.value = waveform;
          sustain = defaultPreset.sustain;
          document.getElementById("checkbox").checked = sustain;
        } else {
    
    var data = JSON.parse(localStorage.getItem("presetList"));
    hertz = data[presetID].hertz;
    document.getElementById("getHertz").setAttribute("value", hertz);
    document.getElementById("getHertz").value = hertz;
    instrument = data[presetID].instrument.toString().toLowerCase();
    const $selectInstrument = document.querySelector("#instrument");
    $selectInstrument.value = instrument;
    changeStrings();
    waveform = data[presetID].waveform.toString().toLowerCase();
    const $selectWaveform = document.querySelector("#waveform");
    $selectWaveform.value = waveform;
    sustain = data[presetID].sustain;
    document.getElementById("checkbox").checked = sustain;

    drawGrid(hertz);
        }
  }

  //Update
  function updatePreset() {
    let presetID = document.getElementById("presets").value;
    let presetName = "";
    var data = JSON.parse(localStorage.getItem("presetList"));
    var presets = document.getElementById("presets");
    for (var i = 0; i < presets.length; i++) {
      var option = presets.options[i];
      if (option.value == presetID) {
        presetName = option.text;
      }
    }
    data[presetID].title = presetName;
    data[presetID].hertz = hertz;
    data[presetID].sustain = sustain;
    data[presetID].waveform = waveform;
    data[presetID].instrument = instrument;
  
    localStorage.setItem('presetList', JSON.stringify(data));
  
  }

  //Delete
  function deletePreset() {
  console.log("delete triggered");
  presetID = document.getElementById("presets").value;
  var data = JSON.parse(localStorage.getItem("presetList"));
  console.log(data.splice(presetID, 1));
  
  localStorage.setItem('presetList', JSON.stringify(data));

  //change this
  location.reload();
  location.reload();
}



