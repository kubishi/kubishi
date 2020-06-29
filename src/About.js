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
                <Col sm={12} lg={8}>
                    <h3 className='text-center'>
                        Do you know <strike>The Owens Valley</strike> Payahuunadü?
                    </h3>

                    <p>
                        <b>Before there was English, there was nanüümüyadohana</b>.
                        According to mythology, the nüümü (people) originally learned the Paiute language from the animals.
                        For thousands of years, they used it to communicate - to sing, to tell stories, to mourn, to celebrate, to educate, and to heal.
                        They gave names to all the places in Payahuunadü and to all the plants and animals it was home to.
                        Due to the <a href='https://en.wikipedia.org/wiki/California_Genocide'>California Genocide</a> and <a href='https://en.wikipedia.org/wiki/Cultural_assimilation_of_Native_Americans'>forced assimilation</a>, many of these names are no longer used.
                        Some stories are forgotten.
                        Some songs, already sung for the last time. 
                        <b> The language <a href='http://www.endangeredlanguages.com/lang/4692'>is dying</a>, but it is not dead and it can be healed. </b>
                        The Tribes of the Owens Valley <a href='http://www.ovcdc.com/blog/language/'>are fighting</a> to preserve the language and culture.
                        Kubishi is proud to be a part of that fight.
                    </p>

                    <h4 className='text-center'><a href='/words/5eacb4f3dca21c60a0a90dde'>Kubishi</a> means brain in <a href='/words/5eacb4f7dca21c60a0a91b42'>nanüümüyadohana</a></h4>
                    <p>
                        Kubishi's mission is to help preserve and protect Owens Valley Paiute history, language, and culture.
                        This website is an online dictionary and encyclopedia dedicated to Payahuunadü and its first people.
                    </p>
                    <p>
                        Kubishi was created and is maintained by <a href='https://jaredraycoleman.com'>Jared Coleman</a>, member of the <a href='http://bigpinepaiute.org'>Big Pine Paiute Tribe of the Owen's Valley</a>.
                        The majority of words and sentences in this dictionary are from the Owens Valley Paiute Dictionary, created by Big Pine Paiute tribal member Glenn Nelson Jr.
                        It is thanks to his work, and the native speakers and elders he worked with, that this website is possible.
                    </p>
                </Col>
                <Col sm={12} lg={4}>
                    <h3>Contribute</h3> 
                    <p>
                        This website is paid for and maintained entirely by me, Jared Coleman. Any contributions would be greatly appreciated! 100% of donations go toward the cost of operating this website.
                    </p>
                    <DonationButton />
                    <p className='mt-3'>
                        If you don't have the means to make a financial contribution (I get it - I'm a student!) but can afford to donate a little time, then contact me.
                        Kubishi is an eternal work in progress, and we need volunteers to proof words and sentences, add articles, and help design new features.
                        With your help, we can make Kubishi a powerful weapon in the fight against the erasure of Owens Valley Paiute language and culture!
                    </p>
                </Col>
            </Row>
        </div>
    );
}

export default About;