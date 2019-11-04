const responseInterceptors = [];
const requestInterceptors = [];

export function setupXMLInterceptors() {
  let open = XMLHttpRequest.prototype.open;
  let send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function() {
    const url = arguments[1];
    this._interceptor = { url };

    this.addEventListener(
      'readystatechange',
      function() {
        for (const { urlmatch, callback } of responseInterceptors) {
          if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
            callback(this);
          }
        }
      },
      false
    );
    return open.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if (this._interceptor) {
      this._interceptor.body += body;
      for (const { urlmatch, callback } of requestInterceptors) {
        if (this._interceptor.url.includes(urlmatch)) {
          callback(this, body);
        }
      }
    }
    return send.apply(this, arguments);
  };
}

export function interceptXHRRequest(urlmatch, callback) {
  requestInterceptors.push({ urlmatch, callback });
}

export function interceptXHRResponse(urlmatch, callback) {
  responseInterceptors.push({ urlmatch, callback });
}
