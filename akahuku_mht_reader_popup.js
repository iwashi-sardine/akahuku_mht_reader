class AkahukuMhtReaderPopup {
  create(atag) {
    let media;

    switch (atag.dataset.popupType.split('/')[0]) {
      case 'image':
        media = document.createElement('img');

        break;
      case 'video':
        media = document.createElement('video');
        media.setAttribute('controls', '');

        break;
      default:
        return;
    }

    media.src = atag.dataset.popupObjectURL;
    media.classList.add('mht_reader_popup');

    const rect = atag.getBoundingClientRect();
    media.style.top = `${rect.top}px`;
    media.style.left = `${rect.left}px`;

    atag.insertAdjacentElement('afterend', media);
  }

  clear() {
    Array.from(
      document.querySelectorAll('.mht_reader_popup')
    )
        .forEach(popup => {
          popup.parentElement.removeChild(popup);
        });
  }
}

const popupMaker = new AkahukuMhtReaderPopup();

Array.from(
  document.querySelectorAll('a[data-popup-type]')
)
  .forEach(atag => {

    atag.addEventListener('click', (ev) => {
      ev.stopPropagation();
      ev.preventDefault();

      popupMaker.create(atag);
    });
  });

document.addEventListener('click', (ev) => {
  if(ev.target.classList.contains('mht_reader_popup')) return;

  popupMaker.clear();
});