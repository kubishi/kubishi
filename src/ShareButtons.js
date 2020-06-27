import React from 'react';
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton } from "react-share";

export default function ShareButtons({ quoteMaxLen, iconSize, title, quote, hashtags, url }) {
    quoteMaxLen = quoteMaxLen || 100;
    iconSize = iconSize || 32;
    hashtags = hashtags || ['kubishi'];

    return (
        <div className='text-center'>
            <h4 className='text-center'>Share</h4>
            <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
            <FacebookShareButton url={url} quote={quote} hashtag={hashtags.map(x => `#${x}`).join(' ')} className='m-1' >
                <FacebookIcon size={iconSize} round={true} />
            </FacebookShareButton>
            <TwitterShareButton url={url} title={quote} related={['ovkubishi']} hashtags={hashtags} className='m-1' >
                <TwitterIcon size={iconSize} round={true} />
            </TwitterShareButton>
            <WhatsappShareButton url={url} title={quote} className='m-1' >
                <WhatsappIcon size={iconSize} round={true} />
            </WhatsappShareButton>
            <LinkedinShareButton url={url} title={title} summary={quote} source='https://kubishi.com' className='m-1' >
                <LinkedinIcon size={iconSize} round={true} />
            </LinkedinShareButton>
            <EmailShareButton url={url} subject={title} body={quote} className='m-1' >
                <EmailIcon size={iconSize} round={true} />
            </EmailShareButton>
        </div>
    );
}