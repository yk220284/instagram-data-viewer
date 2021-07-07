import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { PresistDataService } from '../presist-data.service';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.css']
})
export class UploadTaskComponent implements OnInit {

  @Input() file!: File;
  uploadPercent: Observable<number | undefined> | undefined;

  constructor(
    private presistDataService: PresistDataService
  ) { }

  ngOnInit(): void {
    this.startUpload();
  }

  startUpload() {
    const task = this.presistDataService.uploadImage(this.file);
    this.uploadPercent = task.percentageChanges();
  }

  isActive(snapshot: Observable<any>) {
  }




}


