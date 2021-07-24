import { Component, Input, OnInit } from '@angular/core';
import { Post, PostState } from 'src/post';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  ImageUrl,
  ImgType,
  PresistDataService,
} from '../../../services/presist-data.service';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';
import { Profile } from 'src/profile';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  post: Post | undefined;
  postState: PostState | undefined;
  url: string | undefined;
  profile_pic_url: string | undefined;
  navigationSubscription: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private presistDataService: PresistDataService
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }
    });
  }
  initialiseInvites() {
    // Set default values and re-fetch any data you need.
    const shortcode: string = String(this.route.snapshot.paramMap.get('id'));
    this.postState = String(
      this.route.snapshot.paramMap.get('postState')
    ) as PostState;
    combineLatest([this.getPost(shortcode), this.getImageUrl(shortcode)])
      .pipe(
        take(1),
        tap(([post, urlJson]) => {
          if (post) {
            this.post = post;
            this.url = urlJson.post;
            this.profile_pic_url = urlJson.profile;
          }
        })
      )
      .subscribe();
  }

  private getImageUrl(shortcode: string): Observable<ImageUrl> {
    return this.presistDataService.getImageUrl(shortcode);
  }
  private getPost(shortcode: string): Observable<Post | null> {
    return this.postState === 'unprocessed'
      ? this.presistDataService.getPostUnprocessed(shortcode)
      : this.presistDataService.getPostProcessed(shortcode);
  }

  ngOnInit(): void {
    this.initialiseInvites();
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
