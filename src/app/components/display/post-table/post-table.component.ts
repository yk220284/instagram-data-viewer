import { Component } from '@angular/core';
import { PresistDataService } from '../../../services/presist-data.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { extractValuesFromNestedObj } from '../template-table/template-table.component';

const COLUMNS_TO_DISPLAY = [
  { field: 'postProfile/username', headerName: 'Poster Username' },
  { field: 'postProfile/full_name', headerName: 'Poster Fullname' },
  {
    field: 'upload_date',
    headerName: 'Post Upload Date',
    sort: 'desc',
  },
  {
    field: 'shortcode',
    cellRenderer: 'linkRendererComponent',
    cellRendererParams: { inRouterLink: '/detail/unprocessed' },
  },
];

@Component({
  selector: 'app-post-table',
  templateUrl: './post-table.component.html',
})
export class PostTableComponent {
  rowData$: Observable<any[]>;
  columnDefs: any[];

  constructor(private presistDataService: PresistDataService) {
    this.columnDefs = COLUMNS_TO_DISPLAY;
    this.rowData$ = this.presistDataService.unprocessedPosts.pipe(
      map((dataSource) =>
        extractValuesFromNestedObj(
          COLUMNS_TO_DISPLAY.map((c) => c.field),
          dataSource
        )
      )
    );
  }
}
