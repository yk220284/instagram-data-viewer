import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { combineLatest, forkJoin, from, Observable, of, zip } from 'rxjs';
import {
  filter,
  finalize,
  first,
  last,
  map,
  mergeMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { Post, PostState } from 'src/post';
import { Profile } from 'src/profile';

export interface ImageUrl {
  shortcode: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class PresistDataService {
  private imageUrlCollection: AngularFirestoreCollection<ImageUrl>;
  private postUnprocessedCollection: AngularFirestoreCollection<Post>;
  // private postProcessedCollection: AngularFirestoreCollection<Post>;
  private profileCollection: AngularFirestoreCollection<Profile>;

  unprocessedPosts: Observable<Post[]>;
  profiles: Observable<Profile[]>;
  // processedPosts: Observable<Post[]>;

  private imageUrlFolder: string = 'imageUrlNew';
  private postUnprocessedFolder: string = 'postJsonNew';
  // private postProcessedFolder: string = 'postJsonProcessedNew';
  private imageFolder: string = 'imgNew';
  private profileFolder: string = 'profileNew';

  constructor(
    private afs: AngularFirestore,
    private imageStorage: AngularFireStorage
  ) {
    this.imageUrlCollection = afs.collection<ImageUrl>(this.imageUrlFolder);
    this.postUnprocessedCollection = afs.collection<Post>(
      this.postUnprocessedFolder
    );
    // this.postProcessedCollection = afs.collection<Post>(
    //   this.postProcessedFolder
    // );
    this.profileCollection = afs.collection<Profile>(this.profileFolder);
    this.unprocessedPosts = this.postUnprocessedCollection.valueChanges({
      idField: 'shortcode',
    });
    this.profiles = this.profileCollection.valueChanges({
      idField: 'shortcode',
    });
    // this.processedPosts = this.postProcessedCollection.valueChanges({
    //   idField: 'shortcode',
    // });
  }

  getNextPost(shortcode: string, postState: PostState) {
    const postStore =
      postState === 'processed'
        ? this.profiles.pipe(map((profiles) => profiles.map((p) => p.post)))
        : this.unprocessedPosts;
    return postStore.pipe(
      map((posts) => {
        if (posts.length <= 1) {
          console.log(`we have ${posts.length - 1} posts ${postState}`);
          return null;
        }
        const cur_idx = posts.findIndex((post) => post.shortcode === shortcode);
        if (cur_idx < 0) {
          console.log('cannot find this post, err, give the first post');
          return posts[0];
        }
        return posts[(cur_idx + 1) % posts.length];
      })
    );
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

  deleteUnprocessedPost(shortcode: string) {
    return this.postUnprocessedCollection.doc(shortcode).delete();
  }

  uploadPostJson(post: Post) {
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

  _getDocByShortcode(collection: string, shortcode: string): Observable<any> {
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
  getProfile(shortcode: string) {
    return this._getDocByShortcode(this.profileFolder, shortcode);
  }

  getPostUnprocessed(shortcode: string): Observable<any> {
    return this._getDocByShortcode(this.postUnprocessedFolder, shortcode);
  }
  getPostProcessed(shortcode: string): Observable<any> {
    return this._getDocByShortcode(this.profileFolder, shortcode).pipe(
      map((p: Profile) => (p === null ? null : p.post))
    );
  }

  getImageUrl(shortcode: string): Observable<any> {
    return this._getDocByShortcode(this.imageUrlFolder, shortcode);
  }
}
