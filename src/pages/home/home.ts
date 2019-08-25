import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { PostsProvider } from '../../providers/posts/posts'
import { HttpClient } from '@angular/common/http';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AdMobPro } from '@ionic-native/admob-pro';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  posts: any;

  constructor(
    public navCtrl: NavController, 
    public platform: Platform, 
    public postsProvider: PostsProvider, 
    public http: HttpClient, 
    public socialSharing: SocialSharing, 
    public admob: AdMobPro,
    public loadingCtrl: LoadingController) {
    platform.ready().then(() => {
      var admobid = {
        banner: 'ca-app-pub-9259900466674677/6074875066'
      };

      this.admob.createBanner({
        adId: admobid.banner,
        isTesting: true,
        autoShow: true,
        position: this.admob.AD_POSITION.BOTTOM_CENTER
      });
    });

    this.getPosts();
  }

  getPosts() {
    let loading = this.loadingCtrl.create({
      content: "Loading videos..."
    });
    loading.present();

    this.postsProvider.getPosts().then((data: any) => {
      console.log(data.data.children);

      this.posts = data.data.children.filter(post => post.data.url && this.isStreamWebsite(post.data.url));

      var domParser = new DOMParser();
      this.posts.forEach(post => {
        this.http.get("https://cors-anywhere.herokuapp.com/" + post.data.url, { responseType: 'text' }).subscribe((data: string) => {
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
          if (post["video_url"]) {
            post["video_url"] += "#t=0.1";
          }
        });
      });

      console.log(this.posts);
      loading.dismiss();
    });
  }

  isStreamWebsite(url) {
    return /streamable|streamja|streamvi|gfycat|gifv/i.test(url);
  }

  share(post) {
    this.socialSharing.shareWithOptions({
      message: post.data.title,
      url: post.data.url
    }).then(() => {
      console.log("Share: " + post);
    }).catch(e => {
      console.log(e);
    });
  }

  pauseAll(elem) {
    var videos = document.querySelectorAll('video');
    elem = elem.target;
    
    for (var i = 0; i < videos.length; i++) {
        if (videos[i] == elem) continue;
        if (videos[i].played.length > 0 && !videos[i].paused) {
            videos[i].pause();
        }
    }
}
}
