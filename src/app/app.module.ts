import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule  } from '@angular/common/http';
import { VisitedComponent } from './visited/visited.component';
import { ImagesComponent } from './images/images.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  declarations: [AppComponent, VisitedComponent, ImagesComponent, SearchComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
