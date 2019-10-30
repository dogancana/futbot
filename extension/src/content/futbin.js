let executed = false;

setTimeout(main, 2000);

function LinkButton({ href, textContent, classes, target }) {
  const a = document.createElement('a');
  Object.assign(a, {
    href,
    textContent,
    target
  });
  a.className = 'futbot button-link ' + (classes ? classes : '');
  return a;
}

function addStyling() {
  const style = document.createElement('style');
  style.textContent = `
    .futbot.button-link {
      background-color: #fc4554;
      color: #f2f2f2;
      height: 2.8rem;
      line-height: 2.8rem;
      box-sizing: border-box;
      display: block;
      font-family: inherit;
      text-transform: uppercase;
      font-size: 1em;
      overflow: hidden;
      padding: 0 2rem;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;      
      text-decoration: none;
      border-radius: 5px;
    }

    .futbot.button-link.fab {
      position: fixed;
      bottom: 40px;
      right: 3%;
      box-shadow: 0 6px 10px lightslategrey;
    }
  `;
  document.querySelector('head').appendChild(style);
}

function main() {
  if (executed) return;
  executed = true;

  addStyling();
  const linkButton = new LinkButton({
    href: `http://localhost:9999/invest/add-target-page?futbinPage=${encodeURIComponent(
      location.pathname + location.search
    )}`,
    textContent: `Add Target Page`,
    classes: 'fab',
    target: '_blank'
  });
  document.querySelector('body').appendChild(linkButton);
}
