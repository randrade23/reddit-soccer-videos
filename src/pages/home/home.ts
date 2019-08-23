import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PostsProvider } from '../../providers/posts/posts'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  posts: any;

  constructor(public navCtrl: NavController, public postsProvider: PostsProvider, public http: HttpClient) {
    this.getPosts();
  }

  getPosts() {
    this.postsProvider.getPosts().then((data: any) => {
      console.log(data.data.children);

      this.posts = data.data.children.filter(post => post.data.url && this.isStreamWebsite(post.data.url));
      
      var domParser = new DOMParser();  
      this.posts.forEach(post => {
        this.http.get("https://cors-anywhere.herokuapp.com/" + post.data.url, {responseType: 'text'}).subscribe((data : string) => {
          var document = domParser.parseFromString(data, "text/html");
          var metas = document.getElementsByTagName("meta");
          Array.from(metas).forEach(m => {
            if (m.getAttribute("property") == "og:video:url") {
              post["video_url"] = m.getAttribute("content");
            }
          });
          if (!post["video_url"]) {
            var source = document.getElementsByTagName("source")[0];
            post["video_url"] = source ? source.getAttribute("src") : undefined;
          }
        });
      });

      console.log(this.posts);
    });
  }

  isStreamWebsite(url) {
    return /streamable|streamja|streamvi|gfycat|gifv/i.test(url);
  }
}
