import { Component, OnInit } from '@angular/core';
import { Post } from 'src/post';
import { PostDataService } from '../post-data.service';

@Component({
  selector: 'app-post-table',
  templateUrl: './post-table.component.html',
  styleUrls: ['./post-table.component.css']
})
export class PostTableComponent implements OnInit {

  displayedColumns: string[] = ['full_name', 'shortcode', 'upload_date', 'username', 'display_url'];
  dataSource: Post[] = [];
  clickedRows = new Set<Post>();

  constructor(private postDataService: PostDataService) { }

  ngOnInit(): void {
    this.postDataService.getPosts().subscribe(posts => this.dataSource = posts);
    console.log(this.dataSource);

  }
}
