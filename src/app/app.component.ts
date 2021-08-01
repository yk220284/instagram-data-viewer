import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'instagram-data-viewer';
  navLinks = [
    { path: '/posts', label: 'Posts' },
    { path: '/processed-posts', label: 'Processed Posts' },
    { path: '/upload', label: 'Uploads' },
  ];

  constructor(public auth: AngularFireAuth, private router: Router) {}

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => this.router.navigate(['/']));
  }

  logout() {
    this.auth.signOut().then(() => this.router.navigate(['/']));
  }
}
