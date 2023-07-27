import type { ReactQuillProps } from 'react-quill';
import Delta from 'quill-delta';

export const scopes = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive.file',
];

export const clientId =
  '208531646888-r1tsc6gptem0b2juihb0n4q49ieptr4u.apps.googleusercontent.com';

export const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

export const quillProps: ReactQuillProps = {
  theme: 'snow',
  placeholder: 'Write something awesome...',
  formats: [
    'bold',
    'color',
    'font',
    'code',
    'italic',
    'link',
    'underline',
    'strike',
    'script',
    'blockquote',
    'header',
    'indent',
    'list',
    'align',
    'code-block',
    'formula',
    'image',
    'video',
    'background',
  ],
  modules: {
    toolbar: {
      handlers: {
        image: function () {
          const t = this as any;
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute(
            'accept',
            'image/png, image/gif, image/jpeg, image/bmp, image/x-icon',
          );
          input.addEventListener('change', () => {
            if (!input.files || !input.files[0]) return;
            const selection = t.quill.getSelection(true);
            const url = URL.createObjectURL(input.files[0]);
            t.quill.updateContents(
              new Delta()
                .retain(selection.index)
                .delete(selection.length)
                .insert({ image: url }),
              'user',
            );
            t.quill.setSelection(selection.index + 1);
            input.remove();
          });
          input.click();
        },
      },
      container: [
        [{ font: [] }],
        [{ header: [] }],
        [
          'bold',
          'italic',
          { color: [] },
          { 'background': [] },
          'underline',
          'strike',
        ],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        [
          'blockquote',
          'code-block',
          { script: 'sub' },
          { script: 'super' },
          { align: [] },
        ],
        ['link', 'image', 'video', 'formula'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  },
};
