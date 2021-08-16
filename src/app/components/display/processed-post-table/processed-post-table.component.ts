import { Component } from '@angular/core';
import { PresistDataService } from '../../../services/presist-data.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import 'ag-grid-enterprise';
import { extractValuesFromNestedObj, timeToDate } from '../template-table/template-table.component';

const COLUMNS_TO_DISPLAY = [
  { field: 'post/postProfile/username', headerName: 'Poster Username' },
  { field: 'username', headerName: 'Fake Username' },
  { field: 'platform', enableRowGroup: true, filter: true },
  { field: 'isIrrelevant', enableRowGroup: true, filter: true },
  { field: 'scamType', enableRowGroup: true, filter: true },
  { field: 'post/upload_date', headerName: 'Post Upload Date' },
  {
    field: 'shortcode',
    cellRenderer: 'linkRendererComponent',
    cellRendererParams: { inRouterLink: '/detail/processed' },
  },
  {
    headerName: 'Submit Time',
    field: 'submitTime',
    sort: 'desc',
    valueFormatter: (params) => {
      return params.value ? new Date(params.value).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
    },
  },
];

@Component({
  selector: 'app-processed-post-table',
  templateUrl: './processed-post-table.component.html',
})
export class ProcessedPostTableComponent {
  rowData$: Observable<any[]>;
  columnDefs: any[];
  constructor(private presistDataService: PresistDataService) {
    // Add date group
    this.columnDefs = [
      ...COLUMNS_TO_DISPLAY,
      {
        headerName: 'Date',
        field: 'submitDay',
        rowGroup: true,
        enableRowGroup: true,
        hide: true,
        filter: true,
      },
    ];
    this.rowData$ = this.presistDataService.profiles.pipe(
      map((dataSource) =>
        extractValuesFromNestedObj(
          COLUMNS_TO_DISPLAY.map((c) => c.field),
          dataSource
        ).map((row) => ({ ...row, submitDay: timeToDate(row['submitTime']) }))
      )
    );
  }
}
