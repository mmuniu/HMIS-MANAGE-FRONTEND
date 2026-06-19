let speechRecognitionVariable = null;
try {
    speechRecognitionVariable = SpeechRecognition || window.SpeechRecognition || webkitSpeechRecognition || window.webkitSpeechRecognition;
} catch (e) {
    console.log("This browser does not support SpeechRecognition");
}

export default class STT {
    init() {
        return new speechRecognitionVariable();
    }
}
