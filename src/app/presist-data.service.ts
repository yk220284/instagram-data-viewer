import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Post } from 'src/post';
export interface Item { shortcode: string, name: string; }
export interface ImageUrl { shortcode: string, url: string; }

@Injectable({
  providedIn: 'root'
})
export class PresistDataService {
  private itemsCollection: AngularFirestoreCollection<Item>;
  private imageUrlCollection: AngularFirestoreCollection<ImageUrl>;
  private postJsonCollection: AngularFirestoreCollection<Post>;
  private items: Observable<Item[]>;

  constructor(
    private afs: AngularFirestore,
    private imageStorage: AngularFireStorage
  ) {
    this.itemsCollection = afs.collection<Item>('test');
    this.imageUrlCollection = afs.collection<ImageUrl>('imageUrl');
    this.postJsonCollection = afs.collection<Post>('postJson');
    this.items = this.itemsCollection.valueChanges({ idField: 'shortcode' });
  }

  uploadLabel(jsonFile: File) {
    const fileReader = new FileReader();
    fileReader.readAsText(jsonFile, "UTF-8");
    fileReader.onload = () => {
      if (fileReader.result) {
        const posts = JSON.parse(fileReader.result.toString());
        for (const postSource of posts) {
          const post: Post = {
            display_url: postSource.display_url,
            full_name: postSource.full_name,
            shortcode: postSource.shortcode,
            upload_date: postSource.upload_date,
            username: postSource.username
          }
          // TODO: collect all Promises and add status bar
          this.uploadPostJson(post).finally(() => console.log(`uploaded ${post}`));
        }
      }
    }
    fileReader.onerror = (error) => {
      console.log(error);
    }
    return of([]);
  }

  uploadImage(imageFile: File) {
    // The storage path
    const fileNameNoExt: string = imageFile.name.split('.').slice(0, -1).join('.');
    const filePath = `/img/${fileNameNoExt}.png`;
    const fileRef = this.imageStorage.ref(filePath);

    const task = this.imageStorage.upload(filePath, imageFile);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => this.addImageUrl(fileNameNoExt, url));
      }
      )).subscribe();
    return task;
  }

  uploadPostJson(post: Post) {
    return this.postJsonCollection.doc(post.shortcode).set(post);
  }

  private addImageUrl(shortcode: string, url: string) {
    const imageUrl: ImageUrl = { shortcode: shortcode, url: url };
    return this.imageUrlCollection.doc(shortcode).set(imageUrl);
  }

  addItem(name: string) {
    const shortcode = this.afs.createId();
    const item: Item = { shortcode, name };
    console.log(item);
    return this.itemsCollection.doc(shortcode).set(item);
  }

  getItems(): Observable<Item[]> {
    return this.items
  }
}
