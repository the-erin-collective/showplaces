import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  @Output() startGeolocate: EventEmitter<string> = new EventEmitter();
 
  constructor() { }

  ngOnInit(): void {
  }

  centerOnGeolocation(): void{
    console.log("geolocation button");
    this.startGeolocate.emit("");
    console.log("after emit");
  }
  
}
