import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
  isHovering: boolean = false;

  files: File[] = [];

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  filesPicied(files: any) {
    for (const file of files) {
      this.files.push(file as File);
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
