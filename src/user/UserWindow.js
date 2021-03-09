
import React from 'react';
import { Button, Col, Image, Row, Spinner, H4 } from 'react-bootstrap';
import '../common/common.css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dateformat from 'dateformat';
import history from '../common/history';
import api from '../Api';


class UserWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    deleteUser() {
        let user = this.props.getUser();
        if (this.props.onDelete != null && window.confirm('Are you sure you want to delete your account?')) {
            api.delete(`/api/users/${user.ids[0]}`).then(res => {
                if (res.status == 200) {
                    this.props.onDelete();
                    history.push("/");
                } else {
                    console.log(res.status, res.data);
                }
            }).catch(err => {
                console.error(err);
            });
        }
    }

    render() {
        let user = this.props.getUser();
        
        console.log(user);

        if (!user || user == null) {
            return (
                <Row>
                    <Col sm={0} lg={3}></Col>
                    <Col sm={12} lg={6} className='mt-2'>
                        <h4>You are not logged in!</h4>
                    </Col>
                    <Col sm={0} lg={3}></Col>
                </Row>
            );
        }

        return (
            <>
                <Row>
                    <Col sm={0} lg={3}></Col>
                    <Col sm={12} lg={6} className='mt-2'>
                        <h4>{user.name}</h4>
                        <h6><b>Joined: </b>{dateformat(user.created, "mmmm dS, yyyy, h:MM:ss TT")}</h6>
                        <h6><b>Role: </b>{user.type}</h6>
                        <h6><b>Groups: </b>{user.groups || "None"}</h6>

                        <Button onClick={e => this.deleteUser()} variant="outline-danger" block>    
                            <FontAwesomeIcon icon={faTrash} className='mr-2' />
                            Delete Account
                        </Button>
                    </Col>
                    <Col sm={0} lg={3}></Col>
                </Row>
            </>
        );
    }
}

export default UserWindow;