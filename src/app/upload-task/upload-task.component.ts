import { PathLocationStrategy } from '@angular/common';
import { Output, EventEmitter } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Post } from 'src/post';
import { PresistDataService } from '../presist-data.service';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.css']
})
export class UploadTaskComponent implements OnInit {

  @Input() file!: File;
  uploadPercent: Observable<number | undefined> | undefined;
  fileType: string | undefined;
  @Output() uploaded: EventEmitter<boolean> = new EventEmitter();
  bytesTransferred: number | undefined;

  constructor(
    private presistDataService: PresistDataService
  ) { }

  ngOnInit(): void {
    console.log(this.file);
    this.startUpload();
  }

  uploadLabel(jsonFile: File) {
    const fileReader = new FileReader();
    fileReader.readAsText(jsonFile, "UTF-8");
    fileReader.onload = () => {
      if (fileReader.result) {
        const posts = JSON.parse(fileReader.result.toString());
        let completePostCnt = 0;
        for (const postSource of posts) {
          const post: Post = {
            display_url: postSource.display_url,
            full_name: postSource.full_name,
            shortcode: postSource.shortcode,
            upload_date: postSource.upload_date,
            username: postSource.username
          }
          this.presistDataService.uploadPostJson(post).finally(() =>
            this.uploadPercent = of(Math.ceil(completePostCnt++ / posts.length * 100))
          );
        }
      }
    }
    fileReader.onerror = (error) => {
      console.log(error);
    }
  }

  startUpload() {
    this.fileType = this.file.type.split('/').slice(-1)[0];
    console.log("uploaded file of type: ", this.fileType);

    switch (this.fileType) {
      case "json": {
        this.uploadLabel(this.file);
        break;
      }
      case "png": {
        const task = this.presistDataService.uploadImage(this.file);
        this.uploadPercent = task.percentageChanges();
        task.snapshotChanges().pipe(
          finalize(() => this.uploaded.emit())
        ).subscribe();
        break;
      }
      default: {
        console.log(`${this.file} is not in the required format`);
        break;
      }
    }
  }

  isActive(snapshot: Observable<any>) {
  }




}


