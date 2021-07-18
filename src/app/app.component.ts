import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'instagram-data-viewer';
  navLinks = [
    { path: "/posts", label: "Posts" },
    { path: "/processed-posts", label: "Processed Posts" },
    { path: "/upload", label: "Uploads" }
  ]
}
