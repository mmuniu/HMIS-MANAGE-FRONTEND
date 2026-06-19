<template>
    <v-row >
        <v-col cols="12">
            <v-textarea
                    label="Results"
                    v-model="fr"
            >
            </v-textarea>
        </v-col>
        <v-col cols="12">
        <v-card>
            <v-card-text>
                <v-row  justify="space-around">
                    <v-col class="text-center" cols="8" sm="9" >

                        <p v-if="error" class="grey--text">{{error}}</p>
                        <p v-else class="mb-0">
                            <span v-if="sentences.length > 0">
                                <span v-for="(sentence, index) in sentences" :key="index">{{sentence}}. </span>
                            </span>
                            <span>{{runtimeTranscription}}</span>
                        </p>
                    </v-col>
                    <v-col class="text-center" cols="2" sm="1" >
                        <v-btn
                                dark
                                @click.stop="toggle ? endSpeechRecognition() : startSpeechRecognition()"
                                icon
                                :color="!toggle ? 'grey' : (speaking ? 'red' : 'red darken-3')"
                                :class="{'animated infinite pulse': toggle}"
                        >
                            <v-icon>{{toggle ? 'mic_off' : 'mic'}}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        </v-col>
    </v-row>
</template>

<script>
import STT from '@evaluation/libs/STT';

export default {
    props: {
        lang: {
            type: String,
            default: 'en-US',
        },
        text: {
            type: [String, null],
        },
    },
    data() {
        return {
            error: false,
            speaking: false,
            toggle: false,
            recognition: {},
            runtimeTranscription: '',
            historyTranscription: '',
            fr: '',
            sentences: [],
        };
    },
    methods: {
        checkCompatibility() {
            if (!this.recognition) {
                this.error = 'Speech Recognition is not available on this browser. Please use Chrome or Firefox';
            }
        },
        endSpeechRecognition() {
            this.recognition.stop();
            this.toggle = false;
            this.$emit('speechend', {
                sentences: this.sentences,
                text: this.sentences.join('. '),
            });
        },
        startSpeechRecognition() {
            if (!this.recognition) {
                this.error = 'Speech Recognition is not available on this browser. Please use Chrome or Firefox';
                return false;
            }
            this.toggle = true;
            this.recognition.lang = this.lang;
            this.recognition.interimResults = true;

            let recognizing = false;

            this.recognition.onstart = function() {
                recognizing = true;
            };

            this.recognition.onend = function() {
                recognizing = false;
            };
            //
            // this.recognition.onerror = function (event) {
            //     recognizing = false;
            // }

            this.recognition.addEventListener('speechstart', (event) => {
                console.log('start');
                this.speaking = true;
            });

            this.recognition.addEventListener('speechend', (event) => {
                console.log('s end');
                this.speaking = false;
            });

            this.recognition.addEventListener('result', (event) => {
                const text = Array.from(event.results).map((result) => result[0]).map((result) => result.transcript).join('');

                this.runtimeTranscription = text;
                this.historyTranscription += text;
                this.fr = '<p>'+this.historyTranscription+'</p>';
                console.log(this.runtimeTranscription);
            });

            this.recognition.addEventListener('end', () => {
                console.log('end');
                if (this.runtimeTranscription !== '') {
                    this.sentences.push(this.capitalizeFirstLetter(this.runtimeTranscription));
                    // this.$emit('update:text', `${this.text}${this.sentences.slice(-1)[0]}. `)
                }
                this.runtimeTranscription = '';
                this.recognition.stop();
                if (this.toggle) {
                    // keep it going.
                    if (!recognizing) {
                        this.recognition.start();
                    }
                }
            });
            console.log('s start');
            if (!recognizing) {
                this.recognition.start();
            }
        },
        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
    },

    created() {
        this.recognition = new STT().init();
    },

    mounted() {
        this.checkCompatibility();
    },

};
</script>

<style scoped>

</style>
