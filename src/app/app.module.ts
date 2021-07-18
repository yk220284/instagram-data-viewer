import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostDetailComponent } from './components/edit/post-detail/post-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { PostTableComponent } from './components/display/post-table/post-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Material Module
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Firebace Module
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule, BUCKET } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from 'src/environments/environment';
import { DropzoneDirective } from './dropzone.directive';
import { UploaderComponent } from './components/uploading/uploader/uploader.component';
import { UploadTaskComponent } from './components/uploading/upload-task/upload-task.component';
import { FormComponent } from './components/edit/form/form.component';
import { ProcessedPostTableComponent } from './components/display/processed-post-table/processed-post-table.component';
import { TemplateTableComponent } from './components/display/template-table/template-table.component';

@NgModule({
  declarations: [
    AppComponent,
    PostDetailComponent,
    PostTableComponent,
    DropzoneDirective,
    UploaderComponent,
    UploadTaskComponent,
    FormComponent,
    ProcessedPostTableComponent,
    TemplateTableComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    // Firebase Module
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, // auth
    AngularFireStorageModule, // storage
    // Material Module
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatGridListModule,
    MatTabsModule,
    MatSnackBarModule,
    MatSlideToggleModule,
  ],
  providers: [{ provide: BUCKET, useValue: 'instagram-data-label-tool' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
