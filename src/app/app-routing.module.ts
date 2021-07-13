import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailComponent } from './components/edit/post-detail/post-detail.component';
import { PostTableComponent } from './components/display/post-table/post-table.component';
import { ProcessedPostTableComponent } from './components/display/processed-post-table/processed-post-table.component';
import { UploaderComponent } from './components/uploading/uploader/uploader.component';

const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: PostTableComponent },
  { path: 'processed-posts', component: ProcessedPostTableComponent },
  { path: 'upload', component: UploaderComponent },
  {
    path: 'detail/:id',
    component: PostDetailComponent,
    runGuardsAndResolvers: 'paramsChange',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
