browser.menus.create({
  id: "akahuku_mht_reader",
  title: "赤福mhtリーダーを起動",
  contexts: ["all"],
  onclick: startMhtReader,
}, onCreated);

function onCreated() {
  if (browser.runtime.lastError) {
    console.error(`Error: ${browser.runtime.lastError}`);
  }
}

function startMhtReader(info, tab) {
  browser.windows.create({
    type: "panel",
    incognito: true,
    url: "akahuku_mht_reader.html",
    width: 600,
    height: 215,
  });
}