export default (mht) => {
  return new MhtParser(mht).parse();
};

class MhtParser {
  constructor(mht) {
    this.mht = mht.replace(/\r/g, '');
  }

  getBoundary () {
    const mht = this.mht;
    let boundaryIndex = mht.indexOf('boundary="'); // HACK:

    if(boundaryIndex !== -1) {
      boundaryIndex += 10;
      return mht.substring(boundaryIndex, mht.indexOf('";', boundaryIndex));
    }

    return '';
  }

  parse() {
    const mht = this.mht;
    let boundary = this.getBoundary();

    if(!boundary) return [];

    boundary = '--' + boundary;

    let multiparts = mht.split(boundary);
    multiparts.shift();
    multiparts.pop();

    return multiparts.map(this.parseMultipart);
  }

  parseMultipart(multipart) {
    function parseMultipartContents(name) {
      let value = '';
      let startIndex = multipart.indexOf(name);

      if(startIndex !== -1) {
        startIndex += name.length;

        value = multipart.substring(
          startIndex,
          multipart.indexOf('\n', startIndex)
        )
            .trim();
      }

      return value;
    }

    const contentType = parseMultipartContents('Content-Type:');
    const contentTransferEncoding = parseMultipartContents('Content-Transfer-Encoding:');
    const contentLocation = parseMultipartContents('Content-Location:');
    const data = multipart.split('\n\n')[1];

    return {
      contentType,
      contentTransferEncoding,
      contentLocation,
      data,
    };
  }
}