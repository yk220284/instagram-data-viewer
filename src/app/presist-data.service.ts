import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { combineLatest, forkJoin, from, Observable, of, zip } from 'rxjs';
import {
  finalize,
  first,
  last,
  map,
  mergeMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
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
  unprocessedPosts: Observable<Post[]>;
  processedPosts: Observable<Post[]>;

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
    this.unprocessedPosts = this.postUnprocessedCollection.valueChanges({
      idField: 'shortcode',
    });
    this.processedPosts = this.postProcessedCollection.valueChanges({
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
    return this.getPostUnprocessed(shortcode).pipe(
      map((post: Post) => {
        console.log('adding post', post);
        this.postProcessedCollection
          .doc(shortcode)
          .set(post)
          .then(() =>
            this.postUnprocessedCollection.doc(post.shortcode).delete()
          );
      })
    );
  }

  uploadPostJson(post: Post) {
    // return this.getPostUnprocessed(post.shortcode).pipe(
    //   first(),
    //   withLatestFrom(this.getPostProcessed(post.shortcode)),
    //   mergeMap(([uP, pP]) => {
    //     console.log(`up: ${uP} pp: ${pP}`);
    //     if (uP !== null || pP !== null) {
    //       console.log('already proccessed this post');
    //       return of('Not uploading');
    //     } else {
    //       return from(
    //         this.postUnprocessedCollection.doc(post.shortcode).set(post)
    //       );
    //     }
    //   })
    // );
    return combineLatest([
      this.getPostUnprocessed(post.shortcode),
      this.getPostProcessed(post.shortcode),
    ]).pipe(
      take(1),
      tap(([uP, pP]) => console.log(`up: ${uP} pp: ${pP}`)),
      mergeMap(([uP, pP]) => {
        if (uP === null && pP === null) {
          return from(
            this.postUnprocessedCollection.doc(post.shortcode).set(post)
          );
        } else {
          console.log('already proccessed this post');
          return of('Not uploading');
        }
      })
    );
  }

  private addImageUrl(shortcode: string, url: string) {
    const imageUrl: ImageUrl = { shortcode: shortcode, url: url };
    return this.imageUrlCollection.doc(shortcode).set(imageUrl);
  }

  addProfile(profile: Profile) {
    return this.profileCollection.doc(profile.shortcode).set(profile);
  }

  updateProfile(profile: Profile) {
    let partialProfile = Object.fromEntries(
      Object.entries(profile).filter(([_, v]) => !!v)
    );
    return this.profileCollection.doc(profile.shortcode).update(partialProfile);
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
            console.log(
              `Query by shortcode ${shortcode} in ${collection} got ${values.length} posts`
            );
            return null;
          } else {
            return values[0];
          }
        })
      );
  }

  getPostUnprocessed(shortcode: string): Observable<any> {
    return this._getPost(this.postUnprocessedFolder, shortcode);
  }
  getPostProcessed(shortcode: string): Observable<any> {
    return this._getPost(this.postProcessedFolder, shortcode);
  }

  getImageUrl(shortcode: string): Observable<any> {
    return this._getPost(this.imageUrlFolder, shortcode);
  }
}
