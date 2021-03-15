import React from 'react';


function PrivacyPolicy(props) {
    return (
        <div className="mt-2">
            <h2>Help</h2>
            <h4 id="help-create">How do I create an account?</h4>
            <p>
                From the menu, select "Log in with Facebook" and follow the prompts to sign in with Facebook.
                Currently, we only support logging in through Facebook.
            </p>

            <h4 id="help-create-list">How do I create lists?</h4>
            <p>
                From the menu, select "My Lists". Then, at the bottom of the page, click the button that says "New Word List".
            </p>

            <h4 id="help-create-list">How do I add words to my list?</h4>
            <p>
                Look up a word and go to its page, then look for the dropdown menu that says "Add Word to List".
                Click it and select the list you would like to add the word to.
            </p>

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