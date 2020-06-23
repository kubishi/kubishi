import React from 'react';
import { Row, Col, ListGroup, Button, Spinner, Image, InputGroup } from 'react-bootstrap';

import {
    EmailShareButton,
    FacebookShareButton,
    InstapaperShareButton,
    LineShareButton,
    LinkedinShareButton,
    LivejournalShareButton,
    MailruShareButton,
    OKShareButton,
    PinterestShareButton,
    PocketShareButton,
    RedditShareButton,
    TelegramShareButton,
    TumblrShareButton,
    TwitterShareButton,
    ViberShareButton,
    VKShareButton,
    WhatsappShareButton,
    WorkplaceShareButton,
    FacebookMessengerShareButton
} from "react-share";

import {
    EmailIcon,
    FacebookIcon,
    FacebookMessengerIcon,
    InstapaperIcon,
    LineIcon,
    LinkedinIcon,
    LivejournalIcon,
    MailruIcon,
    OKIcon,
    PinterestIcon,
    PocketIcon,
    RedditIcon,
    TelegramIcon,
    TumblrIcon,
    TwitterIcon,
    ViberIcon,
    VKIcon,
    WeiboIcon,
    WhatsappIcon,
    WorkplaceIcon
  } from "react-share";

const { REACT_APP_FACEBOOK_APP_ID } = process.env;

class ShareButtons extends React.Component {
    constructor(props) {
        super(props);

        this.quoteMaxLen = 100;
        this.iconSize = 32;
    }

    render() {
        let { title, quote, hashtags, url } = this.props;
        if (!hashtags) {
            hashtags = ['kubishi'];
        }

        return (
            <div className='text-center'>
                <h4 className='text-center'>Share</h4>
                <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                <FacebookShareButton url={url} quote={quote} hashtag={hashtags.map(x => `#${x}`).join(' ')} className='m-1' >
                    <FacebookIcon size={this.iconSize} round={true} />
                </FacebookShareButton>
                {/* <FacebookMessengerShareButton appId={REACT_APP_FACEBOOK_APP_ID} className='m-1' >
                    <FacebookMessengerIcon size={this.iconSize} round={true} />
                </FacebookMessengerShareButton> */}
                <TwitterShareButton url={url} title={quote} related={['ovkubishi']} hashtags={hashtags} className='m-1' >
                    <TwitterIcon size={this.iconSize} round={true} />
                </TwitterShareButton>
                <WhatsappShareButton url={url} title={quote} className='m-1' >
                    <WhatsappIcon size={this.iconSize} round={true} />
                </WhatsappShareButton>
                <LinkedinShareButton url={url} title={title} summary={quote} source='https://kubishi.com' className='m-1' >
                    <LinkedinIcon size={this.iconSize} round={true} />
                </LinkedinShareButton>
                <EmailShareButton url={url} subject={title} body={quote} className='m-1' >
                    <EmailIcon size={this.iconSize} round={true} />
                </EmailShareButton>
            </div>
        );
    }
}

export default ShareButtons;