import { Component } from '@angular/core';
import * as L from 'leaflet';
import { NominatimJS }  from '@owsas/nominatim-js';
import { FlickrAPIService } from './flickrapi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  constructor(private flickr: FlickrAPIService) { }

  title = 'showplaces';
  map: any;
  tiles: any;
  showToast: boolean = false;
  fadeOutToast: boolean = false;
  popupText: string = "Welcome.";
  messageQueue: any = [];
  toastMessageDurationSeconds = 5;
  start_latitude: number = -29.8167096;
  start_longitude: number = 30.9508673;
  lastcoordsStorageName = 'lastcoords';
  recentlyVisistedStorageName = 'history';
  recentlyVisited = [];
  ngAfterViewInit(){
    let lastCoords = JSON.parse(localStorage.getItem(this.lastcoordsStorageName));
    if(lastCoords != null)
    {
      this.start_latitude = lastCoords.lat;
      this.start_longitude =  lastCoords.lng;
    }
    this.map = L.map('places_map', {
      center: [ this.start_latitude, this.start_longitude ],
      zoom: 8
    });
    this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    this.tiles.addTo(this.map);
    this.map.zoomControl.setPosition('bottomleft');
    
    this.map.on('click', (args) =>  {
      this.gotoGeoLocation(args.latlng);
    });

    let visited = JSON.parse(localStorage.getItem(this.recentlyVisistedStorageName));
    if(visited != null)
      this.recentlyVisited = visited;
  };
  centerOnGeolocation(){
    if(!('geolocation' in navigator)){
      this.showToastMessage("Unable to get geolocation from browser.");
      return;
    }
    this.showToastMessage("Geolocating.");
    navigator.geolocation.getCurrentPosition((position) => {
      this.gotoGeoLocation({lat: position.coords.latitude, lng: position.coords.longitude});
    });
  };
  findGeoImages(latlong){
    this.flickr.search({
      lat: latlong.lat,
      lon: latlong.lon
    }).toPromise().then(results => { 
      console.log(results);
    }).catch(error => { 
      console.log(error);
      this.showToastMessage("Image service unavailable.");
    });
  }
  gotoGeoLocation(latlng){
    localStorage.setItem(this.lastcoordsStorageName, JSON.stringify(latlng));
    console.log(JSON.stringify(latlng));
    this.map.panTo(latlng, this.map.getZoom());
    NominatimJS.reverse({
      lat: latlng.lat,
      lon: latlng.lng
    }).then(results => {
      console.log(results);
      if(results == null || results.address == null)
        return;
      this.showToastMessage(this.getOneLineAddress(results.address));
      this.recentlyVisited.push({ timestamp : new Date().getDate(), geolocation : { latitude : latlng.lat, longitude : latlng.lng}, address : results.address });
      this.findGeoImages({ lat: latlng.lat, lon: latlng.lng });
    }).catch(error => {
      console.log(error);
      this.showToastMessage("Location service unavailable.");
    });
  };
  getOneLineAddress(address):string{
    let addressArr = [];
    if(address.road && address.road != "")
      addressArr.push(address.road);
    if(address.suburb && address.suburb != "")
      addressArr.push(address.suburb);
    if(address.town && address.town != "")
      addressArr.push(address.town);
    if(address.city && address.city != "")
      addressArr.push(address.city);
    if(address.state && address.state != "")
      addressArr.push(address.state);
    if(address.country && address.country != "")
      addressArr.push(address.country);
    if(address.postcode && address.postcode != "")
      addressArr.push(address.postcode);
    return addressArr.join(", ");
  };
  showToastMessage(message:string){
    this.popupText = message;
    this.showToast = true;
    this.fadeOutToast = false;
    this.messageQueue.push(message);
    setTimeout(() => this.hideToastMessage(), 1000 * this.toastMessageDurationSeconds)
  };
  hideToastMessage(){
    if(this.messageQueue.length > 0){
      this.messageQueue.shift();
    }
    if(this.messageQueue.length == 0){
      this.fadeOutToast = true;
      setTimeout(() => this.showToast = false, 1000 );
    }
  };
  ngOnInit() {
    let lastCoords = JSON.parse(localStorage.getItem(this.lastcoordsStorageName));
    if(lastCoords == null && 'geolocation' in navigator)
    {
      console.log('geolocation available');
      navigator.geolocation.getCurrentPosition((position) => {
       this.gotoGeoLocation({lat: position.coords.latitude, lng: position.coords.longitude});
      });
    } else {
      console.log('geolocation unavailable');
    }
  }
}
