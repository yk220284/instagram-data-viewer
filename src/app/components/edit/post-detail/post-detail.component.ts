import { Component, Input, OnInit } from '@angular/core';
import { Post } from 'src/post';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PresistDataService } from '../../../services/presist-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
  post: Post | undefined;
  isProcessed: boolean | undefined;
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
    this.getPost(shortcode);
    this.getImageUrl(shortcode);
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

  getPost(shortcode: string): void {
    this.presistDataService
      .getPostUnprocessed(shortcode)
      .subscribe((post: Post) => {
        // console.log('unprocessed post', post);
        if (post !== null) {
          this.post = post;
          this.isProcessed = false;
        }
      });
    this.presistDataService
      .getPostProcessed(shortcode)
      .subscribe((post: Post) => {
        if (post !== null) {
          console.log('processed post', post);
          this.post = post;
          this.isProcessed = true;
        }
      });
  }

  getImageUrl(shortcode: string) {
    this.presistDataService.getImageUrl(shortcode).subscribe((urlJson) => {
      this.url = urlJson.url;
    });
  }
}
