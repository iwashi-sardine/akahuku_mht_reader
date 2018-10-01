export default (resources) => {
  return new MhtConverter(resources).createHTML();
};

class MhtConverter {
  constructor(resources) {
    this.html = undefined;
    this.resources = resources;
  }

  createHTML() {
    const htmlResource = this.resources.find(obj => obj.contentType.startsWith('text/html'));

    if(!htmlResource) return;

    const html = (new DOMParser()).parseFromString(htmlResource.decodedData, 'text/html');
    const contentType = html.head.querySelector('meta[http-equiv="Content-type"]');
    contentType.content = "text/html; charset=UTF-8"; // NOTE: UTF-8 で扱っているので直す

    this.html = html;

    this.attachCSS()
        .attachImgs()
        .attachAtagsPopupData();

    return this.html;
  }

  attachCSS() {
    const cssResource = this.resources.find(obj => obj.contentType === 'text/css');

    if(!cssResource) return this;

    const css = document.createElement('style');
    css.textContent = cssResource.decodedData;

    this.html.head.appendChild(css);

    return this;
  }

  attachImgs() {
    this.resources.filter(obj => obj.contentType.startsWith('image/'))
        .forEach(resource => {
          Array.from(this.html.querySelectorAll(`img[src="${resource.contentLocation}"]`))
              .forEach(img => img.src = resource.objectURL);
        });

    return this;
  }

  attachAtagsPopupData() {
    this.resources.filter(
      resource => resource.contentType.match(/^(image|video)/) && resource.objectURL
    )
      .forEach(resource => {
        Array.from(this.html.querySelectorAll(`a[href="${resource.contentLocation}"]`))
            .forEach(atag => {
              // NOTE: popupの制御用にデータ付加する
              atag.dataset.popupObjectURL = resource.objectURL;
              atag.dataset.popupType = resource.contentType;
            });
      });

    return this;
  }
}