import Head from 'next/head';
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | Daily Journal</title>
      </Head>
      <h1 className='text-4xl'>Privacy Policy for Daily Journal App</h1>
      <p>Effective Date: August 7, 2023</p>
      <p>
        Thank you for using Daily Journal. This Privacy Policy outlines how your
        personal information is collected, used, and protected when you use the
        App. By using the App, you agree to the practices described in this
        policy.
      </p>
      <h2 className='text-2xl'>
        1. Information We Collect but do not Personally Store
      </h2>
      <p>The Daily Journal App collects the following information:</p>
      <ul>
        <li>
          <strong>Name</strong>: We collect your name to personalize your
          experience within the App.
        </li>
        <li>
          <strong>Email</strong>: We collect your email address to personalize
          your experience within the App.
        </li>
        <li>
          <strong>Profile Picture</strong>: We collect your profile picture to
          personalize your account and enhance the user experience.
        </li>
        <li>
          <strong>Journal Entries</strong>: We collect the text and images you
          enter as journal entries within the App.
        </li>
        <li>
          <strong>Uploaded Images</strong>: We upload images attached to journal
          entries to your Google Drive storage.
        </li>
      </ul>
      <h2 className='text-2xl'>2. Use of Information</h2>
      <p>The information collected is used for the following purposes:</p>
      <ul>
        <li>
          <strong>Personalization</strong>: Your name and profile picture are
          used to personalize your experience within the App.
        </li>
        <li>
          <strong>Journal Entries</strong>: The app stores your journal entries
          and uploaded images for your reference and use within the App on
          Google Drive outside of our external control.
        </li>
        <li>
          <strong>Google Drive Integration</strong>: Uploaded images are
          securely stored on your Google Drive account, ensuring your data
          remains under your control.
        </li>
      </ul>
      <h2 className='text-2xl'>3. Data Security</h2>
      <p>
        We take your data security seriously and implement appropriate measures
        to protect it:
      </p>
      <ul>
        <li>
          <strong>Google Drive</strong>: Uploaded images and entries are stored
          directly in your Google Drive account, ensuring that only you have
          access to them.
        </li>
      </ul>
      <h2 className='text-2xl'>4. Data Access</h2>
      <p>
        The Daily Journal creators do not have access to the content of your
        journal entries or uploaded images on Google Drive. Your data remains
        private and inaccessible to us.
      </p>
      <h2 className='text-2xl'>5. Third-Party Services</h2>
      <p>
        The app integrates with Google Drive for image storage. Please refer to
        Google&apos;s Privacy Policy for information on how they handle your
        data.
      </p>
      <h2 className='text-2xl'>6. User Control</h2>
      <p>You have control over your data:</p>
      <ul>
        <li>
          <strong>Editing/Deleting Entries</strong>: You can edit or delete your
          journal entries at any time within the App.
        </li>
        <li>
          <strong>Revoking Access</strong>: You can revoke the App&apos;s access
          to your Google Drive account at any time just by logging out.
        </li>
      </ul>
      <h2 className='text-2xl'>7. Updates to Privacy Policy</h2>
      <p>
        We may update this Privacy Policy to reflect changes in how we handle
        your information. We will notify you about significant changes within
        the app.
      </p>
      <h2 className='text-2xl'>8. Contact Us</h2>
      <p>
        If you have questions or concerns about this Privacy Policy, please
        contact us at richardx366@gmail.com.
      </p>
      <p>
        By using the Daily Journal app, you acknowledge and agree to the terms
        outlined in this Privacy Policy. Please read the policy carefully and
        use the app responsibly.
      </p>
      <p>
        Thank you for trusting the Daily Journal App to safeguard your personal
        information and enhance your journaling experience.
      </p>
    </>
  );
};

export default PrivacyPolicy;
