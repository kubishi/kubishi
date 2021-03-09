import React from 'react';
import { Row, Col } from 'react-bootstrap';

function Pronunciation(props) {
    return (
        <Col>
            <Row className='mt-3'>
                <Col>
                    <h4>Vowels</h4>
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col sm={12} md={6}>
                    <p><b>a</b> - as in English "father"</p>
                    <p><b>e</b> - as in English "bet"</p>
                    <p><b>i</b> - as in English "bee"</p>
                </Col>
                <Col sm={12} md={6}>
                    <p><b>o</b> - as in English "boat"</p>
                    <p><b>u</b> - as in English "boot"</p>
                    <p><b>ü</b> - as in English "put" but said with lips apart</p>
                </Col>
            </Row>
            
            <Row className='mt-3'>
                <Col>
                    <h4>Consonants</h4>
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col sm={12} md={6}>
                    <p><b>p</b> - as in English "pour"</p>
                    <p><b>t</b> - as in English "butter"</p>
                    <p><b>k</b> - as in English "kidding"</p>
                    <p><b>h</b> - as in English "house"</p>
                    <p><b>n</b> - as in English "banner"</p>
                    <p><b>w</b> - as in English "winter"</p>
                    <p><b>y</b> - as in English "yabber"</p>
                    <p><b>'</b> - as stop in air output like the 'space' in the middle of the expression "uh oh"</p>
                </Col>
                <Col sm={12} md={6}>
                    <p><b>b</b> - as in English "casaba" without lips touching</p>
                    <p><b>d</b> - as in English "body"</p>
                    <p><b>g</b> - as in English "giggle"</p>
                    <p><b>m</b> - as in English "mom"</p>
                    <p><b>s</b> - as in English "sassy"</p>
                    <p><b>w̃</b> - as in English "want" but with nasalization</p>
                    <p><b>hw</b> - as in English "which"</p>                
                </Col>
            </Row>
            
            <Row className='mt-3'>
                <Col>
                    <h4>Double Consonants</h4>
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col sm={12} md={6}>
                    <p><b>ts</b> - as in English "hats"</p>
                    <p><b>dz</b> - as in English "cods"</p>
                    <p><b>j</b> - as in English "job"</p>
                    <p><b>ng</b> - as in English "singer"</p>
                    <p><b>gw</b> - as in English "iguana"</p>
                </Col>
                <Col sm={12} md={6}>
                    <p><b>ch</b> - as in English "chores"</p>
                    <p><b>z</b> - as in English "zebra"</p>
                    <p><b>zh</b> - as in English "Persian"</p>
                    <p><b>nd</b> - as in English "Monday"</p>
                </Col>
            </Row>
            
            <Row className='mt-3'>
                <Col>
                    <h4>Vowel Diphthongs</h4>
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col sm={12} md={6}>
                    <p><b>au</b> - as in English "ouch"</p>
                    <p><b>ai</b> - pronounced like English "I"</p>
                    <p><b>ia</b> - as in 'ia' in "Santeria"</p>
                    <p><b>ei</b> - as in 'ay' in "say"</p>
                    <p><b>oi</b> - as in 'oi' in "boy"</p>
                    <p><b>üa</b> - say 'u' in "put" with lips apart followed by 'a' as in "father"</p>
                </Col>
                <Col sm={12} md={6}>
                    <p><b>aa</b> - as in English "father" but longer</p>
                    <p><b>ae</b> - as in 'a' in "bat"</p>
                    <p><b>io</b> - as in 'eo' in the name "Leo"</p>
                    <p><b>oa</b> - as in 'oa' in "boa constrictor"</p>
                    <p><b>ua</b> - say 'oo' as in "root" followed by a 'a' sound</p>
                    <p><b>ui</b> - say 'oo' as in "root" followed by an 'i' sound</p>
                    <p><b>üi</b> - say 'u' in "put" with lips apart followed by an 'i' sound</p>                
                </Col>
            </Row>
            
        </Col>
    );
}

export default Pronunciation;