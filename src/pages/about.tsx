import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

const About: React.FC = () => {
  return (
    <>
      <Head>
        <title>About | Daily Journal</title>
      </Head>
      <div className='hero bg-gray-200/30 dark:bg-gray-900 py-24 px-8 text-center'>
        <div className='hero-content flex-col'>
          <h2 className='text-4xl font-bold'>Daily Journal</h2>
          <p className='md:w-[600px]'>
            Daily journal is an app that lets you log your day-to-day life in a
            quick and easy way. All your entries are stored on Google Drive, so
            however much your drive can store is however long you can journal
            for. You can also look through compilations of images over time.
            Navigate by clicking on your profile after logging in.
          </p>
        </div>
      </div>
      <div className='hero bg-blue-300/30 dark:bg-blue-900/30 py-12 px-8'>
        <div className='hero-content flex-col md:flex-row text-center md:text-left md:gap-12'>
          <div className='flex flex-col items-center md:items-start gap-4'>
            <h2 className='text-3xl font-bold'>Home Page</h2>
            <p className='md:w-[400px]'>
              Here, you can create entries for different dates, attach images
              and videos from the day, and write about your day. In the text
              box, you can format your text however you like and embed images
              with IDs. The image IDs will become the name of the image file in
              Google Drive so you can see changes in images over time such as
              yourself.
            </p>
          </div>
          <img
            src='/home.webp'
            alt='Home'
            className='w-56 rounded-md shadow-lg shadow-black/40 dark:shadow-white/40'
          />
        </div>
      </div>
      <div className='hero bg-purple-300/30 dark:bg-purple-900/30 py-12 px-8'>
        <div className='hero-content flex-col md:flex-row text-center md:text-left md:gap-12'>
          <img
            src='/template.webp'
            alt='Template'
            className='w-56 rounded-md shadow-lg shadow-black/40 dark:shadow-white/40'
          />
          <div className='flex flex-col items-center md:items-start gap-4'>
            <h2 className='text-3xl font-bold'>Update Template</h2>
            <p className='md:w-[400px]'>
              Here, you can update your entry template. Whenever you make a new
              entry, you can start off with a template that you make to save you
              some time and make sure things are neat.
            </p>
          </div>
        </div>
      </div>
      <div className='hero bg-teal-300/30 dark:bg-teal-900/30 py-12 px-8'>
        <div className='hero-content flex-col md:flex-row text-center md:text-left md:gap-12'>
          <div className='flex flex-col items-center md:items-start gap-4'>
            <h2 className='text-3xl font-bold'>Search Entries</h2>
            <p className='md:w-[400px]'>
              Here, you can search through the entries you&apos;ve made. You can
              search by the entry titles or the entry content. You can also
              filter by starred status and sort by date. If an entry is starred,
              you will be able to see a star next to its title/date.
            </p>
          </div>
          <img
            src='/search.webp'
            alt='Search'
            className='w-56 rounded-md shadow-lg shadow-black/40 dark:shadow-white/40'
          />
        </div>
      </div>
      <div className='hero bg-red-300/30 dark:bg-red-900/30 py-12 px-8'>
        <div className='hero-content flex-col md:flex-row text-center md:text-left md:gap-12'>
          <img
            src='/entry.webp'
            alt='Entry'
            className='w-56 rounded-md shadow-lg shadow-black/40 dark:shadow-white/40'
          />
          <div className='flex flex-col items-center md:items-start gap-4'>
            <h2 className='text-3xl font-bold'>View Entry</h2>
            <p className='md:w-[400px]'>
              Here, you can view your entry, edit, delete, or star it. You can
              look through your uploaded images and videos through the gallery
              and go to the next and previous entries.
            </p>
          </div>
        </div>
      </div>
      <footer className='footer footer-center p-4 bg-base-300 text-base-content'>
        <div>
          <p>Copyright © 2023 - All right reserved by Richard Xiong</p>
          <Link href='/privacy' className='underline'>
            Privacy Policy
          </Link>
        </div>
      </footer>
    </>
  );
};

export default About;
