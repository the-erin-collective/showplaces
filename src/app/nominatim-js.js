"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = require("cross-fetch");
class NominatimJS {
    static search(params) {
        console.log("NominatimJS search");
        params.format = params.format || 'json';
        if (params.countryCodesArray) {
            params.countrycodes = params.countryCodesArray.join(',');
        }
        if (params.accept_language) {
            params['accept-language'] = params.accept_language;
        }
        const url = new URL('https://nominatim.openstreetmap.org/search');
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return cross_fetch_1.default(url.toJSON())
            .then(res => res.json());
    };
    static reverse(params) {
        console.log("NominatimJS reverse");
        params.format = params.format || 'json';
        if (params.accept_language) {
            params['accept-language'] = params.accept_language;
        }
        const url = new URL('https://nominatim.openstreetmap.org/reverse');
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return cross_fetch_1.default(url.toJSON())
            .then(res => res.json());
    };
}
exports.NominatimJS = NominatimJS;