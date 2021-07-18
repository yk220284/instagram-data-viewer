import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent implements OnInit {
  isHovering: boolean = false;
  files: File[] = [];
  uploadedCnt = 0;

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  filesPicied(files: any) {
    for (const file of files) {
      this.files.push(file as File);
    }
  }

  countUploaded() {
    this.uploadedCnt++;
    console.log(`uploaded ${this.uploadedCnt / this.files.length}`);
  }
  constructor() { }

  ngOnInit(): void {
  }

}
