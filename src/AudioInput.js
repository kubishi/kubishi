import React from 'react';

import { Form, InputGroup, Button } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faTrash, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

import { ReactMic } from 'react-mic';
import { toBase64 } from './helpers';

class AudioPlayButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playing: false
        }
        this.audio = new Audio(this.props.src);
        this.audio.addEventListener('ended', () => this.setState({ playing: false }));
        this.audio.addEventListener('pause', () => this.setState({ playing: false }));
    }

    render() {
        let { playing } = this.state;
        return (
            <Button onClick={e => {
                let { playing } = this.state;
                if (playing) {
                    this.audio.pause();
                } else {
                    this.audio.play().then(() => this.setState({ playing: true }));
                }
            }} >
                <FontAwesomeIcon icon={playing ? faPause : faPlay} />
            </Button>
        );   
    }
};

class AudioInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            record: false,
            audio: {
                data: null,
                filename: false
            }
        };
    }

    onStop(recordedBlob) {
        let reader = new FileReader();
        reader.readAsDataURL(recordedBlob.blob); // converts the blob to base64 and calls onload
        reader.onload = () => {
            this.setState({audio: {filename: 'output.mp3', data: reader.result}}, () => {
                this.props.onSave(this.state.audio);
            });
        };
    }
        
    toggleRecording = () => {
        let { record } = this.state;
        this.setState({ record: !record });
    }

    removeRecording() {
        if (window.confirm('Are you sure you want to remove the recording?')) {
            this.setState({audio: {filename: null, data: null}}, () => {
                this.props.onSave(this.state.audio);
            });
        }
    }

    render() {
        let { audio, record } = this.state;
        let removeAudioButton;
        if (audio.data != null) {
            removeAudioButton = (
                <InputGroup.Prepend>
                    <Button onClick={() => this.removeRecording()} variant='outline-danger'>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </InputGroup.Prepend>
            );
        }

        let recordAudioButton;
        if (audio.data == null) {
            recordAudioButton = (
                <InputGroup.Prepend>
                    <Button onClick={() => this.toggleRecording()} variant={record ? 'outline-danger' : 'outline-primary'}>
                        <FontAwesomeIcon icon={record ? faStop : faMicrophone} />
                    </Button>
                </InputGroup.Prepend>
            );
        }
        
        let audioPlayer;
        if (audio.data != null) {
            audioPlayer = (
                <InputGroup.Prepend>
                    <AudioPlayButton src={audio.data} />
                </InputGroup.Prepend>
            );
        }

        return (
            <Form.Group controlId='audio-input'>
                <Form.Label>Audio</Form.Label>
                <ReactMic
                    record={record}
                    className="d-none"
                    mimeType="audio/mp3"
                    onStop={blob => this.onStop(blob)}
                />                    
                <InputGroup className="mb-3">
                    {audioPlayer}
                    {removeAudioButton}
                    {recordAudioButton}
                    <Form.File 
                        id={'audio-input-form'}
                        accept='audio/*'
                        label={audio.filename || "Sentence audio"}
                        onChange={e => {
                            let file = e.target.files[0];
                            toBase64(file).then(res => {
                                this.setState({audio: {filename: file.name, data: res}}, () => {
                                    this.props.onSave(this.state.audio);
                                });
                            }).catch(err => console.error(err));
                        }}
                        custom
                    />
                </InputGroup>
            </Form.Group>
        );
    }
};

export default AudioInput;
