import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {

  @Output() geolocate = new EventEmitter();
  @Output() onsearch = new EventEmitter<string>();
  @Output() suggest = new EventEmitter<string>();
  @Output() choose = new EventEmitter<any>();

  @Input() placeholderText: string;
  @Input() suggestions: any;

  inputvalue: string = "";
  inputStartTime: Date;
  lastInputTime: Date;
  inputSuggestionDelaySeconds: number = 1; 
  lastSuggestionText: string = "";

  constructor() { }
  
  centerOnGeolocation(){
    this.geolocate.emit();
  }

  search(enterEvent){
    console.log(enterEvent);
    this.onsearch.emit(this.inputvalue);
  }

  textupdated(inputEvent){
    this.lastInputTime = new Date();
    if(this.inputStartTime == null)
      this.inputStartTime = this.lastInputTime;
    console.log(this.lastInputTime);
  }

  checkSuggestionCriteria(){
    if(this.lastInputTime == null)
      return;
    let now = new Date();
    const diffTime = (now.getTime() - this.lastInputTime.getTime());
    if(diffTime < (this.inputSuggestionDelaySeconds * 1000))
      return;
    if(this.lastSuggestionText == this.inputvalue)
      return;
    this.lastSuggestionText = this.inputvalue;
    this.suggest.emit(this.inputvalue);
    console.log("checking for suggestions");
  }

  onSuggestionClicked(suggestion){
    console.log("suggestion chosen");
    this.choose.emit(suggestion);
  }

  ngOnInit(): void {
    interval(1000).subscribe(x => this.checkSuggestionCriteria());
  }

}
