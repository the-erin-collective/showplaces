import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { NominatimJS }  from '@owsas/nominatim-js';
import { SearchComponent } from './../search/search.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [SearchComponent]
})

export class MapComponent implements OnInit {

  map: any;
  tiles: any;
  start_latitude: number = -29.8167096;
  start_longitude: number = 30.9508673;
  lastcoordsStorageName = 'lastcoords';
  ngAfterViewInit(){
    let lastCoords = JSON.parse(localStorage.getItem(this.lastcoordsStorageName));
    if(lastCoords != null)
    {
      this.start_latitude = lastCoords.lat;
      this.start_longitude =  lastCoords.lng;
    }
    this.map = L.map('places_map', {
      center: [ this.start_latitude, this.start_longitude ],
      zoom: 8//,
    //  zoomControl: false
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
  };
  onTestclick(event){
    console.log("onTestclick");
  };
  onStartGeolocate(msg:string){
    console.log("lol");
    console.log(msg);
  };
  gotoGeoLocation(latlng){
    localStorage.setItem(this.lastcoordsStorageName, JSON.stringify(latlng));
    console.log(JSON.stringify(latlng));
    this.map.panTo(latlng, this.map.getZoom());
    NominatimJS.reverse({
      lat: latlng.lat,
      lon: latlng.lng
    }).then(results => {
      console.log(results);
      // do something with results
    }).catch(error => {
      console.log(error);
      // error ocurred
    });
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
