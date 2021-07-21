import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { combineLatest, from, Observable, of } from 'rxjs';
import { finalize, map, mergeMap, take, tap } from 'rxjs/operators';
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
  // Image Blob
  private imageFolder: string = 'imgNew';
  // Image URL
  private imageUrlFolder: string = 'imageUrlNew';
  private imageUrlCollection: AngularFirestoreCollection<ImageUrl>;

  // Profile
  profiles: Observable<Profile[]>;
  private profileFolder: string = 'profileNew';
  private profileCollection: AngularFirestoreCollection<Profile>;

  // Posts
  unprocessedPosts: Observable<Post[]>;
  private postUnprocessedFolder: string = 'postJsonNew';
  private postUnprocessedCollection: AngularFirestoreCollection<Post>;

  constructor(
    private afs: AngularFirestore,
    private imageStorage: AngularFireStorage
  ) {
    this.imageUrlCollection = afs.collection<ImageUrl>(this.imageUrlFolder);
    // Posts
    this.postUnprocessedCollection = afs.collection<Post>(
      this.postUnprocessedFolder
    );
    this.unprocessedPosts = this.postUnprocessedCollection.valueChanges({
      idField: 'shortcode',
    });
    // Profiles
    this.profileCollection = afs.collection<Profile>(this.profileFolder);
    this.profiles = this.profileCollection.valueChanges({
      idField: 'shortcode',
    });
  }

  /* Uploader */
  private addImageUrl(shortcode: string, url: string) {
    const imageUrl: ImageUrl = { shortcode: shortcode, url: url };
    return this.imageUrlCollection.doc(shortcode).set(imageUrl);
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

  /* Routing To Next Post */
  getNextPost(
    shortcode: string,
    postState: PostState
  ): Observable<Post | null> {
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

  /* Profile containing Processed Posts */
  getProfile(shortcode: string) {
    return this._getDocByShortcode(this.profileFolder, shortcode);
  }

  getPostProcessed(shortcode: string): Observable<any> {
    return this._getDocByShortcode(this.profileFolder, shortcode).pipe(
      map((p: Profile) => (p === null ? null : p.post))
    );
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

  /* Unprocessed Post */
  deleteUnprocessedPost(shortcode: string) {
    return this.postUnprocessedCollection.doc(shortcode).delete();
  }

  getPostUnprocessed(shortcode: string): Observable<any> {
    return this._getDocByShortcode(this.postUnprocessedFolder, shortcode);
  }

  /* Image URL */
  getImageUrl(shortcode: string): Observable<any> {
    return this._getDocByShortcode(this.imageUrlFolder, shortcode);
  }

  /* Query by shortcode */
  private _getDocByShortcode(
    collection: string,
    shortcode: string
  ): Observable<any> {
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
}
