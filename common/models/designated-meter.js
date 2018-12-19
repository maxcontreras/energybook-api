'use strict';
const https = require('https');


module.exports = function(Designatedmeter) {

    Designatedmeter.getWeather = function getWeather(lat, lon, cb) {
        const API_URL = 'da79653f5a5cf0558734cee7b31bd0d7';
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&APPID=${API_URL}`;

        https.get(url, (resp) => {
            let data = '';
            resp.setEncoding('utf8');
            
            resp.on('data', (chunk) => {
                data += chunk;
            });
            
            // When the information has been received, send it back
            resp.on('end', () => {
                cb(null, JSON.parse(data));
            });
        });
    }

    Designatedmeter.remoteMethod(
        'getWeather', {
            accepts: [
                { arg: 'lat', type: 'number' },
                { arg: 'lon', type: 'number' }
            ],
            returns: { arg: 'results', type: 'object' }
    });
};
