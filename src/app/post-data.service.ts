import { Injectable } from '@angular/core';
import { Post } from 'src/post';
// import * as POSTS from '../scraped-data/processed_post.json'
import { Observable, of } from 'rxjs';
const POSTS: Post[] = [
  {
    "display_url": "https://instagram.flhr4-3.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/178847368_506319523715030_7156564082136229194_n.jpg?tp=1&_nc_ht=instagram.flhr4-3.fna.fbcdn.net&_nc_cat=102&_nc_ohc=Iqc-IIVNm-AAX8VeACj&tn=NmaTQ6IWa0DxW2Ei&edm=AABBvjUBAAAA&ccb=7-4&oh=be31488d72afaad756b9cb7d2f3ccc2d&oe=60DB04CF&_nc_sid=83d603",
    "full_name": "Darell Fleming Sr",
    "shortcode": "COO_YkbpIGO",
    "upload_date": "2021-04-29 04:08:13",
    "username": "darellflemingsr"
  },
  {
    "display_url": "https://instagram.flhr4-3.fna.fbcdn.net/v/t51.2885-15/e35/179095437_4168649783198946_9052892328957990943_n.jpg?tp=1&_nc_ht=instagram.flhr4-3.fna.fbcdn.net&_nc_cat=106&_nc_ohc=Y_8jMm55ITwAX8FPsR6&tn=NmaTQ6IWa0DxW2Ei&edm=AABBvjUBAAAA&ccb=7-4&oh=4c1337b5dd0271af2eb8a5540b79d300&oe=60DBD66D&_nc_sid=83d603",
    "full_name": "Despoina Arcardia",
    "shortcode": "COOtgB1niSl",
    "upload_date": "2021-04-29 01:31:57",
    "username": "despoinaarcadia"
  }];
@Injectable({
  providedIn: 'root'
})
export class PostDataService {

  constructor() { }

  getPosts(): Observable<Post[]> {
    const posts = of(POSTS)
    return posts;
  }
  getPost(shortcode: string): Observable<Post> {
    const post: Post = POSTS.find(post => post.shortcode === shortcode) || POSTS[0];
    return of(post);
  }
}
