var filterEngine = 
`
async function interceptRequests(window) {
try {
    const fs = require('fs');
    const { FiltersEngine, Request } = require('./adblocker.umd.min.js');
    const filters =
        fs.readFileSync(require.resolve('./easylist.txt'), 'utf-8') + '\\n' +
        fs.readFileSync(require.resolve('./easyprivacy.txt'), 'utf-8') + '\\n' +
        fs.readFileSync(require.resolve('./ublock-ads.txt'), 'utf-8') + '\\n' + 
        fs.readFileSync(require.resolve('./ublock-privacy.txt'), 'utf-8') + '\\n' +
        fs.readFileSync(require.resolve('./peter-lowe-list.txt'), 'utf-8') + '\\ngoogleoptimize.com\\n';
    const engine = await FiltersEngine.fromLists(fetch, filters);

    window.webContents.session.webRequest.onBeforeSendHeaders({urls: ["wss://*/*","https://*/*",],}, (details, callback) => {
        const { requestHeaders, url } = details;
        const { match } = engine.match(Request.fromRawDetails({url: url}));

        if (match == true) {
            log.info('BLOCKED:', details.url);
            callback({cancel: true});
        } else {
            callback({cancel: false});
        }

    
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (e) {
            callback({ cancel: false, requestHeaders });
            return;
        }

        if (url.startsWith("wss://riot")) {
            requestHeaders["Origin"] = null;

            const { username, password } = parsedUrl;

            if (username && password) {
                requestHeaders["Authorization"] = \`Basic ${Buffer.from('`${username}:${password}`').toString("base64")}\`;
            }
        }

        if (url.startsWith("wss://rt.blitz.gg")) {
            requestHeaders["Blitz-Client"] = "true";
        }

        if (url.startsWith("https://127.0.0.1")) {
            requestHeaders["Origin"] = parsedUrl.origin;

            const { password } = nativeModule._lcuConnectionInfo || {};

            requestHeaders["Authorization"] = \`Basic ${Buffer.from('`riot:${password}`').toString("base64")}\`;
        }

        if (url.startsWith("https://blitz-cdn-plain.blitz.gg")) {
            requestHeaders["Origin"] = "https://blitz.gg";
        }

        requestHeaders["X-Blitz-Version"] = app.getVersion();
        callback({ cancel: false, requestHeaders });
        }
      );
} catch (error) {
    log.error(error);
}
`
filterEngine = compress(filterEngine);

var autoGuest =
`autoGuest();

function autoGuest() {
    var buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('label') == 'Login As Guest') {
            buttons[i].click();
            return;
        }
    }
    setTimeout(autoGuest, 1000);
}
`
autoGuest = compress(autoGuest);

function compress(uncompressedJs) {
    var compressedJs = '';
    var stringArr = uncompressedJs.split('\n');

    for (var i = 0; i < stringArr.length; i++) {
        compressedJs += stringArr[i].trim();
    }
    return compressedJs;
}

module.exports = {
    filterEngine: filterEngine,
    autoGuest: autoGuest
};
