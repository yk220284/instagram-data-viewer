import { Component, OnInit } from '@angular/core';
import { PresistDataService } from '../../../services/presist-data.service';
import { Profile } from 'src/profile';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LinkRendererComponent } from '../link-renderer/link-renderer.component';
import 'ag-grid-enterprise';

const COLUMNS_TO_DISPLAY = [
  { field: 'username', headerName: 'Poster Username' },
  { field: 'post/postProfile/username', headerName: 'Fake Username' },
  { field: 'platform', enableRowGroup: true, filter: true },
  { field: 'isIrrelevant', enableRowGroup: true, filter: true },
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

function extractValuesFromNestedObj(columns_to_display: string[], dataSource: Profile[]) {
  return dataSource.map((profile) =>
    columns_to_display.reduce((acc, colName) => {
      const colNameExploded = colName.split('/');
      acc[colName] = colNameExploded.reduce((acc, obj) => acc[obj], profile);
      return acc;
    }, {})
  );
}

function timeToDate(timestamp: number) {
  const day = new Date(timestamp);
  return `${day.getMonth() + 1}/${day.getDate()}`;
}

@Component({
  selector: 'app-processed-post-table',
  templateUrl: './processed-post-table.component.html',
})
export class ProcessedPostTableComponent implements OnInit {
  // Ag grid
  private gridApi;
  private gridColumnApi;
  frameworkComponents = { linkRendererComponent: LinkRendererComponent };
  defaultColDef = {
    flex: 1,
    minWidth: 150,
    sortable: true,
    resizable: true,
  };
  autoGroupColumnDef = {
    flex: 1,
    minWidth: 150,
    sortable: true,
    resizable: true,
  };
  sideBar = { toolPanels: ['columns', 'filters'] };
  // Processed data specifics
  columnDefs: any[];
  rowData$: Observable<any[]>;
  isGroupOpenByDefault = (params) => {
    return params.field === 'submitDay' && params.key === timeToDate(Date.now());
  };

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

  ngOnInit(): void {}

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
}
