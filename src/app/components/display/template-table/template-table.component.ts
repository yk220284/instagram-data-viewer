import { Component, Input } from '@angular/core';
import { Post } from 'src/post';
import { LinkRendererComponent } from '../link-renderer/link-renderer.component';
import { Observable } from 'rxjs';
import { Profile } from '../../../../profile';

export function extractValuesFromNestedObj(columns_to_display: string[], dataSource: Profile[] | Post[]) {
  return dataSource.map((profile) =>
    columns_to_display.reduce((acc, colName) => {
      const colNameExploded = colName.split('/');
      acc[colName] = colNameExploded.reduce((acc, obj) => acc[obj], profile);
      return acc;
    }, {})
  );
}

export function timeToDate(timestamp: number) {
  const day = new Date(timestamp);
  return `${day.getMonth() + 1}/${day.getDate()}`;
}

@Component({
  selector: 'app-template-table',
  templateUrl: './template-table.component.html',
  styleUrls: ['./template-table.component.scss'],
})
export class TemplateTableComponent {
  // Processed data specifics
  @Input() rowData$!: Observable<any[]>;
  // Ag grid
  @Input() columnDefs!: any[];
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
  statusBar = {
    statusPanels: [
      {
        statusPanel: 'agTotalAndFilteredRowCountComponent',
        align: 'right',
      },
    ],
  };
  isGroupOpenByDefault = (params) => {
    return params.field === 'submitDay' && params.key === timeToDate(Date.now());
  };
  defaultGroupSortComparator = function (nodeA, nodeB) {
    if (nodeA.key < nodeB.key) {
      return 1;
    } else if (nodeA.key > nodeB.key) {
      return -1;
    } else {
      return 0;
    }
  };

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
}
