import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

function DonationButton(props) {
    return (
        <div>
            <span style={{display: "none"}}>
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" id="donate-form">
                    <input type="hidden" name="cmd" value="_donations" />
                    <input type="hidden" name="business" value="7VQNJ2BHEWAX8" />
                    <input type="hidden" name="item_name" value="Kushibi Website Maintenance" />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input 
                        type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" 
                        border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" 
                    />
                    <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
                </form>
            </span>
            <Button type="submit" form="donate-form" value="Submit" block>
                Donate
            </Button>
        </div>

    );
}

function About(props) {
    return (
        <div>
            <Row className='text-center mt-3'>
                <Col sm={12} md={8}>
                    <h3><a href='/word/5eacb4f3dca21c60a0a90dde'>Kubishi</a> means brain in <a href='/word/5eacb4f7dca21c60a0a91b42'>nanüümüyadohana</a></h3>
                    <p>
                        This website is an unofficial online dictionary for the Owen's Valley Paiute Language.
                        It was created and is maintained by <a href='https://jaredraycoleman.com'>Jared Coleman</a>, member of the <a href='http://bigpinepaiute.org'>Big Pine Paiute Tribe of the Owen's Valley</a>.
                    </p>
                </Col>
                <Col sm={12} md={4}>
                    <h3>Contribute</h3> 
                    <p>This website is paid for and maintained entirely by me, Jared Coleman. Any contributions would be greatly appreciated!</p>
                    <DonationButton />
                </Col>
            </Row>
        </div>
    );
}

export default About;