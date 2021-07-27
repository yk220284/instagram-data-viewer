import { Component, OnInit } from '@angular/core';
import { PresistDataService } from '../../../services/presist-data.service';
import { Post } from '../../../../post';
import { Profile } from 'src/profile';
@Component({
  selector: 'app-processed-post-table',
  templateUrl: './processed-post-table.component.html',
})
export class ProcessedPostTableComponent implements OnInit {
  dataSource: Post[] = [];
  constructor(private presistDataService: PresistDataService) {
    this.presistDataService.profiles.subscribe(
      // TODO: quick fix, ag table should be used
      (profiles) => (this.dataSource = profiles.map((p) => Object.assign(p.post, { submitTime: p.submitTime })))
    );
  }

  ngOnInit(): void {}
}
