import { Component, Input, OnInit } from '@angular/core';
import { Post } from 'src/post';
import { ActivatedRoute } from '@angular/router';
import { PostDataService } from '../post-data.service';
import { PresistDataService } from '../presist-data.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
  post: Post | undefined;
  isProcessed: boolean | undefined;
  url: string | undefined;
  constructor(
    private route: ActivatedRoute,
    private presistDataService: PresistDataService
  ) {}

  ngOnInit(): void {
    const shortcode: string = String(this.route.snapshot.paramMap.get('id'));
    this.getPost(shortcode);
    this.getImageUrl(shortcode);
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
