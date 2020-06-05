import { Component, HostListener  } from '@angular/core';
import * as L from 'leaflet';
import { NominatimJS }  from '@owsas/nominatim-js';
import { FlickrAPIService } from './flickrapi.service';
import { AppOptions } from './options.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  public options: AppOptions = new AppOptions();

  constructor(private flickr: FlickrAPIService) { 
  }

  title = 'showplaces';
  map: any;
  tiles: any;
  showToast: boolean = false;
  fadeOutToast: boolean = false;
  currentAddressString = "";
  imagesLoadingText = "";
  messageQueue: any = [];
  recentlyVisited = [];
  currentImages = [];
  currentSuggestions = [];
  showPing = false;
  clickEffectLeft = "0";
  clickEffectTop = "0";
  start_latitude: number = -29.8167096;
  start_longitude: number = 30.9508673;
  popupText: string = "Welcome.";
  searchPlaceholderText: string = "Search...";

  onMouseClickAnimEnd(){
    this.showPing = false;
  }

  ngAfterViewInit(){
    // get the last geolocation from local storage
    let lastCoords = JSON.parse(localStorage.getItem(this.options.lastcoordsStorageName));
    if(lastCoords != null)
    {
      this.start_latitude = lastCoords.lat;
      this.start_longitude =  lastCoords.lng;
    }
    // create the map
    this.map = L.map('places_map', {
      center: [ this.start_latitude, this.start_longitude ],
      zoom: 8
    });
    // add map tiles
    this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    this.tiles.addTo(this.map);
    // position zoom control
    this.map.zoomControl.setPosition('bottomleft');
    // geolocate at the current position
    this.gotoGeoLocation({lat: this.start_latitude, lng: this.start_longitude});

    this.map.on('click', (args) =>  {
      // set variables for click animation
      this.showPing = true;
      this.clickEffectLeft =  args.originalEvent.clientX;
      this.clickEffectTop = args.originalEvent.clientY;
      console.log("click at x:" + args.originalEvent.clientX + " y:" + args.originalEvent.clientY );
      // geolocate at the latitude and longitude clicked
      this.gotoGeoLocation(args.latlng);
    });

    this.map.on('zoomstart', () =>  {
      // clear previous geolocation info
      this.currentAddressString = "";
      this.currentImages = [];
      this.currentSuggestions = [];
    })
    
    this.map.on('dragstart', () =>  {
      // clear previous geolocation info
      this.currentAddressString = "";
      this.currentImages = [];
      this.currentSuggestions = [];
    })
  };

  ngOnInit() {
    // if no last coordinates geolocate to the users geolocation if it is supported by the browser
    let lastCoords = JSON.parse(localStorage.getItem(this.options.lastcoordsStorageName));
    if(lastCoords == null && 'geolocation' in navigator)
    {
      console.log('geolocation available');
      navigator.geolocation.getCurrentPosition((position) => {
       this.gotoGeoLocation({lat: position.coords.latitude, lng: position.coords.longitude});
      });
    } else {
      console.log('geolocation unavailable');
    }
    // load the recently visited list from local storage
    let visited = JSON.parse(localStorage.getItem(this.options.recentlyVisistedStorageName));
    if(visited != null)
      this.recentlyVisited = visited;
  };

  searchAddress(searchText){
    // query nomanitim service for the lat and long of the search address
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
      // geolocate at the found location
      this.gotoGeoLocation({lat: thisresult.lat, lng: thisresult.lon});
    });
  };

  suggestAddress(suggest){
    // clear existing suggestions
    this.currentSuggestions = [];
    if(suggest == "")
      return;
    // call nomanitim service for suggested locations based on suggestion text
    NominatimJS.search({ q : suggest, limit : 5}).then(results => {
      this.currentSuggestions = results;
    });
  };

  onSuggestionChosen(suggestion){
    // geolocate to the lat and long of the chosen location suggestion
    this.gotoGeoLocation({lat: suggestion.lat, lng: suggestion.lon});
  };

  centerOnGeolocation(){
    // geolocate to the browser's geolocation if available
    if(!('geolocation' in navigator)){
      this.showToastMessage("Unable to get geolocation from browser.");
      return;
    }
    this.showToastMessage("Geolocating.");
    // get geolocation from browser navigator module
    navigator.geolocation.getCurrentPosition((position) => {
      this.gotoGeoLocation({lat: position.coords.latitude, lng: position.coords.longitude});
    });
  };

  findGeoImages(latlong){
    // call flickr service for photos at the lat and long
    this.flickr.search({
      lat: latlong.lat,
      lon: latlong.lon
    }).toPromise().then(results => { 
      console.log(results);
      this.currentImages = [];
      // if no images found show feedback
      if(results.photos.photo.length == 0){
        this.imagesLoadingText = "No images found.";
        this.showToastMessage("No images found at this location.");
      }else{
        this.imagesLoadingText = "";
      }
      // iterate through up to 5 photos
      for(let i = 0; i < (this.options.maxPhotos < results.photos.photo.length ? this.options.maxPhotos : results.photos.photo.length); i++){
        // get a photo that hasn't already been loaded
        let newPhoto = this.getRandomPhotoFromList(results.photos.photo, this.getPhotoIdList(this.currentImages) );
        // push image to the currentImages array which will add it to the dom via the binding
        this.currentImages.push(newPhoto);
        console.log(newPhoto);
      };
    }).catch(error => { 
      console.log(error);
    });
  };

  getPhotoIdList(images){
    // return an array of image ids from an array of images
    let photoIds = [];
    images.forEach(image => {
      photoIds.push(image.id);
    });
    return photoIds;
  };

  getRandomPhotoFromList(photos, exclusionList){
    // gets a random photo from photos array as long as it's not in the exclusionList
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
      // photo is already added, try again but take it out of the photos list
      photos.filter(photo => photo.id !== randomPhoto.id);
      return this.getRandomPhotoFromList(photos, exclusionList);
    }
    else
      return randomPhoto;
  };

  gotoGeoLocation(latlng){
    // handle geolocating and starting address and image lookups
    this.currentAddressString = "";
    this.imagesLoadingText = "";
    this.currentImages = [];
    this.currentSuggestions = [];
    // save the lat long to local storage as the last visited coordinate
    localStorage.setItem(this.options.lastcoordsStorageName, JSON.stringify(latlng));
    console.log(JSON.stringify(latlng));
    // pan the map to the lat and long
    this.map.panTo(latlng, this.map.getZoom());
    // call the nomanitim service for the address at the given lat and long
    NominatimJS.reverse({
      lat: latlng.lat,
      lon: latlng.lng
    }).then(results => {
      console.log(results);
      // if no results don't continue
      if(results == null || results.address == null)
        return;
      // get the address as a one line string for display
      let oneLineAddress = this.getOneLineAddress(results.address);
      // set current address string, bound to header of the photo box
      this.currentAddressString = oneLineAddress;
      // show the current address as a toast message
      this.showToastMessage(oneLineAddress);
      // if the location hasn't already been added to the recently visisted list, add it
      if(!this.isGeolocationInVisitList(latlng)){
        // if the list is full drop the oldest item of the list
        if(this.recentlyVisited.length == this.options.maxRecentlyVisistedAddresses)
          this.recentlyVisited.shift();
        // add the new location to the list and save it to local storage
        this.recentlyVisited.push(this.createVisitModel(latlng, results.address));
        localStorage.setItem(this.options.recentlyVisistedStorageName, JSON.stringify(this.recentlyVisited));
      };
      // start image lookup
      this.imagesLoadingText = "Loading images...";
      this.findGeoImages({ lat: latlng.lat, lon: latlng.lng });
    }).catch(error => {
      console.log(error);
      this.showToastMessage("Location service unavailable.");
    });
  };

  isGeolocationInVisitList(latlng): boolean{
    // check recently visited list for passed in lat and long
    let alreadyVisisted = false;
    this.recentlyVisited.forEach(element => {
      if(element.geolocation.latitude == latlng.lat && element.geolocation.longitude == latlng.lng)
        alreadyVisisted = true;
    });
    return alreadyVisisted;
  };

  createVisitModel(latlng, address){
    // for saving to the recently visited list
     return { 
       timestamp : new Date().getDate(), 
       geolocation : { 
         latitude : latlng.lat,
         longitude : latlng.lng
        }, 
        addressstring : this.getOneLineAddress(address),
        fulladdress : address
      };
  };

  getOneLineAddress(address):string{
    // flatten address into a one line string
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
    // display a toast message
    this.popupText = message;
    this.showToast = true;
    this.fadeOutToast = false;
    this.messageQueue.push(message);
    // after a delay hide it
    setTimeout(() => this.hideToastMessage(), 1000 * this.options.toastMessageDurationSeconds)
  };

  hideToastMessage(){
    // hide toast message if there are no more to show
    if(this.messageQueue.length > 0){
      this.messageQueue.shift();
    }
    if(this.messageQueue.length == 0){
      this.fadeOutToast = true;
      setTimeout(() => this.showToast = false, 1000 );
    }
  };
};