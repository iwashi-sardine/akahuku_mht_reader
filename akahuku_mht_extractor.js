export default (messageObj) => {
  return new MhtExtractor().extract(messageObj);
};

class MhtExtractor {

  createDataURL(messageObj) {
    return `data:${messageObj.contentType};base64,${messageObj.data}`;
  }

  async extractHTML(messageObj) {
    let value = '';

    switch (messageObj.contentTransferEncoding) {
      case 'base64':
        value = await window.fetch(this.createDataURL(messageObj))
            .then(r => r.blob())
            .then(blob => {
              return new Promise(function(resolve, reject) {
                const fr = new FileReader();

                // NOTE: loadend は failure ケースでも呼ばれる
                fr.addEventListener('loadend', (ev) => {
                  resolve(ev.target.result);
                });

                fr.readAsText(blob, 'shift_jis'); // HACK:
              });
            })
            .catch(e => '');

        break;
      case '8bit':
        // NOTE: 8bitで保存するのオプションがextend版では効いてないかもしれず確認できない
        value = messageObj.data;
        break;
      default:
        break;
    }

    return value;
  }

  async extractCSS(messageObj) {
    let value = '';

    if(messageObj.contentTransferEncoding === 'base64') {
      value = await window.fetch(this.createDataURL(messageObj))
          .then(r => r.text())
          .catch(e => '');
    }

    return value;
  }

  async extractResource(messageObj) {
    let url = '';

    if(messageObj.contentTransferEncoding === 'base64') {
      url = await window.fetch(this.createDataURL(messageObj))
          .then(r => r.blob())
          .then(blob => window.URL.createObjectURL(blob))
          .catch(e => '');
    }

    return url;
  }

  async extract(messageObj) {
    const [type, subType] = messageObj.contentType.split(';')[0].split('/');

    try {
      switch (type) {
        case 'text':
          if(subType === 'html') {
            messageObj.decodedData = await this.extractHTML(messageObj);
          } else if (subType === 'css') {
            messageObj.decodedData = await this.extractCSS(messageObj);
          }
          break;
        case 'image':
          messageObj.objectURL = await this.extractResource(messageObj);
          break;
        case 'video':
          messageObj.objectURL = await this.extractResource(messageObj);
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
    }

    return messageObj;
  }
}