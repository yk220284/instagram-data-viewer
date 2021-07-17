import { Component, Input, OnInit } from '@angular/core';
import { Post, PostState } from 'src/post';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PresistDataService } from '../../../services/presist-data.service';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
  post: Post | undefined;
  postState: PostState | undefined;
  url: string | undefined;
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
            console.log(post, urlJson);

            this.post = post;
            this.url = urlJson.url;
          }
        })
      )
      .subscribe();
  }

  private getImageUrl(
    shortcode: string
  ): Observable<{ url: string; [key: string]: any }> {
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
