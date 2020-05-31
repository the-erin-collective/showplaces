import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import * as L from 'leaflet';
import { NominatimJS }  from '@owsas/nominatim-js';
/*import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';*/
/*
@Component({
  selector: 'demo-typeahead-animated',
  templateUrl: './app.component.html'
})

export class DemoTypeaheadAnimatedComponent {
  selected: string;
  states: string[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Dakota',
    'North Carolina',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ];
}
*/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'showplaces';
  map: any;
  tiles: any;
  start_latitude: number = -29.8167096;
  start_longitude: number = 30.9508673;
  ngAfterViewInit(){
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
  gotoGeoLocation(latlng){
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
    if('geolocation' in navigator) {
      console.log('geolocation available');
      navigator.geolocation.getCurrentPosition((position) => {
       this.gotoGeoLocation({lat: position.coords.latitude, lng: position.coords.longitude});
      });
    } else {
      console.log('geolocation unavailable');
    }
  }
}