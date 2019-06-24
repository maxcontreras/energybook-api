const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Converter = require('xml-js');

const OPTIONS_XML2JS = {
  compact: true,
  spaces: 4
}

const OPTIONS_JS2XML = {
  indentAttributes: true,
  spaces: 2,
  compact: true,
  fullTagEmptyElement: false
};

module.exports = function () {
  this.getData = function (hostname, dates, api_prefix, devices, attrs) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let serviceToCall =
        hostname + api_prefix + "records.xml"
        + "?begin=" + dates.begin + "?end="
        + dates.end;
      if(Array.isArray(devices) && devices.length > 1){
        devices.forEach((device, index) => {
          attrs.forEach(attr => {
            if (index !== 0) {
              serviceToCall += "?var=" + device.name + "." + attr;
            }
          });
        });          
      } else {
        let device = Array.isArray(devices) ? devices[0] : devices;
        if (device != undefined) {
          attrs.forEach(attr => {
            serviceToCall += "?var=" + device.name + "." + attr;
          });  
        }
      }
      serviceToCall = serviceToCall + "?period=" + dates.period;
      //console.log('service to call:', serviceToCall);

      xhr.open('GET', serviceToCall);
      setTimeout(() => {
        if (xhr.readyState < 3) {
          console.log("aborting");
          console.log(xhr);
          xhr.abort();
        }
      }, 120000);
      xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
          return resolve(reading);
        } else {
          return reject({ status: 500, message: 'could not retrieve the requested data' });
        }
      }
      xhr.onerror = function () {
        return reject({ status: 500, message: 'An error occurred while requesting data from ' + serviceToCall });
      };
      xhr.onabort = function () {
        console.error('The request timed out in ' + hostname + api_prefix);
        return reject({ status: 500, message: 'OnAbort' })
      };
      xhr.send();
    })
  }
}