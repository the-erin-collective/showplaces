import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class FlickrAPIService {
  apikey = "126896b00af6a83050b59372c330184c";
  format = "json";
  nojsoncallback = "1";
  apiURL = "https://www.flickr.com/services/rest";

  constructor(private http: HttpClient) { }

  search(params):any {
    params.format = params.format || this.format;
    params.api_key = params.api_key || this.apikey;
    params.nojsoncallback = params.nojsoncallback || this.nojsoncallback;
    params.method = params.method || "flickr.photos.search";
    params.min_taken_date = params.min_taken_date ||"2000-01-01";
    params.license = params.license ||"1,2,3,4,5,6,9,10";
    params.content_type = params.content_type ||"1";
    params.has_geo = params.has_geo ||"1";

    const url = new URL(this.apiURL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return this.http.get(url.toJSON());
  };
  photo(params):any{
    params.format = params.format || this.format;
    params.api_key = params.api_key || this.apikey;
    params.nojsoncallback = params.nojsoncallback || this.nojsoncallback;
    params.method = params.method || "flickr.photos.getInfo";

    const url = new URL(this.apiURL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return this.http.get(url.toJSON());
  };
  getSizes(params):any{ // query
    params.format = params.format || this.format;
    params.api_key = params.api_key || this.apikey;
    params.nojsoncallback = params.nojsoncallback || this.nojsoncallback;
    params.method = params.method || "flickr.photos.getSizes";
   
    const url = new URL(this.apiURL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return this.http.get(url.toJSON());
  };
}