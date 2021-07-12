import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostTableComponent } from './post-table/post-table.component';
import { ProcessedPostTableComponent } from './processed-post-table/processed-post-table.component';
import { UploaderComponent } from './uploader/uploader.component';

const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: PostTableComponent },
  { path: 'processed-posts', component: ProcessedPostTableComponent },
  { path: 'upload', component: UploaderComponent },
  { path: 'detail/:id', component: PostDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
