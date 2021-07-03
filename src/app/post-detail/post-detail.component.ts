import { Component, Input, OnInit } from '@angular/core';
import { Post } from 'src/post';
import { ActivatedRoute } from '@angular/router';
import { PostDataService } from '../post-data.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | undefined;
  constructor(
    private route: ActivatedRoute,
    private postDataService: PostDataService
  ) { }

  ngOnInit(): void {
    const shortcode: string = String(this.route.snapshot.paramMap.get('id'));
    this.getPost(shortcode);
  }

  getPost(shortcode: string): void {
    this.postDataService.getPost(shortcode).subscribe(post => this.post = post);
  }

}
