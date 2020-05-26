import React from 'react';

import { Form, InputGroup, Button } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { ReactMic } from 'react-mic';
import { toBase64 } from './helpers';

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
        this.setState({audio: {filename: null, data: null}}, () => {
            this.props.onSave(this.state.audio);
        });
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
        
        let audioPlayer;
        if (audio.data != null) {
            audioPlayer = [<br />, <audio src={audio.data} controls />];
        }

        return (
            <Form.Group controlId={`form-sentence-audio-${this.props.key || "new"}`}>
                <Form.Label>Audio</Form.Label>
                {audioPlayer}
                <ReactMic
                    record={record}
                    className="d-none"
                    mimeType="audio/mp3"
                    onStop={blob => this.onStop(blob)}
                />                    
                <InputGroup className="mb-3">
                    {removeAudioButton}
                    <InputGroup.Prepend>
                        <Button onClick={() => this.toggleRecording()} variant={record ? 'outline-danger' : 'outline-primary'}>
                            <FontAwesomeIcon icon={record ? faStop : faMicrophone} />
                        </Button>
                    </InputGroup.Prepend>
                    <Form.File 
                        id={`form-file-sentence-audio-${this.props.key || "new"}`}
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
