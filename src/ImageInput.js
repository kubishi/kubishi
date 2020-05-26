import React from 'react';

import { Form, InputGroup, Button, Image } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { toBase64 } from './helpers';

class ImageInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            image: {
                data: null,
                record: false
            }
        };
    }

    removeImage() {
        this.setState({image: {filename: null, data: null}}, () => {
            this.props.onSave(this.state.image);
        });
    }

    addImage(file) {
        toBase64(file).then(res => {
            this.setState({image: {data: res, filename: file.name}}, () => {
                this.props.onSave(this.state.image);
            });
        }).catch(err => console.error(err));
    }

    render() {
        let { image } = this.state;
        let removeImageButton;
        if (image.data != null) {
            removeImageButton = (
                <InputGroup.Prepend>
                    <Button onClick={() => this.removeImage()} variant='outline-danger'>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </InputGroup.Prepend>
            );
        }
        
        let imageSquare;
        if (image != null && image.data != null) {
            imageSquare = [<br />, <Image src={image.data} rounded style={{maxHeight: '20vh', maxWidth: '100%'}} />];
        }

        return (
            <Form.Group controlId={`form-sentence-image-${this.props.key || "new"}`}>
                <Form.Label>Image</Form.Label>
                {imageSquare}                   
                <InputGroup className="mb-3">
                    {removeImageButton}
                    
                    <Form.File 
                        id={`form-file-sentence-image-${this.props.key || "new"}`}
                        accept='image/*'
                        label={image.filename || "Image"}
                        onChange={e => this.addImage(e.target.files[0])}
                        custom
                    />
                </InputGroup>
            </Form.Group>
        );
    }
};

export default ImageInput;
