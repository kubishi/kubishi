import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Dropdown, DropdownButton, Form, Image, InputGroup } from 'react-bootstrap';
import { toBase64 } from './helpers';

class ImageInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            image: {
                data: null,
                filename: null
            },
            urlMode: true
        };
    }

    removeImage() {
        this.setState({image: {filename: null, data: null}}, () => {
            this.props.onSave(this.state.image);
        });
    }

    addImage(file, isFile = false) {
        if (isFile) {
            toBase64(file).then(res => {
                this.setState({image: {data: res, filename: file.name}}, () => this.props.onSave(this.state.image));
            }).catch(err => console.error(err));
        } else {
            this.setState({ image: file }, () => this.props.onSave(this.state.image));
        }
    }

    render() {
        let { image, urlMode } = this.state;
        let prefix;
        if (image.data != null) {
            prefix = (
                <InputGroup.Prepend>
                    <Button onClick={() => this.removeImage()} variant='outline-danger'>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </InputGroup.Prepend>
            );
        } else {
            prefix = ( 
                <DropdownButton
                    as={InputGroup.Prepend}
                    variant="outline-primary"
                    title={urlMode ? "URL" : "File"}
                    id="image-type-dropdown"
                >
                    <Dropdown.Item href="#" onClick={e => this.setState({ urlMode: true })}>
                        URL
                    </Dropdown.Item>
                    <Dropdown.Item href="#" onClick={e => this.setState({ urlMode: false })}>
                        File
                    </Dropdown.Item>
                </DropdownButton>
            );
        }

        let imageControl;
        if (urlMode) {
            imageControl = (  
                <Form.Control
                    type="text"
                    placeholder="URL"
                    value={image.data}
                    onChange={e => this.addImage({ filename: 'online', data: e.target.value })}
                />
            );
        } else {
            imageControl = (
                <Form.File 
                    id={`form-file-sentence-image-${this.props.key || "new"}`}
                    accept='image/*'
                    label='Image'
                    onChange={e => this.addImage(e.target.files[0], true)}
                    custom
                />
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
                    {prefix}
                    {imageControl}
                </InputGroup>
            </Form.Group>
        );
    }
};

export default ImageInput;
