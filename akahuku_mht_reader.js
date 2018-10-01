import mhtParse from './akahuku_mht_parser.js';
import extract from './akahuku_mht_extractor.js';
import convert from './akahuku_mht_converter.js';

export default () => {};

const dropElem = document.querySelector('div.mht_reader');
let mhtResources = [];

dropElem.addEventListener('dragenter', ev => ev.preventDefault());
dropElem.addEventListener('dragover', ev => ev.preventDefault());
dropElem.addEventListener('drop', ev => {
  ev.stopPropagation();
  ev.preventDefault();

  mhtOpen(ev.dataTransfer.files);
});

function mhtRead(files) {
  return new Promise(function(resolve, reject) {
    const mhtFile = files[0];

    if (files.length === 0
      || !mhtFile.name.endsWith('.mht')
      || !(mhtFile.type === 'message/rfc822' || mhtFile.type === 'multipart/related')
    ) {
      reject({ reason: 'mht形式のファイルではないようです' });
    }

    const fr = new FileReader();

    fr.addEventListener('loadend', (ev) => {
      resolve(ev.target.result);
    });

    fr.readAsText(mhtFile);

  });
}

function openInNewWindow(resources) {
  const html = convert(resources);

  if(!html) throw { reason: '正しくデータを展開できませんでした' };

  const objectURL = window.URL.createObjectURL(
    new Blob([html.documentElement.outerHTML], { type : 'text/html' })
  );

  return browser.windows.create({
    type: 'panel',
    incognito: true,
    url: objectURL,
  })
      .then(windowObj => {

        resources.push({
          objectURL,
        });

        mhtResources.push({
          resources,
          windowID: windowObj.id,
        });

        return windowObj.tabs[0].id;
      })
}

function mhtOpen(files) {
  mhtRead(files)
      .then(text => {
        return Promise.all(
                mhtParse(text)
                    .map(extract)
              );
      })
      .then(openInNewWindow)
      .then(tabID => {
        browser.tabs.executeScript(
          tabID,
          {
            file: '/akahuku_mht_reader_popup.js',
          }
        );

        browser.tabs.insertCSS(
          tabID,
          {
            file: '/akahuku_mht_reader_popup.css',
          }
        );
      })
      .catch(console.error.bind(console))

}

function cleanMhtResource(windowID) {
  const target = mhtResources.find(data => data.windowID == windowID);

  if(!target) return;

  target.resources.forEach(resource => {
    if(resource.objectURL) {
      window.URL.revokeObjectURL(resource.objectURL);
    }
  })
}

// NOTE: 一旦リーダーを閉じて開いたとき二重登録されることはない
browser.windows.onRemoved.addListener(cleanMhtResource);