import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en' id='html'>
      <Head />
      <body className='min-h-screen bg-gradient-to-br dark:from-gray-800 dark:to-purple-950 from-blue-50 to-blue-200 dark:text-white'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
