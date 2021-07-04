import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.css']
})
export class UploadTaskComponent implements OnInit {

  @Input() file!: File;
  uploadPercent: Observable<number | undefined> | undefined;
  downloadURL: Observable<string> | undefined;

  constructor(
    private storage: AngularFireStorage,
  ) { }

  ngOnInit(): void {
    this.startUpload();
  }

  startUpload() {
    // The storage path
    const filePath = `/img/${this.file.name}`;
    const fileRef = this.storage.ref(filePath);

    console.log(`upload ${this.file}`);

    // The main task
    const task = this.storage.upload(filePath, this.file);

    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL())
    )
      .subscribe()
  }
  isActive(snapshot: Observable<any>) {
  }




}


