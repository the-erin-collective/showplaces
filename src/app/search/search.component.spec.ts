import { Component, OnInit, Input } from '@angular/core';
import { SearchComponent } from './search.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class Search implements OnInit {
  @Input() searchbox: SearchComponent;

  constructor() { }

  ngOnInit() {
  }

}