import { Component, OnInit } from '@angular/core';
import { Post } from 'src/post';
import { PresistDataService } from '../../../services/presist-data.service';

@Component({
  selector: 'app-post-table',
  templateUrl: './post-table.component.html',
  styleUrls: ['./post-table.component.css'],
})
export class PostTableComponent implements OnInit {
  dataSource: Post[] = [];
  constructor(private presistDataService: PresistDataService) {}

  ngOnInit(): void {
    this.presistDataService.unprocessedPosts.subscribe(
      (posts: Post[]) => (this.dataSource = posts)
    );
  }
}
