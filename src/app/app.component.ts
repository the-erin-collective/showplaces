import { Component, HostListener  } from '@angular/core';
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
  currentAddressString = "";
  imagesLoadingText = "";
  messageQueue: any = [];
  maxRecentlyVisistedAddresses = 5;
  maxPhotos = 5;
  toastMessageDurationSeconds = 5;
  start_latitude: number = -29.8167096;
  start_longitude: number = 30.9508673;
  lastcoordsStorageName = 'lastcoords';
  recentlyVisistedStorageName = 'history';
  recentlyVisited = [];
  currentImages = [];
  currentSuggestions = [];
  showPing = false;
  clickEffectLeft = "0";
  clickEffectTop = "0";
  searchPlaceholderText = "Search...";
  onMouseClickAnimEnd(){
    this.showPing = false;
  }
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
    
    this.gotoGeoLocation({lat: this.start_latitude, lng: this.start_longitude});

    this.map.on('click', (args) =>  {
      this.showPing = true;
      this.clickEffectLeft =  args.originalEvent.clientX;
      this.clickEffectTop = args.originalEvent.clientY;
      console.log("click at x:" + args.originalEvent.clientX + " y:" + args.originalEvent.clientY );
      this.gotoGeoLocation(args.latlng);
    });

    this.map.on('zoomstart', () =>  {
      this.currentAddressString = "";
      this.currentImages = [];
      this.currentSuggestions = [];
    })
    
    this.map.on('dragstart', () =>  {
      this.currentAddressString = "";
      this.currentImages = [];
      this.currentSuggestions = [];
    })
  };
  searchAddress(searchText){
    NominatimJS.search({ q : searchText, limit : 1}).then(results => {
      if(results == null)
        return;
      if(results.length == 0)
      {
        this.showToastMessage("Address not found.");
        return;
      } 
      console.log("search result: " + JSON.stringify(results));
      let thisresult = results[0];
      this.gotoGeoLocation({lat: thisresult.lat, lng: thisresult.lon});
    });
  }
  suggestAddress(suggest){
    this.currentSuggestions = [];
    if(suggest == "")
      return;
    NominatimJS.search({ q : suggest, limit : 5}).then(results => {
      this.currentSuggestions = results;
    });
  }
  onSuggestionChosen(suggestion){
    this.gotoGeoLocation({lat: suggestion.lat, lng: suggestion.lon});
  }
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
      this.currentImages = [];
      if(results.photos.photo.length == 0){
        this.imagesLoadingText = "No images found.";
        this.showToastMessage("No images found at this location.");
      }else{
        this.imagesLoadingText = "";
      }
      for(let i = 0; i < (this.maxPhotos < results.photos.photo.length ? this.maxPhotos : results.photos.photo.length); i++){
        let newPhoto = this.getRandomPhotoFromList(results.photos.photo, this.getPhotoIdList(this.currentImages) );
        this.currentImages.push(newPhoto);
        console.log(newPhoto);
      };
    }).catch(error => { 
      console.log(error);
    });
  };
  getPhotoIdList(images){
    let photoIds = [];
    images.forEach(image => {
      photoIds.push(image.id);
    });
    return photoIds;
  };
  getRandomPhotoFromList(photos, exclusionList){
    let randomIndex = Math.floor(Math.random() * photos.length);
    let randomPhoto = photos[randomIndex];
    if(exclusionList == null)
      exclusionList = [];
    let alreadyExists = false; 
    exclusionList.forEach(photoid => {
     if(photoid == randomPhoto.id)
      alreadyExists = true;
    });
    if(alreadyExists && photos.length > 1)
    {
      photos.filter(photo => photo.id !== randomPhoto.id);
      return this.getRandomPhotoFromList(photos, exclusionList);
    }
    else
      return randomPhoto;
  };
  gotoGeoLocation(latlng){
    this.currentAddressString = "";
    this.imagesLoadingText = "";
    this.currentImages = [];
    this.currentSuggestions = [];
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
      let oneLineAddress = this.getOneLineAddress(results.address);
      this.currentAddressString = oneLineAddress;
      this.showToastMessage(oneLineAddress);
      if(!this.isGeolocationInVisitList(latlng)){
        if(this.recentlyVisited.length == this.maxRecentlyVisistedAddresses)
          this.recentlyVisited.shift();
        this.recentlyVisited.push(this.createVisitModel(latlng, results.address));
        localStorage.setItem(this.recentlyVisistedStorageName, JSON.stringify(this.recentlyVisited));
      };
      this.imagesLoadingText = "Loading images...";
      this.findGeoImages({ lat: latlng.lat, lon: latlng.lng });
    }).catch(error => {
      console.log(error);
      this.showToastMessage("Location service unavailable.");
    });
  };
  isGeolocationInVisitList(latlng): boolean{
    let alreadyVisisted = false;
    this.recentlyVisited.forEach(element => {
      if(element.geolocation.latitude == latlng.lat && element.geolocation.longitude == latlng.lng)
        alreadyVisisted = true;
    });
    return alreadyVisisted;
  };
  createVisitModel(latlng, address){
     return { 
       timestamp : new Date().getDate(), 
       geolocation : { 
         latitude : latlng.lat,
         longitude : latlng.lng
        }, 
        addressstring : this.getOneLineAddress(address),
        fulladdress : address
      };
  }
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
    let visited = JSON.parse(localStorage.getItem(this.recentlyVisistedStorageName));
    if(visited != null)
      this.recentlyVisited = visited;
  }
}
