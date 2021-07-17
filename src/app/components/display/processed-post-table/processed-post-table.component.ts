import { Component, OnInit } from '@angular/core';
import { PresistDataService } from '../../../services/presist-data.service';
import { Post } from '../../../../post';
@Component({
  selector: 'app-processed-post-table',
  templateUrl: './processed-post-table.component.html',
})
export class ProcessedPostTableComponent implements OnInit {
  dataSource: Post[] = [];
  constructor(private presistDataService: PresistDataService) {
    this.presistDataService.processedPosts.subscribe(
      (posts) => (this.dataSource = posts)
    );
  }

  ngOnInit(): void {}
}
