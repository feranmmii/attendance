
const video = document.querySelector('#vid')
const maleTotal = document.querySelector('#maleTotal')
const femaleTotal = document.querySelector('#femaleTotal')
const event_btn = document.querySelector('#start-event')
const event_content = document.querySelector('#event-content')


let maleCount = 0
let femaleCount = 0
const faces = []


event_btn.onclick = strt
    
   function strt (){
    console.log('inside')
    event_btn.classList.add('hidden')
    event_content.classList.remove('hidden')
    startapp()
}


function startapp(){
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models")
    ]).then(connect_to_webcam)
}


function connect_to_webcam(){
    
    const constraints = {
    'video': true,
    'audio': false
}
navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        window.stream = stream
        video.srcObject = stream
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    })
    
}


video.addEventListener('playing', ()=>{
    const canvas = document.querySelector('#canvas')
    
    const displaySize = {width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withAgeAndGender()
            .withFaceDescriptors()
            
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height)
        
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        
        let newFace = resizedDetections[0].descriptor
        
        isInputed = check_for_face(newFace)
        
        if (isInputed){
            if (resizedDetections[0].gender === 'male'){
                maleCount++
                maleTotal.innerHTML = `${maleCount}`
            }
            else if(resizedDetections[0].gender === 'female'){
                femaleCount++
                femaleTotal.innerHTML = `${femaleCount}`
            }
        }
        
    }, 100)
})


function check_for_face(face){
    if (faces.length === 0){
        faces.push(face)
        return true
    }
    
    let check = false
    for(let i = 0; i < faces.length; i++){
        if (faceapi.euclideanDistance(face, faces[i]) > 0.4){
            check = true
            console.log(faceapi.euclideanDistance(face, faces[i]))
            
        }
        
    }
    
    if (check === true){
        faces.push(face)
        return true
    }
    else{
        return false
    }
}