import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-visited',
  templateUrl: './visited.component.html',
  styleUrls: ['./visited.component.css']
})

export class VisitedComponent implements OnInit {
 
  @Output() revisit = new EventEmitter();

  @Input() visited: any;

  constructor() { }

  onRevisit(){
    this.revisit.emit({ lat : this.visited.geolocation.latitude, lng : this.visited.geolocation.longitude});
  }

  ngOnInit(): void {
  }

}
