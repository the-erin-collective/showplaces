import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class FlickrAPIService {
 
  constructor(private http: HttpClient) { }

  search(params) {
    params.format = params.format || 'json';
    params.api_key = params.api_key ||"126896b00af6a83050b59372c330184c";
    params.min_taken_date = params.min_taken_date ||"2000-01-01";
    params.license = params.license ||"1,2,3,4,5,6,9,10";
    params.content_type = params.content_type ||"1";
    params.nojsoncallback = params.nojsoncallback ||"1";
    params.method = params.method || "flickr.photos.search";
    params.has_geo = params.has_geo ||"1";

    const url = new URL('https://www.flickr.com/services/rest');
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return this.http.get(url.toJSON());
  };
}