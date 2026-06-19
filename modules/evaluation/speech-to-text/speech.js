$(document).ready(function(){
    var audio_context;
    var recorder;
    var audio_stream;
    let audio_format = "audio/aac";
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();
    let error = '';
    let runtimeTranscription = '';
    let historyTranscription = '';
    let toggle = false;
    let speaking = false;
    let lang = 'end-US';
    let item_id = '';
    let start = false;//check to see if the recording started

    // check speech recognition of browser
    checkCompatibility();

    // check speech recording of browser
    Initialize();


    /*
        Start recording
     */
    $('.record-btn').click(function (e) {
        e.preventDefault();

        if(!start){
            toggle ? endSpeechRecognition() : startSpeechRecognition();
            startRecording();
        }

        if ($(this).css("background-color") === "rgb(220, 71, 53)") {
            $(this).css("background-color", "grey");
            $(this).find($(".fa")).removeClass('fa-microphone').addClass('fa-microphone-slash');

            if(start) {
                pauseRecording();
                endSpeechRecognition();
            }
        }

        else {
            // $(this).toggleClass('btn-clicked');
            $(this).css("background-color", "#dc4735");
            $(this).find($(".fa")).removeClass('fa-microphone-slash').addClass('fa-microphone');
            if(start) {
                try {
                    continueRecording();
                    startSpeechRecognition();
                }
                catch (err) {

                }
            }

        }
        console.log(toggle);
        item_id = $(this).attr('data-value');
    });

    function checkCompatibility () {
        if (!recognition) {
            error = 'Speech Recognition is not available on this browser. Please use Chrome or Firefox';
            postRecordingStatus(error);
        }
        console.log(error);
    }

    function postRecordingStatus(str){
        $(".recording-status[data-value="+item_id+"]").html("");
        $(".recording-status[data-value="+item_id+"]").append(str);
    }

    function postRecognitionStatus(str){
        $(".recognition-status[data-value="+item_id+"]").html("");
        $(".recognition-status[data-value="+item_id+"]").append(str);
    }

    function startSpeechRecognition() {
        if (!recognition) {
            error = 'Speech Recognition is not available on this browser. Please use Chrome or Firefox';
            postRecognitionStatus(error);
            return false;
        }
        toggle = true;
        recognition.lang = lang;
        recognition.interimResults = true;
        let recognizing = false;
        recognition.onstart = function () {
            postRecognitionStatus("Speech recognition started");
            recognizing = true;
        };

        recognition.onend = function () {
            postRecognitionStatus("Speech recognition ended");
            recognizing = false;
        };
        //
        // recognition.onerror = function (event) {
        //     recognizing = false;
        // }

        recognition.addEventListener('speechstart', event => {
            postRecognitionStatus("Speech detected");
            console.log('start');
            speaking = true;
        });

        recognition.addEventListener('speechend', event => {
            postRecognitionStatus("Speech detection timeout");
            console.log('s end');
            speaking = false;
        });

        recognition.addEventListener('result', event => {
            const text = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('');
            runtimeTranscription = text;
            historyTranscription += text;
            console.log(runtimeTranscription);
        });

        recognition.addEventListener('end', () => {
            postRecognitionStatus("Speech Recognition Ended");
            console.log('end');
            if (runtimeTranscription !== '') {
                // sentences.push(capitalizeFirstLetter(runtimeTranscription));
                $('textarea[data-value=' +item_id+']').redactor().insertHtml("<span>"+runtimeTranscription+"</span>");
            }
            runtimeTranscription = '';
            recognition.stop();
            if (toggle) {
                if (!recognizing) {
                    try {
                        recognition.start();
                    }
                    catch (e) {

                    }
                }
            }
        });
        console.log('s start');
        if (!recognizing) {
            try {
                recognition.start();
            }
            catch (e) {

            }
        }
    }
    function endSpeechRecognition () {
        recognition.stop();
        toggle = false;
    }


    function Initialize() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
            window.URL = window.URL || window.webkitURL;
            audio_context = new AudioContext;
            console.log('Audio context is ready !');
            console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
        } catch (e) {
            postRecordingStatus("No web audio support in this browser!");
            alert('No web audio support in this browser!');
        }
    }

    function startRecording() {
        start = true;
        navigator.getUserMedia({ audio: true }, function (stream) {
            audio_stream = stream;
            var input = audio_context.createMediaStreamSource(stream);
            console.log('Media stream succesfully created');

            // Initialize the Recorder Library
            recorder = new Recorder(input);
            console.log('Recorder initialised');

            // Start recording !
            recorder && recorder.record();
            postRecordingStatus("Recorder initialised");
            postRecordingStatus("Recording .....");
            console.log('Recording...');
        }, function (e) {
            console.error('No live audio input: ' + e);
        });
    }
    $('.stop-btn').click(function (e) {
        e.preventDefault();
        postRecordingStatus("Stopped recording audio");
        console.log('Stopped p recording.');
        if(start) {
            finish_recording();//pauseRecording();
            $(".record-btn[data-value=" + item_id + "]").css("background-color", "grey");
            $(".record-btn[data-value=" + item_id + "]").find($(".fa")).removeClass('fa-microphone').addClass('fa-microphone-slash');
        }
    });

    $('.remove-btn').click(function (e) {
        e.preventDefault();
        $(".div_audio[data-value="+item_id+"]").html('');
        $(".remove-btn[data-value="+item_id+"]").hide();
        postRecognitionStatus("");
        postRecordingStatus("");
    });

    function pauseRecording(){
        recorder.stop();
        postRecordingStatus("Paused recording audio");
    }

    function continueRecording(){
        recorder.record();
        postRecordingStatus("Continued recording audio");
    }
    function stopRecording(callback, AudioFormat) {
        // Stop the recorder instance
        recorder && recorder.stop();
        console.log('Stopped recording.');
        audio_stream.getAudioTracks()[0].stop();
        if(typeof(callback) == "function"){
            recorder && recorder.exportWAV(function (blob) {
                callback(blob);
                recorder.clear();
            }, (AudioFormat || audio_format));
        }
    }

    function finish_recording(){
        start = false;
        postRecordingStatus("Stopped Recording audio");
        endSpeechRecognition();
        var _AudioFormat = audio_format;
        $(".remove-btn[data-value="+item_id+"]").show();
        stopRecording(function(AudioBLOB){
            audio_blob[item_id] = AudioBLOB;
            var url = URL.createObjectURL(AudioBLOB);
            var au = document.createElement('audio');
            au.controls = true;
            au.src = url;
            $(".div_audio[data-value="+item_id+"]").html('');
            $(".div_audio[data-value="+item_id+"]").append(au);
            postRecognitionStatus("");
            postRecordingStatus("");
        }, _AudioFormat);
    }

});
