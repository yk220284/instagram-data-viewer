import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Post } from 'src/post';
import { Profile } from 'src/profile';
export interface Item {
  shortcode: string;
  name: string;
}
export interface ImageUrl {
  shortcode: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class PresistDataService {
  private itemsCollection: AngularFirestoreCollection<Item>;
  private imageUrlCollection: AngularFirestoreCollection<ImageUrl>;
  private postUnprocessedCollection: AngularFirestoreCollection<Post>;
  private postProcessedCollection: AngularFirestoreCollection<Post>;
  private profileCollection: AngularFirestoreCollection<Profile>;

  private items: Observable<Item[]>;
  posts: Observable<Post[]>;

  private imageUrlFolder: string = 'imageUrlNew';
  private postUnprocessedFolder: string = 'postJsonNew';
  private postProcessedFolder: string = 'postJsonProcessedNew';
  private imageFolder: string = 'imgNew';
  private profileFolder: string = 'profileNew';

  constructor(
    private afs: AngularFirestore,
    private imageStorage: AngularFireStorage
  ) {
    this.itemsCollection = afs.collection<Item>('test');
    this.imageUrlCollection = afs.collection<ImageUrl>(this.imageUrlFolder);
    this.postUnprocessedCollection = afs.collection<Post>(
      this.postUnprocessedFolder
    );
    this.postProcessedCollection = afs.collection<Post>(
      this.postProcessedFolder
    );
    this.profileCollection = afs.collection<Profile>(this.profileFolder);
    this.items = this.itemsCollection.valueChanges({ idField: 'shortcode' });
    this.posts = this.postUnprocessedCollection.valueChanges({
      idField: 'shortcode',
    });
  }

  uploadImage(imageFile: File) {
    // The storage path
    const fileNameNoExt: string = imageFile.name
      .split('.')
      .slice(0, -1)
      .join('.');
    const filePath = `/${this.imageFolder}/${fileNameNoExt}.png`;
    const fileRef = this.imageStorage.ref(filePath);

    const task = this.imageStorage.upload(filePath, imageFile);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef
            .getDownloadURL()
            .subscribe((url) => this.addImageUrl(fileNameNoExt, url));
        })
      )
      .subscribe();
    return task;
  }

  movePostJson(shortcode: string) {
    this.getPostUnprocessed(shortcode)
      .pipe(
        map((post: Post) => {
          console.log('adding post', post);
          this.postProcessedCollection
            .doc(shortcode)
            .set(post)
            .then(() =>
              this.postUnprocessedCollection.doc(post.shortcode).delete()
            );
        })
      )
      .subscribe();
  }

  uploadPostJson(post: Post) {
    return this.postUnprocessedCollection.doc(post.shortcode).set(post);
  }

  private addImageUrl(shortcode: string, url: string) {
    const imageUrl: ImageUrl = { shortcode: shortcode, url: url };
    return this.imageUrlCollection.doc(shortcode).set(imageUrl);
  }

  addProfile(profile: Profile) {
    return this.profileCollection.doc(profile.shortcode).set(profile);
  }

  addItem(name: string) {
    const shortcode = this.afs.createId();
    const item: Item = { shortcode, name };
    console.log(item);
    return this.itemsCollection.doc(shortcode).set(item);
  }

  _getPost(collection: string, shortcode: string): Observable<any> {
    return this.afs
      .collection(collection, (ref) => ref.where('shortcode', '==', shortcode))
      .valueChanges()
      .pipe(
        map((values) => {
          if (values.length !== 1) {
            console.log(`Query by shortcode got ${values.length} posts`);
          } else {
            return values[0];
          }
        })
      );
  }

  getPostUnprocessed(shortcode: string): Observable<any> {
    return this._getPost(this.postUnprocessedFolder, shortcode);
  }

  getImageUrl(shortcode: string): Observable<any> {
    return this._getPost(this.imageUrlFolder, shortcode);
  }
}
