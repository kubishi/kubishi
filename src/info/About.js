import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

function DonationButton() {
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
            <Row className='mt-3'>
                <Col> 
                    <h3 className='text-center'>
                        Do you know Payahuunadü?
                    </h3>

                    <p>
                        Nanüümüyadohana is the mother language of Payahuunadü.
                        For thousands of years, the people of Payahuunadü have used it to talk, sing, and tell stories. 
                        Every place, animal, object, and feeling has a name in nanüümüyadohana.
                        Due to the <a href='https://en.wikipedia.org/wiki/California_Genocide'>California Genocide</a> and <a href='https://en.wikipedia.org/wiki/Cultural_assimilation_of_Native_Americans'>forced assimilation</a>, many of these names are no longer, but Indigenous organizations in Payahuunadü <a href='http://www.ovcdc.com/blog/language/'>are fighting</a> to change that!
                    </p>

                    <h4 className='text-center'><a href='/words/5eacb4f3dca21c60a0a90dde'>Kubishi</a> means brain in <a href='/words/5eacb4f7dca21c60a0a91b42'>nanüümüyadohana</a></h4>
                    <p>
                        Our mission is to help preserve and protect Owens Valley Paiute history, language, and culture. 
                        This website is an online dictionary and encyclopedia dedicated to Payahuunadü and its first people. 
                        Kubishi was created and is maintained by <a href='https://jaredraycoleman.com'>Jared Coleman</a>, member of the <a href='http://bigpinepaiute.org'>Big Pine Paiute Tribe of the Owen's Valley</a>. 
                        The majority of words and sentences in this dictionary are from the Owens Valley Paiute Dictionary, created by Glenn Nelson Jr. 
                        It is thanks to his work, and the native speakers and elders he worked with, that this website is possible.
                    </p>
                </Col>
            </Row>
        </div>
    );
}

export default About;