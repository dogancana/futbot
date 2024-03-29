module.exports = {
  name: 'Futbot',
  version: '1.0.0',
  description: 'Vue.js Chrome Extension for FIFA Fut WebApp',
  author: 'Dogancan Arabaci',
  manifest_version: 2,
  icons: { '16': 'icons/16.png', '128': 'icons/128.png' },
  permissions: [
    '<all_urls>',
    '*://*/*',
    'activeTab',
    'tabs',
    'cookies',
    'background',
    'contextMenus',
    'unlimitedStorage',
    'storage',
    'notifications',
    'identity',
    'identity.email',
    'file://*'
  ],
  devtools_page: 'pages/devtools.html',
  options_page: 'pages/options.html',
  content_scripts: [
    {
      js: ['js/inject.js'],
      run_at: 'document_end',
      matches: ['https://www.ea.com/fifa/ultimate-team/web-app*'],
      all_frames: true
    },
    {
      js: ['js/futbin.js'],
      run_at: 'document_end',
      matches: ['https://www.futbin.com/*'],
      all_frames: true
    }
  ],
  browser_action: {
    default_title: 'Futbot',
    default_popup: 'pages/popup.html'
  },
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  web_accessible_resources: ['js/content.js']
};
