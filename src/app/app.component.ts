import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'instagram-data-viewer';
  navLinks = [
    { path: "/posts", label: "Posts" },
    { path: "/upload", label: "Uploads" }
  ]
}
