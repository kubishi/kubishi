import React from 'react';

import { 
    Row, Col
  } from 'react-bootstrap';

function About(props) {
    return (
        <Row className='text-center mt-3'>
            <Col>
                <h3><a href='/word/5eacb4f3dca21c60a0a90dde'>Kubishi</a> means brain in <a href='/word/5eacb4f7dca21c60a0a91b42'>nanüümüyadohana</a></h3>
                <p>
                    This website is an unofficial online dictionary for the Owen's Valley Paiute Language.
                    It was created and is maintained by <a href='https://jaredraycoleman.com'>Jared Coleman</a>, member of the <a href='http://bigpinepaiute.org'>Big Pine Paiute Tribe of the Owen's Valley</a>.
                </p>
            </Col>
        </Row>
    );
}

export default About;