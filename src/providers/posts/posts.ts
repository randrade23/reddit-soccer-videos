import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the PostsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PostsProvider {
  apiUrl = 'https://cors-anywhere.herokuapp.com/https://reddit.com/r/soccer/new/.json?limit=25';

  constructor(public http: HttpClient) {
    console.log('Hello PostsProvider Provider');
  }

  getPosts(last) {
    if (last) {
      return new Promise(resolve => {
        this.http.get(this.apiUrl + "&after=" + last).subscribe(data => {
          resolve(data);
        }, err => {
          console.log(err);
        });
      });
    }
    else {
      return new Promise(resolve => {
        this.http.get(this.apiUrl).subscribe(data => {
          resolve(data);
        }, err => {
          console.log(err);
        });
      });
    }
  }
}
