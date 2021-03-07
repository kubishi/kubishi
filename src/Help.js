import React from 'react';


function PrivacyPolicy(props) {
    return (
        <div className="mt-2">
            <h2>Help</h2>

            <h4 id="help-delete">How do I delete my account?</h4>
            <p>
                Log into your account, then click on the "Welcome, Your Name" message in the menu to view your account details.
                Then click on the "Delete Account" button, highlighted in red at the bottom of the page.
                Verify that you want to delete your account when the alert pops up.
                Now your account is deleted!
                You can recreate your account at any time by logging in again through Facebook,
                but all permissions, groups, lists, and any other Kubishi-content is not recoverable
                after your account has been deleted.
            </p>

        </div>
    );
}

export default PrivacyPolicy;