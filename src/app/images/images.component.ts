import { Component, OnInit, Input } from '@angular/core';
import { FlickrAPIService } from './../flickrapi.service';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit {
  @Input() image: any;
  photoImgUrl: string = "";
  photoSizes: any;
  targetHeight: number = 150;
  showImage: boolean = false;

  constructor(private flickr: FlickrAPIService) { }

  onImageLoaded(){
    this.showImage = true; 
    console.log("loaded image");
  };
  getBestSize(sizes):any{
    if(sizes == null || sizes.length == 0)
      return null;
    let bestSize = sizes[0];
    let bestSizeDifference = bestSize.height - this.targetHeight;
    bestSizeDifference = bestSizeDifference < 0 ? (bestSizeDifference * -1) : bestSizeDifference;
    sizes.forEach(size => {
      let difference = size.height - this.targetHeight;
      let signRemoved = difference < 0 ? (difference * -1) : difference;
      if(signRemoved < bestSizeDifference)
      {
        bestSizeDifference = signRemoved;
        bestSize = size;
      };
    });
    return bestSize;
  };
  ngOnInit(): void {
    this.flickr.getSizes({
      photo_id: this.image.id
    }).toPromise().then(results => { 
      let bestSize = this.getBestSize(results.sizes.size);
      console.log(bestSize);
      this.photoImgUrl = bestSize.source;
    }).catch(error => { 
      this.showImage = true; 
      console.log(error);
    });
  }

}
