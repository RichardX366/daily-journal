import { globalImageScale } from '@/helpers/state';
import { compressGif, compressImage, convertHeic } from '@richardx/components';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import type { ReactQuillProps } from 'react-quill';

const quillProps: ReactQuillProps = {
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
          const index = t.quill.getSelection(true).index;
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*,image/heic');
          input.addEventListener('change', async () => {
            if (!input.files || !input.files[0]) return;
            const [[width, name], url] = await Promise.all([
              new Promise<[number | undefined, string]>((res) =>
                globalImageScale.set({
                  show: true,
                  url: '',
                  name: 'photo',
                  width: 300,
                  onSubmit: res,
                }),
              ),
              (async () => {
                const oldFile = (input.files as FileList)[0];
                let newFile: Blob;
                if (oldFile.type === 'image/heic') {
                  newFile = await compressImage(await convertHeic(oldFile));
                } else if (oldFile.type === 'image/gif') {
                  newFile = await compressGif(oldFile);
                } else if (oldFile.type.includes('image')) {
                  newFile = await compressImage(oldFile);
                } else return;
                if (newFile.size > oldFile.size) newFile = oldFile;

                const url = URL.createObjectURL(newFile);
                globalImageScale.url.set(url);
                input.remove();
                return url;
              })(),
            ]);

            if (!url) return;
            if (!width) return URL.revokeObjectURL(url);

            t.quill.insertEmbed(index, 'image', url, 'user');
            const img: HTMLImageElement = t.quill.getLeaf(index + 1)[0].domNode;
            img.alt = name;
            img.style.width = `${width}px`;
            img.style.height = `${Math.floor(
              (img.naturalHeight * width) / img.naturalWidth,
            )}px`;
            t.quill.setSelection(index + 1);
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

const Loading: React.FC = () => (
  <div className='quill'>
    <div className='ql-toolbar ql-snow'>
      <span className='ql-formats'>
        <span className='ql-font ql-picker'>
          <span
            className='ql-picker-label'
            tabIndex={0}
            role='button'
            aria-expanded='false'
            aria-controls='ql-picker-options-0'
          >
            <svg viewBox='0 0 18 18'>
              <polygon className='ql-stroke' points='7 11 9 13 11 11 7 11' />
              <polygon className='ql-stroke' points='7 7 9 5 11 7 7 7' />
            </svg>
          </span>
        </span>
      </span>
      <span className='ql-formats'>
        <span className='ql-header ql-picker'>
          <span
            className='ql-picker-label'
            tabIndex={0}
            role='button'
            aria-expanded='false'
            aria-controls='ql-picker-options-1'
          >
            <svg viewBox='0 0 18 18'>
              <polygon className='ql-stroke' points='7 11 9 13 11 11 7 11' />
              <polygon className='ql-stroke' points='7 7 9 5 11 7 7 7' />
            </svg>
          </span>
        </span>
      </span>
      <span className='ql-formats'>
        <button type='button' className='ql-bold'>
          <svg viewBox='0 0 18 18'>
            <path
              className='ql-stroke'
              d='M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z'
            />
            <path
              className='ql-stroke'
              d='M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z'
            />
          </svg>
        </button>
        <button type='button' className='ql-italic'>
          <svg viewBox='0 0 18 18'>
            <line className='ql-stroke' x1={7} x2={13} y1={4} y2={4} />
            <line className='ql-stroke' x1={5} x2={11} y1={14} y2={14} />
            <line className='ql-stroke' x1={8} x2={10} y1={14} y2={4} />
          </svg>
        </button>
        <span className='ql-color ql-picker ql-color-picker'>
          <span
            className='ql-picker-label'
            tabIndex={0}
            role='button'
            aria-expanded='false'
            aria-controls='ql-picker-options-2'
          >
            <svg viewBox='0 0 18 18'>
              <line
                className='ql-color-label ql-stroke ql-transparent'
                x1={3}
                x2={15}
                y1={15}
                y2={15}
              />
              <polyline className='ql-stroke' points='5.5 11 9 3 12.5 11' />
              <line className='ql-stroke' x1='11.63' x2='6.38' y1={9} y2={9} />
            </svg>
          </span>
        </span>
        <span className='ql-background ql-picker ql-color-picker'>
          <span
            className='ql-picker-label'
            tabIndex={0}
            role='button'
            aria-expanded='false'
            aria-controls='ql-picker-options-3'
          >
            <svg viewBox='0 0 18 18'>
              <g className='ql-fill ql-color-label'>
                <polygon points='6 6.868 6 6 5 6 5 7 5.942 7 6 6.868' />
                <rect height={1} width={1} x={4} y={4} />
                <polygon points='6.817 5 6 5 6 6 6.38 6 6.817 5' />
                <rect height={1} width={1} x={2} y={6} />
                <rect height={1} width={1} x={3} y={5} />
                <rect height={1} width={1} x={4} y={7} />
                <polygon points='4 11.439 4 11 3 11 3 12 3.755 12 4 11.439' />
                <rect height={1} width={1} x={2} y={12} />
                <rect height={1} width={1} x={2} y={9} />
                <rect height={1} width={1} x={2} y={15} />
                <polygon points='4.63 10 4 10 4 11 4.192 11 4.63 10' />
                <rect height={1} width={1} x={3} y={8} />
                <path d='M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z' />
                <path d='M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z' />
                <path d='M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z' />
                <rect height={1} width={1} x={12} y={2} />
                <rect height={1} width={1} x={11} y={3} />
                <path d='M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z' />
                <rect height={1} width={1} x={2} y={3} />
                <rect height={1} width={1} x={6} y={2} />
                <rect height={1} width={1} x={3} y={2} />
                <rect height={1} width={1} x={5} y={3} />
                <rect height={1} width={1} x={9} y={2} />
                <rect height={1} width={1} x={15} y={14} />
                <polygon points='13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174' />
                <rect height={1} width={1} x={13} y={7} />
                <rect height={1} width={1} x={15} y={5} />
                <rect height={1} width={1} x={14} y={6} />
                <rect height={1} width={1} x={15} y={8} />
                <rect height={1} width={1} x={14} y={9} />
                <path d='M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z' />
                <rect height={1} width={1} x={14} y={3} />
                <polygon points='12 6.868 12 6 11.62 6 12 6.868' />
                <rect height={1} width={1} x={15} y={2} />
                <rect height={1} width={1} x={12} y={5} />
                <rect height={1} width={1} x={13} y={4} />
                <polygon points='12.933 9 13 9 13 8 12.495 8 12.933 9' />
                <rect height={1} width={1} x={9} y={14} />
                <rect height={1} width={1} x={8} y={15} />
                <path d='M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z' />
                <rect height={1} width={1} x={5} y={15} />
                <path d='M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z' />
                <rect height={1} width={1} x={11} y={15} />
                <path d='M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z' />
                <rect height={1} width={1} x={14} y={15} />
                <rect height={1} width={1} x={15} y={11} />
              </g>
              <polyline className='ql-stroke' points='5.5 13 9 5 12.5 13' />
              <line
                className='ql-stroke'
                x1='11.63'
                x2='6.38'
                y1={11}
                y2={11}
              />
            </svg>
          </span>
        </span>
        <button type='button' className='ql-underline'>
          <svg viewBox='0 0 18 18'>
            <path
              className='ql-stroke'
              d='M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3'
            />
            <rect
              className='ql-fill'
              height={1}
              rx='0.5'
              ry='0.5'
              width={12}
              x={3}
              y={15}
            />
          </svg>
        </button>
        <button type='button' className='ql-strike'>
          <svg viewBox='0 0 18 18'>
            <line
              className='ql-stroke ql-thin'
              x1='15.5'
              x2='2.5'
              y1='8.5'
              y2='9.5'
            />
            <path
              className='ql-fill'
              d='M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z'
            />
            <path
              className='ql-fill'
              d='M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z'
            />
          </svg>
        </button>
      </span>
      <span className='ql-formats'>
        <button type='button' className='ql-list' value='ordered'>
          <svg viewBox='0 0 18 18'>
            <line className='ql-stroke' x1={7} x2={15} y1={4} y2={4} />
            <line className='ql-stroke' x1={7} x2={15} y1={9} y2={9} />
            <line className='ql-stroke' x1={7} x2={15} y1={14} y2={14} />
            <line
              className='ql-stroke ql-thin'
              x1='2.5'
              x2='4.5'
              y1='5.5'
              y2='5.5'
            />
            <path
              className='ql-fill'
              d='M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z'
            />
            <path
              className='ql-stroke ql-thin'
              d='M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156'
            />
            <path
              className='ql-stroke ql-thin'
              d='M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109'
            />
          </svg>
        </button>
        <button type='button' className='ql-list' value='bullet'>
          <svg viewBox='0 0 18 18'>
            <line className='ql-stroke' x1={6} x2={15} y1={4} y2={4} />
            <line className='ql-stroke' x1={6} x2={15} y1={9} y2={9} />
            <line className='ql-stroke' x1={6} x2={15} y1={14} y2={14} />
            <line className='ql-stroke' x1={3} x2={3} y1={4} y2={4} />
            <line className='ql-stroke' x1={3} x2={3} y1={9} y2={9} />
            <line className='ql-stroke' x1={3} x2={3} y1={14} y2={14} />
          </svg>
        </button>
        <button type='button' className='ql-indent' value={-1}>
          <svg viewBox='0 0 18 18'>
            <line className='ql-stroke' x1={3} x2={15} y1={14} y2={14} />
            <line className='ql-stroke' x1={3} x2={15} y1={4} y2={4} />
            <line className='ql-stroke' x1={9} x2={15} y1={9} y2={9} />
            <polyline className='ql-stroke' points='5 7 5 11 3 9 5 7' />
          </svg>
        </button>
        <button type='button' className='ql-indent' value={+1}>
          <svg viewBox='0 0 18 18'>
            <line className='ql-stroke' x1={3} x2={15} y1={14} y2={14} />
            <line className='ql-stroke' x1={3} x2={15} y1={4} y2={4} />
            <line className='ql-stroke' x1={9} x2={15} y1={9} y2={9} />
            <polyline className='ql-fill ql-stroke' points='3 7 3 11 5 9 3 7' />
          </svg>
        </button>
      </span>
      <span className='ql-formats'>
        <button type='button' className='ql-blockquote'>
          <svg viewBox='0 0 18 18'>
            <rect
              className='ql-fill ql-stroke'
              height={3}
              width={3}
              x={4}
              y={5}
            />
            <rect
              className='ql-fill ql-stroke'
              height={3}
              width={3}
              x={11}
              y={5}
            />
            <path
              className='ql-even ql-fill ql-stroke'
              d='M7,8c0,4.031-3,5-3,5'
            />
            <path
              className='ql-even ql-fill ql-stroke'
              d='M14,8c0,4.031-3,5-3,5'
            />
          </svg>
        </button>
        <button type='button' className='ql-code-block'>
          <svg viewBox='0 0 18 18'>
            <polyline className='ql-even ql-stroke' points='5 7 3 9 5 11' />
            <polyline className='ql-even ql-stroke' points='13 7 15 9 13 11' />
            <line className='ql-stroke' x1={10} x2={8} y1={5} y2={13} />
          </svg>
        </button>
        <button type='button' className='ql-script' value='sub'>
          <svg viewBox='0 0 18 18'>
            <path
              className='ql-fill'
              d='M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z'
            />
            <path
              className='ql-fill'
              d='M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z'
            />
          </svg>
        </button>
        <button type='button' className='ql-script' value='super'>
          <svg viewBox='0 0 18 18'>
            <path
              className='ql-fill'
              d='M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z'
            />
            <path
              className='ql-fill'
              d='M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z'
            />
          </svg>
        </button>
        <span className='ql-align ql-picker ql-icon-picker'>
          <span
            className='ql-picker-label'
            tabIndex={0}
            role='button'
            aria-expanded='false'
            aria-controls='ql-picker-options-4'
          >
            <svg viewBox='0 0 18 18'>
              <line className='ql-stroke' x1={3} x2={15} y1={9} y2={9} />
              <line className='ql-stroke' x1={3} x2={13} y1={14} y2={14} />
              <line className='ql-stroke' x1={3} x2={9} y1={4} y2={4} />
            </svg>
          </span>
          <span
            className='ql-picker-options'
            aria-hidden='true'
            tabIndex={-1}
            id='ql-picker-options-4'
          >
            <span
              tabIndex={0}
              role='button'
              className='ql-picker-item ql-selected'
            >
              <svg viewBox='0 0 18 18'>
                <line className='ql-stroke' x1={3} x2={15} y1={9} y2={9} />
                <line className='ql-stroke' x1={3} x2={13} y1={14} y2={14} />
                <line className='ql-stroke' x1={3} x2={9} y1={4} y2={4} />
              </svg>
            </span>
            <span
              tabIndex={0}
              role='button'
              className='ql-picker-item'
              data-value='center'
            >
              <svg viewBox='0 0 18 18'>
                <line className='ql-stroke' x1={15} x2={3} y1={9} y2={9} />
                <line className='ql-stroke' x1={14} x2={4} y1={14} y2={14} />
                <line className='ql-stroke' x1={12} x2={6} y1={4} y2={4} />
              </svg>
            </span>
            <span
              tabIndex={0}
              role='button'
              className='ql-picker-item'
              data-value='right'
            >
              <svg viewBox='0 0 18 18'>
                <line className='ql-stroke' x1={15} x2={3} y1={9} y2={9} />
                <line className='ql-stroke' x1={15} x2={5} y1={14} y2={14} />
                <line className='ql-stroke' x1={15} x2={9} y1={4} y2={4} />
              </svg>
            </span>
            <span
              tabIndex={0}
              role='button'
              className='ql-picker-item'
              data-value='justify'
            >
              <svg viewBox='0 0 18 18'>
                <line className='ql-stroke' x1={15} x2={3} y1={9} y2={9} />
                <line className='ql-stroke' x1={15} x2={3} y1={14} y2={14} />
                <line className='ql-stroke' x1={15} x2={3} y1={4} y2={4} />
              </svg>
            </span>
          </span>
        </span>
      </span>
      <span className='ql-formats'>
        <button type='button' className='ql-link'>
          <svg viewBox='0 0 18 18'>
            <line className='ql-stroke' x1={7} x2={11} y1={7} y2={11} />
            <path
              className='ql-even ql-stroke'
              d='M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z'
            />
            <path
              className='ql-even ql-stroke'
              d='M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z'
            />
          </svg>
        </button>
        <button type='button' className='ql-image'>
          <svg viewBox='0 0 18 18'>
            <rect className='ql-stroke' height={10} width={12} x={3} y={4} />
            <circle className='ql-fill' cx={6} cy={7} r={1} />
            <polyline
              className='ql-even ql-fill'
              points='5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12'
            />
          </svg>
        </button>
        <button type='button' className='ql-video'>
          <svg viewBox='0 0 18 18'>
            <rect className='ql-stroke' height={12} width={12} x={3} y={3} />
            <rect className='ql-fill' height={12} width={1} x={5} y={3} />
            <rect className='ql-fill' height={12} width={1} x={12} y={3} />
            <rect className='ql-fill' height={2} width={8} x={5} y={8} />
            <rect className='ql-fill' height={1} width={3} x={3} y={5} />
            <rect className='ql-fill' height={1} width={3} x={3} y={7} />
            <rect className='ql-fill' height={1} width={3} x={3} y={10} />
            <rect className='ql-fill' height={1} width={3} x={3} y={12} />
            <rect className='ql-fill' height={1} width={3} x={12} y={5} />
            <rect className='ql-fill' height={1} width={3} x={12} y={7} />
            <rect className='ql-fill' height={1} width={3} x={12} y={10} />
            <rect className='ql-fill' height={1} width={3} x={12} y={12} />
          </svg>
        </button>
        <button type='button' className='ql-formula'>
          <svg viewBox='0 0 18 18'>
            <path
              className='ql-fill'
              d='M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z'
            />
            <rect
              className='ql-fill'
              height='1.6'
              rx='0.8'
              ry='0.8'
              width={5}
              x='5.15'
              y='6.2'
            />
            <path
              className='ql-fill'
              d='M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z'
            />
          </svg>
        </button>
      </span>
      <span className='ql-formats'>
        <button type='button' className='ql-clean'>
          <svg className='' viewBox='0 0 18 18'>
            <line className='ql-stroke' x1={5} x2={13} y1={3} y2={3} />
            <line className='ql-stroke' x1={6} x2='9.35' y1={12} y2={3} />
            <line className='ql-stroke' x1={11} x2={15} y1={11} y2={15} />
            <line className='ql-stroke' x1={15} x2={11} y1={11} y2={15} />
            <rect
              className='ql-fill'
              height={1}
              rx='0.5'
              ry='0.5'
              width={7}
              x={2}
              y={14}
            />
          </svg>
        </button>
      </span>
    </div>
    <div className='ql-container ql-snow'>
      <div
        className='ql-editor ql-blank'
        contentEditable='false'
        data-placeholder='Write something awesome...'
        spellCheck='false'
      />
    </div>
  </div>
);

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <Loading />,
});

const Quill: React.FC<{ value: string; onChange: (value: string) => void }> = ({
  value,
  onChange,
}) => {
  useEffect(() => {
    if (window.katex) return;
    import('katex').then((katex) => {
      window.katex = katex.default;
    });
  }, []);

  return (
    <div className='shadow-md transition-shadow shadow-black/10 dark:shadow-white/20 hover:shadow-black/40 hover:dark:shadow-white/70'>
      <QuillNoSSRWrapper {...quillProps} value={value} onChange={onChange} />
    </div>
  );
};

export default Quill;
