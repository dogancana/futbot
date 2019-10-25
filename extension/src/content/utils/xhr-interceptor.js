const intercepts = [];

export function setupXMLInterceptors() {
  let send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener(
      'readystatechange',
      function() {
        for (const { urlmatch, callback } of intercepts) {
          if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
            callback(this);
          }
        }
      },
      false
    );
    return send.apply(this, arguments);
  };
}

export function interceptXHR(urlmatch, callback) {
  intercepts.push({ urlmatch, callback });
}
