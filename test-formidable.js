const formidablePkg = require("formidable");
const { Readable } = require("stream");
const body = Buffer.from('--boundary\r\nContent-Disposition: form-data; name="photo"; filename="test.png"\r\nContent-Type: image/png\r\n\r\ntestdata\r\n--boundary--\r\n');
class BodyStream extends Readable {
  constructor(buffer) {
    super();
    this.buffer = buffer;
    this.sent = false;
  }
  _read() {
    if (!this.sent) {
      this.push(this.buffer);
      this.sent = true;
    }
    this.push(null);
  }
}
const req = new BodyStream(body);
req.headers = { 'content-type': 'multipart/form-data; boundary=boundary' };
req.method = 'POST';
req.url = '/';
const form = new formidablePkg.IncomingForm({ multiples: false, keepExtensions: false });
form.parse(req, (err, fields, files) => {
  console.log('err', err && err.message);
  console.log('fields', fields);
  console.log('files', files);
});
