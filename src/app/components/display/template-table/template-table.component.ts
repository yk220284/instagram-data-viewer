import { Component, Input, OnInit } from '@angular/core';
import { Post } from 'src/post';
import { PresistDataService } from '../../../services/presist-data.service';

@Component({
  selector: 'app-template-table',
  templateUrl: './template-table.component.html',
  styleUrls: ['./template-table.component.css']
})
export class TemplateTableComponent implements OnInit {

  displayedColumns: string[] = ['full_name', 'shortcode', 'upload_date', 'username', 'display_url'];
  @Input() dataSource: Post[] = [];
  clickedRows = new Set<Post>();

  constructor() { }

  ngOnInit(): void {
  }
}
