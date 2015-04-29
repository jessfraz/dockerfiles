# Application Insights for Node.js

[![NPM version](https://badge.fury.io/js/applicationinsights.svg)](http://badge.fury.io/js/applicationinsights)
[![Build Status](https://travis-ci.org/lukehoban/AppInsights-node.js.svg?branch=master)](https://travis-ci.org/lukehoban/AppInsights-node.js)

This project provides a Node.js SDK for Application Insights. [Application Insights](http://azure.microsoft.com/en-us/services/application-insights/) is a service that allows developers to keep their applications available, performant, and successful. This node module will allow you to send telemetry of various kinds (event, trace, exception, etc.) to the Application Insights service where they can be visualized in the Azure Portal. 




## Requirements ##
**Install**
```
    npm install applicationinsights
```
**Get an instrumentation key**
>**Note**: an instrumentation key is required before any data can be sent. Please see the "[Getting an Application Insights Instrumentation Key](https://github.com/Microsoft/AppInsights-Home/wiki#getting-an-application-insights-instrumentation-key)" section of the wiki for more information. To try the SDK without an instrumentation key, set the instrumentationKey config value to a non-empty string.




## Usage ##

```javascript
var AppInsights = require('applicationinsights');

// instantiate an instance of NodeAppInsights
var appInsights = new AppInsights(
    /* configuration can optionally be passed here instead of the environment variable, example:
    {
        instrumentationKey: "<guid>"
    }
    */
);

// must be done before creating the http server ('monkey patch' http.createServer to inject request tracking)
// this example tracks all requests except requests for "favicon" 
appInsights.trackAllHttpServerRequests("favicon");

// log unhandled exceptions by adding a handler to process.on("uncaughtException")
appInsights.trackAllUncaughtExceptions();

// manually collect telemetry
appInsights.trackTrace("example usage trace");
appInsights.trackEvent("example usage event name", { custom: "properties" });
appInsights.trackException(new Error("example usage error message"), "handledHere");
appInsights.trackMetric("example usage metric name", 42);

// start tracking server startup
var exampleUsageServerStartEvent = "exampleUsageServerStart";
appInsights.startTrackEvent(exampleUsageServerStartEvent);

// create server
var port = process.env.port || 1337
var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);

// stop tracking server startup (this will send a timed telemetry event)
server.on("listening", () => {
    appInsights.stopTrackEvent(exampleUsageServerStartEvent);
});
```



## Contributing ##
**Development environment**

* Install dev dependencies
```
npm install 
```
* (optional) Set an environment variable to your instrumentation key
```
set APPINSIGHTS_INSTRUMENTATION_KEY=<insert_your_instrumentation_key_here>
```
* Run tests
```
npm test
```



## How to integrate with Azure ##
1. Click on your website tile and scroll down to the Console tile. Type the command (as shown above) to install the module from the Node Package Manager. <br/> <img src="https://cloud.githubusercontent.com/assets/8000269/3898723/334d80b8-2270-11e4-9265-fea64fa8c4d9.png" width="600">

2. Scroll to the bottom of your website blade to the Extensions tile. Click the Add button and select Visual Studio Online and add the extension. You may need to refresh the current blade for it to appear on your list of extensions. <br/> <img src="https://cloud.githubusercontent.com/assets/8000269/3898727/335acae8-2270-11e4-9294-a53f68e2bb77.png" width="600">
 
3. Next, scroll to the top and in the Summary tile, click on the section that says Application Insights. Find your Node website in the list and click on it. Then click on the Properties tile and copy your instrumentation key. <br/> <img src="https://cloud.githubusercontent.com/assets/8000269/3898721/334b228c-2270-11e4-82a7-1bb158c3a843.png" width="600"> <br/> <img src="https://cloud.githubusercontent.com/assets/8000269/3898722/334c0e04-2270-11e4-81c9-2f6101ae12a9.png" width="600"> 

4. From the website blade click "site settings". Under the "App settings" section, enter a new key "APPINSIGHTS\_INSTRUMENTATION\_KEY" and paste your instrumentation key into the value field.

5. Go back to your Extensions tile and click on Visual Studio Online to open up the VSO blade. Click the Browse button to open VSO to edit your files. <br/> <img src="https://cloud.githubusercontent.com/assets/8000269/3898729/3361b43e-2270-11e4-9c07-0904f632e514.png" width="600">

6. Once you open VSO, click on the `server.js` file and enter the require statement as stated above. <br/> <img src="https://cloud.githubusercontent.com/assets/8000269/3898728/335aea0a-2270-11e4-9545-27e5d0baac57.png" width="600"> 

7. Open your website and click on a link to generate a request. <br/>

8. Return to your project tile in the Azure Portal. You can view your requests in the Monitoring tile.
